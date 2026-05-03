# imaginario27-portfolio — Claude project rules

## Project

`imaginario27-portfolio` is a Vue 3 + Nuxt 4 + Tailwind CSS v4 website that **consumes** the AirUI design system via two npm packages as Nuxt layers:

- [`@imaginario27/air-ui-ds`](../node_modules/@imaginario27/air-ui-ds) — components + theme tokens
- [`@imaginario27/air-ui-utils`](../node_modules/@imaginario27/air-ui-utils) — composables + pure utils

Content comes from a headless WordPress via `nuxt-graphql-client` (`GQL_HOST`, default `https://imaginario27.com/graphql`). Stack: Nuxt 4.4.2, Vue 3.5.31, Tailwind 4.2.2, TypeScript 6.0.2, Pinia, VueUse, `@nuxt/content` 3, `@nuxtjs/i18n` (es/en/de, default `es`), `@nuxt/image`, `three`, `vue3-toastify`, Vitest + `@vue/test-utils` + `happy-dom`.

This is **not** a monorepo. There are no `packages/` or `docs/` folders, no Changesets, no publish pipeline. All app code lives under [app/](app/) (Nuxt 4 `srcDir`).

## Project map

| Path | Purpose |
|---|---|
| [app/components/](app/components/) | App-specific components (`pathPrefix: false`, auto-imported). Categories: `hero-animations/`, `layout/`, `toggles/` |
| [app/layouts/](app/layouts/) | `default.vue` |
| [app/pages/](app/pages/) | Routes (`index.vue`, `graphql-test.vue`) |
| [app/stores/](app/stores/) | Pinia stores (`useLanguageStore`, `useThemeStore`) |
| [app/composables/](app/composables/) | App-only composables (e.g. `useWPSeo`) |
| [app/models/](app/models/) | `enums/`, `types/` — auto-imported via `imports.dirs: ["models/**"]` |
| [app/queries/](app/queries/) | `.gql` files consumed by `nuxt-graphql-client` |
| [app/extend/queries/](app/extend/queries/) | GraphQL extensions / fragments |
| [app/assets/css/](app/assets/css/) | `main.css` (Tailwind v4 `@theme`), `theme/` (primitives → colors → ui-theme), `defaults.css` |
| [app/scripts/](app/scripts/) | `generate-theme.ts`, `update-ui-theme-colors.ts` (ts-node) |
| [app/plugins/](app/plugins/) | `vue3-toastify.ts` |
| [i18n/locales/](i18n/locales/) | `es.json`, `en.json`, `de.json` |
| [server/api/](server/api/) | Nitro API routes |
| [content/](content/) | `@nuxt/content` collection |
| [public/](public/) | Static assets (incl. `images/logo/`) |
| [tests/](tests/) | Vitest specs (mirrors `app/` paths — e.g. `app/components/layout/WebHeader.vue` → `tests/components/layout/WebHeader.test.ts`) |
| [nuxt.config.ts](nuxt.config.ts) | Extends both DS packages as Nuxt layers, registers modules, i18n, Tailwind Vite plugin |

## Commands

- `npm run dev` — dev server
- `npm run build` / `npm run generate` / `npm run preview`
- `npm run update-design-system` — bumps both AirUI packages to `latest`
- `npm run generate-theme` — regenerates local theme CSS via `app/scripts/generate-theme.ts`
- `npm run update-theme-colors` — updates `ui-theme.css` color mappings
- `npx vitest` / `npx vitest run` — run tests
- `npx vue-tsc --noEmit` — typecheck

There is no commitlint/husky/changeset setup in this repo. Use Conventional Commits as a convention (`feat:`, `fix:`, `chore:`, `docs:`…) without enforced scopes.

## How this project uses the design system

- `nuxt.config.ts` contains `extends: ["@imaginario27/air-ui-ds/nuxt.config.ts", "@imaginario27/air-ui-utils/nuxt.config.ts"]`. This makes every DS component, composable, enum, type, and the DS `assets/css/theme/` available via Nuxt auto-import — **no explicit imports needed** for `CompactHeader`, `AppLogo`, `DropdownSelect`, `ActionButton`, `Section`, `SectionBody`, enums like `SelectType` / `ButtonSize` / `ButtonStyleType`, composables like `useIsMobile`, etc. See [app/components/layout/WebHeader.vue](app/components/layout/WebHeader.vue) for a canonical example.
- **DS-first rule.** Whenever a UI need maps to something AirUI already ships, use the AirUI component. Raw HTML + Tailwind is the fallback *only* when nothing in AirUI fits. This applies to buttons, alerts, cards, accordions, avatars, badges, breadcrumbs, modals, tabs, tables, form fields, sections, heroes, etc. — see the MCP workflow below.
- **Do not** reach into `node_modules/@imaginario27/...` with relative imports. Rely on auto-import via layers.
- **Do not** copy DS components into this repo. If a DS component is missing a feature, flag it — the fix belongs in the DS repo, not here.
- Theme CSS is duplicated locally under [app/assets/css/theme/](app/assets/css/theme/) so it can be regenerated via `generate-theme` / `update-theme-colors` scripts. Tokens are declared under `@theme { … }` in [app/assets/css/main.css](app/assets/css/main.css). Tailwind v4 — there is no `tailwind.config.*`.

## AirUI MCP (source of truth for DS components)

This project has the AirUI docs MCP server wired in (`claude_ai_AirUI`). Use it **before** hand-rolling any component — it's the authoritative list of what AirUI exposes, the prop/enum surface, and usage examples. Tools:

| Tool | When to call |
|---|---|
| `mcp__claude_ai_AirUI__list_doc_pages` | Get an overview of all available components & blocks (paths like `/docs/components/<name>`, `/docs/blocks/<name>`) |
| `mcp__claude_ai_AirUI__search_docs` | Keyword search (e.g. `"button"`, `"section"`, `"card"`, `"accordion"`, `"hero"`) to find the right page |
| `mcp__claude_ai_AirUI__get_doc_page` | Read the full page with props, enums, and MDC examples (pass a `path` from the list/search result). **Can return large payloads** — some pages exceed the per-call token cap and get spilled to a tool-results file that must be chunk-read. Only call it when you actually need the full prop/enum table. |

**Cost-saving heuristic:** lead with `search_docs` — the returned title + path is often enough to pick the right component by name. Reserve `get_doc_page` for moments when you need to know prop names, enum values, or slot structure and can't infer them from existing usage in this repo. When you do call `get_doc_page` and hit the truncation warning, read the saved file in chunks rather than retrying.

**Decision flow — always run this before writing UI code:**

1. Describe the UI need in one sentence ("I need a card with an image, title, and CTA").
2. Call `search_docs` with 1–2 keywords; if nothing obvious, fall back to `list_doc_pages`.
3. If a match exists → `get_doc_page` to confirm the props, then use the DS component name (auto-imported) with enum-bound props.
4. Only if no match exists → build it in `app/components/<category>/`, composing smaller DS pieces where possible (e.g. `ActionButton`, `MdiIcon`, `Section`).

Existing consumption already follows this: [app/components/layout/WebHeader.vue](app/components/layout/WebHeader.vue) uses `CompactHeader`, `AppLogo`, `DropdownSelect`; [app/components/layout/hero/HomeHero.vue](app/components/layout/hero/HomeHero.vue) uses `ActionButton`; [app/pages/index.vue](app/pages/index.vue) uses `Section` + `SectionBody`. Match that pattern.

## Adding a new app-specific component (checklist)

1. Create `app/components/<category>/<ComponentName>.vue` (PascalCase filename = auto-imported name). Reuse existing categories (`layout/`, `toggles/`, `hero-animations/`) or add a new one.
2. Compose from DS components first. Only add a new component here if the behavior is portfolio-specific (site layout, page sections, WP-data wiring, three.js scenes, etc.).
3. If a prop uses a fixed value set, prefer a DS enum (auto-imported from the DS layer). Otherwise add one in [app/models/enums/](app/models/enums/). Shared object shapes go in [app/models/types/](app/models/types/).
4. Write a test at `tests/components/<category>/<ComponentName>.test.ts` mirroring the source path; import the subject via the `~/` or relative alias resolved by `vitest.config.ts`.
5. Style with Tailwind utilities + semantic DS tokens only (see GUARDRAILS.md).

## Adding a new page / route

1. Create `app/pages/<path>.vue`. Use `definePageMeta({ title, description, layout })` as needed.
2. For CMS-backed pages, fetch via `useAsyncGql({ operation, variables })` using a query from [app/queries/](app/queries/).
3. For SEO, use [app/composables/useWPSeo.ts](app/composables/useWPSeo.ts).
4. Add translations keys in [i18n/locales/*.json](i18n/locales/) for all three locales (es/en/de).

## Common Claude mistakes to avoid

1. Writing `defineProps<{…}>()` with a TS generic. This repo uses runtime `defineProps({ key: { type: … as PropType<T>, default, validator } })` — match [app/components/layout/WebHeader.vue](app/components/layout/WebHeader.vue).
2. Adding `<style scoped>` blocks. Components are Tailwind utility-first via `:class="[ … ]"` arrays.
2a. Cramming 4+ classes or 4+ props on a single line. If an element has more than 3 classes **or** more than 3 attributes, break each onto its own line (see GUARDRAILS.md §4a). This is not optional.
3. Hardcoding colors (`bg-red-500`, `#fff`). Always use semantic DS tokens (`bg-background-primary-brand-default`, `text-text-neutral-subtle`, `border-border-neutral-subtle`, `text-icon-default`).
4. Creating a barrel `index.ts`. Nuxt auto-import handles components, composables, and `models/**` — a barrel will duplicate registrations.
5. Deep-importing from `node_modules/@imaginario27/...` with relative paths. Rely on the layer `extends` — the name is already globally available.
6. Re-creating a DS component locally because you didn't find it. Before writing one, check the **AirUI MCP** (`search_docs` / `list_doc_pages`) — it's the authoritative catalogue. Filenames in `node_modules/@imaginario27/air-ui-ds/components/**` are a secondary source.
7. Assuming a `tailwind.config.ts`. Tailwind v4 config lives in [app/assets/css/main.css](app/assets/css/main.css) under `@theme { … }`. Theme-variable edits go in [app/assets/css/theme/](app/assets/css/theme/).
8. Binding enum-like DS props as raw strings (`type="image"`). Always bind the enum member (`:type="SelectType.IMAGE"`) — the enum is auto-imported from the DS layer.
9. Forgetting locale coverage. Any user-facing string added to a translation file must exist in `es.json`, `en.json`, and `de.json`.
10. Calling `npm publish`, `changeset`, or monorepo scripts — none of those apply here.
11. Re-implementing a util, composable, or store that already exists. Before writing new logic, search [app/utils/](app/utils/), [app/composables/](app/composables/), [app/stores/](app/stores/), the AirUI layers (`@imaginario27/air-ui-ds`, `@imaginario27/air-ui-utils`), and VueUse — reuse or extend instead of duplicating (GUARDRAILS.md §23).
12. Adding `import` lines for things Nuxt already auto-imports: app components / composables / utils / stores / `models/**`, DS components & enums from the AirUI layers, Vue (`ref`, `computed`, `watch`, …), VueUse, Pinia, and Nuxt runtime (`useAsyncGql`, `useRoute`, `useRuntimeConfig`, `definePageMeta`, …). See GUARDRAILS.md §24.
13. Declaring shared types, interfaces, or enums inline in a component / composable / util / page. Put `type` / `interface` in [app/models/types/](app/models/types/) and `enum` in [app/models/enums/](app/models/enums/), one concept per file (GUARDRAILS.md §25).
