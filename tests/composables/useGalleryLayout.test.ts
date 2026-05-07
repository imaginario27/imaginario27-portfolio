// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'

const img = (id: string, w: number, h: number, tags?: string[]): GalleryImage => ({
    id,
    src: `/${id}.jpg`,
    alt: id,
    width: w,
    height: h,
    tags,
})

const defaultOptions = (overrides: Partial<Record<string, unknown>> = {}) => ({
    items: ref((overrides.items as GalleryImage[]) ?? []),
    showFilter: ref((overrides.showFilter as boolean) ?? false),
    filterIsMultiple: ref(false),
    filterHasAllButton: ref(true),
    sortBy: ref((overrides.sortBy as GallerySortBy) ?? GallerySortBy.NONE),
    paginationMode: ref((overrides.paginationMode as GalleryPaginationMode) ?? GalleryPaginationMode.NONE),
    pageSize: ref((overrides.pageSize as number) ?? 12),
    limit: ref((overrides.limit as number) ?? 0),
    layout: ref(GalleryLayout.GRID),
    columnsSm: ref(2),
    columnsMd: ref(3),
    columnsLg: ref(4),
    gap: ref(8),
    targetRowHeight: ref(240),
    widowAlign: ref(GalleryWidowAlign.JUSTIFY),
})

const withSetup = async <T>(fn: () => T): Promise<T> => {
    let result: T = undefined as T
    await mountSuspended(
        defineComponent({
            setup: () => {
                result = fn()
                return () => null
            },
        }),
    )
    return result
}

describe('useGalleryLayout', () => {
    it('returns all items when no filter or pagination', async () => {
        const images = [img('a', 100, 100), img('b', 200, 200)]
        const { visibleImages } = await withSetup(() => useGalleryLayout(defaultOptions({ items: images })))
        expect(visibleImages.value).toHaveLength(2)
    })

    it('filters items by tags when showFilter is enabled', async () => {
        const images = [img('a', 100, 100, ['cat']), img('b', 200, 200, ['dog']), img('c', 300, 300, ['cat', 'dog'])]
        const opts = defaultOptions({ items: images, showFilter: true })
        const { visibleImages, onFilterChange } = await withSetup(() => useGalleryLayout(opts))

        onFilterChange('cat')
        expect(visibleImages.value).toHaveLength(2)
        expect(visibleImages.value.map((i) => i.id)).toContain('a')
        expect(visibleImages.value.map((i) => i.id)).toContain('c')
    })

    it('sorts by title ascending', async () => {
        const images = [img('c', 100, 100), img('a', 200, 200), img('b', 300, 300)]
        const { visibleImages } = await withSetup(() =>
            useGalleryLayout(defaultOptions({ items: images, sortBy: GallerySortBy.TITLE_ASC })),
        )
        expect(visibleImages.value.map((i) => i.id)).toEqual(['a', 'b', 'c'])
    })

    it('sorts by title descending', async () => {
        const images = [img('a', 100, 100), img('c', 200, 200), img('b', 300, 300)]
        const { visibleImages } = await withSetup(() =>
            useGalleryLayout(defaultOptions({ items: images, sortBy: GallerySortBy.TITLE_DESC })),
        )
        expect(visibleImages.value.map((i) => i.id)).toEqual(['c', 'b', 'a'])
    })

    it('paginates items with PAGINATION mode', async () => {
        const images = Array.from({ length: 10 }, (_, i) => img(`img-${i}`, 100, 100))
        const { visibleImages, totalPages, onPageChange } = await withSetup(() =>
            useGalleryLayout(
                defaultOptions({
                    items: images,
                    paginationMode: GalleryPaginationMode.PAGINATION,
                    pageSize: 3,
                }),
            ),
        )
        expect(visibleImages.value).toHaveLength(3)
        expect(totalPages.value).toBe(4)

        onPageChange(2)
        expect(visibleImages.value).toHaveLength(3)
        expect(visibleImages.value[0].id).toBe('img-3')
    })

    it('applies limit cap', async () => {
        const images = Array.from({ length: 10 }, (_, i) => img(`img-${i}`, 100, 100))
        const { visibleImages } = await withSetup(() => useGalleryLayout(defaultOptions({ items: images, limit: 5 })))
        expect(visibleImages.value).toHaveLength(5)
    })

    it('computes grid style based on columns and gap', async () => {
        const { gridStyle } = await withSetup(() => useGalleryLayout(defaultOptions()))
        expect(gridStyle.value.gap).toBe('8px')
        expect(gridStyle.value.gridTemplateColumns).toContain('repeat(')
    })

    it('has loadMore for LOAD_MORE mode', async () => {
        const images = Array.from({ length: 10 }, (_, i) => img(`img-${i}`, 100, 100))
        const { visibleImages, hasMore, loadMore } = await withSetup(() =>
            useGalleryLayout(
                defaultOptions({
                    items: images,
                    paginationMode: GalleryPaginationMode.LOAD_MORE,
                    pageSize: 3,
                }),
            ),
        )
        expect(visibleImages.value).toHaveLength(3)
        expect(hasMore.value).toBe(true)

        loadMore()
        expect(visibleImages.value).toHaveLength(6)
    })
})
