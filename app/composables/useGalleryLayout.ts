type UseGalleryLayoutOptions = {
    items: Ref<GalleryImage[]>
    showFilter: Ref<boolean>
    filterIsMultiple: Ref<boolean>
    filterHasAllButton: Ref<boolean>
    sortBy: Ref<GallerySortBy>
    paginationMode: Ref<GalleryPaginationMode>
    pageSize: Ref<number>
    limit: Ref<number>
    layout: Ref<GalleryLayout>
    columnsSm: Ref<number>
    columnsMd: Ref<number>
    columnsLg: Ref<number>
    gap: Ref<number>
    targetRowHeight: Ref<number>
    widowAlign: Ref<GalleryWidowAlign>
}

export const useGalleryLayout = (options: UseGalleryLayoutOptions) => {
    const {
        items,
        showFilter,
        filterIsMultiple,
        filterHasAllButton,
        sortBy,
        paginationMode,
        pageSize,
        limit,
        columnsSm,
        columnsMd,
        columnsLg,
        gap,
        targetRowHeight,
        widowAlign,
    } = options

    // Filtering
    const getInitialFilterValue = (): string | string[] => {
        if (filterIsMultiple.value) return []
        return filterHasAllButton.value ? '__all__' : ''
    }
    const filterValue = ref<string | string[]>(getInitialFilterValue())

    const onFilterChange = (value: string | string[]) => {
        filterValue.value = value
        currentPage.value = 1
        visibleCount.value = initialVisible.value
    }

    const filtered = computed<GalleryImage[]>(() => {
        if (!showFilter.value) return items.value
        const selection = filterValue.value
        const isAll = (Array.isArray(selection) && selection.length === 0) || selection === '__all__' || selection === ''
        if (isAll) return items.value

        const wanted = Array.isArray(selection) ? selection : [selection]
        return items.value.filter((image) => {
            const tags = image.tags ?? []
            return wanted.some((tag) => tags.includes(tag))
        })
    })

    // Sorting
    const filteredAndSorted = computed<GalleryImage[]>(() => {
        const list = [...filtered.value]
        switch (sortBy.value) {
            case GallerySortBy.TITLE_ASC:
                return list.sort((first, second) => (first.alt || '').localeCompare(second.alt || ''))
            case GallerySortBy.TITLE_DESC:
                return list.sort((first, second) => (second.alt || '').localeCompare(first.alt || ''))
            case GallerySortBy.RANDOM:
                for (let i = list.length - 1; i > 0; i--) {
                    const j = Math.trunc(Math.random() * (i + 1))
                    ;[list[i], list[j]] = [list[j]!, list[i]!]
                }
                return list
            case GallerySortBy.DATE_ASC:
            case GallerySortBy.DATE_DESC:
            case GallerySortBy.NONE:
            default:
                return list
        }
    })

    // Limit capping
    const cappedDataset = computed<GalleryImage[]>(() => {
        if (
            limit.value > 0 &&
            (paginationMode.value === GalleryPaginationMode.PAGINATION || paginationMode.value === GalleryPaginationMode.NONE)
        ) {
            return filteredAndSorted.value.slice(0, limit.value)
        }
        return filteredAndSorted.value
    })

    // Pagination
    const currentPage = ref(1)
    const initialVisible = computed(() => {
        if (paginationMode.value === GalleryPaginationMode.LOAD_MORE) {
            return limit.value > 0 ? limit.value : pageSize.value
        }
        if (paginationMode.value === GalleryPaginationMode.INFINITE) {
            return limit.value > 0 ? limit.value : pageSize.value
        }
        return cappedDataset.value.length
    })
    const visibleCount = ref(0)

    watch(
        initialVisible,
        (count) => {
            if (visibleCount.value === 0) visibleCount.value = count
        },
        { immediate: true },
    )

    const onPageChange = (page: number) => {
        currentPage.value = page
    }

    const visibleImages = computed<GalleryImage[]>(() => {
        const dataset = cappedDataset.value
        switch (paginationMode.value) {
            case GalleryPaginationMode.PAGINATION: {
                const start = (currentPage.value - 1) * pageSize.value
                return dataset.slice(start, start + pageSize.value)
            }
            case GalleryPaginationMode.LOAD_MORE:
            case GalleryPaginationMode.INFINITE:
                return dataset.slice(0, visibleCount.value || initialVisible.value)
            case GalleryPaginationMode.NONE:
            default:
                return dataset
        }
    })

    const totalPages = computed(() => Math.max(1, Math.ceil(cappedDataset.value.length / pageSize.value)))

    const hasMore = computed(() => visibleCount.value < cappedDataset.value.length)

    const loadMore = () => {
        visibleCount.value = Math.min(cappedDataset.value.length, visibleCount.value + pageSize.value)
    }

    // Infinite-scroll sentinel
    const sentinelEl = ref<HTMLElement | null>(null)
    useIntersectionObserver(sentinelEl, ([entry]) => {
        if (entry?.isIntersecting && hasMore.value) loadMore()
    })

    // Grid layout
    const breakpoint = ref<'sm' | 'md' | 'lg'>('sm')

    const updateBreakpoint = () => {
        if (globalThis.window === undefined) return
        const windowWidth = globalThis.window.innerWidth
        if (windowWidth >= 1024) breakpoint.value = 'lg'
        else if (windowWidth >= 768) breakpoint.value = 'md'
        else breakpoint.value = 'sm'
    }

    onMounted(() => {
        updateBreakpoint()
        globalThis.window.addEventListener('resize', updateBreakpoint, { passive: true })
    })
    onBeforeUnmount(() => {
        if (globalThis.window !== undefined) {
            globalThis.window.removeEventListener('resize', updateBreakpoint)
        }
    })

    const activeColumns = computed(() => {
        switch (breakpoint.value) {
            case 'lg':
                return columnsLg.value
            case 'md':
                return columnsMd.value
            case 'sm':
            default:
                return columnsSm.value
        }
    })

    const gridStyle = computed(() => ({
        gridTemplateColumns: `repeat(${activeColumns.value}, minmax(0, 1fr))`,
        gap: `${gap.value}px`,
    }))

    const gridSizes = computed(() => `${Math.round(100 / activeColumns.value)}vw`)

    // Masonry / justified layout
    const masonryEl = ref<HTMLElement | null>(null)
    const { width: containerWidth } = useElementSize(masonryEl)

    const { layout: masonryLayout } = useJustifiedLayout({
        images: visibleImages,
        containerWidth,
        targetRowHeight: targetRowHeight,
        gap: gap,
        widowAlign: widowAlign,
    })

    const rowJustifyClass = (row: { isWidow: boolean; align: GalleryWidowAlign }) => {
        if (!row.isWidow) return 'justify-start'
        switch (row.align) {
            case GalleryWidowAlign.CENTER:
                return 'justify-center'
            case GalleryWidowAlign.JUSTIFY:
                return 'justify-between'
            case GalleryWidowAlign.LEFT:
            case GalleryWidowAlign.HIDE_IF_SINGLE:
            default:
                return 'justify-start'
        }
    }

    return {
        filterValue,
        onFilterChange,
        filtered,
        filteredAndSorted,
        cappedDataset,
        visibleImages,
        currentPage,
        totalPages,
        hasMore,
        loadMore,
        onPageChange,
        breakpoint,
        activeColumns,
        gridStyle,
        gridSizes,
        masonryEl,
        masonryLayout,
        rowJustifyClass,
        sentinelEl,
    }
}
