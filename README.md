# imaginario27-portfolio

Portfolio website for [imaginario27.com](https://imaginario27.com), built with Vue 3, Nuxt 4, and Tailwind CSS v4.

Content is sourced from a headless WordPress instance via GraphQL. The UI consumes the [AirUI](https://www.npmjs.com/package/@imaginario27/air-ui-ds) design system as Nuxt layers.

## Stack

- **Framework:** Nuxt 4 + Vue 3
- **Styling:** Tailwind CSS v4 (theme-based, no `tailwind.config.*`)
- **Design system:** `@imaginario27/air-ui-ds` + `@imaginario27/air-ui-utils` (Nuxt layers)
- **CMS:** WordPress + GraphQL (`nuxt-graphql-client`)
- **i18n:** `@nuxtjs/i18n` — Spanish (default), English, German
- **Fonts:** `@nuxt/fonts` — Inter (body), Sora (headings)
- **State:** Pinia
- **Testing:** Vitest + `@vue/test-utils` + `happy-dom`

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview   # preview production build locally
```

## Testing

```bash
npm test          # single run
npm run test:watch # watch mode
```

## Other commands

| Command                        | Description                               |
| ------------------------------ | ----------------------------------------- |
| `npm run generate-theme`       | Regenerate local theme CSS from DS tokens |
| `npm run update-theme-colors`  | Update `ui-theme.css` color mappings      |
| `npm run update-design-system` | Bump AirUI packages to latest             |
| `npx vue-tsc --noEmit`         | Run TypeScript type checking              |

## Project structure

All app code lives under `app/` (Nuxt 4 `srcDir`). See [guidelines/ARCHITECTURE.md](guidelines/ARCHITECTURE.md) for the full breakdown.

```
app/
  components/     # Auto-imported Vue components
  composables/    # Composables (useGraphQL, useWPSeo, usePortfolioData, ...)
  pages/          # File-based routes
  stores/         # Pinia stores
  models/         # Shared types & enums (auto-imported)
  queries/        # GraphQL .gql operations
  assets/css/     # Tailwind v4 theme + tokens
i18n/locales/     # es.json, en.json, de.json
tests/            # Vitest specs (mirrors app/ paths)
```
