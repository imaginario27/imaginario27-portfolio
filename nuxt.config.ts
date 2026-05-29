// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: false },

    runtimeConfig: {
        public: {
            GQL_HOST: process.env.GQL_HOST || 'https://imaginario27.com/graphql',
        },
    },

    modules: [
        '@pinia/nuxt',
        '@vueuse/nuxt',
        '@nuxt/content',
        '@nuxtjs/i18n',
        '@nuxt/image',
        'nuxt-graphql-client',
        '@vueuse/motion/nuxt',
        '@nuxt/fonts',
    ],

    imports: {
        dirs: ['models/**'],
    },

    components: [
        {
            path: 'components',
            pathPrefix: false,
        },
    ],

    extends: ['@imaginario27/air-ui-ds/nuxt.config.ts', '@imaginario27/air-ui-utils/nuxt.config.ts'],

    i18n: {
        langDir: 'locales',
        strategy: 'prefix_except_default',
        defaultLocale: 'es',
        detectBrowserLanguage: false,
        locales: [
            {
                code: 'es',
                iso: 'es',
                name: 'Español',
                file: 'es.json',
            },
            {
                code: 'en',
                iso: 'en',
                name: 'English',
                file: 'en.json',
            },
            {
                code: 'de',
                iso: 'de',
                name: 'Deutsch',
                file: 'de.json',
            },
        ],
        vueI18n: 'i18n.config.ts',
    },

    css: ['~/assets/css/main.css', '~/assets/css/defaults.css'],

    app: {
        head: {
            link: [
                // Favicons
                // Generate favicons: https://favicon.io/
                {
                    rel: 'apple-touch-icon',
                    sizes: '180x180',
                    href: '/favicon/apple-touch-icon.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '192x192',
                    href: 'favicon/android-chrome-192x192.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '512x512',
                    href: '/favicon/android-chrome-512x512.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    href: '/favicon/favicon-32x32.png',
                },
                {
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '16x16',
                    href: '/favicon/favicon-16x16.png',
                },
                {
                    rel: 'icon',
                    type: 'image/x-icon',
                    href: '/favicon/favicon.ico',
                },
            ],

            meta: [
                {
                    name: 'viewport',
                    content: 'width=device-width, initial-scale=1.0, user-scalable=no',
                },
            ],
        },
    },

    typescript: {
        tsConfig: {
            include: ['../tests/**/*'],
            compilerOptions: {
                types: ['vitest/globals'],
            },
        },
    },

    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: ['vue3-toastify'],
        },
    },
})
