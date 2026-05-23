# Style cheat-sheet

### Formatting rule (Prettier-enforced)

Formatting is owned by Prettier ([.prettierrc](../.prettierrc)): `tabWidth: 4`, `printWidth: 140`, `semi: false`, `singleQuote: true`, `singleAttributePerLine: true`.

- `singleAttributePerLine: true` → any element with 2+ attributes/props is auto-split onto separate lines on save.
- Class arrays with **more than 3 classes** must be one-per-line (keep manual — Prettier won't always reformat inside the array).
- Don't hand-format around Prettier — write naturally and let `npm run lint` normalize.

```vue
<!-- ≤ 3 classes, ≤ 3 attrs → single line is fine -->
<span class="text-text-subtle text-sm">…</span>

<!-- > 3 classes → one per line -->
<div :class="['relative', 'w-full', 'h-[calc(100vh-72px)]', 'overflow-hidden']">
    …
</div>

<!-- > 3 props → one per line -->
<ActionButton
    :size="ButtonSize.LG"
    :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
    text="Guardar cambios"
    iconPosition="right"
    icon="mdi:content-save"
    @click="onSave"
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

### Component style (composing DS components)

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

### Page style

`app/pages/<slug>.vue`:

```vue
<template>template content</template>

<script setup lang="ts">
script content
</script>
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
