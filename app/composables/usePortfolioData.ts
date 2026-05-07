const TAXONOMY_KEYS = ['projectCategories', 'projectTags', 'tecnologias', 'formatos', 'clientes', 'tiposSeleccion'] as const

const stripHtml = (html: string | null | undefined) => {
    if (!html) return ''
    return html.replaceAll(/<[^>]+>/g, '').trim()
}

const toGalleryImage = (p: PortfolioItem, taxonomyKey: string): GalleryImage => ({
    ...p.featuredImage,
    tags: (p.taxonomies[taxonomyKey] ?? []).map((t) => t.slug),
})

const mapNodeToPortfolioItem = (node: ProjectNode): PortfolioItem | null => {
    const img = node.featuredImage?.node
    if (!img?.sourceUrl || !img.mediaDetails?.width || !img.mediaDetails?.height) {
        return null
    }

    const id = String(node.databaseId ?? node.id)

    const taxonomies: Record<string, PortfolioTerm[]> = {}
    for (const key of TAXONOMY_KEYS) {
        const raw = node[key]?.nodes ?? []
        taxonomies[key] = raw
            .filter((t): t is { slug: string; name: string } => Boolean(t.slug && t.name))
            .map((t) => ({ slug: t.slug, name: t.name }))
    }

    return {
        id,
        title: node.title ?? '',
        slug: node.slug ?? '',
        url: node.uri ?? `/${node.slug ?? ''}`,
        excerpt: stripHtml(node.excerpt) || null,
        featuredImage: {
            id,
            src: img.sourceUrl,
            alt: img.altText ?? node.title ?? '',
            width: img.mediaDetails.width,
            height: img.mediaDetails.height,
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
            const { data } = await useAsyncGql({
                operation: 'ProjectsList',
                variables: {
                    first: variables?.first ?? 100,
                    language: variables?.language,
                },
            })
            const nodes = (data.value?.projects?.nodes ?? []) as ProjectNode[]
            items.value = nodes.map(mapNodeToPortfolioItem).filter((x): x is PortfolioItem => x !== null)
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
            return items.value.map((p) => toGalleryImage(p, taxonomyKey))
        })
    }

    const itemsByImageId = computed(() => {
        const map = new Map<string, PortfolioItem>()
        items.value.forEach((p) => map.set(p.featuredImage.id, p))
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
