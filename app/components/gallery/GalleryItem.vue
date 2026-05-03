<template>
    <component
        :is="tag"
        :class="[
            'group',
            'relative',
            'block',
            'overflow-hidden',
            'bg-background-neutral-subtle',
            'focus-visible:outline-2',
            'focus-visible:outline-border-primary-brand-default',
            'focus-visible:outline-offset-2',
            isClickable && 'cursor-pointer',
            itemClass,
        ]"
        :style="wrapperStyle"
        :type="isButton ? 'button' : undefined"
        :aria-label="ariaLabel"
        @click="onClick"
        @keydown.enter.prevent="onClick"
        @keydown.space.prevent="onClick"
    >
        <NuxtImg
            :src="image.src"
            :alt="image.alt"
            :width="image.width"
            :height="image.height"
            :sizes="sizes"
            :densities="densities"
            loading="lazy"
            :class="[
                'h-full',
                'w-full',
                fit === 'cover' ? 'object-cover' : 'object-contain',
                'transition-transform',
                'duration-300',
                'ease-out',
                'motion-reduce:transition-none',
                'group-hover:scale-105',
                imageClass,
            ]"
        />

        <div
            v-if="captionPlacement === GalleryCaptionPlacement.HOVER && image.caption"
            :class="[
                'pointer-events-none',
                'absolute',
                'inset-0',
                'flex',
                'items-center',
                'justify-center',
                'bg-background-neutral-filled-default/80',
                'opacity-0',
                'transition-opacity',
                'duration-200',
                'group-hover:opacity-100',
                'group-focus-visible:opacity-100',
                'motion-reduce:transition-none',
                hoverClass,
            ]"
        >
            <span
                :class="[
                    'px-4 text-center font-semibold',
                    isDark ? 'text-black' : 'text-text-neutral-on-filled',
                    captionClass,
                ]"
            >
                {{ image.caption }}
            </span>
        </div>

        <div
            v-else-if="captionPlacement === GalleryCaptionPlacement.OVERLAY_BOTTOM && image.caption"
            :class="[
                'absolute',
                'right-0',
                'bottom-0',
                'left-0',
                'p-3',
                'bg-linear-to-t',
                'from-background-neutral-filled-default/80',
                'to-transparent',
                'font-semibold',
                isDark ? 'text-black' : 'text-text-neutral-on-filled',
                captionClass,
            ]"
        >
            {{ image.caption }}
        </div>

        <div
            v-else-if="captionPlacement === GalleryCaptionPlacement.BELOW && image.caption"
            :class="['mt-2 text-text-neutral-subtle', captionClass]"
        >
            {{ image.caption }}
        </div>
    </component>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
    image: {
        type: Object as PropType<GalleryImage>,
        required: true,
    },
    width: {
        type: Number as PropType<number>,
        default: 0,
    },
    height: {
        type: Number as PropType<number>,
        default: 0,
    },
    fit: {
        type: String as PropType<"cover" | "contain">,
        default: "cover",
        validator: (v: string) => ["cover", "contain"].includes(v),
    },
    captionPlacement: {
        type: String as PropType<GalleryCaptionPlacement>,
        default: GalleryCaptionPlacement.HOVER,
        validator: (v: GalleryCaptionPlacement) =>
            Object.values(GalleryCaptionPlacement).includes(v),
    },
    sizes: {
        type: String as PropType<string>,
        default: "sm:50vw md:33vw lg:25vw",
    },
    densities: {
        type: String as PropType<string>,
        default: "x1 x2",
    },
    isClickable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    itemClass: String as PropType<string>,
    imageClass: String as PropType<string>,
    captionClass: String as PropType<string>,
    hoverClass: String as PropType<string>,
})

// Emits
const emit = defineEmits<{
    (e: "click", image: GalleryImage): void
}>()

// Stores
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// Computed
const isButton = computed(() => props.isClickable)
const tag = computed(() => (props.isClickable ? "button" : "div"))

const wrapperStyle = computed(() => {
    if (!props.width || !props.height) return undefined
    return {
        width: `${props.width}px`,
        height: `${props.height}px`,
    }
})

const ariaLabel = computed(() => {
    if (!props.isClickable) return undefined
    return props.image.caption || props.image.alt || "Open image"
})

// Methods
const onClick = () => {
    if (!props.isClickable) return
    emit("click", props.image)
}
</script>
