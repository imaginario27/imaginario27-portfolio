<template>
    <div :class="['w-full', rootClass]">
        <GalleryFilter
            v-if="showFilter"
            :id="`${id}-filter`"
            :modelValue="filterValue"
            :options="computedFilterOptions"
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
            <PortfolioItem
                v-for="image in visibleImages"
                :key="image.id"
                :item="getPortfolioItem(image.id)"
                :captionPlacement="captionPlacement"
                :sizes="gridSizes"
                :showExcerpt="showExcerpt"
                :showTaxonomies="showTaxonomies"
                :taxonomyToShow="taxonomyToShow"
                :itemClass="['aspect-square', itemClass].filter(Boolean).join(' ')"
                :imageClass="imageClass"
                :captionClass="captionClass"
                :hoverClass="hoverClass"
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
                <PortfolioItem
                    v-for="(it, i) in row.items"
                    :key="it.image.id"
                    :item="getPortfolioItem(it.image.id)"
                    :captionPlacement="captionPlacement"
                    sizes="50vw"
                    :showExcerpt="showExcerpt"
                    :showTaxonomies="showTaxonomies"
                    :taxonomyToShow="taxonomyToShow"
                    :itemClass="itemClass"
                    :imageClass="imageClass"
                    :captionClass="captionClass"
                    :hoverClass="hoverClass"
                    :style="{
                        flex: `${it.width} 1 0%`,
                        aspectRatio: `${it.width} / ${it.height}`,
                        marginRight: i < row.items.length - 1 ? `${gap}px` : '0',
                    }"
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
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    id: {
        type: String as PropType<string>,
        default: 'portfolio',
    },
    items: {
        type: Array as PropType<PortfolioItem[] | null>,
        default: null,
    },

    // Layout
    layout: {
        type: String as PropType<GalleryLayout>,
        default: GalleryLayout.GRID,
        validator: (v: GalleryLayout) => Object.values(GalleryLayout).includes(v),
    },
    columnsSm: { type: Number as PropType<number>, default: 1 },
    columnsMd: { type: Number as PropType<number>, default: 2 },
    columnsLg: { type: Number as PropType<number>, default: 3 },
    gap: {
        type: Number as PropType<number>,
        default: 16,
    },
    targetRowHeight: {
        type: Number as PropType<number>,
        default: 280,
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
    filterTaxonomy: {
        type: String as PropType<string>,
        default: 'projectCategories',
    },
    filterOptions: {
        type: Array as PropType<GalleryFilterOption[] | null>,
        default: null,
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

    // Sorting
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

    // Portfolio-specific display
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
        default: 'projectCategories',
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
        default: 'No projects to show',
    },

    // Class API
    rootClass: String as PropType<string>,
    itemClass: String as PropType<string>,
    imageClass: String as PropType<string>,
    captionClass: String as PropType<string>,
    hoverClass: String as PropType<string>,
    filterClass: String as PropType<string>,
    paginationClass: String as PropType<string>,
})

const { pending, setItems, fetchProjects, buildFilterOptions, imagesWithTags, itemsByImageId } = usePortfolioData()

watch(
    () => props.items,
    (val) => {
        if (val) {
            setItems(val)
        } else {
            fetchProjects()
        }
    },
    { immediate: true, deep: true },
)

const layoutImages = imagesWithTags(props.filterTaxonomy)

const computedFilterOptions = computed(() => {
    if (props.filterOptions) return props.filterOptions
    return buildFilterOptions(props.filterTaxonomy)
})

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
    items: layoutImages,
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

const getPortfolioItem = (imageId: string): PortfolioItem => {
    return (
        itemsByImageId.value.get(imageId) ?? {
            id: imageId,
            title: '',
            slug: '',
            url: '/',
            excerpt: null,
            featuredImage: { id: imageId, src: '', alt: '', width: 0, height: 0 },
            taxonomies: {},
        }
    )
}
</script>
