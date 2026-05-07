<template>
    <ToggleButtonGroup
        v-if="hasOnlyIcons"
        v-model="selectedTheme"
        :buttons="themeToggleIconButtons"
        :hasButtonBorder="false"
        onlyIcon
        :class="customClass"
    />
    <ToggleButtonsGroupField
        v-else
        id="theme"
        v-model="selectedTheme"
        :buttons="themeToggleButtons"
        :hasButtonBorder="false"
        :label="showLabel ? (label ? label : $t('Tema')) : undefined"
        :class="customClass"
    />
</template>
<script setup lang="ts">
// Props
defineProps({
    hasOnlyIcons: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    showLabel: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    label: String as PropType<string>,
    customClass: String as PropType<string>,
})

// Stores
const themeStore = useThemeStore()
const { themes, selectedTheme } = storeToRefs(themeStore)

const themeToggleIconButtons = computed(() =>
    themes.value.map((theme) => ({
        icon: theme.icon,
        value: theme.value,
    })),
)

const themeToggleButtons = computed(() =>
    themes.value.map((theme) => ({
        text: theme.text,
        value: theme.value,
        icon: theme.icon,
        iconPosition: IconPosition.LEFT,
    })),
)
</script>
