<template>
    <section
        ref="rootEl"
        :class="['relative', 'flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'select-none', sliderClass]"
        aria-roledescription="carousel"
        :aria-label="ariaLabel"
    >
        <div :class="['relative', 'flex', 'h-full', 'w-full', 'items-center', 'justify-center', 'overflow-hidden']">
            <Transition
                mode="out-in"
                enter-active-class="transition-opacity duration-200 motion-reduce:transition-none"
                leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="current"
                    :key="current.id"
                    :class="['flex', 'h-full', 'w-full', 'items-center', 'justify-center']"
                    aria-roledescription="slide"
                    :aria-label="`${currentIndex + 1} / ${images.length}`"
                >
                    <NuxtImg
                        :src="current.src"
                        :alt="current.alt"
                        :width="current.width"
                        :height="current.height"
                        sizes="100vw"
                        densities="x1 x2"
                        class="max-h-full max-w-full object-contain"
                    />
                </div>
            </Transition>
        </div>

        <button
            v-if="images.length > 1"
            type="button"
            :class="[
                'absolute',
                'top-1/2',
                'left-2',
                '-translate-y-1/2',
                'md:left-4',
                'flex',
                'h-10',
                'w-10',
                'items-center',
                'justify-center',
                'rounded-full',
                'cursor-pointer',
                'bg-background-neutral-filled-default/60',
                'text-white',
                'hover:bg-background-neutral-filled-default/80',
                'focus-visible:outline-2',
                'focus-visible:outline-border-primary-brand-default',
                'focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed',
                'disabled:opacity-40',
            ]"
            :disabled="!loop && currentIndex === 0"
            :aria-label="prevLabel"
            @click="prev"
        >
            <Icon
                name="mdi:chevron-left"
                :size="IconSize.LG"
            />
        </button>

        <button
            v-if="images.length > 1"
            type="button"
            :class="[
                'absolute',
                'top-1/2',
                'right-2',
                '-translate-y-1/2',
                'md:right-4',
                'flex',
                'h-10',
                'w-10',
                'items-center',
                'justify-center',
                'rounded-full',
                'cursor-pointer',
                'bg-background-neutral-filled-default/60',
                'text-white',
                'hover:bg-background-neutral-filled-default/80',
                'focus-visible:outline-2',
                'focus-visible:outline-border-primary-brand-default',
                'focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed',
                'disabled:opacity-40',
            ]"
            :disabled="!loop && currentIndex === images.length - 1"
            :aria-label="nextLabel"
            @click="next"
        >
            <Icon
                name="mdi:chevron-right"
                :size="IconSize.LG"
            />
        </button>

        <div
            v-if="showCounter && images.length > 1"
            :class="[
                'pointer-events-none',
                'absolute',
                'top-2',
                'left-1/2',
                '-translate-x-1/2',
                'rounded-full',
                'bg-background-neutral-filled-default/60',
                'px-3',
                'py-1',
                'text-sm',
                'text-white',
            ]"
        >
            {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <div
            v-if="showCaption && current?.caption"
            :class="[
                'pointer-events-none',
                'absolute',
                'right-0',
                'bottom-0',
                'left-0',
                'bg-linear-to-t',
                'from-background-neutral-filled-default/80',
                'to-transparent',
                'p-4',
                'text-center',
                'font-semibold',
                'text-white',
            ]"
        >
            {{ current.caption }}
        </div>
    </section>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
    images: {
        type: Array as PropType<GalleryImage[]>,
        required: true,
    },
    modelValue: {
        type: Number as PropType<number>,
        default: 0,
    },
    loop: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    showCounter: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    showCaption: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    autofocus: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    prevLabel: {
        type: String as PropType<string>,
        default: 'Previous image',
    },
    nextLabel: {
        type: String as PropType<string>,
        default: 'Next image',
    },
    ariaLabel: {
        type: String as PropType<string>,
        default: 'Image gallery',
    },
    sliderClass: String as PropType<string>,
})

// Emits
const emit = defineEmits<{
    (e: 'update:modelValue' | 'change', index: number): void
}>()

// States
const rootEl = ref<HTMLElement | null>(null)
const currentIndex = ref(props.modelValue)

// Watchers
watch(
    () => props.modelValue,
    (v) => {
        currentIndex.value = v
    },
)

// Computed
const current = computed(() => props.images[currentIndex.value])

// Methods
const setIndex = (i: number) => {
    const len = props.images.length
    if (!len) return
    const next = props.loop ? ((i % len) + len) % len : Math.max(0, Math.min(len - 1, i))
    if (next === currentIndex.value) return
    currentIndex.value = next
    emit('update:modelValue', next)
    emit('change', next)
}

const next = () => setIndex(currentIndex.value + 1)
const prev = () => setIndex(currentIndex.value - 1)

onMounted(() => {
    rootEl.value?.setAttribute('tabindex', '0')
    if (props.autofocus) rootEl.value?.focus()
})

useEventListener(rootEl, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
    }
    if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
    }
})

defineExpose({ next, prev, setIndex })
</script>
