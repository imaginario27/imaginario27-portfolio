const FORMAT_DATABASE_IDS: Record<number, ProjectFormat> = {
    90: ProjectFormat.VERTICAL,
    95: ProjectFormat.HORIZONTAL,
}

const resolveFormat = (formatos: ProjectDetailNode['formatos']): ProjectFormat => {
    const nodes = formatos?.nodes ?? []
    for (const node of nodes) {
        if (node.databaseId != null) {
            const format = FORMAT_DATABASE_IDS[node.databaseId]
            if (format) return format
        }
    }
    return ProjectFormat.HORIZONTAL
}

const mapTaxonomyNodes = (nodes: Array<{ name?: string | null; slug?: string | null }> | null | undefined): PortfolioTerm[] => {
    return (nodes ?? [])
        .filter((node): node is { name: string; slug: string } => Boolean(node.name && node.slug))
        .map((node) => ({ name: node.name, slug: node.slug }))
}

const mapTranslations = (node: ProjectDetailNode): ProjectTranslation[] => {
    const translations: ProjectTranslation[] = []

    if (node.slug && node.uri && node.language?.code) {
        translations.push({
            slug: node.slug,
            uri: node.uri,
            languageCode: node.language.code.toLowerCase(),
        })
    }

    for (const translation of node.translations ?? []) {
        if (translation.slug && translation.uri && translation.language?.code) {
            translations.push({
                slug: translation.slug,
                uri: translation.uri,
                languageCode: translation.language.code.toLowerCase(),
            })
        }
    }

    return translations
}

const mapToProjectDetail = (node: ProjectDetailNode): ProjectDetail | null => {
    if (!node.title || !node.slug) return null

    const image = node.featuredImage?.node
    const featuredImage: GalleryImage | null =
        image?.sourceUrl && image.mediaDetails?.width && image.mediaDetails?.height
            ? {
                  id: String(node.databaseId ?? node.slug),
                  src: image.sourceUrl,
                  alt: image.altText ?? node.title ?? '',
                  width: image.mediaDetails.width,
                  height: image.mediaDetails.height,
              }
            : null

    const clientNode = node.clientes?.nodes?.[0]

    return {
        databaseId: node.databaseId ?? 0,
        title: node.title,
        slug: node.slug,
        uri: node.uri ?? `/${node.slug}`,
        date: node.date ?? '',
        content: node.content ?? '',
        excerpt: node.excerpt ?? null,
        featuredImage,
        client: clientNode?.name ?? null,
        format: resolveFormat(node.formatos),
        tags: mapTaxonomyNodes(node.projectTags?.nodes),
        technologies: mapTaxonomyNodes(node.tecnologias?.nodes),
        categories: mapTaxonomyNodes(node.projectCategories?.nodes),
        translations: mapTranslations(node),
    }
}

export const useProjectDetail = (slug: string, language: string) => {
    const { data, pending, error } = useAsyncQuery({
        operation: 'GetProjectDetail',
        variables: { slug, language },
    })

    const project = computed<ProjectDetail | null>(() => {
        const nodes = (data.value as { projects?: { nodes?: ProjectDetailNode[] } } | null)?.projects?.nodes
        const node = nodes?.[0]
        if (!node) return null
        return mapToProjectDetail(node)
    })

    return {
        project,
        pending,
        error,
    }
}
