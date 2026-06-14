const { execSync } = require('node:child_process')
const http = require('node:http')

const BASE_URL = 'http://localhost:3000'

const checkServer = (url) => {
    return new Promise((resolve) => {
        http.get(url, (res) => {
            res.resume()
            resolve(true)
        }).on('error', () => resolve(false))
    })
}

const run = async () => {
    const isRunning = await checkServer(BASE_URL)

    if (!isRunning) {
        console.error(`\n  ✖ Dev server is not running at ${BASE_URL}\n` + `    Start it first with: npm run dev\n`)
        process.exit(1)
    }

    // Run collect and assert as separate steps so that the Windows EPERM
    // error (chrome-launcher failing to delete its temp dir) doesn't abort
    // the entire run — results are already saved before cleanup crashes.
    try {
        execSync('npx lhci collect', { stdio: 'inherit' })
    } catch {
        // chrome-launcher on Windows may fail to clean up its temp directory (EPERM).
        // The audit results are still valid — reports are saved to .lighthouseci/.
    }

    try {
        execSync('npx lhci assert', { stdio: 'inherit' })
    } catch (err) {
        process.exit(err.status || 1)
    }
}

run()
