<template>
    <Section
        :spacing="SectionSpacing.XL"
        :hasSidePadding="false"
        class="gap-6!"
    >
        <SectionHeader :class="['px-content-side-padding-mobile', 'md:px-content-side-padding']">
            <MaxWidthContainer>
                <Heading
                    :title="pageTitle"
                    :description="pageDescription"
                    :align="Align.LEFT"
                    :size="HeadingSize.LG"
                    headingTag="h1"
                />
            </MaxWidthContainer>
        </SectionHeader>

        <SectionBody>
            <MaxWidthContainer :class="['mb-8', 'px-content-side-padding-mobile', 'md:px-content-side-padding', 'items-start!', 'gap-6!']">
                <SearchField
                    id="portfolio-search"
                    :modelValue="searchQuery"
                    :placeholder="$t('Buscar proyectos…')"
                    :maxLength="100"
                    :size="InputSize.LG"
                    class="max-w-[600px]"
                    inputCustomClass="bg-background-container-surface"
                    @update:modelValue="onSearchChange"
                />

                <PortfolioFilter
                    v-if="pageConfig?.filterTaxonomy"
                    id="portfolio-filter"
                    :modelValue="activeFilter"
                    :options="filterOptions"
                    :isMultiple="pageConfig?.isMultipleFilter ?? false"
                    :hasAllButton="true"
                    :allButtonText="$t('Todos')"
                    @update:modelValue="onFilterChange"
                />
            </MaxWidthContainer>

            <LoadingScreen
                v-if="pending"
                :isFullScreen="false"
                :loadingText="$t('Cargando…')"
            />
            <Portfolio
                v-else
                id="portfolio-grid"
                :items="displayedItems"
                :layout="GalleryLayout.MASONRY"
                :columnsSm="1"
                :columnsMd="2"
                :columnsLg="3"
                :gap="16"
                :showFilter="false"
                :paginationMode="GalleryPaginationMode.INFINITE"
                :pageSize="12"
                :captionPlacement="GalleryCaptionPlacement.HOVER"
                :showTaxonomies="true"
                taxonomyToShow="tecnologias"
                :loadingText="$t('Cargando…')"
                :emptyText="$t('No hay proyectos que mostrar')"
            />
        </SectionBody>
    </Section>
</template>

<script setup lang="ts">
definePageMeta({
    fullPageParallax: true,
})

// Page type configuration
const PAGE_CONFIGS: ProjectPageConfig[] = [
    {
        type: 'frontend',
        filterTaxonomy: 'tecnologias',
        categoryIds: { es: [113], en: [114], de: [115] },
        mode: 'include',
        isMultipleFilter: true,
    },
    {
        type: 'uiux',
        filterTaxonomy: null,
        categoryIds: { es: [147], en: [148], de: [149] },
        mode: 'include',
        isMultipleFilter: false,
    },
    {
        type: 'creative',
        filterTaxonomy: 'projectCategories',
        categoryIds: { es: [41, 113, 147], en: [57, 114, 148], de: [58, 115, 149] },
        mode: 'exclude',
        isMultipleFilter: false,
    },
]

const SLUG_TO_PAGE_TYPE: Record<string, ProjectPageType> = {
    'proyectos-de-desarrollo-web-front-end': 'frontend',
    'proyectos-de-diseno-ui-ux': 'uiux',
    'proyectos-creativos': 'creative',
    'front-end-web-development-projects': 'frontend',
    'ui-ux-design-projects': 'uiux',
    'creative-projects': 'creative',
    'front-end-web-development-projekte': 'frontend',
    'ui-ux-design-projekte': 'uiux',
    'kreative-projekte': 'creative',
}

// Composables
const route = useRoute()
const { t, locale } = useI18n()
const { items, pending, fetchProjects, buildFilterOptions } = usePortfolioData()

// Resolve page type from route slug (synchronous, no network)
const projectsSlug = computed(() => route.params.projectsSlug as string)
const pageType = computed(() => SLUG_TO_PAGE_TYPE[projectsSlug.value])

if (!pageType.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const pageConfig = computed(() => PAGE_CONFIGS.find((config) => config.type === pageType.value))

const categoryIds = computed(() => {
    const config = pageConfig.value
    if (!config) return []
    return (config.categoryIds[locale.value] ?? []).map(String)
})

const loadProjects = async () => {
    if (pageConfig.value?.mode === 'include') {
        await fetchProjects({
            language: locale.value,
            categoryIds: categoryIds.value,
        })
    } else {
        await fetchProjects({
            language: locale.value,
            excludeCategoryIds: categoryIds.value,
        })
    }
}

// --- Non-blocking data fetching ---
const { data: menu } = useAsyncQuery({
    operation: 'Menu',
    variables: {
        language: locale,
        location: MenuLocationEnum.PRIMARY_MENU,
    },
    options: { watch: [locale] },
})

loadProjects()

const extractSlug = (uri?: string | null): string => (uri ?? '').replace(/\/$/, '').split('/').filter(Boolean).pop() ?? ''

const categoryMenuItems = computed(() => {
    const nodes = (menu.value?.menuItems?.nodes ?? []) as MenuNode[]
    return nodes.filter((node) => node.parentId)
})

const matchedChild = computed(() => categoryMenuItems.value.find((child) => extractSlug(child.uri) === projectsSlug.value))

watch(
    matchedChild,
    (matched) => {
        if (menu.value && !matched) {
            const correctChild = categoryMenuItems.value.find((child) => SLUG_TO_PAGE_TYPE[extractSlug(child.uri)] === pageType.value)
            if (correctChild?.uri) {
                navigateTo(correctChild.uri.replace(/\/$/, ''), { replace: true })
            }
        }
    },
    { immediate: true },
)

const { data: seoData } = useAsyncQuery({
    operation: 'GetPageSEO',
    variables: { slug: computed(() => matchedChild.value?.uri ?? `/${projectsSlug.value}`) },
})

useWPSeo(
    computed(() => seoData.value?.page?.seo),
    t,
)

watch(locale, () => {
    loadProjects()
})

// Client-side search and filter state
const searchQuery = ref('')
const activeFilter = ref<string | string[]>('__all__')

const filterOptions = computed<GalleryFilterOption[]>(() => {
    const taxonomy = pageConfig.value?.filterTaxonomy
    if (!taxonomy) return []
    return buildFilterOptions(taxonomy)
})

const onSearchChange = (value: string) => {
    searchQuery.value = value
}

const onFilterChange = (value: string | string[]) => {
    activeFilter.value = value
}

const displayedItems = computed(() => {
    let result = items.value

    const query = searchQuery.value.trim().toLowerCase()
    if (query) {
        result = result.filter((item) => item.title.toLowerCase().includes(query))
    }

    const taxonomy = pageConfig.value?.filterTaxonomy
    if (taxonomy) {
        const selected = Array.isArray(activeFilter.value) ? activeFilter.value : [activeFilter.value]
        if (selected.length && !selected.includes('__all__')) {
            result = result.filter((item) => (item.taxonomies[taxonomy] ?? []).some((term) => selected.includes(term.slug)))
        }
    }

    return result
})

// Page header
const pageTitle = computed(() => matchedChild.value?.label ?? t('Portfolio'))

const pageDescription = computed(() => t('Explora mis proyectos en diseño, frontend e inteligencia artificial.'))
</script>
