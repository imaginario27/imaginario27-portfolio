<template>
    <div :class="['flex', 'flex-col', 'gap-1']">
        <span :class="['text-3xl sm:text-5xl', 'font-bold', 'text-text-primary-brand-default']">
            {{ value }}
        </span>
        <span :class="['text-sm', 'font-medium', 'text-text-neutral-subtle']">
            {{ label }}
        </span>
    </div>
</template>

<script setup lang="ts">
defineProps({
    value: {
        type: String as PropType<string>,
        required: true,
    },
    label: {
        type: String as PropType<string>,
        required: true,
    },
})
</script>
