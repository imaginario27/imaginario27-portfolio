# Guardrails

1. ALWAYS use `<script setup lang="ts">` with runtime `defineProps({ key: { type: … as PropType<T>, default, validator } })`. NEVER use the generic `defineProps<Interface>()` form.
2. ALWAYS type enum-like props with an enum — prefer a DS enum (auto-imported from the `@imaginario27/air-ui-ds` layer, e.g. `SelectType`, `ButtonSize`, `ButtonStyleType`) and fall back to an app-local enum in [app/models/enums/](app/models/enums/). Validate with `validator: (v) => Object.values(Enum).includes(v)`.
2a. ALWAYS bind the enum member when consuming a DS prop: `<ActionButton :size="ButtonSize.MD" :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED" />`, never `size="md"` / `styleType="primary-brand-filled"`. Applies across `app/components/**`, `app/pages/**`, and `app/layouts/**`.
3. NEVER use the Options API, `defineComponent({ data() … })`, or `.tsx` components. This repo is `<script setup>` only.
4. NEVER add a `<style>` or `<style scoped>` block. Styling is Tailwind utility-first via `:class="[ … ]"` arrays.
4a. ALWAYS format class arrays with **one class per line** (and the opening tag / `:class` on its own lines) whenever an element has **more than 3 classes OR more than 3 attributes/props**. This is a hard readability rule — no single-line arrays of 4+ classes, ever.

```vue
<!-- ✅ good (> 3 classes → one per line) -->
<div
    :class="[
        'relative',
        'w-full',
        'h-[calc(100vh-72px)]',
        'overflow-hidden',
    ]"
>

<!-- ❌ bad -->
<div :class="['relative', 'w-full', 'h-[calc(100vh-72px)]', 'overflow-hidden']">
```

Same rule for components that take more than 3 props — break each prop onto its own line:

```vue
<!-- ✅ good -->
<InfiniteLandscape
    width="100%"
    height="100%"
    :cameraZ="125"
    :planeSize="256"
    :speed="0.5"
/>
```

Elements with ≤ 3 classes *and* ≤ 3 attributes may stay on one line.
5. NEVER hardcode colors, radii, or spacings (`bg-red-500`, `#fff`, ad-hoc `rounded-lg` where a `rounded-button` token applies). Use semantic DS tokens: `bg-background-*`, `text-text-*`, `border-border-*`, `text-icon-*`, `rounded-button`, `opacity-disabled`, `spacing-section-*`.
6. NEVER create or edit a `tailwind.config.*`. Tailwind v4 config lives in [app/assets/css/main.css](app/assets/css/main.css) under `@theme { … }` with variables from [app/assets/css/theme/*.css](app/assets/css/theme/).
7. NEVER create a barrel `index.ts`. Nuxt auto-imports every component (`pathPrefix: false`), composable, and `models/**` file.
8. NEVER deep-import DS internals with `node_modules/@imaginario27/...` paths or copy DS components into this repo. Rely on the layer `extends` in [nuxt.config.ts](nuxt.config.ts) — DS names are already globally available.
9. BEFORE creating a new component — AND before hand-rolling markup for things like buttons, cards, alerts, sections, form fields, accordions, avatars, badges, breadcrumbs, modals, tabs, tables, heroes, etc. — query the **AirUI MCP** (`mcp__claude_ai_AirUI__search_docs`, `mcp__claude_ai_AirUI__list_doc_pages`, `mcp__claude_ai_AirUI__get_doc_page`). Prefer `search_docs` for discovery — the title + path alone is usually enough to pick the component. Only call `get_doc_page` when you need prop names / enum values / slot structure you can't infer from existing usage in this repo, because it can return payloads large enough to require chunked file reads. If AirUI exposes it, use the DS component; raw Tailwind markup is only acceptable when no AirUI component fits. Only add an `app/components/**` wrapper for portfolio-specific behavior (site chrome, page sections, WP-data wiring, three.js scenes, etc.).
9a. DS-first rule: when composing inside an `app/components/**` file, prefer composing smaller AirUI primitives (e.g. `ActionButton`, `MdiIcon`, `Section`, `SectionBody`, `Card`, `Alert`) over hand-writing equivalent markup. Raw `<button>` / `<input>` / `<select>` / `<dialog>` / ad-hoc wrappers mimicking AirUI components are a code-review smell.
10. ALWAYS mirror a component's path in tests: `app/components/<cat>/<Name>.vue` → `tests/components/<cat>/<Name>.test.ts` using `mount` from `@vue/test-utils`. Run via `npx vitest`.
11. ALWAYS co-create a test file for every new util in [app/utils/](app/utils/) → `tests/utils/<name>.test.ts`, and every new composable in [app/composables/](app/composables/) → `tests/composables/<name>.test.ts`.
12. ALWAYS declare `defineOptions({ inheritAttrs: false })` when a component spreads `$attrs` on an inner element via `v-bind`.
13. ALWAYS encode variants as a `computed` returning an `Object.values`-validated map keyed by an enum; NEVER use CVA, `class-variance-authority`, or ad-hoc string concatenation.
14. ALWAYS emit events via `defineEmits(['eventName'])` (array form) or typed object form. Kebab-case event names (`update:modelValue`, `close`).
15. NEVER use placeholder text like "Lorem ipsum" or `TODO` in default prop values, page content, or i18n strings. Use realistic values.
16. ALWAYS cover all three locales (`es`, `en`, `de`) for every user-facing string added. If a key exists in [i18n/locales/es.json](i18n/locales/es.json), it must exist in `en.json` and `de.json`.
17. ALWAYS import test subjects via the configured alias (e.g. `~/components/layout/WebHeader.vue` or `@/components/...` depending on `vitest.config.ts`), never via `node_modules` paths.
18. NEVER commit generated artifacts from `npm run generate-theme` / `update-theme-colors` without also updating the source they derive from. If the script produced unexpected diffs, investigate before committing.
19. NEVER call `npm publish`, `changeset`, `version-packages`, or any release script. This repo is the portfolio app, not the design system — release work happens in the AirUI repo.
20. NEVER modify files under `node_modules/@imaginario27/**`. If the DS or utils layer needs a fix, raise it in the DS repo and bump here via `npm run update-design-system`.
21. ALWAYS fetch CMS data via `useAsyncGql({ operation, variables })` with an operation defined in [app/queries/](app/queries/). Do not call `$fetch` against the GraphQL endpoint directly, and do not hardcode the GQL host — it comes from `runtimeConfig.public.GQL_HOST`.
22. NEVER skip commit hooks with `--no-verify`. Fix the underlying lint / typecheck failure instead.
