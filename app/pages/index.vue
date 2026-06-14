<template>
    <HomeHero />

    <!-- Featured Projects -->
    <Section
        id="featured-projects"
        :spacing="SectionSpacing.XL"
        :hasSidePadding="false"
        class="relative gap-20 overflow-hidden"
    >
        <SectionHeader :class="['px-content-side-padding-mobile', 'md:px-content-side-padding', 'flex-col md:flex-row', 'items-center']">
            <MaxWidthContainer
                :class="[
                    'px-content-side-padding-mobile',
                    'md:px-content-side-padding',
                    'flex-col md:flex-row',
                    'md:items-center',
                    'mx-auto',
                ]"
            >
                <Heading
                    :title="$t('Proyectos destacados')"
                    :description="$t('Una selección de proyectos destacados')"
                    :align="Align.LEFT"
                    :size="HeadingSize.LG"
                    headingTag="h2"
                />
            </MaxWidthContainer>
        </SectionHeader>
        <SectionBody class="relative z-10">
            <LoadingScreen
                v-if="projectsPending"
                :isFullScreen="false"
                :loadingText="$t('Cargando…')"
            />
            <Portfolio
                v-else
                :items="featuredItems"
                :layout="GalleryLayout.MASONRY"
                :columnsSm="1"
                :columnsMd="2"
                :columnsLg="3"
                :gap="8"
                :showFilter="false"
                :paginationMode="GalleryPaginationMode.NONE"
                :limit="portfolioItemsToShow"
                :captionPlacement="GalleryCaptionPlacement.HOVER"
                :showTaxonomies="true"
                taxonomyToShow="tecnologias"
                :loadingText="$t('Cargando…')"
                :emptyText="$t('No hay proyectos que mostrar')"
            />
        </SectionBody>
    </Section>

    <ParallaxContainer>
        <WebsiteParallaxBackground fadeTop />

        <ParallaxChildContainer>
            <!-- Value Proposition -->
            <Section
                id="value-proposition"
                :spacing="SectionSpacing.LG"
                hasContentMaxWidth
            >
                <SectionHeader class="mb-12">
                    <Heading
                        :title="$t('Una mente, tres disciplinas.')"
                        :description="$t('Diseño, construyo e integro IA. Todo en el mismo proceso.')"
                        :size="HeadingSize.LG"
                        headingTag="h2"
                    />
                </SectionHeader>
                <SectionBody>
                    <div :class="['grid', 'gap-6', 'md:grid-cols-3']">
                        <FeatureCard
                            :title="$t('UI/UX Design')"
                            :description="
                                $t('Del research al prototipo final. Design systems, tokens y accesibilidad como base, no como extra.')
                            "
                            icon="mdi:palette-outline"
                            :containedIconColor="ColorAccent.PRIMARY_BRAND"
                        />
                        <FeatureCard
                            :title="$t('Frontend Development')"
                            :description="
                                $t('Arquitectura limpia, tipado estricto y orientación a producto. Vue · Nuxt · TypeScript · Tailwind.')
                            "
                            icon="mdi:code-braces"
                            :containedIconColor="ColorAccent.INFO"
                        />
                        <FeatureCard
                            :title="$t('IA aplicada')"
                            :description="$t('Integración con criterio técnico. Prompt engineering · MCPs · Agentes.')"
                            icon="mdi:robot-outline"
                            :containedIconColor="ColorAccent.SECONDARY_BRAND"
                        />
                    </div>
                </SectionBody>
            </Section>

            <!-- About Me -->
            <Section
                id="about"
                :spacing="SectionSpacing.LG"
                hasContentMaxWidth
            >
                <SectionBody>
                    <div :class="['flex', 'flex-col', 'items-center', 'gap-12', 'md:flex-row', 'md:items-start', 'md:gap-16']">
                        <!-- Photo -->
                        <div :class="['relative', 'shrink-0', 'w-56', 'md:w-72', 'aspect-3/4', 'overflow-hidden', 'rounded-2xl']">
                            <NuxtImg
                                src="/images/about/roberto-carlos.png"
                                :alt="$t('Foto de Roberto Carlos')"
                                width="288"
                                height="384"
                                loading="lazy"
                                :class="['w-full', 'h-full', 'object-cover', 'object-top']"
                            />
                        </div>

                        <!-- Text -->
                        <div :class="['flex', 'flex-col', 'gap-6']">
                            <Heading
                                :title="$t('Sobre mí')"
                                :size="HeadingSize.LG"
                                headingTag="h2"
                            />
                            <p :class="['text-base', 'leading-relaxed', 'text-text-neutral-subtle', 'max-w-2xl']">
                                {{
                                    $t(
                                        'Roberto Carlos, diseñador UI/UX y desarrollador frontend desde Valladolid. Diseño, código y producto. Del research al deploy, todo pasa por mis manos.',
                                    )
                                }}
                            </p>
                            <p :class="['text-base', 'leading-relaxed', 'text-text-neutral-subtle', 'max-w-2xl']">
                                {{
                                    $t(
                                        'Vue, Nuxt, TypeScript y Tailwind. Design systems, interfaces accesibles y aplicaciones web. La IA también forma parte del flujo, con criterio técnico.',
                                    )
                                }}
                            </p>

                            <div :class="['flex', 'gap-8', 'pt-2']">
                                <FeaturedMetric
                                    value="8+"
                                    :label="$t('Años diseño')"
                                />
                                <FeaturedMetric
                                    value="5+"
                                    :label="$t('Años UI/UX')"
                                />
                                <FeaturedMetric
                                    value="3+"
                                    :label="$t('Años frontend')"
                                />
                            </div>

                            <div class="flex items-center gap-3">
                                <Icon
                                    name="mdi:translate"
                                    :size="IconSize.LG"
                                    :color="ColorAccent.PRIMARY_BRAND"
                                />
                                <span class="font-medium text-sm">
                                    {{ $t('Idiomas: ES · EN · DE') }}
                                </span>
                            </div>

                            <div class="flex gap-2 mt-4">
                                <DropdownMenu
                                    :items="cvOptions"
                                    :position="DropdownPosition.BOTTOM_LEFT"
                                    :positionXOffset="0"
                                    :positionYOffset="8"
                                    positionClass=""
                                    class="min-w-[200px]"
                                >
                                    <template #activator="{ isOpen }">
                                        <ActionButton
                                            :size="ButtonSize.LG"
                                            :styleType="ButtonStyleType.NEUTRAL_OUTLINED"
                                            :text="$t('Descargar CV')"
                                            :iconPosition="IconPosition.RIGHT"
                                            :icon="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                                        />
                                    </template>
                                </DropdownMenu>

                                <ActionButton
                                    :actionType="ButtonActionType.LINK"
                                    :size="ButtonSize.LG"
                                    :styleType="ButtonStyleType.NEUTRAL_TRANSPARENT"
                                    :text="$t('Ver LinkedIn')"
                                    :iconPosition="IconPosition.RIGHT"
                                    icon="mdi:linkedin"
                                    to="https://www.linkedin.com/in/rcvera/"
                                    isExternal
                                />
                            </div>
                        </div>
                    </div>
                </SectionBody>
            </Section>

            <!-- Tech Stack -->
            <Section
                id="tech-stack"
                :spacing="SectionSpacing.XL"
                hasContentMaxWidth
            >
                <SectionHeader class="mb-12">
                    <Heading
                        :title="$t('Stack')"
                        :description="$t('El ecosistema con el que construyo productos reales.')"
                        :size="HeadingSize.LG"
                        headingTag="h2"
                    />
                </SectionHeader>
                <SectionBody>
                    <div :class="['grid', 'gap-10', 'md:grid-cols-3']">
                        <div
                            v-for="category in techStack"
                            :key="category.label"
                            :class="['flex', 'flex-col', 'gap-4']"
                        >
                            <h3 :class="['text-xs', 'font-semibold', 'uppercase', 'tracking-widest', 'text-text-neutral-subtle']">
                                {{ category.label }}
                            </h3>

                            <FeaturedBadgeStack :items="category.items" />
                        </div>
                    </div>
                </SectionBody>
            </Section>
        </ParallaxChildContainer>
    </ParallaxContainer>

    <!-- Final CTA -->
    <Section
        id="contact"
        :spacing="SectionSpacing.NONE"
        hasContentMaxWidth
    >
        <SectionBody class="relative overflow-hidden py-[10vh] sm:py-section-xl lg:py-section-xl">
            <CTABackground
                :plusSize="20"
                :class="isDark ? 'text-background-primary-brand-default/50' : 'text-background-primary-brand-default/30'"
            />
            <div :class="['relative', 'z-10', 'flex', 'flex-col', 'items-center', 'text-center', 'gap-8']">
                <Heading
                    :title="$t('¿Buscas reforzar tu equipo de producto?')"
                    :align="Align.CENTER"
                    :size="HeadingSize.LG"
                    headingTag="h2"
                    class="max-w-150"
                />

                <Badge
                    :text="$t('Full-time · Remoto preferente')"
                    :color="ColorAccent.SECONDARY_BRAND"
                    :shape="BadgeShape.PILL"
                    class="font-semibold! text-xl! px-4! py-1! h-fit! rounded-full!"
                />

                <div :class="['flex', 'flex-wrap', 'justify-center', 'gap-3', 'mt-4']">
                    <ActionButton
                        :actionType="ButtonActionType.LINK"
                        :size="ButtonSize.XXL"
                        :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
                        :text="$t('Hablemos de una vacante')"
                        :to="localePath({ name: 'contact' })"
                        :class="isDark && 'shadow-[0_0_20px_var(--color-background-primary-brand-default)]'"
                    />
                    <ActionButton
                        :actionType="ButtonActionType.LINK"
                        :size="ButtonSize.XXL"
                        :styleType="ButtonStyleType.NEUTRAL_OUTLINED"
                        :text="$t('Ver portfolio')"
                        :to="localePath('/proyectos-de-desarrollo-web-front-end')"
                        :class="isDark && 'shadow-[0_0_20px_var(--color-background-neutral-subtle)]'"
                    />
                </div>
            </div>
        </SectionBody>
    </Section>
</template>

<script setup lang="ts">
// Composables
const { items: featuredItems, pending: projectsPending, fetchProjects } = usePortfolioData()
const { isMobile } = useIsMobile()

// Computed
const portfolioItemsToShow = computed(() => (isMobile.value ? 4 : 12))

// Stores
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// Computed classes

// Translations
const { t, locale } = useI18n()
const localePath = useLocalePath()

// CV Dropdowns
const cvOptions = computed<DropdownMenuItem[]>(() => [
    {
        actionType: DropdownActionType.LINK,
        size: DropdownItemSize.LG,
        text: t('CV Frontend Developer'),
        to:
            locale.value === 'es'
                ? 'https://www.imaginario27.com/Pdfs/CV-Roberto-Carlos-Vera-desarrollador-web-front-end-es.pdf'
                : 'https://www.imaginario27.com/Pdfs/CV-Roberto-Carlos-Vera-desarrollador-web-front-end-en.pdf',
        isExternal: true,
    },
    {
        actionType: DropdownActionType.LINK,
        size: DropdownItemSize.LG,
        text: t('CV UI/UX Designer'),
        to:
            locale.value === 'es'
                ? 'https://www.imaginario27.com/Pdfs/CV-Roberto-Carlos-Vera-ui-ux-designer-front-end-web-es.pdf'
                : 'https://www.imaginario27.com/Pdfs/CV-Roberto-Carlos-Vera-ui-ux-designer-front-end-web-en.pdf',
        isExternal: true,
    },
])

// Data
const { data: seoData } = await useAsyncQuery({
    operation: 'GetPageSEO',
    variables: { slug: '/' },
})

await fetchProjects({ first: portfolioItemsToShow.value, language: locale.value })

watch(locale, () => {
    fetchProjects({ first: portfolioItemsToShow.value, language: locale.value })
})

useWPSeo(
    computed(() => seoData.value?.page?.seo),
    t,
)

// Tech stack
const techStack = computed(() => [
    {
        label: t('Frontend'),
        items: ['Vue', 'Nuxt', 'TypeScript', 'Tailwind CSS', 'Pinia', 'VueUse'],
    },
    {
        label: t('Diseño'),
        items: ['Figma', 'Design Systems', 'Tokens', t('Accesibilidad')],
    },
    {
        label: t('IA y herramientas'),
        items: ['GitHub Copilot', 'Claude', 'Prompt Engineering', 'MCPs', t('Agentes')],
    },
])
</script>
