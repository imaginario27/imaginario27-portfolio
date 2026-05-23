type Options = {
    images: Ref<GalleryImage[]>
    containerWidth: Ref<number>
    targetRowHeight: Ref<number>
    gap: Ref<number>
    widowAlign: Ref<GalleryWidowAlign>
}

export const useJustifiedLayout = ({ images, containerWidth, targetRowHeight, gap, widowAlign }: Options) => {
    const layout = computed<JustifiedLayout>(() => {
        const currentWidth = containerWidth.value
        const targetHeight = targetRowHeight.value
        const gapSize = gap.value

        if (!currentWidth || !targetHeight || !images.value.length) {
            return { rows: [], items: [], totalHeight: 0 }
        }

        const rows: JustifiedRow[] = []
        let buffer: { image: GalleryImage; aspect: number }[] = []

        const flush = (isLastRow: boolean) => {
            if (!buffer.length) return

            const aspectSum = buffer.reduce((sum, entry) => sum + entry.aspect, 0)
            const gapsWidth = gapSize * Math.max(0, buffer.length - 1)

            let rowHeight: number
            if (isLastRow) {
                const naturalWidth = aspectSum * targetHeight + gapsWidth
                rowHeight = naturalWidth > currentWidth ? (currentWidth - gapsWidth) / aspectSum : targetHeight
            } else {
                rowHeight = (currentWidth - gapsWidth) / aspectSum
            }

            const items: JustifiedItem[] = buffer.map((entry) => ({
                image: entry.image,
                width: entry.aspect * rowHeight,
                height: rowHeight,
                rowIndex: rows.length,
                isLastRow,
            }))

            const rowWidth = items.reduce((sum, item) => sum + item.width, 0) + gapsWidth

            rows.push({
                height: rowHeight,
                width: rowWidth,
                items,
                isWidow: isLastRow && rowWidth < currentWidth - 1,
                align: widowAlign.value,
            })

            buffer = []
        }

        for (const image of images.value) {
            if (!image?.width || !image.height) continue

            const aspect = image.width / image.height
            const itemWidth = aspect * targetHeight
            const currentRowWidth =
                buffer.reduce((sum, entry) => sum + entry.aspect * targetHeight, 0) + gapSize * Math.max(0, buffer.length - 1)
            const projectedWidth = currentRowWidth + (buffer.length ? gapSize : 0) + itemWidth

            if (buffer.length && projectedWidth > currentWidth) {
                flush(false)
            }
            buffer.push({ image, aspect })
        }

        flush(true)

        if (rows.length) {
            const lastRow = rows.at(-1)
            if (lastRow && widowAlign.value === GalleryWidowAlign.HIDE_IF_SINGLE && lastRow.items.length === 1 && lastRow.isWidow) {
                rows.pop()
            } else if (lastRow) {
                lastRow.items.forEach((item) => (item.isLastRow = true))
            }
        }

        const flatItems = rows.flatMap((row) => row.items)
        const totalHeight = rows.reduce((sum, row) => sum + row.height, 0) + Math.max(0, rows.length - 1) * gapSize

        return { rows, items: flatItems, totalHeight }
    })

    return { layout }
}
