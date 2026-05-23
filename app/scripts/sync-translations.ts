const PROJECT_KEY = 'imaginario27_imaginario27-portfolio_6e485fe9-dff3-4a8b-85d8-444661076ebd'

const SONAR_HOST_URL = process.env.SONAR_HOST_URL
if (!SONAR_HOST_URL) {
    console.error('❌ SONAR_HOST_URL environment variable is not set.')
    process.exit(1)
}
const BASE_URL = `${SONAR_HOST_URL.replace(/\/$/, '')}/api`

// Detect PR vs branch context.
// In a GitHub Actions PR run, GITHUB_REF_NAME is "<number>/merge".
const IS_PR = process.env.GITHUB_EVENT_NAME === 'pull_request'
const PR_NUMBER = IS_PR ? process.env.GITHUB_REF_NAME?.split('/')[0] : process.env.SONAR_PR
const BRANCH = PR_NUMBER ? '' : process.env.SONAR_BRANCH || process.env.GITHUB_REF_NAME || 'main'

const refParams = (): Record<string, string> => (PR_NUMBER ? { pullRequest: PR_NUMBER } : { branch: BRANCH })

const refDescription = (): string => (PR_NUMBER ? `PR #${PR_NUMBER}` : `branch "${BRANCH}"`)

interface Issue {
    key: string
    severity: string
    type: string
    message: string
    component: string
    line?: number
}

interface IssuesResponse {
    total: number
    issues: Issue[]
}

const fetchIssues = async (statuses: string, page = 1): Promise<IssuesResponse> => {
    const token = process.env.SONAR_TOKEN
    if (!token) {
        console.error('❌ SONAR_TOKEN environment variable is not set.')
        process.exitCode = 1
        return { total: 0, issues: [] }
    }

    const params = new URLSearchParams({
        componentKeys: PROJECT_KEY,
        ...refParams(),
        statuses,
        ps: '100',
        p: String(page),
    })

    const url = `${BASE_URL}/issues/search?${params}`
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        const body = await res.text()
        console.error(`❌ SonarQube API error: ${res.status} ${res.statusText}`)
        console.error(`   URL: ${url}`)
        console.error(`   Response: ${body.slice(0, 500)}`)
        process.exitCode = 1
        return { total: 0, issues: [] }
    }

    return res.json() as Promise<IssuesResponse>
}

const severityIcon = (severity: string): string => {
    const icons: Record<string, string> = {
        BLOCKER: '🔴',
        CRITICAL: '🟠',
        MAJOR: '🟡',
        MINOR: '🔵',
        INFO: '⚪',
    }
    return icons[severity] || '⚪'
}

const sanitize = (input: string): string => {
    return input.replaceAll(/[\r\n]/g, '').slice(0, 500)
}

const stripPrefix = (component: string): string => {
    return component.replace(`${PROJECT_KEY}:`, '')
}

const fetchLastAnalysis = async (): Promise<string | null> => {
    const token = process.env.SONAR_TOKEN
    if (!token) {
        console.error('❌ SONAR_TOKEN environment variable is not set.')
        return null
    }

    const params = new URLSearchParams({
        project: PROJECT_KEY,
        ...refParams(),
        ps: '1',
    })

    const url = `${BASE_URL}/project_analyses/search?${params}`
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        const body = await res.text()
        console.error(`❌ fetchLastAnalysis: HTTP ${res.status} ${res.statusText}`)
        console.error(`   URL: ${url}`)
        console.error(`   Response: ${body.slice(0, 500)}`)
        return null
    }

    const data = (await res.json()) as { analyses: { date: string }[] }
    if (!data.analyses?.length) {
        console.error(`⚠️  API returned 0 analyses for project="${PROJECT_KEY}" on ${refDescription()}.`)
        console.error('    Possible causes: wrong project key, scan ran on a different ref, or token lacks Browse permission.')
    }
    return data.analyses?.[0]?.date || null
}

const formatTimeSince = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} minute(s) ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour(s) ago`
    const days = Math.floor(hours / 24)
    return `${days} day(s) ago`
}

const checkSonar = async () => {
    console.log(`🔎 Checking SonarQube for ${refDescription()}...`)

    const lastAnalysis = await fetchLastAnalysis()
    if (!lastAnalysis) {
        console.warn(`⚠️  No scan found on SonarQube for ${refDescription()}. Run "npm run sonar" first.\n`)
        process.exitCode = 1
        return
    }

    console.log(`📅 Last scan: ${formatTimeSince(lastAnalysis)} (${new Date(lastAnalysis).toLocaleString()})`)

    const hoursSince = (Date.now() - new Date(lastAnalysis).getTime()) / 3600000
    if (hoursSince > 24) {
        console.warn('⚠️  Results may be stale. Consider running "npm run sonar" to refresh.\n')
    }

    const openIssues = await fetchIssues('OPEN,CONFIRMED,REOPENED')
    const total = openIssues.total

    if (total === 0) {
        console.log('✅ No open SonarQube issues found.')
        return
    }

    console.log(`\n⚠️  ${Number(total)} open SonarQube issue(s) found:\n`)

    const counts: Record<string, number> = {}

    for (const issue of openIssues.issues) {
        counts[issue.severity] = (counts[issue.severity] || 0) + 1
        const loc = issue.line ? `:${issue.line}` : ''
        const icon = severityIcon(issue.severity)
        const component = sanitize(stripPrefix(issue.component))
        const severity = sanitize(issue.severity)
        const message = sanitize(issue.message)
        console.log(`  ${icon} [${severity}] ${component}${loc}`)
        console.log(`    ${message}\n`)
    }

    if (total > 100) {
        console.log(`  ... and ${total - 100} more (check SonarQube dashboard)\n`)
    }

    console.log('Summary:')
    for (const [severity, count] of Object.entries(counts)) {
        console.log(`  ${severityIcon(severity)} ${severity}: ${count}`)
    }
    console.log(`\n🔗 ${SONAR_HOST_URL}/project/issues?id=${PROJECT_KEY}&resolved=false\n`)

    process.exitCode = 1
}

await checkSonar()
