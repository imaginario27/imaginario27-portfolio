import { mount } from '@vue/test-utils'
import { useGalleryLayout } from '~/composables/useGalleryLayout'
import type { GalleryImage } from '~/models/types/gallery'
import { GalleryLayout, GalleryPaginationMode, GallerySortBy, GalleryWidowAlign } from '~/models/enums/gallery'
import { defineComponent, ref } from 'vue'

const img = (id: string, width: number, height: number, tags?: string[]): GalleryImage => ({
    id,
    src: `/${id}.jpg`,
    alt: id,
    width,
    height,
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

const withSetup = <T>(fn: () => T): T => {
    let result: T = undefined as T
    mount(
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
    it('returns all items when no filter or pagination', () => {
        const images = [img('a', 100, 100), img('b', 200, 200)]
        const { visibleImages } = withSetup(() => useGalleryLayout(defaultOptions({ items: images })))
        expect(visibleImages.value).toHaveLength(2)
    })

    it('filters items by tags when showFilter is enabled', () => {
        const images = [img('a', 100, 100, ['cat']), img('b', 200, 200, ['dog']), img('c', 300, 300, ['cat', 'dog'])]
        const options = defaultOptions({ items: images, showFilter: true })
        const { visibleImages, onFilterChange } = withSetup(() => useGalleryLayout(options))

        onFilterChange('cat')
        expect(visibleImages.value).toHaveLength(2)
        expect(visibleImages.value.map((item: GalleryImage) => item.id)).toContain('a')
        expect(visibleImages.value.map((item: GalleryImage) => item.id)).toContain('c')
    })

    it('sorts by title ascending', () => {
        const images = [img('c', 100, 100), img('a', 200, 200), img('b', 300, 300)]
        const { visibleImages } = withSetup(() => useGalleryLayout(defaultOptions({ items: images, sortBy: GallerySortBy.TITLE_ASC })))
        expect(visibleImages.value.map((item: GalleryImage) => item.id)).toEqual(['a', 'b', 'c'])
    })

    it('sorts by title descending', () => {
        const images = [img('a', 100, 100), img('c', 200, 200), img('b', 300, 300)]
        const { visibleImages } = withSetup(() => useGalleryLayout(defaultOptions({ items: images, sortBy: GallerySortBy.TITLE_DESC })))
        expect(visibleImages.value.map((item: GalleryImage) => item.id)).toEqual(['c', 'b', 'a'])
    })

    it('paginates items with PAGINATION mode', () => {
        const images = Array.from({ length: 10 }, (_, index) => img(`img-${index}`, 100, 100))
        const { visibleImages, totalPages, onPageChange } = withSetup(() =>
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

    it('applies limit cap', () => {
        const images = Array.from({ length: 10 }, (_, index) => img(`img-${index}`, 100, 100))
        const { visibleImages } = withSetup(() => useGalleryLayout(defaultOptions({ items: images, limit: 5 })))
        expect(visibleImages.value).toHaveLength(5)
    })

    it('computes grid style based on columns and gap', () => {
        const { gridStyle } = withSetup(() => useGalleryLayout(defaultOptions()))
        expect(gridStyle.value.gap).toBe('8px')
        expect(gridStyle.value.gridTemplateColumns).toContain('repeat(')
    })

    it('has loadMore for LOAD_MORE mode', () => {
        const images = Array.from({ length: 10 }, (_, index) => img(`img-${index}`, 100, 100))
        const { visibleImages, hasMore, loadMore } = withSetup(() =>
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
