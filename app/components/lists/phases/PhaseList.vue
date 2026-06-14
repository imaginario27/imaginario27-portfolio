<template>
    <div :class="['grid', 'grid-cols-1', 'md:grid-cols-3', 'lg:grid-cols-5', 'gap-8']">
        <PhaseItem
            v-for="(phase, index) in phases"
            :key="phase.title"
            :index="index + 1"
            :title="phase.title"
            :description="phase.description"
        />
    </div>
</template>

<script setup lang="ts">
defineProps({
    phases: {
        type: Array as PropType<PhaseListItem[]>,
        required: true,
    },
})
</script>
