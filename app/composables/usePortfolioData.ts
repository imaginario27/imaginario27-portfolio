const TAXONOMY_KEYS = ['projectCategories', 'projectTags', 'tecnologias', 'formatos', 'clientes', 'tiposSeleccion'] as const

const PROJECTS_LIST_QUERY = `
query ProjectsList($first: Int, $after: String, $language: String) {
    projects(first: $first, after: $after, where: { language: $language }) {
        nodes {
            id databaseId title slug uri excerpt
            featuredImage { node { sourceUrl altText mediaDetails { width height } } }
            projectCategories { nodes { databaseId slug name } }
            projectTags { nodes { slug name } }
            tecnologias { nodes { slug name } }
            formatos { nodes { slug name } }
            clientes { nodes { slug name } }
            tiposSeleccion { nodes { slug name } }
        }
        pageInfo { hasNextPage endCursor }
    }
}`

const PROJECTS_BY_CATEGORY_QUERY = `
query ProjectsByCategory($categoryId: ID!, $first: Int, $after: String) {
    projectCategory(id: $categoryId, idType: DATABASE_ID) {
        contentNodes(first: $first, after: $after) {
            nodes {
                ... on Project {
                    id databaseId title slug uri excerpt
                    featuredImage { node { sourceUrl altText mediaDetails { width height } } }
                    projectCategories { nodes { databaseId slug name } }
                    projectTags { nodes { slug name } }
                    tecnologias { nodes { slug name } }
                    formatos { nodes { slug name } }
                    clientes { nodes { slug name } }
                    tiposSeleccion { nodes { slug name } }
                }
            }
            pageInfo { hasNextPage endCursor }
        }
    }
}`

const stripHtml = (html: string | null | undefined): string => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').trim()
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
            .filter((term): term is { databaseId?: number | null; slug: string; name: string } => Boolean(term.slug && term.name))
            .map((term) => ({
                ...(term.databaseId != null ? { databaseId: term.databaseId } : {}),
                slug: term.slug,
                name: term.name,
            }))
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
    const config = useRuntimeConfig()
    const graphqlEndpoint = String((config.public as Record<string, unknown>).GQL_HOST ?? 'https://imaginario27.com/graphql')

    const setItems = (preloaded: PortfolioItem[]) => {
        items.value = preloaded
    }

    const fetchGraphQLPage = async (
        language?: string,
        after?: string,
        first = 100,
    ): Promise<{ nodes: ProjectNode[]; hasNextPage: boolean; endCursor?: string }> => {
        const response = await $fetch<{
            data: { projects: { nodes: ProjectNode[]; pageInfo: { hasNextPage: boolean; endCursor?: string } } }
        }>(graphqlEndpoint, {
            method: 'POST',
            body: {
                query: PROJECTS_LIST_QUERY,
                variables: { first, after, language },
            },
        })
        const projects = response.data?.projects
        return {
            nodes: projects?.nodes ?? [],
            hasNextPage: projects?.pageInfo?.hasNextPage ?? false,
            endCursor: projects?.pageInfo?.endCursor,
        }
    }

    const fetchCategoryPage = async (
        categoryId: string,
        after?: string,
        first = 100,
    ): Promise<{ nodes: ProjectNode[]; hasNextPage: boolean; endCursor?: string }> => {
        const response = await $fetch<{
            data: {
                projectCategory: {
                    contentNodes: {
                        nodes: ProjectNode[]
                        pageInfo: { hasNextPage: boolean; endCursor?: string }
                    }
                }
            }
        }>(graphqlEndpoint, {
            method: 'POST',
            body: {
                query: PROJECTS_BY_CATEGORY_QUERY,
                variables: { categoryId, first, after },
            },
        })
        const contentNodes = response.data?.projectCategory?.contentNodes
        return {
            nodes: contentNodes?.nodes ?? [],
            hasNextPage: contentNodes?.pageInfo?.hasNextPage ?? false,
            endCursor: contentNodes?.pageInfo?.endCursor,
        }
    }

    const fetchAllByCategory = async (categoryId: string): Promise<ProjectNode[]> => {
        const allNodes: ProjectNode[] = []
        let hasNextPage = true
        let after: string | undefined
        while (hasNextPage) {
            const page = await fetchCategoryPage(categoryId, after)
            allNodes.push(...page.nodes)
            hasNextPage = page.hasNextPage
            after = page.endCursor
        }
        return allNodes
    }

    const fetchProjects = async (variables?: {
        first?: number
        language?: string
        categoryIds?: string[]
        excludeCategoryIds?: string[]
    }) => {
        pending.value = true
        try {
            if (variables?.categoryIds?.length) {
                const results = await Promise.all(variables.categoryIds.map((categoryId) => fetchAllByCategory(categoryId)))
                items.value = results
                    .flat()
                    .map(mapNodeToPortfolioItem)
                    .filter((item): item is PortfolioItem => item !== null)
                return
            }

            const needsAllPages = Boolean(variables?.excludeCategoryIds?.length)
            const allNodes: ProjectNode[] = []
            let hasNextPage = true
            let after: string | undefined

            while (hasNextPage) {
                const page = await fetchGraphQLPage(variables?.language, after, needsAllPages ? 100 : (variables?.first ?? 100))
                allNodes.push(...page.nodes)
                hasNextPage = page.hasNextPage
                after = page.endCursor
                if (!needsAllPages) break
            }

            items.value = allNodes.map(mapNodeToPortfolioItem).filter((item): item is PortfolioItem => item !== null)

            if (variables?.excludeCategoryIds?.length) {
                const excluded = new Set(variables.excludeCategoryIds)
                items.value = items.value.filter((item) => {
                    const categories = item.taxonomies.projectCategories ?? []
                    return !categories.some((term) => term.databaseId != null && excluded.has(String(term.databaseId)))
                })
            }
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
