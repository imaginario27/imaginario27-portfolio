<template>
    <div :class="['w-full', rootClass]">
        <GalleryFilter
            v-if="showFilter"
            :id="`${id}-filter`"
            :modelValue="filterValue"
            :options="filterOptions"
            :isMultiple="filterIsMultiple"
            :hasAllButton="filterHasAllButton"
            :allButtonText="filterAllText"
            :class="['mb-6', filterClass]"
            @update:modelValue="onFilterChange"
        />

        <div
            v-if="pending && !visibleImages.length"
            :class="['flex', 'items-center', 'justify-center', 'py-12', 'text-text-neutral-subtle']"
        >
            {{ loadingText }}
        </div>

        <div
            v-else-if="!pending && !visibleImages.length"
            :class="['flex', 'items-center', 'justify-center', 'py-12', 'text-text-neutral-subtle']"
        >
            {{ emptyText }}
        </div>

        <!-- Grid layout -->
        <div
            v-else-if="layout === GalleryLayout.GRID"
            class="grid overflow-hidden"
            :style="gridStyle"
        >
            <GalleryItem
                v-for="image in visibleImages"
                :key="image.id"
                :image="image"
                :captionPlacement="captionPlacement"
                :sizes="gridSizes"
                :itemClass="['aspect-square', itemClass].filter(Boolean).join(' ')"
                :imageClass="imageClass"
                :captionClass="captionClass"
                :hoverClass="hoverClass"
                @click="onItemClick"
            />
        </div>

        <!-- Masonry / justified layout -->
        <div
            v-else
            ref="masonryEl"
            class="relative w-full overflow-hidden"
        >
            <div
                v-for="(row, rIdx) in masonryLayout.rows"
                :key="row.items[0]?.image.id"
                :class="['flex', rowJustifyClass(row)]"
                :style="{
                    marginBottom: rIdx < masonryLayout.rows.length - 1 ? `${gap}px` : '0',
                }"
            >
                <GalleryItem
                    v-for="(it, i) in row.items"
                    :key="it.image.id"
                    :image="it.image"
                    :captionPlacement="captionPlacement"
                    sizes="50vw"
                    :itemClass="itemClass"
                    :imageClass="imageClass"
                    :captionClass="captionClass"
                    :hoverClass="hoverClass"
                    :style="{
                        flex: `${it.width} 1 0%`,
                        aspectRatio: `${it.width} / ${it.height}`,
                        marginRight: i < row.items.length - 1 ? `${gap}px` : '0',
                    }"
                    @click="onItemClick"
                />
            </div>
        </div>

        <!-- Pagination controls -->
        <div
            v-if="paginationMode === GalleryPaginationMode.PAGINATION && totalPages > 1"
            :class="['mt-8', paginationClass]"
        >
            <ButtonPagination
                :modelValue="currentPage"
                :totalItems="filteredAndSorted.length"
                :itemsPerPage="pageSize"
                :showRowsPerPage="false"
                @update:modelValue="onPageChange"
            />
        </div>

        <div
            v-else-if="paginationMode === GalleryPaginationMode.LOAD_MORE && hasMore"
            :class="['mt-8 flex justify-center', paginationClass]"
        >
            <ActionButton
                :text="loadMoreText"
                :styleType="ButtonStyleType.NEUTRAL_OUTLINED"
                @click="loadMore"
            />
        </div>

        <div
            v-else-if="paginationMode === GalleryPaginationMode.INFINITE && hasMore"
            ref="sentinelEl"
            class="h-px w-full"
            aria-hidden="true"
        />

        <!-- Lightbox -->
        <Lightbox
            v-if="enableLightbox"
            :modelValue="lightboxOpen"
            :images="visibleImages"
            :initialIndex="lightboxIndex"
            :lightboxClass="lightboxClass"
            :sliderClass="sliderClass"
            @update:modelValue="lightboxOpen = $event"
        />
    </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps({
    id: {
        type: String as PropType<string>,
        default: 'gallery',
    },
    mediaIds: {
        type: Array as PropType<(string | number)[]>,
        default: () => [],
    },
    items: {
        type: Array as PropType<GalleryImage[] | null>,
        default: null,
    },
    itemTags: {
        type: Object as PropType<Record<string, string[]>>,
        default: () => ({}),
    },

    // Layout
    layout: {
        type: String as PropType<GalleryLayout>,
        default: GalleryLayout.GRID,
        validator: (v: GalleryLayout) => Object.values(GalleryLayout).includes(v),
    },
    columnsSm: { type: Number as PropType<number>, default: 2 },
    columnsMd: { type: Number as PropType<number>, default: 3 },
    columnsLg: { type: Number as PropType<number>, default: 4 },
    gap: {
        type: Number as PropType<number>,
        default: 8,
    },
    targetRowHeight: {
        type: Number as PropType<number>,
        default: 240,
    },
    widowAlign: {
        type: String as PropType<GalleryWidowAlign>,
        default: GalleryWidowAlign.JUSTIFY,
        validator: (v: GalleryWidowAlign) => Object.values(GalleryWidowAlign).includes(v),
    },
    captionPlacement: {
        type: String as PropType<GalleryCaptionPlacement>,
        default: GalleryCaptionPlacement.HOVER,
    },

    // Filtering
    showFilter: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    filterOptions: {
        type: Array as PropType<GalleryFilterOption[]>,
        default: () => [],
    },
    filterIsMultiple: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    filterHasAllButton: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    filterAllText: {
        type: String as PropType<string>,
        default: 'All',
    },

    // Sorting (no UI; configured)
    sortBy: {
        type: String as PropType<GallerySortBy>,
        default: GallerySortBy.NONE,
    },

    // Pagination
    paginationMode: {
        type: String as PropType<GalleryPaginationMode>,
        default: GalleryPaginationMode.NONE,
    },
    pageSize: {
        type: Number as PropType<number>,
        default: 12,
    },
    limit: {
        type: Number as PropType<number>,
        default: 0,
    },

    // Lightbox
    enableLightbox: {
        type: Boolean as PropType<boolean>,
        default: true,
    },

    // Copy
    loadMoreText: {
        type: String as PropType<string>,
        default: 'Load more',
    },
    loadingText: {
        type: String as PropType<string>,
        default: 'Loading…',
    },
    emptyText: {
        type: String as PropType<string>,
        default: 'No images to show',
    },

    // Class API
    rootClass: String as PropType<string>,
    itemClass: String as PropType<string>,
    imageClass: String as PropType<string>,
    captionClass: String as PropType<string>,
    hoverClass: String as PropType<string>,
    filterClass: String as PropType<string>,
    paginationClass: String as PropType<string>,
    lightboxClass: String as PropType<string>,
    sliderClass: String as PropType<string>,
})

// Emits
const emit = defineEmits<{
    (e: 'select', image: GalleryImage, index: number): void
}>()

// Media fetching
const fetchedImages = ref<GalleryImage[]>([])
const pending = ref(false)

const fetchMedia = async () => {
    if (props.items) {
        fetchedImages.value = props.items
        return
    }
    if (!props.mediaIds.length) {
        fetchedImages.value = []
        return
    }
    pending.value = true
    try {
        const ids = props.mediaIds.map(String)
        const { data } = await useAsyncGql({
            operation: 'GalleryMediaItems',
            variables: { ids },
        })
        const nodes = (data.value?.mediaItems?.nodes ?? []) as Array<{
            id: string
            databaseId?: number | null
            sourceUrl?: string | null
            altText?: string | null
            caption?: string | null
            title?: string | null
            mediaDetails?: { width?: number | null; height?: number | null } | null
        }>

        // Preserve the order of mediaIds
        const byId = new Map<string, GalleryImage>()
        nodes.forEach((n) => {
            const key = String(n.databaseId ?? n.id)
            byId.set(key, {
                id: key,
                src: n.sourceUrl ?? '',
                alt: n.altText ?? n.title ?? '',
                caption: stripHtml(n.caption ?? null) || null,
                width: n.mediaDetails?.width ?? 0,
                height: n.mediaDetails?.height ?? 0,
                tags: props.itemTags[key],
            })
        })

        fetchedImages.value = ids.map((id) => byId.get(id)).filter((x): x is GalleryImage => Boolean(x && x.src && x.width && x.height))
    } finally {
        pending.value = false
    }
}

const stripHtml = (html: string | null) => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return (doc.body.textContent ?? '').trim()
}

watch(
    () => [props.mediaIds, props.items],
    () => {
        fetchMedia()
    },
    { immediate: true, deep: true },
)

// Layout composable
const {
    filterValue,
    onFilterChange,
    filteredAndSorted,
    visibleImages,
    currentPage,
    totalPages,
    hasMore,
    loadMore,
    onPageChange,
    gridStyle,
    gridSizes,
    masonryEl,
    masonryLayout,
    rowJustifyClass,
    sentinelEl,
} = useGalleryLayout({
    items: fetchedImages,
    showFilter: computed(() => props.showFilter),
    filterIsMultiple: computed(() => props.filterIsMultiple),
    filterHasAllButton: computed(() => props.filterHasAllButton),
    sortBy: computed(() => props.sortBy),
    paginationMode: computed(() => props.paginationMode),
    pageSize: computed(() => props.pageSize),
    limit: computed(() => props.limit),
    layout: computed(() => props.layout),
    columnsSm: computed(() => props.columnsSm),
    columnsMd: computed(() => props.columnsMd),
    columnsLg: computed(() => props.columnsLg),
    gap: computed(() => props.gap),
    targetRowHeight: computed(() => props.targetRowHeight),
    widowAlign: computed(() => props.widowAlign),
})

// Lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const onItemClick = (image: GalleryImage) => {
    const idx = visibleImages.value.findIndex((i) => i.id === image.id)
    const safeIdx = Math.max(0, idx)
    emit('select', image, safeIdx)
    if (props.enableLightbox) {
        lightboxIndex.value = safeIdx
        lightboxOpen.value = true
    }
}
</script>
