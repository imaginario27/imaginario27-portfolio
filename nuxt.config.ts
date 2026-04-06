// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

    modules: ["@pinia/nuxt", "@vueuse/nuxt", "@nuxt/content", "@nuxtjs/i18n", "@nuxt/image"],

    imports: {
        dirs: ["~/app/models/**"],
    },

    components: [
        {
            path: "~/app/components",
            pathPrefix: false,
        },
    ],

    extends: ["@imaginario27/air-ui-ds/nuxt.config.ts", "@imaginario27/air-ui-utils/nuxt.config.ts"],

    i18n: {
        langDir: "locales",
        strategy: "no_prefix",
        defaultLocale: "en",
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: "i18n_redirected",
            fallbackLocale: "en",
            alwaysRedirect: false,
            redirectOn: "root",
        },
        locales: [
            {
                code: "en",
                iso: "en",
                name: "English",
                file: "en.json",
            },
        ],
        vueI18n: "i18n.config.ts",
    },

    css: ["~/assets/css/main.css"],

    vite: {
        plugins: [tailwindcss()],
    },
})
