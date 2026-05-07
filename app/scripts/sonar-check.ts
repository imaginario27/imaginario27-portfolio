const PROJECT_KEY = 'imaginario27'
const BASE_URL = 'https://sonarcloud.io/api'

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

async function fetchIssues(statuses: string, page = 1): Promise<IssuesResponse> {
    const token = process.env.SONAR_TOKEN
    if (!token) {
        console.error('❌ SONAR_TOKEN environment variable is not set.')
        process.exitCode = 1
        return { total: 0, issues: [] }
    }

    const params = new URLSearchParams({
        componentKeys: PROJECT_KEY,
        statuses,
        ps: '100',
        p: String(page),
    })

    const res = await fetch(`${BASE_URL}/issues/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
        console.error(`❌ SonarCloud API error: ${res.status} ${res.statusText}`)
        process.exitCode = 1
        return { total: 0, issues: [] }
    }

    return res.json() as Promise<IssuesResponse>
}

function severityIcon(severity: string): string {
    const icons: Record<string, string> = {
        BLOCKER: '🔴',
        CRITICAL: '🟠',
        MAJOR: '🟡',
        MINOR: '🔵',
        INFO: '⚪',
    }
    return icons[severity] || '⚪'
}

function stripPrefix(component: string): string {
    return component.replace(`${PROJECT_KEY}:`, '')
}

async function fetchLastAnalysis(): Promise<string | null> {
    const token = process.env.SONAR_TOKEN
    const params = new URLSearchParams({
        project: PROJECT_KEY,
        ps: '1',
    })

    const res = await fetch(`${BASE_URL}/project_analyses/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return null

    const data = (await res.json()) as { analyses: { date: string }[] }
    return data.analyses?.[0]?.date || null
}

function formatTimeSince(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} minute(s) ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour(s) ago`
    const days = Math.floor(hours / 24)
    return `${days} day(s) ago`
}

async function main() {
    const lastAnalysis = await fetchLastAnalysis()
    if (!lastAnalysis) {
        console.warn('⚠️  No scan found on SonarCloud. Run "npm run sonar" first.\n')
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
        console.log('✅ No open SonarCloud issues found.')
        return
    }

    console.log(`\n⚠️  ${total} open SonarCloud issue(s) found:\n`)

    const counts: Record<string, number> = {}

    for (const issue of openIssues.issues) {
        counts[issue.severity] = (counts[issue.severity] || 0) + 1
        const loc = issue.line ? `:${issue.line}` : ''
        console.log(`  ${severityIcon(issue.severity)} [${issue.severity}] ${stripPrefix(issue.component)}${loc}`)
        console.log(`    ${issue.message}\n`)
    }

    if (total > 100) {
        console.log(`  ... and ${total - 100} more (check SonarCloud dashboard)\n`)
    }

    console.log('Summary:')
    for (const [severity, count] of Object.entries(counts)) {
        console.log(`  ${severityIcon(severity)} ${severity}: ${count}`)
    }
    console.log(`\n🔗 https://sonarcloud.io/project/issues?id=${PROJECT_KEY}&resolved=false\n`)

    process.exitCode = 1
}

main()
