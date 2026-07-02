export type ProjectTranslation = {
    slug: string
    uri: string
    languageCode: string
}

export type ProjectDetail = {
    databaseId: number
    title: string
    slug: string
    uri: string
    date: string
    content: string
    excerpt: string | null
    featuredImage: GalleryImage | null
    client: string | null
    format: ProjectFormat
    tags: PortfolioTerm[]
    technologies: PortfolioTerm[]
    categories: PortfolioTerm[]
    translations: ProjectTranslation[]
}

export type ProjectDetailNode = {
    databaseId?: number | null
    title?: string | null
    slug?: string | null
    uri?: string | null
    date?: string | null
    content?: string | null
    excerpt?: string | null
    language?: { code?: string | null } | null
    translations?: TranslationNode[] | null
    featuredImage?: {
        node?: {
            sourceUrl?: string | null
            altText?: string | null
            mediaDetails?: { width?: number | null; height?: number | null } | null
        } | null
    } | null
    clientes?: { nodes?: Array<{ name?: string | null; slug?: string | null }> | null } | null
    formatos?: { nodes?: Array<{ name?: string | null; databaseId?: number | null }> | null } | null
    projectTags?: { nodes?: Array<{ name?: string | null; slug?: string | null }> | null } | null
    tecnologias?: { nodes?: Array<{ name?: string | null; slug?: string | null }> | null } | null
    projectCategories?: { nodes?: Array<{ name?: string | null; slug?: string | null; databaseId?: number | null }> | null } | null
}
