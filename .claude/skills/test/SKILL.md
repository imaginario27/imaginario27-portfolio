---
description: Create a unit test for a component, composable, util, or store following project conventions
---

# test

Create a unit test for a given source file, following all project conventions from GUARDRAILS.md and vitest.config.ts.

## Input

The user provides a source file path (e.g. `app/composables/useGallery.ts`, `app/components/layout/WebHeader.vue`).

## Steps

1. **Read the source file** to understand its exports, dependencies, props, emits, and behavior.
2. **Determine the test path** by mirroring the source structure under `tests/`:
    - `app/components/<category>/<Name>.vue` -> `tests/components/<category>/<Name>.test.ts`
    - `app/composables/<name>.ts` -> `tests/composables/<name>.test.ts`
    - `app/utils/<name>.ts` -> `tests/utils/<name>.test.ts`
    - `app/stores/<name>.ts` -> `tests/stores/<name>.test.ts`
3. **Choose the test environment** based on the subject's dependencies:
    - Default is `happy-dom` (do NOT add `// @vitest-environment happy-dom`, it's the default).
    - Only use `// @vitest-environment nuxt` when the subject depends on Nuxt runtime APIs (`useRoute`, `useRouter`, `useAsyncData`, `useFetch`, `useRuntimeConfig`, `useNuxtApp`, `definePageMeta`, `<NuxtLink>`, route middleware) or when `mockNuxtImport` is needed.
    - Pure utils, Pinia stores, VueUse-only composables, and leaf components with no Nuxt API calls MUST stay on the default.
4. **Write the test file** following these rules:

### Imports

- **NEVER** import `describe`, `it`, `expect`, `beforeEach`, `vi` — `globals: true` is set in vitest.config.ts.
- **ALWAYS** explicitly import the subject under test, types, enums, and testing helpers (`mount` from `@vue/test-utils`, `createPinia`, `mountSuspended` from `@nuxt/test-utils/runtime`, etc.).
- Import types via `~/models/types/<name>` and enums via `~/models/enums/<name>`.
- **ALWAYS** import Vue APIs (`ref`, `computed`, `defineComponent`, etc.) explicitly — they are NOT auto-imported in test files.
- Use `~/` alias for all imports as configured in `tests/tsconfig.json`.

### TypeScript — zero errors required

- **NEVER** leave implicit `any` types. In `happy-dom` environment, Nuxt auto-import type augmentations are absent, so computed/ref return types often lose inference through wrappers like `withSetup`. Annotate callback parameters explicitly when TypeScript cannot infer them:

```ts
// bad — implicit any in happy-dom
visibleImages.value.map((item) => item.id)
layout.value.rows.forEach((row) => { ... })
layout.value.rows.reduce((sum, row) => sum + row.items.length, 0)

// good — explicit types
visibleImages.value.map((item: GalleryImage) => item.id)
layout.value.rows.forEach((row: JustifiedRow) => { ... })
layout.value.rows.reduce((sum: number, row: JustifiedRow) => sum + row.items.length, 0)
```

- Import every type used in annotations from `~/models/types/<name>` or `~/models/enums/<name>`.
- After writing the test, mentally check every callback parameter, destructured binding, and variable for implicit `any`.

### Stubs

- **ALWAYS** stub DS components from `@imaginario27/air-ui-ds` — they are covered by DS tests.
- **ALWAYS** stub `NuxtLink` and `NuxtImg` to avoid Vue Router warnings:

```ts
const NuxtLinkStub = {
    template: '<a :href="to"><slot /></a>',
    props: ['to'],
}

const NuxtImgStub = {
    template: '<img :src="src" :alt="alt" />',
    props: ['src', 'alt', 'width', 'height', 'sizes', 'densities', 'loading'],
}
```

- When stubbing a DS child whose `@click` the parent binds, set `inheritAttrs: false` and declare `emits: ['click']` on the stub to prevent double-firing.
- Stub heavy children (`ECharts`, Monaco, maps, `<ClientOnly>`) and children with side effects (network, portals, focus traps).
- Render real children only when the integration between app-local components is what's being tested.

### Factory pattern

- Use a `factory` function when setup is reused across test cases:

```ts
const factory = (props: Record<string, unknown> = {}) =>
    mount(Subject, {
        props: { ...defaultProps, ...props },
        global: { stubs: { ... } },
    })
```

### Composable testing

- For composables that need a Vue component context (`onMounted`, `watch`, lifecycle hooks), use a `withSetup` wrapper with `mount` + `defineComponent`:

```ts
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const withSetup = <T>(fn: () => T): T => {
    let result: T = undefined as T
    mount(
        defineComponent({
            setup: () => {
                result = fn()
                return () => null
            },
        }),
    )
    return result
}
```

- For pure composables that only use `ref`/`computed` without lifecycle hooks, call them directly without a wrapper.

### Naming

- Use full, readable variable/parameter names — never single-letter or abbreviated (`item` not `i`, `index` not `idx`, `image` not `img`).
- Exception: trivial `.map`/`.filter` callbacks where the collection name provides context (e.g. `items.map((item) => ...)`).

### Style

- Use arrow functions everywhere, never `function` declarations.
- Follow Prettier formatting: `tabWidth: 4`, `singleQuote: true`, `semi: false`.

5. **Run the test** with `npx vitest run <test-file-path> --reporter=verbose` and check for:
    - All tests passing.
    - **Zero warnings** in stdout and stderr: no `[Vue warn]`, no `[Vue Router warn]`, no `<Suspense>` messages, no unhandled-promise rejections.
6. **Fix any warnings** before reporting the test as complete. Treat warnings as test failures.
7. **Typecheck** the test file after writing by scanning for implicit `any` in callbacks, reduce accumulators, and destructured values. If in doubt, add explicit type annotations.

## Rules

- Mirror the source file path structure exactly under `tests/`.
- Prefer `vi.mock('~/composables/<path>')` over `mockNuxtImport` to stay in `happy-dom`.
- Never mock the subject under test — only mock its dependencies.
- Test behavior, not implementation details.
- Cover the golden path and meaningful edge cases.
- Keep tests focused: one concept per `it` block.
- Zero TypeScript errors — annotate types explicitly when inference fails.
