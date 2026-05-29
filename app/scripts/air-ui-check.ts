import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const execAsync = promisify(exec)
const require = createRequire(import.meta.url)
const npmViewTimeoutMs = 15000
const npmViewMaxAttempts = 2

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

type LatestVersionResult = {
    version: string | null
    error: string | null
}

const getCommandErrorMessage = (error: unknown): string => {
    const typedError = error as NodeJS.ErrnoException & { stderr?: string }
    const code = typedError.code ? ` (${typedError.code})` : ''
    const message = typedError.message ?? 'Unknown npm error'
    const stderr = typedError.stderr?.trim()

    if (stderr) {
        return `${message}${code}: ${stderr.split('\n')[0]}`
    }

    return `${message}${code}`
}

const parseVersionOutput = (output: string): string | null => {
    const trimmedOutput = output.trim()

    if (!trimmedOutput) {
        return null
    }

    try {
        const parsedOutput = JSON.parse(trimmedOutput)

        if (typeof parsedOutput === 'string') {
            return parsedOutput.trim()
        }
    } catch {
        return trimmedOutput
    }

    return trimmedOutput
}

const getLatestVersion = async (packageName: string): Promise<LatestVersionResult> => {
    let lastError: string | null = null

    for (let attempt = 1; attempt <= npmViewMaxAttempts; attempt += 1) {
        try {
            const { stdout } = await execAsync(`npm view ${packageName} version --json`, { timeout: npmViewTimeoutMs })
            const version = parseVersionOutput(stdout)

            if (version) {
                return { version, error: null }
            }

            lastError = 'npm returned an empty version value'
        } catch (error) {
            lastError = getCommandErrorMessage(error)
        }
    }

    return { version: null, error: lastError }
}

const run = async (): Promise<void> => {
    const latestVersions = await Promise.all(packages.map((packageName) => getLatestVersion(packageName)))

    let hasOutdated = false

    packages.forEach((packageName, index) => {
        const installed = getInstalledVersion(packageName)
        const latest = latestVersions[index].version
        const latestError = latestVersions[index].error

        if (!installed) {
            console.warn(`⚠️ ${packageName} is not installed\n`)
            return
        }

        if (!latest) {
            const reason = latestError ?? 'Unknown error'

            console.warn(
                `⚠️ Could not fetch latest version for ${packageName}\n` +
                    `   Reason: ${reason}\n` +
                    '   Tip: Check npm registry access (npm config get registry / npm login).\n',
            )
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
