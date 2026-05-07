import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        environment: 'nuxt',
        coverage: {
            provider: 'v8',
            reportsDirectory: 'tests/.coverage',
            reporter: ['text', 'html'],
        },
        globals: true,
        include: ['tests/**/*.test.ts'],
    },
})
