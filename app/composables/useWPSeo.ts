export const useWPSeo = (seo: MaybeRefOrGetter<WPSeoData | null | undefined>, t: (key: string, ...args: unknown[]) => string) => {
    const get = () => toValue(seo)

    useSeoMeta({
        title: () => get()?.title ?? t('Imaginario27 - Portfolio de Imaginario27'),
        description: () => get()?.metaDesc ?? undefined,

        ogTitle: () => get()?.opengraphTitle ?? undefined,
        ogDescription: () => get()?.opengraphDescription ?? undefined,
        ogImage: () => get()?.opengraphImage?.sourceUrl ?? undefined,

        twitterTitle: () => get()?.twitterTitle ?? undefined,
        twitterDescription: () => get()?.twitterDescription ?? undefined,
        twitterImage: () => get()?.twitterImage?.sourceUrl ?? undefined,
    })

    useHead({
        link: () => {
            const canonical = get()?.canonical
            return canonical ? [{ rel: 'canonical', href: canonical }] : []
        },
    })
}
