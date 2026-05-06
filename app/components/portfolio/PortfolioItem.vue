<template>
    <NuxtLink
        :to="item.url"
        :class="[
            'group',
            'relative',
            'block',
            'overflow-hidden',
            'bg-background-neutral-subtle',
            'focus-visible:outline-2',
            'focus-visible:outline-border-primary-brand-default',
            'focus-visible:outline-offset-2',
            'cursor-pointer',
            itemClass,
        ]"
    >
        <NuxtImg
            :src="item.featuredImage.src"
            :alt="item.featuredImage.alt"
            :width="item.featuredImage.width"
            :height="item.featuredImage.height"
            :sizes="sizes"
            :densities="densities"
            loading="lazy"
            :class="[
                'h-full',
                'w-full',
                'object-cover',
                'transition-transform',
                'duration-300',
                'ease-out',
                'motion-reduce:transition-none',
                'group-hover:scale-105',
                imageClass,
            ]"
        />

        <!-- Hover overlay with title -->
        <div
            v-if="captionPlacement === GalleryCaptionPlacement.HOVER"
            :class="[
                'pointer-events-none',
                'absolute',
                'inset-0',
                'flex',
                'flex-col',
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
                    'px-4',
                    'text-center',
                    'font-semibold',
                    isDark ? 'text-black' : 'text-text-neutral-on-filled',
                    captionClass,
                ]"
            >
                {{ item.title }}
            </span>
            <p
                v-if="showExcerpt && item.excerpt"
                :class="[
                    'mt-2',
                    'px-4',
                    'text-center',
                    'text-sm',
                    isDark ? 'text-black/70' : 'text-text-neutral-on-filled/70',
                ]"
            >
                {{ item.excerpt }}
            </p>
            <div
                v-if="showTaxonomies && visibleTerms.length"
                :class="[
                    'mt-3',
                    'flex',
                    'flex-wrap',
                    'justify-center',
                    'gap-1.5',
                    'px-4',
                ]"
            >
                <span
                    v-for="term in visibleTerms"
                    :key="term.slug"
                    :class="[
                        'rounded-full',
                        'px-2',
                        'py-0.5',
                        'text-xs',
                        'bg-background-primary-brand-default/20',
                        isDark ? 'text-black' : 'text-text-neutral-on-filled',
                    ]"
                >
                    {{ term.name }}
                </span>
            </div>
        </div>

        <!-- Bottom overlay with title -->
        <div
            v-else-if="captionPlacement === GalleryCaptionPlacement.OVERLAY_BOTTOM"
            :class="[
                'absolute',
                'right-0',
                'bottom-0',
                'left-0',
                'p-3',
                'bg-linear-to-t',
                'from-background-neutral-filled-default/80',
                'to-transparent',
                isDark ? 'text-black' : 'text-text-neutral-on-filled',
                captionClass,
            ]"
        >
            <span class="font-semibold">{{ item.title }}</span>
            <p
                v-if="showExcerpt && item.excerpt"
                class="mt-1 text-sm opacity-70"
            >
                {{ item.excerpt }}
            </p>
        </div>

        <!-- Below image -->
        <div
            v-else-if="captionPlacement === GalleryCaptionPlacement.BELOW"
            :class="['mt-2', 'text-text-neutral-subtle', captionClass]"
        >
            <span class="font-semibold">{{ item.title }}</span>
            <p
                v-if="showExcerpt && item.excerpt"
                class="mt-1 text-sm"
            >
                {{ item.excerpt }}
            </p>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
    item: {
        type: Object as PropType<PortfolioItem>,
        required: true,
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
    showExcerpt: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    showTaxonomies: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    taxonomyToShow: {
        type: String as PropType<string>,
        default: "projectCategories",
    },
    itemClass: String as PropType<string>,
    imageClass: String as PropType<string>,
    captionClass: String as PropType<string>,
    hoverClass: String as PropType<string>,
})

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

const visibleTerms = computed(() => {
    if (!props.showTaxonomies) return []
    return props.item.taxonomies[props.taxonomyToShow] ?? []
})
</script>
