import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const execAsync = promisify(exec)
const require = createRequire(import.meta.url)

const packages = ['@imaginario27/air-ui-ds', '@imaginario27/air-ui-utils']
const isStrict = process.argv.includes('--strict')

console.log('\nAir UI Dependency Check')
console.log('--------------------------------------------------')

const getInstalledVersion = (packageName: string): string | null => {
    try {
        const packagePath = require.resolve(`${packageName}/package.json`)
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

        return packageJson.version
    } catch {
        return null
    }
}

const getLatestVersion = async (packageName: string): Promise<string | null> => {
    try {
        const { stdout } = await execAsync(`npm view ${packageName} version`, { timeout: 5000 })
        return stdout.trim()
    } catch {
        return null
    }
}

const run = async (): Promise<void> => {
    const latestVersions = await Promise.all(packages.map((packageName) => getLatestVersion(packageName)))

    let hasOutdated = false

    packages.forEach((packageName, index) => {
        const installed = getInstalledVersion(packageName)
        const latest = latestVersions[index]

        if (!installed) {
            console.warn(`⚠️ ${packageName} is not installed\n`)
            return
        }

        if (!latest) {
            console.warn(`⚠️ Could not fetch latest version for ${packageName}\n`)
            return
        }

        if (installed === latest) {
            console.log(`✅ ${packageName} is up to date (${installed})`)
        } else {
            hasOutdated = true

            console.warn(`⚠️ ${packageName} is outdated\n` + `   Installed: ${installed}\n` + `   Latest:    ${latest}\n`)
        }
    })

    if (hasOutdated) {
        console.log('👉 Please update to the latest version using:\n' + '   npm run update-design-system\n')

        if (isStrict) {
            process.exit(1)
        }
    }

    console.log('')
}

await run()
