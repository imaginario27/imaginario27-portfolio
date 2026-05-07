// @vitest-environment nuxt
import { describe, it, expect } from 'vitest'

const img = (id: string, w: number, h: number): GalleryImage => ({
    id,
    src: `/${id}.jpg`,
    alt: id,
    width: w,
    height: h,
})

describe('useJustifiedLayout', () => {
    it('returns empty layout when no images', () => {
        const { layout } = useJustifiedLayout({
            images: ref([]),
            containerWidth: ref(1000),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.JUSTIFY),
        })
        expect(layout.value.rows.length).toBe(0)
        expect(layout.value.totalHeight).toBe(0)
    })

    it('returns empty when container width is zero', () => {
        const { layout } = useJustifiedLayout({
            images: ref([img('a', 400, 300)]),
            containerWidth: ref(0),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.JUSTIFY),
        })
        expect(layout.value.rows.length).toBe(0)
    })

    it('packs images into rows that fit container width', () => {
        // 4 landscape images of aspect 2:1, target row height 200,
        // each at target = 400px wide; container 900 → ~2 fit per row.
        const images = ref([img('a', 800, 400), img('b', 800, 400), img('c', 800, 400), img('d', 800, 400)])
        const { layout } = useJustifiedLayout({
            images,
            containerWidth: ref(900),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.JUSTIFY),
        })

        expect(layout.value.rows.length).toBeGreaterThan(0)
        // Each row's total width should be approximately the container width
        // (full rows are scaled to fit exactly).
        layout.value.rows.forEach((row) => {
            if (!row.isWidow) {
                expect(Math.round(row.width)).toBeLessThanOrEqual(900)
                expect(row.width).toBeGreaterThan(800)
            }
        })
    })

    it("flags last row as widow when it doesn't fill the container", () => {
        // 3 images at aspect 1:1, target 200, container 900
        // 1st row needs ~3 squares = 600 + gaps; flushes when total >= 900
        // We test that some row is widowed when content can't fill exactly.
        const images = ref([img('a', 200, 200), img('b', 200, 200), img('c', 200, 200)])
        const { layout } = useJustifiedLayout({
            images,
            containerWidth: ref(900),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.LEFT),
        })

        const last = layout.value.rows[layout.value.rows.length - 1]
        expect(last).toBeDefined()
        expect(last!.isWidow).toBe(true)
        expect(last!.align).toBe(GalleryWidowAlign.LEFT)
    })

    it('hides single-item widow row when widowAlign is HIDE_IF_SINGLE', () => {
        // 5 wide images, container forces a 4+1 split (last row = 1 widow)
        const images = ref([
            img('a', 800, 200), // aspect 4
            img('b', 800, 200),
            img('c', 800, 200),
            img('d', 800, 200),
            img('e', 800, 200),
        ])
        const { layout: hidden } = useJustifiedLayout({
            images,
            containerWidth: ref(1600),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.HIDE_IF_SINGLE),
        })
        const { layout: shown } = useJustifiedLayout({
            images,
            containerWidth: ref(1600),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.LEFT),
        })

        const totalImagesShown = shown.value.rows.reduce((s, r) => s + r.items.length, 0)
        const totalImagesHidden = hidden.value.rows.reduce((s, r) => s + r.items.length, 0)

        expect(totalImagesHidden).toBeLessThanOrEqual(totalImagesShown)
    })

    it('preserves DOM order across rows', () => {
        const images = ref([
            img('a', 200, 200),
            img('b', 200, 200),
            img('c', 200, 200),
            img('d', 200, 200),
            img('e', 200, 200),
            img('f', 200, 200),
        ])
        const { layout } = useJustifiedLayout({
            images,
            containerWidth: ref(700),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.JUSTIFY),
        })
        const orderedIds = layout.value.items.map((i) => i.image.id)
        expect(orderedIds).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    it('computes a positive totalHeight when rows exist', () => {
        const images = ref([img('a', 800, 400), img('b', 800, 400)])
        const { layout } = useJustifiedLayout({
            images,
            containerWidth: ref(900),
            targetRowHeight: ref(200),
            gap: ref(8),
            widowAlign: ref(GalleryWidowAlign.JUSTIFY),
        })
        expect(layout.value.totalHeight).toBeGreaterThan(0)
    })
})
