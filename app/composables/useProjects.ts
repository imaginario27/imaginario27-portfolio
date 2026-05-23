const PROJECT_SEGMENTS = ['/proyectos/', '/projekte/', '/projects/']

export const useProjects = () => {
    const isProjectPath = (path: string): boolean => PROJECT_SEGMENTS.some((segment) => path.includes(segment))

    const getProjectSlug = (path: string): string => path.split('/').findLast(Boolean) ?? ''

    const fetchProjectSeo = async (slug: string) => {
        const result = await executeQuery('GetProjectSEO', { slug })
        return {
            seo: result.project?.seo ?? null,
            title: result.project?.title ?? null,
        }
    }

    return {
        PROJECT_SEGMENTS,
        isProjectPath,
        getProjectSlug,
        fetchProjectSeo,
    }
}
