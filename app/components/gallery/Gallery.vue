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
            :class="[
                'flex',
                'items-center',
                'justify-center',
                'py-12',
                'text-text-neutral-subtle',
            ]"
        >
            {{ loadingText }}
        </div>

        <div
            v-else-if="!pending && !visibleImages.length"
            :class="[
                'flex',
                'items-center',
                'justify-center',
                'py-12',
                'text-text-neutral-subtle',
            ]"
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
        default: "gallery",
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
        default: "All",
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
        default: "Load more",
    },
    loadingText: {
        type: String as PropType<string>,
        default: "Loading…",
    },
    emptyText: {
        type: String as PropType<string>,
        default: "No images to show",
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
    (e: "select", image: GalleryImage, index: number): void
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
            operation: "GalleryMediaItems",
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
                src: n.sourceUrl ?? "",
                alt: n.altText ?? n.title ?? "",
                caption: stripHtml(n.caption ?? null) || null,
                width: n.mediaDetails?.width ?? 0,
                height: n.mediaDetails?.height ?? 0,
                tags: props.itemTags[key],
            })
        })

        fetchedImages.value = ids
            .map((id) => byId.get(id))
            .filter((x): x is GalleryImage => Boolean(x && x.src && x.width && x.height))
    } finally {
        pending.value = false
    }
}

const stripHtml = (html: string | null) => {
    if (!html) return ""
    return html.replace(/<[^>]+>/g, "").trim()
}

watch(
    () => [props.mediaIds, props.items],
    () => {
        fetchMedia()
    },
    { immediate: true, deep: true }
)

// Filtering and sorting
const filterValue = ref<string | string[]>(
    props.filterIsMultiple ? [] : props.filterHasAllButton ? "__all__" : ""
)

const onFilterChange = (v: string | string[]) => {
    filterValue.value = v
    currentPage.value = 1
    visibleCount.value = initialVisible.value
}

const filtered = computed<GalleryImage[]>(() => {
    if (!props.showFilter) return fetchedImages.value
    const v = filterValue.value
    const isAll =
        (Array.isArray(v) && v.length === 0) ||
        v === "__all__" ||
        v === ""
    if (isAll) return fetchedImages.value

    const wanted = Array.isArray(v) ? v : [v]
    return fetchedImages.value.filter((img) => {
        const tags = img.tags ?? []
        return wanted.some((w) => tags.includes(w))
    })
})

const filteredAndSorted = computed<GalleryImage[]>(() => {
    const list = [...filtered.value]
    switch (props.sortBy) {
        case GallerySortBy.TITLE_ASC:
            return list.sort((a, b) => (a.alt || "").localeCompare(b.alt || ""))
        case GallerySortBy.TITLE_DESC:
            return list.sort((a, b) => (b.alt || "").localeCompare(a.alt || ""))
        case GallerySortBy.RANDOM:
            return list.sort(() => Math.random() - 0.5)
        case GallerySortBy.DATE_ASC:
        case GallerySortBy.DATE_DESC:
        case GallerySortBy.NONE:
        default:
            return list
    }
})

// Apply hard `limit` cap when pagination is `pagination` or `none`
const cappedDataset = computed<GalleryImage[]>(() => {
    if (
        props.limit > 0 &&
        (props.paginationMode === GalleryPaginationMode.PAGINATION ||
            props.paginationMode === GalleryPaginationMode.NONE)
    ) {
        return filteredAndSorted.value.slice(0, props.limit)
    }
    return filteredAndSorted.value
})

// Pagination states and methods
const currentPage = ref(1)
const initialVisible = computed(() => {
    if (props.paginationMode === GalleryPaginationMode.LOAD_MORE) {
        return props.limit > 0 ? props.limit : props.pageSize
    }
    if (props.paginationMode === GalleryPaginationMode.INFINITE) {
        return props.limit > 0 ? props.limit : props.pageSize
    }
    return cappedDataset.value.length
})
const visibleCount = ref(0)

watch(
    initialVisible,
    (v) => {
        if (visibleCount.value === 0) visibleCount.value = v
    },
    { immediate: true }
)

const onPageChange = (p: number) => {
    currentPage.value = p
}

const visibleImages = computed<GalleryImage[]>(() => {
    const ds = cappedDataset.value
    switch (props.paginationMode) {
        case GalleryPaginationMode.PAGINATION: {
            const start = (currentPage.value - 1) * props.pageSize
            return ds.slice(start, start + props.pageSize)
        }
        case GalleryPaginationMode.LOAD_MORE:
        case GalleryPaginationMode.INFINITE:
            return ds.slice(0, visibleCount.value || initialVisible.value)
        case GalleryPaginationMode.NONE:
        default:
            return ds
    }
})

const totalPages = computed(() =>
    Math.max(1, Math.ceil(cappedDataset.value.length / props.pageSize))
)

const hasMore = computed(() => visibleCount.value < cappedDataset.value.length)

const loadMore = () => {
    visibleCount.value = Math.min(
        cappedDataset.value.length,
        visibleCount.value + props.pageSize
    )
}

// Infinite-scroll sentinel
const sentinelEl = ref<HTMLElement | null>(null)
useIntersectionObserver(sentinelEl, ([entry]) => {
    if (entry?.isIntersecting && hasMore.value) loadMore()
})

// Layout: Grid 
const breakpoint = ref<"sm" | "md" | "lg">("sm")

const updateBreakpoint = () => {
    if (typeof window === "undefined") return
    const w = window.innerWidth
    if (w >= 1024) breakpoint.value = "lg"
    else if (w >= 768) breakpoint.value = "md"
    else breakpoint.value = "sm"
}

onMounted(() => {
    updateBreakpoint()
    window.addEventListener("resize", updateBreakpoint, { passive: true })
})
onBeforeUnmount(() => {
    if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateBreakpoint)
    }
})

const activeColumns = computed(() => {
    switch (breakpoint.value) {
        case "lg":
            return props.columnsLg
        case "md":
            return props.columnsMd
        case "sm":
        default:
            return props.columnsSm
    }
})

const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${activeColumns.value}, minmax(0, 1fr))`,
    gap: `${props.gap}px`,
}))

const gridSizes = computed(() => `${Math.round(100 / activeColumns.value)}vw`)

// Layout: Masonry / justified
const masonryEl = ref<HTMLElement | null>(null)
const { width: containerWidth } = useElementSize(masonryEl)

const visibleImagesRef = computed(() => visibleImages.value)
const targetRowHeightRef = computed(() => props.targetRowHeight)
const gapRef = computed(() => props.gap)
const widowAlignRef = computed(() => props.widowAlign)

const { layout: masonryLayout } = useJustifiedLayout({
    images: visibleImagesRef,
    containerWidth,
    targetRowHeight: targetRowHeightRef,
    gap: gapRef,
    widowAlign: widowAlignRef,
})

const rowJustifyClass = (row: { isWidow: boolean; align: GalleryWidowAlign }) => {
    if (!row.isWidow) return "justify-start"
    switch (row.align) {
        case GalleryWidowAlign.CENTER:
            return "justify-center"
        case GalleryWidowAlign.JUSTIFY:
            return "justify-between"
        case GalleryWidowAlign.LEFT:
        case GalleryWidowAlign.HIDE_IF_SINGLE:
        default:
            return "justify-start"
    }
}

// Lightbox
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

const onItemClick = (image: GalleryImage) => {
    const idx = visibleImages.value.findIndex((i) => i.id === image.id)
    emit("select", image, idx >= 0 ? idx : 0)
    if (props.enableLightbox) {
        lightboxIndex.value = idx >= 0 ? idx : 0
        lightboxOpen.value = true
    }
}
</script>
