export const useRouteWPSeo = async () => {
    const route = useRoute()
    const { locales, defaultLocale } = useI18n()
    const { isProjectPath, getProjectSlug, fetchProjectSeo } = useProjects()

    const stripLocale = (path: string): string => {
        const codes = (locales.value as Array<{ code: string }>).map((l) => l.code)
        for (const code of codes) {
            if (code === defaultLocale) continue
            if (path === `/${code}`) return '/'
            if (path.startsWith(`/${code}/`)) return path.slice(code.length + 1)
        }
        return path
    }

    const normalizedPath = computed(() => stripLocale(route.path))

    const isProject = computed(() => isProjectPath(normalizedPath.value))

    const slug = computed(() => {
        const path = normalizedPath.value
        if (isProject.value) return getProjectSlug(path)
        return path === '/' ? '/' : path.replaceAll(/^\/|\/$/g, '')
    })

    const fetchPageSeo = async (pageSlug: string) => {
        const res = await executeQuery('GetPageSEO', { slug: pageSlug })
        return {
            seo: res.page?.seo ?? null,
            title: res.page?.title ?? null,
        }
    }

    const { data: seoData } = await useAsyncData(
        () => `route-wp-seo:${route.path}`,
        () => (isProject.value ? fetchProjectSeo(slug.value) : fetchPageSeo(slug.value)),
        { watch: [() => route.path] },
    )

    useWPSeo(
        () => seoData.value?.seo,
        () => seoData.value?.title,
    )

    watchEffect(() => {
        const wpTitle = seoData.value?.seo?.title ?? seoData.value?.title
        if (wpTitle) route.meta.title = wpTitle
    })

    return {
        seoData,
        normalizedPath,
        isProject,
        slug,
    }
}
