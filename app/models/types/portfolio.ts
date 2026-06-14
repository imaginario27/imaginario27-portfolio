export type PortfolioItem = {
    id: string
    title: string
    slug: string
    url: string
    excerpt: string | null
    featuredImage: GalleryImage
    taxonomies: Record<string, PortfolioTerm[]>
}

export type PortfolioTerm = {
    databaseId?: number
    slug: string
    name: string
}

export type ProjectNode = {
    id: string
    databaseId?: number | null
    title?: string | null
    slug?: string | null
    uri?: string | null
    excerpt?: string | null
    featuredImage?: {
        node?: {
            sourceUrl?: string | null
            altText?: string | null
            mediaDetails?: { width?: number | null; height?: number | null } | null
        } | null
    } | null
    projectCategories?: TaxonomyNodes | null
    projectTags?: TaxonomyNodes | null
    tecnologias?: TaxonomyNodes | null
    formatos?: TaxonomyNodes | null
    clientes?: TaxonomyNodes | null
    tiposSeleccion?: TaxonomyNodes | null
}

type TaxonomyNodes = {
    nodes?: Array<{ databaseId?: number | null; slug?: string | null; name?: string | null }> | null
}
