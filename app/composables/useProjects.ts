const PROJECT_SEGMENTS = ['/proyectos/', '/projekte/', '/projects/']

export const useProjects = () => {
    const isProjectPath = (path: string): boolean => PROJECT_SEGMENTS.some((seg) => path.includes(seg))

    const getProjectSlug = (path: string): string => path.split('/').findLast(Boolean) ?? ''

    const fetchProjectSeo = async (slug: string) => {
        const res = await GqlGetProjectSEO({ slug })
        return {
            seo: res.project?.seo ?? null,
            title: res.project?.title ?? null,
        }
    }

    return {
        PROJECT_SEGMENTS,
        isProjectPath,
        getProjectSlug,
        fetchProjectSeo,
    }
}
