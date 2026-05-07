#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

// ----------------------------------------------------
// CONFIGURATION
// ----------------------------------------------------
const ASSETS_THEME_PATH = 'app/assets/css/theme'
const UI_THEME_FILE = 'ui-theme.css'
const COLORS_FILE = 'colors.css'

const THEMES = ['primary-brand', 'secondary-brand', 'neutral', 'success', 'warning', 'info', 'danger'] as const

type Theme = (typeof THEMES)[number]

interface Replacement {
    theme: Theme
    from: string
    to: string
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const ask = (question: string): Promise<string> => new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())))

const readFile = (filePath: string): string => fs.readFileSync(filePath, 'utf8')

const writeFile = (filePath: string, content: string): void => fs.writeFileSync(filePath, content)

const getColorSchemesFromColorsCss = (content: string): Set<string> => {
    const regex = /(?:--)?(?:color-)?([a-z0-9-]+)-50:/g
    const schemes = new Set<string>()

    let match: RegExpExecArray | null
    while ((match = regex.exec(content))) {
        const scheme = match[1]
        if (scheme) {
            schemes.add(scheme)
        }
    }

    return schemes
}

const extractCurrentSchemeForTheme = (css: string, theme: Theme): string | null => {
    const regex = new RegExp(String.raw`--color-theme-${theme}-\d+:\s*var\(--([a-z0-9-]+)-\d+\)`, 'i')

    const match = regex.exec(css)
    return match?.[1] ?? null
}

// ----------------------------------------------------
// MAIN
// ----------------------------------------------------
const run = async (): Promise<void> => {
    const themePath = path.resolve(process.cwd(), ASSETS_THEME_PATH)
    const uiThemePath = path.join(themePath, UI_THEME_FILE)
    const colorsPath = path.join(themePath, COLORS_FILE)

    if (!fs.existsSync(uiThemePath)) {
        console.error(`❌ ui-theme.css not found at ${uiThemePath}`)
        process.exit(1)
    }

    if (!fs.existsSync(colorsPath)) {
        console.error(`❌ colors.css not found at ${colorsPath}`)
        process.exit(1)
    }

    let uiThemeCss = readFile(uiThemePath)
    const colorsCss = readFile(colorsPath)
    const availableSchemes = getColorSchemesFromColorsCss(colorsCss)

    const replacements: Replacement[] = []

    console.log('\n🎨 UI Theme color scheme configuration\n')

    for (const theme of THEMES) {
        const currentScheme = extractCurrentSchemeForTheme(uiThemeCss, theme)

        if (!currentScheme) {
            console.log(`⚠️  Could not detect current scheme for "${theme}", skipping`)
            continue
        }

        const answer = await ask(`Do you want to replace "${theme}" color scheme? (current: ${currentScheme}) [y/N]: `)

        if (answer.toLowerCase() !== 'y') {
            continue
        }

        const newScheme = await ask(`→ Enter new color scheme name (must exist in colors.css, ex.: lavender): `)

        if (!availableSchemes.has(newScheme)) {
            console.error(`❌ Color scheme "${newScheme}" does not exist in colors.css — skipping "${theme}"`)
            continue
        }

        replacements.push({
            theme,
            from: currentScheme,
            to: newScheme,
        })
    }

    rl.close()

    if (replacements.length === 0) {
        console.log('\nℹ️  No changes applied')
        return
    }

    // Apply replacements AFTER all questions
    for (const { theme, from, to } of replacements) {
        const regex = new RegExp(String.raw`(--color-theme-${theme}-\d+:\s*var\()\s*--(?:color-)?${from}-(\d+\))`, 'g')

        // Result will be: var(--pink-500), not --color-pink-500
        uiThemeCss = uiThemeCss.replace(regex, `$1--${to}-$2`)
    }

    writeFile(uiThemePath, uiThemeCss)

    console.log('\n✅ ui-theme.css updated successfully\n')

    // Normalize colors.css by removing `--color-` prefix
    const updatedColorsCss = colorsCss.replace(/--color-([a-z0-9-]+):/g, '--$1:')

    if (updatedColorsCss !== colorsCss) {
        writeFile(colorsPath, updatedColorsCss)
        console.log('✅ colors.css cleaned: removed --color- prefixes\n')
    }
}

run()
