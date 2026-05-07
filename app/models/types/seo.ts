export type WPSeoData = {
    title?: string | null
    metaDesc?: string | null
    canonical?: string | null

    opengraphTitle?: string | null
    opengraphDescription?: string | null
    opengraphImage?: {
        sourceUrl?: string | null
    } | null

    twitterTitle?: string | null
    twitterDescription?: string | null
    twitterImage?: {
        sourceUrl?: string | null
    } | null
}
