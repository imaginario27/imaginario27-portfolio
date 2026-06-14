export type WPContentBlock =
    | { type: WPContentBlockType.HTML; html: string }
    | { type: WPContentBlockType.IMAGE; image: GalleryImage }
    | { type: WPContentBlockType.GALLERY; mediaIds?: string[]; images?: GalleryImage[] }
