#!/usr/bin/env node
// PreToolUse hook: blocks access to .env files (allows .env.example).
// Logs blocked attempts to .claude/blocked-access.log.
let data = ''
process.stdin.on('data', (chunk) => (data += chunk))
process.stdin.on('end', () => {
    try {
        const payload = JSON.parse(data)
        const input = payload.tool_input || {}
        const targets = [input.file_path, input.path, input.pattern, input.command].filter(Boolean)
        const re = /(^|[\\/\s"'`=])\.env(?!\.example)(\.[\w-]+)?(?![.\w-])/
        if (targets.some((t) => re.test(t))) {
            const fs = require('fs')
            const path = require('path')
            const logDir = path.join(process.cwd(), '.claude')
            fs.mkdirSync(logDir, { recursive: true })
            fs.appendFileSync(
                path.join(logDir, 'blocked-access.log'),
                `${new Date().toISOString()} ${payload.tool_name} ${JSON.stringify(input)}\n`,
            )
            process.stdout.write(
                JSON.stringify({
                    hookSpecificOutput: {
                        hookEventName: 'PreToolUse',
                        permissionDecision: 'deny',
                        permissionDecisionReason: 'Access to .env is blocked by project policy. Use .env.example for templates.',
                    },
                }),
            )
        }
    } catch (err) {
        process.stderr.write(`block-env hook: ${err.message}\n`)
    }
})
