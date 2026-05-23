const { execSync } = require('child_process')
const cases = [
    { name: '.env (Read)', payload: { tool_name: 'Read', tool_input: { file_path: '.env' } }, expect: 'block' },
    { name: '.env.local (Read)', payload: { tool_name: 'Read', tool_input: { file_path: '.env.local' } }, expect: 'block' },
    { name: '.env.example (Read)', payload: { tool_name: 'Read', tool_input: { file_path: '.env.example' } }, expect: 'allow' },
    { name: 'src/foo.ts (Read)', payload: { tool_name: 'Read', tool_input: { file_path: 'src/foo.ts' } }, expect: 'allow' },
    { name: 'cat .env (Bash)', payload: { tool_name: 'Bash', tool_input: { command: 'cat .env' } }, expect: 'block' },
    { name: 'cat .env.example (Bash)', payload: { tool_name: 'Bash', tool_input: { command: 'cat .env.example' } }, expect: 'allow' },
    { name: 'echo hi (Bash)', payload: { tool_name: 'Bash', tool_input: { command: 'echo hi' } }, expect: 'allow' },
]
for (const c of cases) {
    const out = execSync('node .claude/hooks/block-env.cjs', { input: JSON.stringify(c.payload) }).toString()
    const blocked = out.includes('"permissionDecision":"deny"')
    const got = blocked ? 'block' : 'allow'
    console.log(`${got === c.expect ? 'PASS' : 'FAIL'}  ${c.name}  expected=${c.expect} got=${got}`)
}
