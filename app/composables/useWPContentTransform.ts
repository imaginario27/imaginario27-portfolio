type ContentTransform = (html: string) => string

const GALLERY_MARKER_PREFIX = '<!--wp-gallery:'
const GALLERY_MARKER_SUFFIX = '-->'
const GALLERY_INLINE_PREFIX = '<!--wp-gallery-inline:'
const GALLERY_INLINE_SUFFIX = '-->'
const GALLERY_MARKER_REGEX = /<!--wp-gallery:([\d,]+)(?:\|(\d+))?-->/g
const GALLERY_INLINE_REGEX = /<!--wp-gallery-inline:([\s\S]*?)-->/g

const wrapIframes: ContentTransform = (html) => {
    return html.replaceAll(
        /<iframe([^>]*)><\/iframe>/gi,
        '<div class="aspect-video w-full overflow-hidden rounded-lg"><iframe$1 class="h-full w-full" loading="lazy"></iframe></div>',
    )
}

const wrapVideo: ContentTransform = (html) => {
    return html.replaceAll(
        /<video([^>]*)>([\s\S]*?)<\/video>/gi,
        '<div class="aspect-video w-full overflow-hidden rounded-lg"><video$1 class="h-full w-full object-cover">$2</video></div>',
    )
}

const stripSocialSharing: ContentTransform = (html) => {
    return html.replace(/<div[^>]*class="[^"]*et_social[^"]*"[^>]*>[\s\S]*$/i, '')
}

const cleanNbsp: ContentTransform = (html) => {
    return html.replaceAll(/&nbsp;/gi, ' ').trim()
}

const autoParagraph: ContentTransform = (html) => {
    const hasBlockElements = /<(?:p|div|h[1-6]|ul|ol|blockquote|figure|table|section|article|pre)\b/i.test(html)
    if (hasBlockElements) return html

    const paragraphs = html
        .split(/\r?\n\r?\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            const withBreaks = block.replaceAll(/\r?\n/g, '<br />')
            return `<p>${withBreaks}</p>`
        })

    return paragraphs.join('\n')
}

const extractColumnsFromShortcode = (shortcode: string): number | null => {
    const columnsMatch = /columns="(\d+)"/.exec(shortcode)
    if (!columnsMatch?.[1]) return null
    const columns = Number.parseInt(columnsMatch[1], 10)
    return columns > 0 ? columns : null
}

const buildGalleryMarker = (ids: string, columns: number | null): string => {
    const columnsSuffix = columns ? `|${columns}` : ''
    return `${GALLERY_MARKER_PREFIX}${ids}${columnsSuffix}${GALLERY_MARKER_SUFFIX}`
}

const convertGalleryShortcodes: ContentTransform = (html) => {
    return html.replaceAll(/\[gallery\s+[^\]]*ids="([^"]+)"[^\]]*\]/gi, (fullMatch, ids: string) => {
        const cleaned = ids
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean)
            .join(',')
        const columns = extractColumnsFromShortcode(fullMatch)
        return buildGalleryMarker(cleaned, columns)
    })
}

const matchNestedDiv = (html: string, startIndex: number): string | null => {
    let depth = 0
    const combined = /(<div\b)|(<\/div>)/gi
    combined.lastIndex = startIndex

    let tagMatch: RegExpExecArray | null = null
    while ((tagMatch = combined.exec(html)) !== null) {
        if (tagMatch[1]) {
            depth++
        } else if (tagMatch[2]) {
            depth--
            if (depth === 0) {
                return html.slice(startIndex, tagMatch.index + tagMatch[0].length)
            }
        }
    }
    return null
}

const extractDimensionsFromFilename = (url: string): { width: number; height: number } | null => {
    const match = /-(\d+)x(\d+)\.\w+(?:\?|$)/.exec(url)
    if (!match?.[1] || !match?.[2]) return null
    return { width: Number.parseInt(match[1], 10), height: Number.parseInt(match[2], 10) }
}

const extractGalleryImages = (galleryHtml: string): GalleryImage[] => {
    const images: GalleryImage[] = []
    const imgRegex = /<img([^>]*?)(?:\/)?>/gi
    let imgMatch: RegExpExecArray | null = null

    while ((imgMatch = imgRegex.exec(galleryHtml)) !== null) {
        const attrs = imgMatch[1] ?? ''
        const src = extractAttr(attrs, 'src')
        if (!src) continue

        const alt = extractAttr(attrs, 'alt') ?? ''
        const attrWidth = Number.parseInt(extractAttr(attrs, 'width') ?? '', 10) || 0
        const attrHeight = Number.parseInt(extractAttr(attrs, 'height') ?? '', 10) || 0
        const filenameDims = extractDimensionsFromFilename(src)
        const width = filenameDims?.width ?? attrWidth
        const height = filenameDims?.height ?? attrHeight

        const anchorContext = findWrappingAnchor(galleryHtml, imgMatch.index)
        const fullSizeUrl = anchorContext ? extractFullSizeUrl(anchorContext) : null

        if (width && height) {
            images.push({
                id: src,
                src: fullSizeUrl ?? src,
                alt,
                width,
                height,
            })
        }
    }

    return images
}

const extractColumnsFromClass = (divTag: string): number | null => {
    const columnsMatch = /gallery-columns-(\d+)/.exec(divTag)
    if (!columnsMatch?.[1]) return null
    const columns = Number.parseInt(columnsMatch[1], 10)
    return columns > 0 ? columns : null
}

const extractWpImageIds = (html: string): string[] => {
    const ids: string[] = []
    const wpImageRegex = /wp-image-(\d+)/g
    let wpMatch: RegExpExecArray | null = null
    while ((wpMatch = wpImageRegex.exec(html)) !== null) {
        if (wpMatch[1]) ids.push(wpMatch[1])
    }
    return ids
}

const convertGalleryDivToMarker = (divTag: string, fullDiv: string): string => {
    const columns = extractColumnsFromClass(divTag)
    const ids = extractWpImageIds(fullDiv)

    if (ids.length) {
        return buildGalleryMarker(ids.join(','), columns)
    }

    const images = extractGalleryImages(fullDiv)
    if (!images.length) return fullDiv

    const payload = columns ? { images, columns } : { images }
    return `${GALLERY_INLINE_PREFIX}${JSON.stringify(payload)}${GALLERY_INLINE_SUFFIX}`
}

const convertRenderedGalleries: ContentTransform = (html) => {
    const galleryDivRegex = /<div[^>]*class=["'][^"']*gallery[^"']*["'][^>]*>/gi
    let result = ''
    let lastIndex = 0
    let divMatch: RegExpExecArray | null = null

    while ((divMatch = galleryDivRegex.exec(html)) !== null) {
        const fullDiv = matchNestedDiv(html, divMatch.index)
        if (!fullDiv) continue

        result += html.slice(lastIndex, divMatch.index)
        result += convertGalleryDivToMarker(divMatch[0], fullDiv)

        lastIndex = divMatch.index + fullDiv.length
        galleryDivRegex.lastIndex = lastIndex
    }

    result += html.slice(lastIndex)
    return result
}

const stripInlineStyles: ContentTransform = (html) => {
    return html.replaceAll(/\s+style="[^"]*"/gi, '')
}

const stripSrcset: ContentTransform = (html) => {
    return html.replaceAll(/\s+srcset="[^"]*"/gi, '').replaceAll(/\s+sizes="[^"]*"/gi, '')
}

const HTML_TRANSFORMS: ContentTransform[] = [
    cleanNbsp,
    stripSocialSharing,
    stripInlineStyles,
    stripSrcset,
    convertGalleryShortcodes,
    convertRenderedGalleries,
    autoParagraph,
    wrapIframes,
    wrapVideo,
]

const extractAttr = (tag: string, attr: string): string | null => {
    const regex = new RegExp(String.raw`${attr}\s*=\s*["']([^"']*)["']`, 'i')
    const result = regex.exec(tag)
    return result?.[1] ?? null
}

const extractImageFromImgTag = (imgAttrs: string, contextHtml?: string): GalleryImage | null => {
    const src = extractAttr(imgAttrs, 'src')
    if (!src) return null

    const width = Number.parseInt(extractAttr(imgAttrs, 'width') ?? '', 10)
    const height = Number.parseInt(extractAttr(imgAttrs, 'height') ?? '', 10)
    const alt = extractAttr(imgAttrs, 'alt') ?? ''
    const wpClass = extractAttr(imgAttrs, 'class') ?? ''
    const idFromClass = /wp-image-(\d+)/.exec(wpClass)?.[1]
    const fullSizeSrc = contextHtml ? extractFullSizeUrl(contextHtml) : null

    return {
        id: idFromClass ?? src,
        src: fullSizeSrc ?? src,
        alt,
        width: width || 800,
        height: height || 600,
    }
}

const extractFullSizeUrl = (contextHtml: string): string | null => {
    const anchorRegex = /<a[^>]*href="([^"]+)"[^>]*>/i
    const anchorMatch = anchorRegex.exec(contextHtml)
    const href = anchorMatch?.[1]
    if (!href) return null
    return /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(href) ? href : null
}

const findWrappingAnchor = (fragment: string, imgIndex: number): string | null => {
    const beforeImg = fragment.slice(0, imgIndex)
    const anchorStart = beforeImg.lastIndexOf('<a ')
    if (anchorStart === -1) return null
    const anchorEnd = fragment.indexOf('</a>', imgIndex)
    if (anchorEnd === -1) return null
    return fragment.slice(anchorStart, anchorEnd + 4)
}

const extractImagesFromFragment = (fragment: string): GalleryImage[] => {
    const images: GalleryImage[] = []
    const imgRegex = /<img([^>]*?)(?:\/)?>/gi
    let imgMatch: RegExpExecArray | null = null

    while ((imgMatch = imgRegex.exec(fragment)) !== null) {
        const anchorContext = findWrappingAnchor(fragment, imgMatch.index)
        const image = extractImageFromImgTag(imgMatch[1] ?? '', anchorContext ?? '')
        if (image) images.push(image)
    }

    return images
}

const isImageOnlyContent = (html: string): boolean => {
    const stripped = html
        .replaceAll(/<a[^>]*>|<\/a>/gi, '')
        .replaceAll(/<img[^>]*\/?>/gi, '')
        .replaceAll(/\s+/g, '')
    return stripped.length === 0
}

const parseImageContent = (html: string): WPContentBlock | null => {
    const images = extractImagesFromFragment(html)
    if (!images.length || !isImageOnlyContent(html)) return null

    if (images.length === 1 && images[0]) {
        return { type: WPContentBlockType.IMAGE, image: images[0] }
    }
    return { type: WPContentBlockType.GALLERY, images }
}

const clampColumns = (columns: number | null | undefined): number | undefined => {
    if (!columns || columns < 1) return undefined
    return Math.min(columns, 3)
}

const parseInlineGalleryPayload = (jsonString: string): WPContentBlock | null => {
    try {
        const parsed = JSON.parse(jsonString) as GalleryImage[] | { images: GalleryImage[]; columns?: number }
        if (Array.isArray(parsed)) {
            return { type: WPContentBlockType.GALLERY, images: parsed }
        }
        return {
            type: WPContentBlockType.GALLERY,
            images: parsed.images,
            columns: clampColumns(parsed.columns),
        }
    } catch {
        return null
    }
}

const parseParagraphBlock = (fullMatch: string): WPContentBlock => {
    const inner = fullMatch.replaceAll(/^<p[^>]*>|<\/p>$/gi, '')

    const galleryMarkerMatch = GALLERY_MARKER_REGEX.exec(inner)
    GALLERY_MARKER_REGEX.lastIndex = 0
    if (galleryMarkerMatch?.[1]) {
        const mediaIds = galleryMarkerMatch[1].split(',')
        const columns = clampColumns(galleryMarkerMatch[2] ? Number.parseInt(galleryMarkerMatch[2], 10) : null)
        return { type: WPContentBlockType.GALLERY, mediaIds, columns }
    }

    const inlineMatch = GALLERY_INLINE_REGEX.exec(inner)
    GALLERY_INLINE_REGEX.lastIndex = 0
    if (inlineMatch?.[1]) {
        const block = parseInlineGalleryPayload(inlineMatch[1])
        if (block) return block
    }

    const imageBlock = parseImageContent(inner)
    if (imageBlock) return imageBlock

    return { type: WPContentBlockType.HTML, html: fullMatch }
}

const pushHtmlIfPresent = (blocks: WPContentBlock[], html: string) => {
    const trimmed = html.trim()
    if (trimmed) {
        blocks.push({ type: WPContentBlockType.HTML, html: trimmed })
    }
}

const BLOCK_PATTERN = [
    String.raw`(<p[^>]*>[\s\S]*?</p>)`,
    String.raw`(${GALLERY_MARKER_PREFIX}[\d,]+(?:\|\d+)?${GALLERY_MARKER_SUFFIX})`,
    String.raw`(${GALLERY_INLINE_PREFIX}[\s\S]*?${GALLERY_INLINE_SUFFIX})`,
].join('|')

const parseToBlocks = (html: string): WPContentBlock[] => {
    const blocks: WPContentBlock[] = []
    const topLevelRegex = new RegExp(BLOCK_PATTERN, 'gi')
    let lastIndex = 0
    let match: RegExpExecArray | null = null

    while ((match = topLevelRegex.exec(html)) !== null) {
        pushHtmlIfPresent(blocks, html.slice(lastIndex, match.index))

        if (match[1] !== undefined) {
            blocks.push(parseParagraphBlock(match[0]))
        } else if (match[2] !== undefined) {
            const markerContent = match[0].replace(GALLERY_MARKER_PREFIX, '').replace(GALLERY_MARKER_SUFFIX, '')
            const [idsString, columnsString] = markerContent.split('|')
            const ids = (idsString ?? '').split(',')
            const columns = clampColumns(columnsString ? Number.parseInt(columnsString, 10) : null)
            blocks.push({ type: WPContentBlockType.GALLERY, mediaIds: ids, columns })
        } else if (match[3] !== undefined) {
            const jsonString = match[0].replace(GALLERY_INLINE_PREFIX, '').replace(GALLERY_INLINE_SUFFIX, '')
            const block = parseInlineGalleryPayload(jsonString)
            if (block) {
                blocks.push(block)
            } else {
                pushHtmlIfPresent(blocks, match[0])
            }
        }

        lastIndex = match.index + match[0].length
    }

    pushHtmlIfPresent(blocks, html.slice(lastIndex))
    return blocks
}

export const useWPContentTransform = (rawContent: MaybeRefOrGetter<string>) => {
    const blocks = computed<WPContentBlock[]>(() => {
        const content = toValue(rawContent)
        if (!content) return []

        const transformed = HTML_TRANSFORMS.reduce((result, transform) => transform(result), content)

        return parseToBlocks(transformed)
    })

    return { blocks }
}
