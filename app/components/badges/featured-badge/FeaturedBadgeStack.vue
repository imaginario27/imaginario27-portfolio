<template>
    <div :class="['flex', 'flex-wrap', 'gap-2']">
        <span
            v-for="item in items"
            :key="item"
            :class="[
                'px-3',
                'py-1.5',
                'text-sm',
                'rounded-lg',
                'text-text-default',
                'bg-background-neutral-subtle/40',
                'border',
                'border-border-neutral-subtle/30',
                'shadow-xs',
            ]"
        >
            {{ item }}
        </span>
    </div>
</template>
<script setup lang="ts">
defineProps({
    items: {
        type: Array as PropType<string[]>,
        default: () => [],
    },
})
</script>
