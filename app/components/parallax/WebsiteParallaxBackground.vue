<template>
    <div
        :class="[
            'absolute',
            'inset-0',
            fadeTop && '[mask-image:linear-gradient(to_bottom,transparent_0%,black_25%)]',
            fadeBottom && '[mask-image:linear-gradient(to_top,transparent_0%,black_25%)]',
        ]"
    >
        <div
            aria-hidden="true"
            :class="['absolute', 'inset-0', 'overflow-hidden', 'pointer-events-none', 'z-0']"
        >
            <div class="absolute inset-0 bg-background-surface" />

            <div
                :class="[
                    'absolute',
                    'left-[-18vw]',
                    'top-[-8vh]',
                    'h-[72vh]',
                    'w-[86vw]',
                    'rounded-full',
                    isDark ? 'bg-background-primary-brand-soft/12' : 'bg-background-primary-brand-soft/10',
                    'blur-[140px]',
                ]"
                :style="farGradientStyle"
            />

            <div
                :class="[
                    'absolute',
                    'right-[-22vw]',
                    'top-[24vh]',
                    'h-[74vh]',
                    'w-[78vw]',
                    'rounded-full',
                    isDark ? 'bg-background-secondary-brand-soft/12' : 'bg-background-secondary-brand-soft/10',
                    'blur-[140px]',
                ]"
                :style="midGradientStyle"
            />

            <div
                :class="[
                    'absolute',
                    'left-[18vw]',
                    'top-[18vh]',
                    'h-[38vh]',
                    'w-[38vh]',
                    'rounded-full',
                    isDark ? 'bg-background-primary-brand-default/12' : 'bg-background-primary-brand-default/10',
                    'blur-[100px]',
                ]"
                :style="nearGradientStyle"
            />

            <div
                :class="[
                    'absolute',
                    'inset-0',
                    'bg-linear-to-b',
                    'from-transparent',
                    'via-transparent',
                    isDark ? 'to-background-surface/12' : 'to-background-surface/10',
                ]"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    fadeTop: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    fadeBottom: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
})

const { y } = useWindowScroll()

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const reducedMotion = ref(false)

const translateY = (speed: number): string => {
    if (reducedMotion.value || !import.meta.client) {
        return 'translate3d(0, 0px, 0)'
    }

    return `translate3d(0, ${Math.round(y.value * speed)}px, 0)`
}

const farGradientStyle = computed(() => ({
    transform: translateY(0.08),
    willChange: reducedMotion.value ? 'auto' : 'transform',
}))

const midGradientStyle = computed(() => ({
    transform: translateY(0.16),
    willChange: reducedMotion.value ? 'auto' : 'transform',
}))

const nearGradientStyle = computed(() => ({
    transform: translateY(0.24),
    willChange: reducedMotion.value ? 'auto' : 'transform',
}))

onMounted(() => {
    reducedMotion.value = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>
