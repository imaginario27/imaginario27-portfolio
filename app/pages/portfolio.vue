<template>
    <Section>
        <SectionBody>
            <div :class="['mx-auto', 'max-w-7xl', 'space-y-8', 'px-4', 'py-12']">
                <header class="space-y-2">
                    <h1 class="text-3xl font-bold text-text-default">
                        {{ $t('Portfolio') }}
                    </h1>
                    <p class="text-text-neutral-subtle">
                        {{ $t('Una selección de proyectos destacados') }}
                    </p>
                </header>

                <Portfolio
                    id="portfolio-grid"
                    :items="portfolioItems"
                    :layout="GalleryLayout.MASONRY"
                    :columnsSm="1"
                    :columnsMd="2"
                    :columnsLg="3"
                    :gap="16"
                    :captionPlacement="GalleryCaptionPlacement.HOVER"
                    :paginationMode="GalleryPaginationMode.LOAD_MORE"
                    :pageSize="9"
                    :loadMoreText="$t('Cargar más')"
                    :loadingText="$t('Cargando…')"
                    :emptyText="$t('No hay proyectos que mostrar')"
                />
            </div>
        </SectionBody>
    </Section>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Portfolio',
})

const { locale } = useI18n()
const { items: portfolioItems, fetchProjects } = usePortfolioData()

await fetchProjects({ first: 100, language: locale.value })
</script>
