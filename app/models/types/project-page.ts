export type ProjectPageType = 'frontend' | 'uiux' | 'creative'

export type ProjectPageConfig = {
    type: ProjectPageType
    filterTaxonomy: string | null
    categoryIds: Record<string, number[]>
    mode: 'include' | 'exclude'
    isMultipleFilter: boolean
}
