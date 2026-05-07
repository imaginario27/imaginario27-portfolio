import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

interface TranslationConfig {
    missingFile: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../..')
const config: TranslationConfig = JSON.parse(readFileSync(resolve(rootDir, 'i18n/translation.config.json'), 'utf-8'))

const hasMissingTranslations = (missingPath: string): boolean => {
    if (!existsSync(missingPath)) {
        return false
    }

    const missing: Record<string, Record<string, string>> = JSON.parse(readFileSync(missingPath, 'utf-8'))

    return Object.values(missing).some((langEntries) => Object.keys(langEntries ?? {}).length > 0)
}

const checkTranslations = async (): Promise<void> => {
    const missingPath = resolve(rootDir, config.missingFile)

    // Remove stale output before regenerating translation status.
    if (existsSync(missingPath)) {
        unlinkSync(missingPath)
    }

    await import('./sync-translations.ts')

    if (hasMissingTranslations(missingPath)) {
        console.error('\n  Missing translations detected. Fill i18n/locales/missing-translations.json and run npm run apply-translations.')
        process.exit(1)
    }

    console.log('\n  ✓ No missing translations detected.')
}

await checkTranslations()
