import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const rootDir = resolve(__dirname, '../..')
const config: TranslationConfig = JSON.parse(readFileSync(resolve(rootDir, 'i18n/translation.config.json'), 'utf-8'))
const migrateMode = process.argv.includes('--migrate')

const getAllFiles = (dir: string, extensions: string[]): string[] => {
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

const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {}
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            Object.assign(result, flattenObject(obj[key], fullKey))
        } else {
            result[fullKey] = String(obj[key])
        }
    }
    return result
}

const hasI18nUsage = (content: string): boolean => {
    return /\$t\s*\(/.test(content) || /useI18n/.test(content) || /const\s*{\s*t\s*[,}]/.test(content) || /const\s+t\s*=/.test(content)
}

const normalizeKey = (raw: string): string => {
    return raw.replaceAll(/\s+/g, ' ').trim()
}

const extractKeys = (content: string, _filePath: string): string[] => {
    const keys: string[] = []
    const hasDirectT = hasI18nUsage(content)

    const dollarTRegex = /\$t\s*\(\s*(['"`])([\s\S]*?)\1\s*[,)]/g
    let match: RegExpExecArray | null
    while ((match = dollarTRegex.exec(content)) !== null) {
        keys.push(normalizeKey(match[2]))
    }

    if (hasDirectT) {
        const tRegex = /(?<![.\w$])t\s*\(\s*(['"`])([\s\S]*?)\1\s*[,)]/g
        while ((match = tRegex.exec(content)) !== null) {
            keys.push(normalizeKey(match[2]))
        }
    }

    return keys
}

const readLocaleFile = (lang: string): Record<string, string> => {
    const filePath = resolve(rootDir, config.localesDir, `${lang}.json`)
    if (!existsSync(filePath)) return {}
    const content = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (typeof Object.values(content)[0] === 'object') {
        return flattenObject(content)
    }
    return content
}

const buildNestedKeyMap = (mainLocale: Record<string, string>): Record<string, string> => {
    const map: Record<string, string> = {}
    for (const [nestedKey, value] of Object.entries(mainLocale)) {
        map[nestedKey] = value
    }
    return map
}

const escapeRegex = (str: string): string => {
    return str.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

const getSourceFiles = (): string[] => {
    const files: string[] = []
    for (const dir of config.scanDirs) {
        const fullDir = resolve(rootDir, dir)
        files.push(...getAllFiles(fullDir, config.fileExtensions))
    }
    return files
}

const migrateSourceFiles = (keyMap: Record<string, string>): void => {
    const files = getSourceFiles()
    let totalReplacements = 0

    for (const filePath of files) {
        let content = readFileSync(filePath, 'utf-8')
        let modified = false

        for (const [nestedKey, spanishValue] of Object.entries(keyMap)) {
            const patterns = [
                new RegExp(`\\$t\\s*\\(\\s*(['"\`])${escapeRegex(nestedKey)}\\1\\s*\\)`, 'g'),
                new RegExp(`(?<![.\\w$])t\\s*\\(\\s*(['"\`])${escapeRegex(nestedKey)}\\1\\s*\\)`, 'g'),
            ]

            for (const pattern of patterns) {
                const replaced = content.replace(pattern, (fullMatch: string, quote: string) => {
                    modified = true
                    totalReplacements++
                    const prefix = fullMatch.startsWith('$') ? '$t' : 't'
                    return `${prefix}(${quote}${spanishValue}${quote})`
                })
                content = replaced
            }
        }

        if (modified) {
            writeFileSync(filePath, content, 'utf-8')
            console.log(`  Migrated: ${filePath.replace(rootDir, '.')}`)
        }
    }

    console.log(`\n  Total replacements: ${totalReplacements}`)
}

const collectKeysFromSource = (): string[] => {
    const files = getSourceFiles()
    const allKeys = new Set<string>()

    for (const filePath of files) {
        const content = readFileSync(filePath, 'utf-8')
        const keys = extractKeys(content, filePath)
        for (const key of keys) {
            allKeys.add(key)
        }
    }

    console.log(`  Found ${allKeys.size} unique translation keys across ${files.length} files.\n`)
    return [...allKeys].sort((a, b) => a.localeCompare(b))
}

const resolveTranslation = (key: string, existing: Record<string, string>, mainLocale: Record<string, string>, lang: string): string => {
    if (existing[key] && existing[key] !== '') return existing[key]

    const existingByValue = Object.entries(mainLocale).find(([, v]) => v === key)
    if (!existingByValue) return ''

    const langNested = readLocaleFile(lang)
    const nestedTranslation = langNested[existingByValue[0]]
    return nestedTranslation && nestedTranslation !== '' ? nestedTranslation : ''
}

const buildLanguageFile = (
    lang: string,
    sortedKeys: string[],
    mainLocale: Record<string, string>,
): { langOutput: Record<string, string>; missingKeys: Record<string, string> } => {
    const existing = readLocaleFile(lang)
    const langOutput: Record<string, string> = {}
    const missingKeys: Record<string, string> = {}

    for (const key of sortedKeys) {
        const translation = resolveTranslation(key, existing, mainLocale, lang)
        langOutput[key] = translation
        if (!translation) missingKeys[key] = ''
    }

    return { langOutput, missingKeys }
}

const writeMissingReport = (missing: Record<string, Record<string, string>>, languages: string[]): void => {
    const hasMissing = languages.some((l) => Object.keys(missing[l]).length > 0)
    if (!hasMissing) {
        console.log('\n  ✓ All translations are complete!')
        return
    }

    const missingPath = resolve(rootDir, config.missingFile)
    writeFileSync(missingPath, JSON.stringify(missing, null, 4) + '\n', 'utf-8')
    console.log(`\n  ⚠ Missing translations written to: ${config.missingFile}`)
    for (const lang of languages) {
        const count = Object.keys(missing[lang]).length
        if (count > 0) console.log(`    ${lang}: ${count} missing`)
    }
    console.log(`\n  Fill in the values and run: npm run apply-translations`)
}

const main = (): void => {
    console.log('🔍 Scanning for translation keys...\n')

    const mainLocale = readLocaleFile(config.mainLanguage)

    if (migrateMode) {
        console.log('  [MIGRATE] Replacing nested keys with main language text in source files...\n')
        const keyMap = buildNestedKeyMap(mainLocale)
        migrateSourceFiles(keyMap)
        console.log('\n  Migration complete. Running sync...\n')
    }

    const sortedKeys = collectKeysFromSource()

    const mainOutput: Record<string, string> = {}
    for (const key of sortedKeys) {
        mainOutput[key] = key
    }

    const missing: Record<string, Record<string, string>> = {}
    const otherLanguages = config.languages.filter((l) => l !== config.mainLanguage)

    for (const lang of otherLanguages) {
        const { langOutput, missingKeys } = buildLanguageFile(lang, sortedKeys, mainLocale)
        missing[lang] = missingKeys

        const langPath = resolve(rootDir, config.localesDir, `${lang}.json`)
        writeFileSync(langPath, JSON.stringify(langOutput, null, 4) + '\n', 'utf-8')
        console.log(`  Written: ${lang}.json (${sortedKeys.length} keys)`)
    }

    const mainPath = resolve(rootDir, config.localesDir, `${config.mainLanguage}.json`)
    writeFileSync(mainPath, JSON.stringify(mainOutput, null, 4) + '\n', 'utf-8')
    console.log(`  Written: ${config.mainLanguage}.json (${sortedKeys.length} keys)`)

    writeMissingReport(missing, otherLanguages)
}

main()
