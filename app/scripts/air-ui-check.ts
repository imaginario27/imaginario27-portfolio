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

const getInstalledVersion = (pkg: string): string | null => {
    try {
        const pkgPath = require.resolve(`${pkg}/package.json`)
        const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'))

        return pkgJson.version
    } catch {
        return null
    }
}

const getLatestVersion = async (pkg: string): Promise<string | null> => {
    try {
        const { stdout } = await execAsync(`npm view ${pkg} version`, { timeout: 5000 })
        return stdout.trim()
    } catch {
        return null
    }
}

const run = async (): Promise<void> => {
    const latestVersions = await Promise.all(packages.map((pkg) => getLatestVersion(pkg)))

    let hasOutdated = false

    packages.forEach((pkg, index) => {
        const installed = getInstalledVersion(pkg)
        const latest = latestVersions[index]

        if (!installed) {
            console.warn(`⚠️ ${pkg} is not installed\n`)
            return
        }

        if (!latest) {
            console.warn(`⚠️ Could not fetch latest version for ${pkg}\n`)
            return
        }

        if (installed === latest) {
            console.log(`✅ ${pkg} is up to date (${installed})`)
        } else {
            hasOutdated = true

            console.warn(`⚠️ ${pkg} is outdated\n` + `   Installed: ${installed}\n` + `   Latest:    ${latest}\n`)
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
