# Architecture

## Repo structure

```
imaginario27-portfolio/
├── app/                                  # Nuxt 4 srcDir
│   ├── app.vue                           # Root app shell
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css                  # Tailwind v4 entry + @theme token declaration
│   │   │   ├── defaults.css              # Base element defaults
│   │   │   └── theme/                    # primitives.css → colors.css → ui-theme.css (local copy of DS tokens)
│   │   └── images/                       # App-specific images
│   ├── components/<category>/*.vue       # Auto-imported, pathPrefix: false
│   │   ├── hero-animations/              # three.js / canvas scenes (e.g. InfiniteLandscape.vue)
│   │   ├── layout/                       # Site chrome (WebHeader.vue, hero/HomeHero.vue)
│   │   └── toggles/                      # ThemeToggle.vue
│   ├── composables/use*.ts               # App-only composables (useWPSeo)
│   ├── extend/queries/                   # GraphQL fragments / query extensions
│   ├── layouts/default.vue               # Single layout at present
│   ├── middleware/                       # Route middleware (currently empty)
│   ├── models/
│   │   ├── enums/                        # App-local enums (menus.ts)
│   │   └── types/                        # App-local types (languages.ts, seo.ts, themes.ts)
│   ├── pages/                            # File-based routes (index.vue, graphql-test.vue)
│   ├── plugins/                          # vue3-toastify.ts
│   ├── queries/*.gql                     # nuxt-graphql-client operations (menu, pages, page-seo)
│   ├── scripts/                          # generate-theme.ts, update-ui-theme-colors.ts (ts-node)
│   ├── stores/                           # Pinia (useLanguageStore, useThemeStore)
│   └── utils/                            # Pure app-local helpers
├── content/                              # @nuxt/content collection
├── i18n/locales/                         # es.json, en.json, de.json
├── public/                               # Static assets (logos under public/images/logo/)
├── server/api/                           # Nitro API routes
├── tests/                                # Vitest specs — mirror app/ paths
├── content.config.ts                     # @nuxt/content collection config
├── eslint.config.mjs                     # ESLint flat config (via @nuxt/eslint)
├── nuxt.config.ts                        # extends the two AirUI packages as Nuxt layers
├── tsconfig.json
└── package.json                          # Single-app package (not a workspace root)
```

## Design-system consumption (dependency flow)

```
node_modules/@imaginario27/air-ui-utils        (leaf layer: composables + pure utils)
                ▲
                │ extends
                │
node_modules/@imaginario27/air-ui-ds           (DS layer: components + theme CSS + enums)
                ▲
                │ extends
                │
      this repo (nuxt.config.ts `extends: [ds, utils]`)
                │
                ▼
      app/** consumes DS names via Nuxt auto-import
```

Both DS layers expose their `components/`, `composables/`, `models/**`, and `assets/css/**` automatically. In this repo, any DS component (e.g. `CompactHeader`, `AppLogo`, `DropdownSelect`, `ActionButton`), composable (e.g. `useIsMobile`), or enum (`SelectType`, `ButtonSize`, `ButtonStyleType`) can be referenced by name without an import statement.

## Theme / token flow

```
app/assets/css/theme/primitives.css ──► colors.css ──► ui-theme.css     (CSS custom properties)
                                                             │
                                                             ▼
              app/assets/css/main.css @theme { --color-* : var(...) }   (Tailwind v4 theme)
                                                             │
                                                             ▼
                     components use semantic utilities: bg-background-*, text-text-*,
                     border-border-*, text-icon-*, rounded-button, opacity-disabled,
                     spacing-section-*
```

There is no `tailwind.config.{ts,js}`. Tailwind v4 is configured via `@import "tailwindcss"` + `@theme { … }` in [app/assets/css/main.css](app/assets/css/main.css). The DS also ships a theme under `node_modules/@imaginario27/air-ui-ds/assets/css/theme/`; the copy in this repo is regenerable via `npm run generate-theme` / `npm run update-theme-colors` and is the source of truth at build time for this app.

## Runtime data flow

```
WordPress (https://imaginario27.com/graphql)
          │
          │ nuxt-graphql-client (GQL_HOST runtimeConfig.public)
          ▼
app/queries/*.gql  ──►  useAsyncGql({ operation, variables })
                                │
                                ▼
                  pages / components render DS components
                                │
                                ▼
            useLanguageStore + @nuxtjs/i18n drive locale (es/en/de)
            useThemeStore drives light/dark token set
```

## Dependency graph

| From | Depends on | How |
|---|---|---|
| this repo | `@imaginario27/air-ui-ds` | Nuxt `extends: ["@imaginario27/air-ui-ds/nuxt.config.ts", …]` |
| this repo | `@imaginario27/air-ui-utils` | same (via `extends`) |
| `@imaginario27/air-ui-ds` | `@imaginario27/air-ui-utils` | DS layer extends utils layer (handled inside the package) |
| `@imaginario27/air-ui-utils` | — | leaf layer |

## Key files

| File | Role | Edit when… |
|---|---|---|
| [nuxt.config.ts](nuxt.config.ts) | Nuxt config: modules, extends (DS layers), i18n, Tailwind Vite plugin, runtimeConfig | Adding a module, changing GQL host, touching i18n locales or strategy |
| [app/assets/css/main.css](app/assets/css/main.css) | Tailwind v4 entry + `@theme` token declaration | Exposing a new semantic token as a Tailwind utility |
| [app/assets/css/theme/](app/assets/css/theme/) | Local copy of DS theme layers (primitives → colors → ui-theme) | Rebranding the portfolio; otherwise regenerate via scripts |
| [app/scripts/generate-theme.ts](app/scripts/generate-theme.ts) | Regenerates `theme/*.css` from source | Theme refresh after DS theme changes |
| [app/scripts/update-ui-theme-colors.ts](app/scripts/update-ui-theme-colors.ts) | Updates `ui-theme.css` color mappings | Switching color palette without full regen |
| [app/queries/](app/queries/) | GraphQL operations (`menu`, `pages`, `page-seo`) | Adding a new WP data source |
| [app/extend/queries/](app/extend/queries/) | Fragments / query extensions consumed by the codegen | Reusing a fragment across queries |
| [app/stores/useLanguageStore.ts](app/stores/useLanguageStore.ts) | Current locale + available languages, wired to i18n | Changing locale bootstrapping |
| [app/stores/useThemeStore.ts](app/stores/useThemeStore.ts) | Light/dark mode state | Changing theme persistence or default |
| [i18n/locales/](i18n/locales/) | `es.json`, `en.json`, `de.json` | Adding/renaming translation keys (all three locales required) |
| [content.config.ts](content.config.ts) | `@nuxt/content` collection config | Splitting collections or adding schema |
| [tests/](tests/) | Vitest specs mirroring `app/` paths | Every new component or util gets a sibling test |
