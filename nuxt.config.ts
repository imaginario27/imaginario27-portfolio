// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },

    runtimeConfig: {
        public: {
            GQL_HOST: process.env.GQL_HOST || "https://imaginario27.com/graphql",
        }
    },

    modules: [
      "@pinia/nuxt",
      "@vueuse/nuxt",
      "@nuxt/content",
      "@nuxtjs/i18n",
      "@nuxt/image",
      "nuxt-graphql-client",
    ],

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
        strategy: "prefix_except_default",
        defaultLocale: "es",
        detectBrowserLanguage: false,
        locales: [
            {
                code: "es",
                iso: "es",
                name: "Español",
                file: "es.json",
            },
            {
                code: "en",
                iso: "en",
                name: "English",
                file: "en.json",
            },
            {
                code: "de",
                iso: "de",
                name: "Deutsch",
                file: "de.json",
            },
        ],
        vueI18n: "i18n.config.ts",
    },

    css: ["~/assets/css/main.css"],

    vite: {
        plugins: [tailwindcss()],
    },
})