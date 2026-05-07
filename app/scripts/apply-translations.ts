import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

interface TranslationConfig {
    mainLanguage: string
    languages: string[]
    localesDir: string
    missingFile: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../..')
const config: TranslationConfig = JSON.parse(readFileSync(resolve(rootDir, 'i18n/translation.config.json'), 'utf-8'))

function main(): void {
    const missingPath = resolve(rootDir, config.missingFile)

    if (!existsSync(missingPath)) {
        console.log('  No missing-translations.json found. Nothing to apply.')
        console.log('  Run `npm run sync-translations` first.')
        return
    }

    const missing: Record<string, Record<string, string>> = JSON.parse(readFileSync(missingPath, 'utf-8'))

    let appliedCount = 0
    let stillMissing = 0

    for (const [lang, translations] of Object.entries(missing)) {
        const localePath = resolve(rootDir, config.localesDir, `${lang}.json`)
        if (!existsSync(localePath)) {
            console.log(`  ⚠ Locale file not found: ${lang}.json — skipping`)
            continue
        }

        const locale: Record<string, string> = JSON.parse(readFileSync(localePath, 'utf-8'))

        for (const [key, value] of Object.entries(translations)) {
            if (value && value.trim() !== '') {
                locale[key] = value
                appliedCount++
            } else {
                stillMissing++
            }
        }

        const sorted = Object.keys(locale)
            .sort()
            .reduce(
                (acc, k) => {
                    acc[k] = locale[k]
                    return acc
                },
                {} as Record<string, string>,
            )

        writeFileSync(localePath, JSON.stringify(sorted, null, 4) + '\n', 'utf-8')
        console.log(`  Updated: ${lang}.json`)
    }

    if (stillMissing === 0) {
        unlinkSync(missingPath)
        console.log(`\n  ✓ Applied ${appliedCount} translations. Removed missing-translations.json.`)
    } else {
        console.log(`\n  Applied ${appliedCount} translations. ${stillMissing} still missing.`)
        console.log(`  Fill remaining values in ${config.missingFile} and run again.`)
    }
}

main()
