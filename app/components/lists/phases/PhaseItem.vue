<template>
    <div :class="['flex', 'flex-col', 'gap-2']">
        <span :class="['text-6xl', 'lg:text-7xl', 'font-bold', 'leading-none', 'text-text-secondary-brand-default/80']">
            {{ formattedIndex }}
        </span>
        <h3 :class="['text-lg', 'font-semibold', 'text-text-default']">
            {{ title }}
        </h3>
        <p :class="['text-sm', 'text-text-neutral-subtle', 'leading-relaxed']">
            {{ description }}
        </p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    index: {
        type: Number as PropType<number>,
        required: true,
    },
    title: {
        type: String as PropType<string>,
        required: true,
    },
    description: {
        type: String as PropType<string>,
        required: true,
    },
})

const formattedIndex = computed(() => String(props.index).padStart(2, '0'))
</script>
