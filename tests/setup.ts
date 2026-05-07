import { beforeAll, afterAll } from 'vitest'

const originalWarn = console.warn

beforeAll(() => {
    console.warn = (...args: unknown[]) => {
        if (typeof args[0] === 'string' && args[0].includes('No match found for location')) return
        originalWarn(...args)
    }
})

afterAll(() => {
    console.warn = originalWarn
})
