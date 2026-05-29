<template>
    <div
        ref="backgroundRef"
        class="absolute inset-0 h-full w-full pointer-events-none"
        :style="backgroundStyle"
    />
</template>

<script setup lang="ts">
// Props
const props = defineProps({
    plusSize: {
        type: [Number, String] as PropType<number | string>,
        default: 20,
    },
    plusColor: String as PropType<string>,
    backgroundColor: {
        type: String as PropType<string>,
        default: 'transparent',
    },
    fade: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
})

// Resolve color from the element's computed text color so callers can use Tailwind classes.
const backgroundRef = ref<HTMLElement | null>(null)
const resolvedPlusColor = ref('rgb(251, 58, 93)')

const updateResolvedPlusColor = (): void => {
    if (!import.meta.client || props.plusColor || !backgroundRef.value) {
        return
    }

    const color = getComputedStyle(backgroundRef.value).color

    if (color) {
        resolvedPlusColor.value = color
    }
}

const encodedPlusColor = computed(() => encodeURIComponent(props.plusColor || resolvedPlusColor.value))

const backgroundStyle = computed(() => {
    const maskStyle = props.fade
        ? {
              maskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(circle, white 10%, transparent 90%)',
          }
        : {}

    return {
        backgroundColor: props.backgroundColor,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='${props.plusSize}' height='${props.plusSize}' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodedPlusColor.value}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        ...maskStyle,
    }
})

onMounted(() => {
    updateResolvedPlusColor()
})

onUpdated(() => {
    updateResolvedPlusColor()
})
</script>
