# Style cheat-sheet

### Formatting rule (readability)

When an element has **more than 3 classes OR more than 3 attributes**, put each on its own line. See GUARDRAILS.md §4a.

```vue
<!-- ≤ 3 classes, ≤ 3 attrs → single line is fine -->
<span class="text-text-subtle text-sm">…</span>

<!-- > 3 classes → one per line -->
<div
    :class="[
        'relative',
        'w-full',
        'h-[calc(100vh-72px)]',
        'overflow-hidden',
    ]"
>
    …
</div>

<!-- > 3 props → one per line -->
<ActionButton
    :size="ButtonSize.LG"
    :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
    text="Ver proyectos"
    iconPosition="right"
    icon="mdi:arrow-right"
    @click="onClick"
/>
```

### AirUI-first workflow

Before writing markup, query the AirUI MCP:

```
mcp__claude_ai_AirUI__search_docs({ query: "button" })
  → [{ title: "Action Button", path: "/docs/components/action-button" }, …]

mcp__claude_ai_AirUI__get_doc_page({ path: "/docs/components/action-button" })
  → full page with props, enums, MDC examples
```

Then consume the component by its auto-imported name with enum-bound props (no import statement needed).

**Prefer `search_docs` over `get_doc_page`** — the title/path is usually enough to identify the component, and `get_doc_page` can return payloads that exceed the per-call token cap (spilled to a tool-results file that needs chunked reads). Only pull the full page when you genuinely need the prop/enum table.

### App component style (composing DS components)

`app/components/toggles/ThemeToggle.vue` (sketch — DS names resolved via Nuxt auto-import):

```vue
<template>
    <ActionButton
        :size="ButtonSize.SM"
        :styleType="ButtonStyleType.NEUTRAL_GHOST"
        :class="[customClass]"
        @click="toggle"
    >
        <MdiIcon :name="isDark ? 'weather-sunny' : 'weather-night'" />
        <span v-if="!hasOnlyIcons">{{ $t('theme.toggle') }}</span>
    </ActionButton>
</template>

<script setup lang="ts">
// Props
defineProps({
    hasOnlyIcons: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    customClass: {
        type: String as PropType<string | undefined>,
        default: undefined,
    },
})

// Stores
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const { toggle } = themeStore
</script>
```

### App component style (utility-first, no DS component available)

```vue
<template>
    <kbd
        :class="[
            'inline-flex',
            'items-center',
            'justify-center',
            'rounded-button',
            'border',
            'border-border-default',
            'px-1.5',
            'py-0.5',
            'text-xs',
            'font-semibold',
            'leading-none',
            'text-text-neutral-subtle',
            'whitespace-nowrap',
            'select-none',
        ]"
    >
        {{ text }}
    </kbd>
</template>

<script setup lang="ts">
// Props
defineProps({
    text: {
        type: String as PropType<string>,
        default: 'Enter',
    },
})
</script>
```

### Page style (CMS-backed)

`app/pages/<slug>.vue`:

```vue
<template>
    <section :class="['py-section-md']">
        <h1 :class="['text-text-default', 'text-4xl', 'font-bold']">{{ page?.title }}</h1>
        <!-- render WP content here -->
    </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const { locale } = useI18n()

const { data: page } = await useAsyncGql({
    operation: 'Pages',
    variables: {
        slug: route.params.slug,
        language: locale.value,
    },
    options: { watch: [locale] },
})

useWPSeo(page)
</script>
```

### i18n keys

Adding a new key requires all three locale files — `i18n/locales/es.json`, `en.json`, `de.json`:

```jsonc
// es.json
{ "theme": { "toggle": "Cambiar tema" } }
// en.json
{ "theme": { "toggle": "Toggle theme" } }
// de.json
{ "theme": { "toggle": "Thema wechseln" } }
```

### Test style

`tests/components/toggles/ThemeToggle.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ThemeToggle from '~/components/toggles/ThemeToggle.vue'

describe('ThemeToggle.vue', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('renders label when hasOnlyIcons is false', () => {
        const wrapper = mount(ThemeToggle, {
            props: { hasOnlyIcons: false },
            global: {
                stubs: ['ActionButton', 'MdiIcon'],
                mocks: { $t: (k: string) => k },
            },
        })
        expect(wrapper.html()).toContain('theme.toggle')
    })
})
```

### GraphQL query style

`app/queries/example.gql`:

```graphql
query Example($slug: ID!, $language: LanguageCodeEnum!) {
    page(id: $slug, idType: URI) {
        id
        title(format: RENDERED)
        content(format: RENDERED)
        translation(language: $language) {
            uri
        }
    }
}
```

Consumed as `useAsyncGql({ operation: 'Example', variables: { slug, language } })`. Never fetch the GQL endpoint directly — always go through the generated client.
