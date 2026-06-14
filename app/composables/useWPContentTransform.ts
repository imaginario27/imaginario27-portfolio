type ContentTransform = (html: string) => string

const GALLERY_MARKER_PREFIX = '<!--wp-gallery:'
const GALLERY_MARKER_SUFFIX = '-->'
const GALLERY_MARKER_REGEX = /<!--wp-gallery:([\d,]+)-->/g

const wrapIframes: ContentTransform = (html) => {
    return html.replace(
        /<iframe([^>]*)><\/iframe>/gi,
        '<div class="aspect-video w-full overflow-hidden rounded-lg"><iframe$1 class="h-full w-full" loading="lazy"></iframe></div>',
    )
}

const wrapVideo: ContentTransform = (html) => {
    return html.replace(
        /<video([^>]*)>([\s\S]*?)<\/video>/gi,
        '<div class="aspect-video w-full overflow-hidden rounded-lg"><video$1 class="h-full w-full object-cover">$2</video></div>',
    )
}

const stripSocialSharing: ContentTransform = (html) => {
    return html.replace(/<div[^>]*class="[^"]*et_social[^"]*"[^>]*>[\s\S]*$/i, '')
}

const cleanNbsp: ContentTransform = (html) => {
    return html.replace(/&nbsp;/gi, ' ').trim()
}

const autoParagraph: ContentTransform = (html) => {
    const hasBlockElements = /<(?:p|div|h[1-6]|ul|ol|blockquote|figure|table|section|article|pre)\b/i.test(html)
    if (hasBlockElements) return html

    const paragraphs = html
        .split(/\r?\n\r?\n/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            const withBreaks = block.replace(/\r?\n/g, '<br />')
            return `<p>${withBreaks}</p>`
        })

    return paragraphs.join('\n')
}

const convertGalleryShortcodes: ContentTransform = (html) => {
    return html.replace(/\[gallery\s+ids="([^"]+)"[^\]]*\]/gi, (_match, ids: string) => {
        const cleaned = ids
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean)
            .join(',')
        return `${GALLERY_MARKER_PREFIX}${cleaned}${GALLERY_MARKER_SUFFIX}`
    })
}

const convertRenderedGalleries: ContentTransform = (html) => {
    return html.replace(/<div[^>]*class="[^"]*gallery[^"]*"[^>]*>[\s\S]*?<\/div>/gi, (galleryHtml) => {
        const ids: string[] = []
        const imgRegex = /wp-image-(\d+)/g
        let imgMatch: RegExpExecArray | null = null
        while ((imgMatch = imgRegex.exec(galleryHtml)) !== null) {
            if (imgMatch[1]) ids.push(imgMatch[1])
        }
        if (!ids.length) return galleryHtml
        return `${GALLERY_MARKER_PREFIX}${ids.join(',')}${GALLERY_MARKER_SUFFIX}`
    })
}

const stripInlineStyles: ContentTransform = (html) => {
    return html.replace(/\s+style="[^"]*"/gi, '')
}

const stripSrcset: ContentTransform = (html) => {
    return html.replace(/\s+srcset="[^"]*"/gi, '').replace(/\s+sizes="[^"]*"/gi, '')
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
        .replace(/<a[^>]*>|<\/a>/gi, '')
        .replace(/<img[^>]*\/?>/gi, '')
        .replace(/\s+/g, '')
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

const parseParagraphBlock = (fullMatch: string): WPContentBlock => {
    const inner = fullMatch.replace(/^<p[^>]*>|<\/p>$/gi, '')

    const galleryMarkerMatch = GALLERY_MARKER_REGEX.exec(inner)
    GALLERY_MARKER_REGEX.lastIndex = 0
    if (galleryMarkerMatch?.[1]) {
        const mediaIds = galleryMarkerMatch[1].split(',')
        return { type: WPContentBlockType.GALLERY, mediaIds }
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

const BLOCK_PATTERN = [String.raw`(<p[^>]*>[\s\S]*?</p>)`, `(${GALLERY_MARKER_PREFIX}[\\d,]+${GALLERY_MARKER_SUFFIX})`].join('|')

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
            const ids = match[0].replace(GALLERY_MARKER_PREFIX, '').replace(GALLERY_MARKER_SUFFIX, '').split(',')
            blocks.push({ type: WPContentBlockType.GALLERY, mediaIds: ids })
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
