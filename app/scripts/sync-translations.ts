import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs"
import { resolve, join, extname, dirname } from "path"
import { fileURLToPath } from "url"

interface TranslationConfig {
    mainLanguage: string
    languages: string[]
    scanDirs: string[]
    fileExtensions: string[]
    localesDir: string
    missingFile: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, "../..")
const config: TranslationConfig = JSON.parse(
    readFileSync(resolve(rootDir, "i18n/translation.config.json"), "utf-8")
)
const migrateMode = process.argv.includes("--migrate")

function getAllFiles(dir: string, extensions: string[]): string[] {
    const results: string[] = []
    if (!existsSync(dir)) return results

    const entries = readdirSync(dir)
    for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
            results.push(...getAllFiles(fullPath, extensions))
        } else if (extensions.includes(extname(fullPath).slice(1))) {
            results.push(fullPath)
        }
    }
    return results
}

function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {}
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === "object" && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], fullKey))
        } else {
            result[fullKey] = String(obj[key])
        }
    }
    return result
}

function hasI18nUsage(content: string): boolean {
    return /\$t\s*\(/.test(content) ||
        /useI18n/.test(content) ||
        /const\s*{\s*t\s*[,}]/.test(content) ||
        /const\s+t\s*=/.test(content)
}

function extractKeys(content: string, _filePath: string): string[] {
    const keys: string[] = []
    const hasDirectT = hasI18nUsage(content)

    // Match $t('...') or $t("...") — always valid
    const dollarTRegex = /\$t\s*\(\s*(['"`])([\s\S]*?)\1\s*[,)]/g
    let match: RegExpExecArray | null
    while ((match = dollarTRegex.exec(content)) !== null) {
        keys.push(normalizeKey(match[2]))
    }

    // Match t('...') or t("...") only if file uses i18n
    if (hasDirectT) {
        const tRegex = /(?<![.\w$])t\s*\(\s*(['"`])([\s\S]*?)\1\s*[,)]/g
        while ((match = tRegex.exec(content)) !== null) {
            keys.push(normalizeKey(match[2]))
        }
    }

    return keys
}

function normalizeKey(raw: string): string {
    return raw.replace(/\s+/g, " ").trim()
}

function readLocaleFile(lang: string): Record<string, string> {
    const filePath = resolve(rootDir, config.localesDir, `${lang}.json`)
    if (!existsSync(filePath)) return {}
    const content = JSON.parse(readFileSync(filePath, "utf-8"))
    if (typeof Object.values(content)[0] === "object") {
        return flattenObject(content)
    }
    return content
}

function buildNestedKeyMap(mainLocale: Record<string, string>): Record<string, string> {
    const map: Record<string, string> = {}
    for (const [nestedKey, value] of Object.entries(mainLocale)) {
        map[nestedKey] = value
    }
    return map
}

function migrateSourceFiles(keyMap: Record<string, string>): void {
    const files = getSourceFiles()
    let totalReplacements = 0

    for (const filePath of files) {
        let content = readFileSync(filePath, "utf-8")
        let modified = false

        for (const [nestedKey, spanishValue] of Object.entries(keyMap)) {
            const patterns = [
                new RegExp(`\\$t\\s*\\(\\s*(['"\`])${escapeRegex(nestedKey)}\\1\\s*\\)`, "g"),
                new RegExp(`(?<![.\\w$])t\\s*\\(\\s*(['"\`])${escapeRegex(nestedKey)}\\1\\s*\\)`, "g"),
            ]

            for (const pattern of patterns) {
                const replaced = content.replace(pattern, (fullMatch: string, quote: string) => {
                    modified = true
                    totalReplacements++
                    const prefix = fullMatch.startsWith("$") ? "$t" : "t"
                    return `${prefix}(${quote}${spanishValue}${quote})`
                })
                content = replaced
            }
        }

        if (modified) {
            writeFileSync(filePath, content, "utf-8")
            console.log(`  Migrated: ${filePath.replace(rootDir, ".")}`)
        }
    }

    console.log(`\n  Total replacements: ${totalReplacements}`)
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getSourceFiles(): string[] {
    const files: string[] = []
    for (const dir of config.scanDirs) {
        const fullDir = resolve(rootDir, dir)
        files.push(...getAllFiles(fullDir, config.fileExtensions))
    }
    return files
}

function main(): void {
    console.log("🔍 Scanning for translation keys...\n")

    const mainLocale = readLocaleFile(config.mainLanguage)

    if (migrateMode) {
        console.log("  [MIGRATE] Replacing nested keys with main language text in source files...\n")
        const keyMap = buildNestedKeyMap(mainLocale)
        migrateSourceFiles(keyMap)
        console.log("\n  Migration complete. Running sync...\n")
    }

    const files = getSourceFiles()
    const allKeys = new Set<string>()

    for (const filePath of files) {
        const content = readFileSync(filePath, "utf-8")
        const keys = extractKeys(content, filePath)
        for (const key of keys) {
            allKeys.add(key)
        }
    }

    console.log(`  Found ${allKeys.size} unique translation keys across ${files.length} files.\n`)

    const sortedKeys = [...allKeys].sort()

    // Build main language file (key = value)
    const mainOutput: Record<string, string> = {}
    for (const key of sortedKeys) {
        mainOutput[key] = key
    }

    // Build other language files and track missing
    const missing: Record<string, Record<string, string>> = {}
    const otherLanguages = config.languages.filter(l => l !== config.mainLanguage)

    for (const lang of otherLanguages) {
        const existing = readLocaleFile(lang)
        const langOutput: Record<string, string> = {}
        missing[lang] = {}

        for (const key of sortedKeys) {
            // Check if there's already a translation for this key directly
            if (existing[key] && existing[key] !== "") {
                langOutput[key] = existing[key]
            } else {
                // Check if the key was a value that maps from a nested key
                const existingByValue = Object.entries(mainLocale).find(([, v]) => v === key)
                if (existingByValue) {
                    const nestedKey = existingByValue[0]
                    const langNested = readLocaleFile(lang)
                    if (langNested[nestedKey] && langNested[nestedKey] !== "") {
                        langOutput[key] = langNested[nestedKey]
                    } else {
                        langOutput[key] = ""
                        missing[lang][key] = ""
                    }
                } else {
                    langOutput[key] = ""
                    missing[lang][key] = ""
                }
            }
        }

        const langPath = resolve(rootDir, config.localesDir, `${lang}.json`)
        writeFileSync(langPath, JSON.stringify(langOutput, null, 4) + "\n", "utf-8")
        console.log(`  Written: ${lang}.json (${sortedKeys.length} keys)`)
    }

    // Write main language file
    const mainPath = resolve(rootDir, config.localesDir, `${config.mainLanguage}.json`)
    writeFileSync(mainPath, JSON.stringify(mainOutput, null, 4) + "\n", "utf-8")
    console.log(`  Written: ${config.mainLanguage}.json (${sortedKeys.length} keys)`)

    // Write missing translations file
    const hasMissing = otherLanguages.some(l => Object.keys(missing[l]).length > 0)
    if (hasMissing) {
        const missingPath = resolve(rootDir, config.missingFile)
        writeFileSync(missingPath, JSON.stringify(missing, null, 4) + "\n", "utf-8")
        console.log(`\n  ⚠ Missing translations written to: ${config.missingFile}`)
        for (const lang of otherLanguages) {
            const count = Object.keys(missing[lang]).length
            if (count > 0) {
                console.log(`    ${lang}: ${count} missing`)
            }
        }
        console.log(`\n  Fill in the values and run: npm run apply-translations`)
    } else {
        console.log("\n  ✓ All translations are complete!")
    }
}

main()
