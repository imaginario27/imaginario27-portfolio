<template>
    <span
        :class="[
            'px-3',
            'py-1.5',
            'text-sm',
            'rounded-lg',
            'text-text-default',
            'bg-background-neutral-subtle/40',
            'border',
            'border-border-neutral-subtle/30',
        ]"
    >
        {{ text }}
    </span>
</template>
<script setup lang="ts">
defineProps({
    text: {
        type: String,
        default: 'Badge text',
    },
})
</script>
