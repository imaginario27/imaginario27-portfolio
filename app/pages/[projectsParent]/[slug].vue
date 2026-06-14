<template>
    <div v-if="project">
        <Section
            :spacing="SectionSpacing.XL"
            :hasSidePadding="true"
        >
            <SectionBody>
                <MaxWidthContainer :class="['flex', 'flex-col', 'items-center', 'gap-8', 'mx-auto']">
                    <div
                        :class="[
                            'overflow-hidden',
                            'rounded-2xl',
                            project.format === ProjectFormat.VERTICAL ? 'max-w-2xl w-full aspect-3/4' : 'w-full aspect-video',
                        ]"
                    >
                        <NuxtImg
                            v-if="project.featuredImage"
                            :src="project.featuredImage.src"
                            :alt="project.featuredImage.alt"
                            :width="project.featuredImage.width"
                            :height="project.featuredImage.height"
                            class="h-full w-full object-cover"
                            loading="eager"
                        />
                    </div>

                    <div :class="['flex', 'flex-col', 'items-center', 'gap-3', 'text-center']">
                        <span
                            v-if="formattedDate || project.client"
                            class="text-sm uppercase tracking-wider text-text-neutral-subtler"
                        >
                            <template v-if="formattedDate">
                                {{ formattedDate }}
                            </template>
                            <template v-if="formattedDate && project.client"> | </template>
                            <template v-if="project.client">
                                <span class="text-text-primary-brand-default">
                                    {{ project.client }}
                                </span>
                            </template>
                        </span>

                        <Heading
                            :title="project.title"
                            :align="Align.CENTER"
                            :size="HeadingSize.LG"
                            headingTag="h1"
                        />

                        <div
                            v-if="categoriesAndTags.length"
                            :class="['flex', 'flex-wrap', 'justify-center', 'gap-2']"
                        >
                            <Badge
                                v-for="term in categoriesAndTags"
                                :key="term.slug"
                                :text="term.name"
                                :color="ColorAccent.NEUTRAL"
                                :shape="BadgeShape.PILL"
                                :styleType="BadgeStyle.BORDER"
                            />
                        </div>

                        <div
                            v-if="project.technologies.length"
                            :class="['flex', 'flex-wrap', 'justify-center', 'gap-2']"
                        >
                            <Badge
                                v-for="technology in project.technologies"
                                :key="technology.slug"
                                :text="technology.name"
                                :color="ColorAccent.PRIMARY_BRAND"
                                :shape="BadgeShape.PILL"
                                :styleType="BadgeStyle.BORDER"
                            />
                        </div>
                    </div>
                </MaxWidthContainer>
            </SectionBody>
        </Section>

        <MaxWidthContainer class="mx-auto">
            <Divider />
        </MaxWidthContainer>

        <Section
            v-if="project.content"
            :spacing="SectionSpacing.LG"
            :hasSidePadding="true"
        >
            <SectionBody>
                <MaxWidthContainer class="mx-auto">
                    <WPContent :content="project.content" />
                </MaxWidthContainer>
            </SectionBody>
        </Section>
    </div>

    <LoadingScreen
        v-else
        :isFullScreen="false"
        :loadingText="$t('Cargando…')"
    />
</template>

<script setup lang="ts">
const LOCALE_TO_SEGMENT: Record<string, string> = {
    es: 'proyectos',
    en: 'projects',
    de: 'projekte',
}

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()

const projectsParent = computed(() => String(route.params.projectsParent ?? ''))
const slug = computed(() => String(route.params.slug ?? ''))

const expectedParent = computed(() => LOCALE_TO_SEGMENT[locale.value] ?? 'proyectos')

const { project, pending } = useProjectDetail(slug.value, locale.value)

const getTranslatedPath = (targetLocale: string): string | null => {
    if (!project.value) return null
    const translation = project.value.translations.find((translationItem) => translationItem.languageCode === targetLocale)
    if (!translation) return null
    const segment = LOCALE_TO_SEGMENT[targetLocale]
    if (!segment) return null
    const prefix = targetLocale === 'es' ? '' : `/${targetLocale}`
    return `${prefix}/${segment}/${translation.slug}`
}

useHead({
    title: () => project.value?.title ?? t('Proyecto no encontrado'),
})

const categoriesAndTags = computed<PortfolioTerm[]>(() => {
    if (!project.value) return []
    return [...project.value.categories, ...project.value.tags]
})

const formattedDate = computed(() => {
    if (!project.value?.date) return ''
    return formatLocalizedDate(project.value.date, locale.value)
})

watch(pending, (isPending) => {
    if (isPending) return
    if (!project.value) {
        showError({
            statusCode: 404,
            statusMessage: 'project-not-found',
        })
        return
    }
    if (projectsParent.value !== expectedParent.value) {
        const correctPath = getTranslatedPath(locale.value)
        if (correctPath) {
            navigateTo(correctPath, { replace: true })
        }
    }
})

watch(locale, (newLocale) => {
    const translatedPath = getTranslatedPath(newLocale)
    if (translatedPath) {
        router.replace(translatedPath)
    }
})
</script>
