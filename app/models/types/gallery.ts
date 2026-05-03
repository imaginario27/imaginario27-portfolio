export type GalleryImage = {
    id: string
    src: string
    alt: string
    caption?: string | null
    width: number
    height: number
    tags?: string[]
}

export type GalleryFilterOption = {
    value: string
    text: string
}

export type GalleryClasses = {
    rootClass?: string
    itemClass?: string
    imageClass?: string
    captionClass?: string
    hoverClass?: string
    filterClass?: string
    paginationClass?: string
    lightboxClass?: string
    sliderClass?: string
}

export type JustifiedItem = {
    image: GalleryImage
    width: number
    height: number
    rowIndex: number
    isLastRow: boolean
}

export type JustifiedRow = {
    height: number
    width: number
    items: JustifiedItem[]
    isWidow: boolean
    align: GalleryWidowAlign
}

export type JustifiedLayout = {
    rows: JustifiedRow[]
    items: JustifiedItem[]
    totalHeight: number
}
