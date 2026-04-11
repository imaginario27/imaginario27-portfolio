export const useWPSeo = (seo: WPSeoData | null | undefined, fallbackTitle?: string) => {
    useSeoMeta({
        title: seo?.title ?? fallbackTitle,
        description: seo?.metaDesc ?? undefined,

        ogTitle: seo?.opengraphTitle ?? undefined,
        ogDescription: seo?.opengraphDescription ?? undefined,
        ogImage: seo?.opengraphImage?.sourceUrl ?? undefined,

        twitterTitle: seo?.twitterTitle ?? undefined,
        twitterDescription: seo?.twitterDescription ?? undefined,
        twitterImage: seo?.twitterImage?.sourceUrl ?? undefined,
    })

    useHead({
        link: seo?.canonical
            ? [{ rel: 'canonical', href: seo.canonical }]
            : []
    })
}