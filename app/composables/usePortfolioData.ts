const TAXONOMY_KEYS = ['projectCategories', 'projectTags', 'tecnologias', 'formatos', 'clientes', 'tiposSeleccion'] as const

const stripHtml = (html: string | null | undefined) => {
    if (!html) return ''
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    return (parsed.body.textContent ?? '').trim()
}

const toGalleryImage = (portfolioItem: PortfolioItem, taxonomyKey: string): GalleryImage => ({
    ...portfolioItem.featuredImage,
    tags: (portfolioItem.taxonomies[taxonomyKey] ?? []).map((term) => term.slug),
})

const mapNodeToPortfolioItem = (node: ProjectNode): PortfolioItem | null => {
    const image = node.featuredImage?.node
    if (!image?.sourceUrl || !image.mediaDetails?.width || !image.mediaDetails?.height) {
        return null
    }

    const id = String(node.databaseId ?? node.id)

    const taxonomies: Record<string, PortfolioTerm[]> = {}
    for (const key of TAXONOMY_KEYS) {
        const raw = node[key]?.nodes ?? []
        taxonomies[key] = raw
            .filter((term): term is { slug: string; name: string } => Boolean(term.slug && term.name))
            .map((term) => ({ slug: term.slug, name: term.name }))
    }

    return {
        id,
        title: node.title ?? '',
        slug: node.slug ?? '',
        url: node.uri ?? `/${node.slug ?? ''}`,
        excerpt: stripHtml(node.excerpt) || null,
        featuredImage: {
            id,
            src: image.sourceUrl,
            alt: image.altText ?? node.title ?? '',
            width: image.mediaDetails.width,
            height: image.mediaDetails.height,
        },
        taxonomies,
    }
}

export const usePortfolioData = () => {
    const items = ref<PortfolioItem[]>([])
    const pending = ref(false)

    const setItems = (preloaded: PortfolioItem[]) => {
        items.value = preloaded
    }

    const fetchProjects = async (variables?: { first?: number; language?: string }) => {
        pending.value = true
        try {
            const { data } = await useAsyncQuery({
                operation: 'ProjectsList',
                variables: {
                    first: variables?.first ?? 100,
                    language: variables?.language,
                },
            })
            const nodes = (data.value?.projects?.nodes ?? []) as ProjectNode[]
            items.value = nodes.map(mapNodeToPortfolioItem).filter((item): item is PortfolioItem => item !== null)
        } finally {
            pending.value = false
        }
    }

    const buildFilterOptions = (taxonomyKey: string): GalleryFilterOption[] => {
        const seen = new Map<string, string>()
        for (const item of items.value) {
            const terms = item.taxonomies[taxonomyKey] ?? []
            for (const term of terms) {
                if (!seen.has(term.slug)) {
                    seen.set(term.slug, term.name)
                }
            }
        }
        return Array.from(seen.entries()).map(([slug, name]) => ({
            value: slug,
            text: name,
        }))
    }

    const imagesWithTags = (taxonomyKey: string) => {
        return computed<GalleryImage[]>(() => {
            return items.value.map((portfolioItem) => toGalleryImage(portfolioItem, taxonomyKey))
        })
    }

    const itemsByImageId = computed(() => {
        const map = new Map<string, PortfolioItem>()
        items.value.forEach((portfolioItem) => map.set(portfolioItem.featuredImage.id, portfolioItem))
        return map
    })

    return {
        items,
        pending,
        setItems,
        fetchProjects,
        buildFilterOptions,
        imagesWithTags,
        itemsByImageId,
    }
}
