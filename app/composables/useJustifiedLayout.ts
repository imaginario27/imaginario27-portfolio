type Options = {
    images: Ref<GalleryImage[]>
    containerWidth: Ref<number>
    targetRowHeight: Ref<number>
    gap: Ref<number>
    widowAlign: Ref<GalleryWidowAlign>
}

export const useJustifiedLayout = ({ images, containerWidth, targetRowHeight, gap, widowAlign }: Options) => {
    const layout = computed<JustifiedLayout>(() => {
        const cw = containerWidth.value
        const target = targetRowHeight.value
        const g = gap.value

        if (!cw || !target || !images.value.length) {
            return { rows: [], items: [], totalHeight: 0 }
        }

        const rows: JustifiedRow[] = []
        let buffer: { image: GalleryImage; aspect: number }[] = []

        const flush = (isLastRow: boolean) => {
            if (!buffer.length) return

            const aspectSum = buffer.reduce((s, b) => s + b.aspect, 0)
            const gapsWidth = g * Math.max(0, buffer.length - 1)

            let rowHeight: number
            if (isLastRow) {
                const naturalWidth = aspectSum * target + gapsWidth
                rowHeight = naturalWidth > cw ? (cw - gapsWidth) / aspectSum : target
            } else {
                rowHeight = (cw - gapsWidth) / aspectSum
            }

            const items: JustifiedItem[] = buffer.map((b) => ({
                image: b.image,
                width: b.aspect * rowHeight,
                height: rowHeight,
                rowIndex: rows.length,
                isLastRow,
            }))

            const rowWidth = items.reduce((s, i) => s + i.width, 0) + gapsWidth

            rows.push({
                height: rowHeight,
                width: rowWidth,
                items,
                isWidow: isLastRow && rowWidth < cw - 1,
                align: widowAlign.value,
            })

            buffer = []
        }

        for (const img of images.value) {
            if (!img?.width || !img.height) continue

            const aspect = img.width / img.height
            const itemWidth = aspect * target
            const currentWidth = buffer.reduce((s, b) => s + b.aspect * target, 0) + g * Math.max(0, buffer.length - 1)
            const projected = currentWidth + (buffer.length ? g : 0) + itemWidth

            if (buffer.length && projected > cw) {
                flush(false)
            }
            buffer.push({ image: img, aspect })
        }

        flush(true)

        if (rows.length) {
            const last = rows.at(-1)
            if (last && widowAlign.value === GalleryWidowAlign.HIDE_IF_SINGLE && last.items.length === 1 && last.isWidow) {
                rows.pop()
            } else if (last) {
                last.items.forEach((it) => (it.isLastRow = true))
            }
        }

        const flatItems = rows.flatMap((r) => r.items)
        const totalHeight = rows.reduce((s, r) => s + r.height, 0) + Math.max(0, rows.length - 1) * g

        return { rows, items: flatItems, totalHeight }
    })

    return { layout }
}
