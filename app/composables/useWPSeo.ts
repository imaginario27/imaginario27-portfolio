export const useWPSeo = (
    seo: MaybeRefOrGetter<WPSeoData | null | undefined>,
    fallbackTitle?: MaybeRefOrGetter<string | null | undefined>,
) => {
    const get = () => toValue(seo)

    useSeoMeta({
        title: () => get()?.title ?? toValue(fallbackTitle) ?? undefined,
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
