# Guardrails

1. ALWAYS use `<script setup lang="ts">` with runtime `defineProps({ key: { type: … as PropType<T>, default, validator } })`. NEVER use the generic `defineProps<Interface>()` form.
2. ALWAYS type enum-like props with an enum — prefer a DS enum (auto-imported from the `@imaginario27/air-ui-ds` layer, e.g. `SelectType`, `ButtonSize`, `ButtonStyleType`) and fall back to an app-local enum in [app/models/enums/](app/models/enums/). Validate with `validator: (v) => Object.values(Enum).includes(v)`.
   2a. ALWAYS bind the enum member when consuming a DS prop: `<ActionButton :size="ButtonSize.MD" :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED" />`, never `size="md"` / `styleType="primary-brand-filled"`. Applies across `app/components/**`, `app/pages/**`, and `app/layouts/**`.
3. NEVER use the Options API, `defineComponent({ data() … })`, or `.tsx` components. This repo is `<script setup>` only.
4. NEVER add a `<style>` or `<style scoped>` block. Styling is Tailwind utility-first via `:class="[ … ]"` arrays.
5. Formatting is enforced by Prettier ([.prettierrc](../.prettierrc)): `tabWidth: 4`, `printWidth: 140`, `semi: false`, `singleQuote: true`, `singleAttributePerLine: true`. Because of `singleAttributePerLine`, **any element with 2+ attributes/props is broken onto separate lines automatically** — don't fight it. For classes: arrays with **more than 3 classes** must be one-per-line. Don't hand-format around Prettier; let it normalize.

    ```vue
    <!-- good (> 3 classes -> one per line) -->
    <div
        :class="[
            'relative',
            'w-full',
            'h-[calc(100vh-72px)]',
            'overflow-hidden',
        ]"
    >

    <!-- bad -->
    <div :class="['relative', 'w-full', 'h-[calc(100vh-72px)]', 'overflow-hidden']">
    ```

    Same rule for components that take more than 3 props — break each prop onto its own line:

    ```vue
    <!-- good -->
    <InfiniteLandscape width="100%" height="100%" :cameraZ="125" :planeSize="256" :speed="0.5" />
    ```

    Elements with ≤ 3 classes _and_ ≤ 3 attributes may stay on one line.

6. NEVER hardcode colors, radii, or spacings (`bg-red-500`, `#fff`, ad-hoc `rounded-lg` where a `rounded-button` token applies). Use semantic DS tokens: `bg-background-*`, `text-text-*`, `border-border-*`, `text-icon-*`, `rounded-button`, `opacity-disabled`, `spacing-section-*`.
7. NEVER create or edit a `tailwind.config.*`. Tailwind v4 config lives in [app/assets/css/main.css](../app/assets/css/main.css) under `@theme { … }` with variables from [app/assets/css/theme/\*.css](../app/assets/css/theme/).
8. NEVER create a barrel `index.ts`. Nuxt auto-imports every component (`pathPrefix: false`), composable, and `models/**` file.
9. NEVER deep-import DS internals with `node_modules/@imaginario27/...` paths or copy DS components into this repo. Rely on the layer `extends` in [nuxt.config.ts](../nuxt.config.ts) — DS names are already globally available.
10. BEFORE creating a new component — AND before hand-rolling markup for things like buttons, cards, alerts, sections, form fields, accordions, avatars, badges, breadcrumbs, modals, tabs, tables, heroes, etc. — query the **AirUI MCP** (`mcp__claude_ai_AirUI__search_docs`, `mcp__claude_ai_AirUI__list_doc_pages`, `mcp__claude_ai_AirUI__get_doc_page`). Prefer `search_docs` for discovery — the title + path alone is usually enough to pick the component. Only call `get_doc_page` when you need prop names / enum values / slot structure you can't infer from existing usage in this repo, because it can return payloads large enough to require chunked file reads. If AirUI exposes it, use the DS component; raw Tailwind markup is only acceptable when no AirUI component fits. Only add an `app/components/**` wrapper for portfolio-specific behavior (site chrome, page sections, WP-data wiring, three.js scenes, etc.).
11. DS-first rule: when composing inside an `app/components/**` file, prefer composing smaller AirUI primitives (e.g. `ActionButton`, `MdiIcon`, `Section`, `SectionBody`, `Card`, `Alert`) over hand-writing equivalent markup. Raw `<button>` / `<input>` / `<select>` / `<dialog>` / ad-hoc wrappers mimicking AirUI components are a code-review smell.
12. ALWAYS declare `defineOptions({ inheritAttrs: false })` when a component spreads `$attrs` on an inner element via `v-bind`.
13. ALWAYS encode variants as a `computed` returning an `Object.values`-validated map keyed by an enum; NEVER use CVA, `class-variance-authority`, or ad-hoc string concatenation.
14. ALWAYS emit events via `defineEmits(['eventName'])` (array form) or typed object form. Kebab-case event names (`update:modelValue`, `close`).
15. NEVER use placeholder text like "Lorem ipsum" or `TODO` in default prop values, page content, or i18n strings. Use realistic values.
16. ALWAYS cover all three locales (`es`, `en`, `de`) for every user-facing string added. If a key exists in [i18n/locales/es.json](../i18n/locales/es.json), it must exist in `en.json` and `de.json`.
17. NEVER commit generated artifacts from `npm run generate-theme` / `update-theme-colors` without also updating the source they derive from. If the script produced unexpected diffs, investigate before committing.
18. NEVER call `npm publish`, `changeset`, `version-packages`, or any release script. This repo is the portfolio app, not the design system — release work happens in the AirUI repo.
19. NEVER modify files under `node_modules/@imaginario27/**`. If the DS or utils layer needs a fix, raise it in the DS repo and bump here via `npm run update-design-system`.
20. ALWAYS fetch CMS data via the GraphQL wrapper in [app/composables/useGraphQL.ts](../app/composables/useGraphQL.ts): `useAsyncQuery({ operation, variables })` for reactive queries, `executeQuery(operation, variables)` for imperative calls. Operations are defined in [app/queries/](../app/queries/). Do not call `useAsyncGql`, `GqlXxx`, `useGql()`, or `$fetch` against the GraphQL endpoint directly, and do not hardcode the GQL host — it comes from `runtimeConfig.public.GQL_HOST`.
21. NEVER skip commit hooks with `--no-verify`. Fix the underlying lint / typecheck failure instead.
    21a. ALWAYS use conventional commit prefixes (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `style:`, `ci:`, `perf:`) for both commit messages and PR titles. NEVER append a `Co-Authored-By` line. NEVER include a "Test plan" or checklist section in PR descriptions. PR and commit bodies must be `-` bullet lists, one item per line, grouped by topic or scope under `### Heading` sections when applicable.
22. NEVER add an `import` statement for something Nuxt already auto-imports. This includes: every file under [app/components/](../app/components/) (`pathPrefix: false`), [app/composables/](../app/composables/) (including `useAsyncQuery`, `executeQuery`), [app/utils/](../app/utils/), [app/stores/](../app/stores/), [app/models/\*\*](../app/models/) (`imports.dirs: ["models/**"]`), all DS components / composables / enums / types from the two AirUI layers, Vue (`ref`, `computed`, `watch`, `reactive`, `onMounted`, …), VueUse, Pinia (`defineStore`, `storeToRefs`), and Nuxt runtime (`useRoute`, `useRouter`, `useRuntimeConfig`, `useNuxtApp`, `navigateTo`, `definePageMeta`, `defineNuxtPlugin`, `useState`, `useFetch`, `useHead`, `useSeoMeta`, …). If your IDE auto-added one, delete it. Explicit imports are reserved for third-party packages that aren't part of an auto-import source.
23. ALWAYS declare types, interfaces, and enums under [app/models/](../app/models/) — `interface` / `type` in [app/models/types/](../app/models/types/), `enum` in [app/models/enums/](../app/models/enums/), one concept per file, PascalCase filename matching the export. NEVER inline a shared type/enum in a component, composable, util, store, or page; NEVER define a `type` next to a `defineProps` runtime declaration. Component-private literal unions used in a single `validator` are the only exception. Anything reused across two or more files belongs in `models/`.

## Naming

24. NEVER use single-letter or abbreviated variable/parameter names (`p`, `cb`, `val`, `arr`, `el`, `idx`, `img`, `btn`, `opts`, `cfg`). Every identifier must be a full, readable word: `project`, `callback`, `value`, `items`, `element`, `index`, `image`, `button`, `options`, `config`. The only exceptions are: (a) trivial arrow callbacks in `.map`, `.filter`, `.reduce` where the collection name already provides context (e.g. `items.map((item) => …)`), and (b) conventional loop counters `i`, `j` in rare imperative loops. When in doubt, spell it out.

## Reuse

25. ALWAYS reuse existing code before writing new code. Before adding a util, composable, store, component, type, or enum, search for an existing one — in this repo ([app/utils/](../app/utils/), [app/composables/](../app/composables/), [app/stores/](../app/stores/), [app/models/](../app/models/), [app/components/](../app/components/)) **and** in the auto-imported AirUI layers (`@imaginario27/air-ui-ds`, `@imaginario27/air-ui-utils`) and VueUse. If something already does the job, use it; if it's close, extend it. Duplicating logic, copy-pasting helpers, or wrapping an existing util in a new util with the same surface is a code-review smell.
26. ALWAYS check [app/composables/](../app/composables/) and [app/utils/](../app/utils/) (and the auto-imported AirUI layers + VueUse) for an existing helper before writing a local one. Local `const formatX = …` / inline helpers that duplicate an existing util are a code-review smell — extend or reuse the existing one instead of creating a parallel implementation.

## Testing

27. ALWAYS mirror the project structure under [tests/](../tests/). Every source folder that gets tested has a matching subfolder in `tests/` with the same name and nesting — `app/composables/useGallery.ts` → `tests/composables/useGallery.test.ts`, `app/components/layout/WebHeader.vue` → `tests/components/layout/WebHeader.test.ts`, `app/utils/formatDate.ts` → `tests/utils/formatDate.test.ts`, `app/stores/theme.ts` → `tests/stores/theme.test.ts`. Never flatten tests into a single folder or invent a parallel taxonomy.
28. ALWAYS co-create a test file for every new util in [app/utils/](../app/utils/) → `tests/utils/<name>.test.ts`, and every new composable in [app/composables/](../app/composables/) → `tests/composables/<name>.test.ts`.
29. ALWAYS import test subjects via the configured alias (e.g. `~/components/layout/WebHeader.vue` or `@/components/...` depending on [vitest.config.ts](../vitest.config.ts)), never via `node_modules` paths.
30. ALWAYS import TypeScript types and interfaces used by the tested code so tests stay typed end-to-end. Exception: local types/interfaces that are not exported from the subject — those stay test-private.
31. ALWAYS import the components, composables, stores, and utils the test actually exercises. Don't rely on auto-imports inside `tests/**` — be explicit about what the subject under test depends on.
32. PREFER a test factory whenever a setup is reused across cases. Name it `factory` (e.g. `const factory = (props = {}) => mount(Subject, { props })`) and call it from each `it` block instead of duplicating `mount(...)` setup.
33. `vitest.config.ts` sets `globals: true` — NEVER import `describe`, `it`, `expect`, `beforeEach`, `vi`, etc. from `vitest`. Only import non-global testing helpers (`mount` from `@vue/test-utils`, `createPinia`, etc.).
34. `happy-dom` is the DEFAULT environment ([vitest.config.ts](../vitest.config.ts)) — do NOT add `// @vitest-environment happy-dom`, it's redundant. Opt into the `nuxt` environment per file with `// @vitest-environment nuxt` ONLY when the subject actually depends on Nuxt runtime (`useRoute`, `useRouter`, `useAsyncData`/`useFetch`, `useRuntimeConfig`, `useNuxtApp`, `definePageMeta`, `<NuxtLink>`, route middleware, or when you need `mockNuxtImport` from `@nuxt/test-utils/runtime`). The `nuxt` env boots a full Nuxt app per file (~15s and pulls in `pages/**` + every plugin); `happy-dom` runs in ~1s. Pure utils, Pinia stores, VueUse-only composables, and leaf components with no Nuxt API calls MUST stay on the default.
35. STUB design-system children and heavy children; render real children only when the integration is the point of the test.
    - Stub when the child is from `@imaginario27/air-ui-ds` (already covered by DS tests), is heavy (`ECharts`, Monaco, maps, `<NuxtLink>`, `<ClientOnly>`), has side effects you don't want (network, portals/teleports, focus traps, observers), or has its own dedicated test.
    - Render real when the integration between two app-local components is what you're asserting, or when stubbing would erase the behavior under test (e.g. a thin wrapper whose only job is forwarding props).
    - Heuristic: test the seams you own — assert that your component passes the right props and emits the right events. Don't re-test the DS. If a test needs 5+ stubs to stay readable, narrow the assertions or promote it to an integration test in the `nuxt` env.
36. WHEN stubbing a DS child whose `@click` (or other listener) the parent binds, set `inheritAttrs: false` and declare `emits: ["click", …]` on the stub. Otherwise Vue both forwards the listener as a native fallthrough AND fires it on the emitted event, causing the parent handler to run twice.

    ```ts
    // good — stub doesn't double-fire the parent's @click
    stubs: {
        ActionIconButton: {
            inheritAttrs: false,
            emits: ["click"],
            template: '<button class="action-icon-button" @click="$emit(\'click\')" />',
        },
    },
    ```

37. PREFER `vi.mock("~/composables/<path>", …)` (or `vi.mock("~/stores/<path>", …)`) over `mockNuxtImport` whenever possible — `vi.mock` works in `happy-dom`, so the file stays fast (~1s). Only reach for `mockNuxtImport` (and the `nuxt` env it requires) when the subject depends on a true Nuxt runtime API that can't be reached by mocking a single module path. Example:

    ```ts
    // good — stays in happy-dom
    vi.mock("~/composables/useWPSeo", () => ({
        useWPSeo: () => ({ setSeo: vi.fn() }),
    }));

    // avoid for an auto-imported app composable — forces the nuxt env
    mockNuxtImport("useWPSeo", () => () => ({ … }));
    ```

38. ALWAYS run the test you just created/changed and check the output for warnings. A passing assertion suite with `[Vue warn]`, `[Vue Router warn]`, `[nuxt] error caught during app initialization`, unhandled-promise rejections, or `stderr` noise is NOT done. Treat warnings as test failures: silence them at the source (stub the offending child, mock the failing import via `resolve.alias` in [vitest.config.ts](../vitest.config.ts), or switch environment) before marking the test complete.
