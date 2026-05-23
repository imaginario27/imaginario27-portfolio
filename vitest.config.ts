import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: ['tests/setup.ts'],
        include: ['tests/**/*.test.ts'],
        hookTimeout: 60000,
        testTimeout: 30000,
        onConsoleLog: (log: string) => {
            if (log.includes('<Suspense> is an experimental feature')) return false
        },
        coverage: {
            provider: 'v8',
            reportsDirectory: 'tests/coverage',
            reporter: ['text', 'lcov'],
            include: ['app/**/*.{ts,vue}'],
            exclude: ['app/scripts/**', 'app/plugins/**', 'app/queries/**', 'app/extend/**'],
        },
    },
})
