import {
    readFileSync,
    writeFileSync,
    existsSync,
    mkdirSync,
    unlinkSync,
} from "fs"
import { resolve, dirname } from "path"

const inputPath = resolve("assets/css/theme/ui-theme.css")
const outputPath = resolve("assets/css/main.css")

ensureOutputDir(outputPath)
deleteIfExists(outputPath)

const content = readFileSync(inputPath, "utf-8")
const { colorVars, otherVars } = extractThemeVars(content)

const finalOutput = generateThemeFile(colorVars, otherVars)
writeFileSync(outputPath, finalOutput, "utf-8")

console.log("✅ Tailwind theme file generated in assets/css/")

function ensureOutputDir(filePath: string) {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
}

function deleteIfExists(filePath: string) {
    if (existsSync(filePath)) {
        unlinkSync(filePath)
    }
}

function extractThemeVars(content: string) {
    const colorVars: string[] = []
    const otherVars: string[] = []

    const lines = content.split("\n")
    let inRoot = false
    let inDark = false

    for (const rawLine of lines) {
        const line = rawLine.trim()

        if (line.startsWith(":root {")) {
            inRoot = true
            continue
        }
        if (line.startsWith(".dark {")) {
            inDark = true
            continue
        }
        if (line.startsWith("}")) {
            inRoot = false
            inDark = false
            continue
        }

        if (!inRoot || inDark) continue

        const key = extractVarKey(line)
        if (!key || key.startsWith("--ds-")) continue

        const declaration = `    ${key}: var(${key});`
        if (key.startsWith("--color-")) {
            colorVars.push(declaration)
        } else {
            otherVars.push(declaration)
        }
    }

    return { colorVars, otherVars }
}

function extractVarKey(line: string): string | null {
    const match = line.match(/^--[\w-]+:\s*[^;]+;/)
    if (!match) return null
    const [key] = line.split(":").map(s => s.trim().replace(/;$/, ""))
    return key || null
}

function generateThemeFile(colorVars: string[], otherVars: string[]): string {
    return [
        `@import "tailwindcss";`,
        `@source "../../node_modules/@imaginario27/air-ui-ds";`,
        `@source "../../node_modules/@imaginario27/air-ui-utils";`,
        ``,
        `@import "./theme/primitives.css";`,
        `@import "./theme/colors.css";`,
        `@import "./theme/ui-theme.css";`,
        ``,
        `@theme {`,
        `    /* Disables Tailwind default colors */`,
        `    --color-*: initial;`,
        ``,
        ...colorVars,
        ``,
        ...otherVars,
        `}`,
    ].join("\n")
}
