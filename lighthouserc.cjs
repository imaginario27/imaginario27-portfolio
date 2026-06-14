const { execSync } = require('node:child_process')

const BASE_URL = 'http://localhost:3000'

const getUrlsFromSitemap = () => {
    try {
        const xml = execSync(`node -e "fetch('${BASE_URL}/sitemap.xml').then(r=>r.text()).then(t=>process.stdout.write(t))"`, {
            timeout: 10000,
            encoding: 'utf-8',
        })
        const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
            const parsed = new URL(m[1])
            return `${BASE_URL}${parsed.pathname}`
        })
        if (urls.length > 0) return urls
    } catch {
        // Sitemap not reachable — fall back to hardcoded list
    }
    return [`${BASE_URL}/`, `${BASE_URL}/about`, `${BASE_URL}/contact`]
}

module.exports = {
    ci: {
        collect: {
            url: getUrlsFromSitemap(),
            numberOfRuns: 1,
            settings: {
                onlyCategories: ['accessibility', 'best-practices', 'seo'],
                skipAudits: ['errors-in-console'],
                throttlingMethod: 'provided',
                chromeFlags: '--no-sandbox --disable-gpu --user-data-dir=.lighthouseci/chrome-profile',
            },
        },
        assert: {
            assertions: {
                'categories:accessibility': ['warn', { minScore: 0.9 }],
                'categories:best-practices': ['warn', { minScore: 0.9 }],
                'categories:seo': ['warn', { minScore: 0.9 }],
            },
        },
        upload: {
            target: 'filesystem',
            outputDir: '.lighthouseci',
        },
    },
}
