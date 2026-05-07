<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-300 motion-reduce:transition-none"
            leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
        >
            <dialog
                v-if="modelValue"
                ref="rootEl"
                open
                :class="[
                    'fixed',
                    'inset-0',
                    'z-9999',
                    'flex',
                    'flex-col',
                    'm-0',
                    'h-full',
                    'max-h-none',
                    'w-full',
                    'max-w-none',
                    'border-none',
                    'p-0',
                    'bg-black/90',
                    lightboxClass,
                ]"
                :aria-label="ariaLabel"
                @keydown.escape.prevent="close"
                @keydown.left.prevent="prev"
                @keydown.right.prevent="next"
            >
                <div :class="['flex', 'w-full', 'items-center', 'justify-between', 'px-4', 'py-3', 'pointer-events-auto']">
                    <span
                        v-if="images.length > 1"
                        class="text-sm text-white/80"
                    >
                        {{ currentIndex + 1 }} / {{ images.length }}
                    </span>
                    <span v-else />

                    <div class="flex items-center gap-2">
                        <button
                            type="button"
                            :class="toolbarButtonClass"
                            :aria-label="fullscreenLabel"
                            @click="toggleFullscreen"
                        >
                            <Icon
                                :name="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'"
                                :size="IconSize.MD"
                            />
                        </button>
                        <button
                            type="button"
                            :class="toolbarButtonClass"
                            :aria-label="closeLabel"
                            @click="close"
                        >
                            <Icon
                                name="mdi:close"
                                :size="IconSize.MD"
                            />
                        </button>
                    </div>
                </div>

                <div
                    ref="swipeAreaEl"
                    :class="[
                        'relative',
                        'flex',
                        'min-h-0',
                        'flex-1',
                        'items-center',
                        'justify-center',
                        isDragging && 'cursor-grabbing',
                        !isDragging && 'cursor-grab',
                    ]"
                    @click.self="onOverlayClick"
                    @pointerdown="onPointerDown"
                    @pointermove="onPointerMove"
                    @pointerup="onPointerUp"
                    @pointercancel="onPointerUp"
                >
                    <Transition
                        :enter-active-class="slideEnterActive"
                        :leave-active-class="slideLeaveActive"
                        :enter-from-class="slideEnterFrom"
                        :leave-to-class="slideLeaveTo"
                        mode="out-in"
                    >
                        <div
                            v-if="current"
                            :key="current.id"
                            :class="[
                                'flex',
                                'max-h-full',
                                'max-w-full',
                                'items-center',
                                'justify-center',
                                'px-12',
                                'md:px-16',
                                'pointer-events-none',
                                'select-none',
                            ]"
                            :style="slideOffsetStyle"
                        >
                            <NuxtImg
                                :src="current.src"
                                :alt="current.alt"
                                :width="current.width"
                                :height="current.height"
                                sizes="100vw"
                                densities="x1 x2"
                                class="max-h-[calc(100vh-8rem)] max-w-full object-contain"
                                draggable="false"
                            />
                        </div>
                    </Transition>

                    <button
                        v-if="images.length > 1"
                        type="button"
                        :class="['absolute', 'top-1/2', 'left-2', '-translate-y-1/2', 'md:left-4', navButtonClass]"
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
                        :class="['absolute', 'top-1/2', 'right-2', '-translate-y-1/2', 'md:right-4', navButtonClass]"
                        :aria-label="nextLabel"
                        @click="next"
                    >
                        <Icon
                            name="mdi:chevron-right"
                            :size="IconSize.LG"
                        />
                    </button>
                </div>

                <div
                    v-if="showCaption && current?.caption"
                    :class="['px-4', 'pb-4', 'pt-2', 'text-center', 'text-sm', 'text-white/80']"
                >
                    {{ current.caption }}
                </div>
            </dialog>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
    modelValue: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    images: {
        type: Array as PropType<GalleryImage[]>,
        required: true,
    },
    initialIndex: {
        type: Number as PropType<number>,
        default: 0,
    },
    loop: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    showCaption: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    ariaLabel: {
        type: String as PropType<string>,
        default: 'Image lightbox',
    },
    prevLabel: {
        type: String as PropType<string>,
        default: 'Previous image',
    },
    nextLabel: {
        type: String as PropType<string>,
        default: 'Next image',
    },
    closeLabel: {
        type: String as PropType<string>,
        default: 'Close lightbox',
    },
    fullscreenLabel: {
        type: String as PropType<string>,
        default: 'Toggle fullscreen',
    },
    closeOnClickOutside: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    lightboxClass: String as PropType<string>,
    sliderClass: String as PropType<string>,
})

// Emits
const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'update:index', index: number): void
    (e: 'close'): void
}>()

// States
const rootEl = ref<HTMLDialogElement | null>(null)
const currentIndex = ref(props.initialIndex)
const isFullscreen = ref(false)

// Classes
const navButtonClass = [
    'flex h-10 w-10 items-center justify-center rounded-full',
    'cursor-pointer bg-white/10 text-white',
    'hover:bg-white/25',
    'focus-visible:outline-2 focus-visible:outline-white',
    'focus-visible:outline-offset-2',
    'transition-colors duration-150',
]

const toolbarButtonClass = [
    'flex h-9 w-9 items-center justify-center rounded-full',
    'cursor-pointer text-white/80 hover:text-white',
    'hover:bg-white/10',
    'focus-visible:outline-2 focus-visible:outline-white',
    'focus-visible:outline-offset-2',
    'transition-colors duration-150',
]

// Watchers
watch(
    () => props.initialIndex,
    (v) => {
        currentIndex.value = v
    },
)

watch(
    () => props.modelValue,
    (open) => {
        if (open) {
            currentIndex.value = props.initialIndex
            lockScroll()
            nextTick(() => rootEl.value?.focus())
        } else {
            unlockScroll()
        }
    },
)

// Lifecycle
onBeforeUnmount(() => {
    unlockScroll()
})

// Computed
const current = computed(() => props.images[currentIndex.value])

// Methods
const setIndex = (i: number) => {
    const len = props.images.length
    if (!len) return
    const idx = props.loop ? ((i % len) + len) % len : Math.max(0, Math.min(len - 1, i))
    if (idx === currentIndex.value) return
    currentIndex.value = idx
    emit('update:index', idx)
}

const next = () => {
    slideDirection.value = 'left'
    setIndex(currentIndex.value + 1)
}
const prev = () => {
    slideDirection.value = 'right'
    setIndex(currentIndex.value - 1)
}

// Swipe handling
const SWIPE_THRESHOLD = 40
const swipeAreaEl = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const dragOffsetX = ref(0)
const slideDirection = ref<'left' | 'right'>('left')
let startX = 0
let startY = 0
let pointerId: number | null = null
let wasInteracting = false

const slideEnterActive = 'transition-all duration-250 ease-out motion-reduce:transition-none'
const slideLeaveActive = 'transition-all duration-200 ease-in motion-reduce:transition-none'

const slideEnterFrom = computed(() => (slideDirection.value === 'left' ? 'translate-x-24 opacity-0' : '-translate-x-24 opacity-0'))

const slideLeaveTo = computed(() => (slideDirection.value === 'left' ? '-translate-x-24 opacity-0' : 'translate-x-24 opacity-0'))

const slideOffsetStyle = computed(() => {
    if (!dragOffsetX.value) return undefined
    return { transform: `translateX(${dragOffsetX.value}px)` }
})

// Swipe event handlers
const onPointerDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    isDragging.value = true
    wasInteracting = false
    startX = e.clientX
    startY = e.clientY
    pointerId = e.pointerId
    swipeAreaEl.value?.setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
    if (!isDragging.value || e.pointerId !== pointerId) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    if (Math.abs(dx) > Math.abs(dy)) {
        dragOffsetX.value = dx
    }
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        wasInteracting = true
    }
}

const onPointerUp = (e: PointerEvent) => {
    if (!isDragging.value || e.pointerId !== pointerId) return
    isDragging.value = false

    if (Math.abs(dragOffsetX.value) > SWIPE_THRESHOLD && props.images.length > 1) {
        wasInteracting = true
        if (dragOffsetX.value < 0) {
            slideDirection.value = 'left'
            next()
        } else {
            slideDirection.value = 'right'
            prev()
        }
    }

    dragOffsetX.value = 0
    pointerId = null
}

// Overlay click handling
const onOverlayClick = () => {
    if (wasInteracting) {
        wasInteracting = false
        return
    }
    if (props.closeOnClickOutside) {
        close()
    }
}

const close = () => {
    emit('update:modelValue', false)
    emit('close')
}

let savedOverflow = ''

// Scroll handling
const lockScroll = () => {
    if (typeof document === 'undefined') return
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
}

const unlockScroll = () => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = savedOverflow
}

// Fullscreen handling
const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) {
        await document.exitFullscreen()
        isFullscreen.value = false
    } else {
        await document.documentElement.requestFullscreen()
        isFullscreen.value = true
    }
}
</script>
