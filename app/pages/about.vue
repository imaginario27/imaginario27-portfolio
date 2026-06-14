<template>
    <!-- Hero -->
    <Section
        id="about-hero"
        :spacing="SectionSpacing.MD"
        hasContentMaxWidth
    >
        <SectionBody>
            <div :class="['flex', 'flex-col', 'items-center', 'gap-10', 'md:flex-row', 'md:items-start', 'md:gap-16']">
                <div :class="['relative', 'shrink-0', 'w-64', 'md:w-80', 'aspect-3/4', 'overflow-hidden', 'rounded-2xl']">
                    <NuxtImg
                        src="/images/about/roberto-carlos.png"
                        :alt="$t('Foto de Roberto Carlos')"
                        width="320"
                        height="427"
                        loading="eager"
                        :class="['w-full', 'h-full', 'object-cover', 'object-top']"
                    />
                </div>

                <div :class="['flex', 'flex-col', 'gap-4']">
                    <span :class="['text-sm', 'font-semibold', 'uppercase', 'tracking-widest', 'text-text-primary-brand-default']">
                        Roberto Carlos
                    </span>
                    <h1 :class="['text-4xl', 'md:text-6xl', 'lg:text-7xl', 'font-bold', 'text-text-default', 'leading-tight']">
                        {{ $t('UI/UX Designer & Frontend Developer') }}
                    </h1>
                    <p :class="['text-lg', 'md:text-xl', 'leading-relaxed', 'text-text-neutral-subtle', 'max-w-2xl']">
                        {{ $t('Diseño, código y producto. Del research al deploy, todo pasa por mis manos.') }}
                    </p>
                </div>
            </div>
        </SectionBody>
    </Section>

    <ParallaxContainer>
        <WebsiteParallaxBackground fadeTop />

        <ParallaxChildContainer>
            <!-- Story -->
            <Section
                id="story"
                :spacing="SectionSpacing.LG"
                hasContentMaxWidth
            >
                <SectionHeader>
                    <Heading
                        :title="$t('Mi historia')"
                        :size="HeadingSize.LG"
                        headingTag="h2"
                    />
                </SectionHeader>
                <SectionBody>
                    <div :class="['flex', 'flex-col', 'gap-12', 'md:flex-row', 'md:gap-16']">
                        <div :class="['flex', 'flex-col', 'gap-8']">
                            <p :class="['text-lg', 'leading-loose', 'text-text-neutral-subtle', 'max-w-2xl']">
                                {{
                                    $t(
                                        'Llevo más de 8 años diseñando y más de 3 desarrollando en frontend. No soy solo diseñador ni solo desarrollador. Entiendo el producto completo, desde la investigación inicial hasta el deploy. En ese punto es donde diseño y código dejan de ser disciplinas separadas.',
                                    )
                                }}
                            </p>

                            <Divider class="w-16! border-2 border-border-primary-brand-subtle" />

                            <p :class="['text-lg', 'leading-loose', 'text-text-neutral-subtle', 'max-w-2xl']">
                                {{
                                    $t(
                                        'Integro IA en mi flujo de trabajo con criterio técnico. Hago mentoring, participo en code reviews y en decisiones de producto. Trabajo en español, inglés y alemán. Un perfil internacional con base técnica sólida.',
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
                        </div>

                        <div :class="['flex', 'flex-col', 'gap-6']">
                            <h3 :class="['text-xs', 'font-semibold', 'uppercase', 'tracking-widest', 'text-text-neutral-subtle']">
                                {{ $t('Trayectoria reciente') }}
                            </h3>
                            <VerticalStepper
                                :items="workExperience"
                                :stepType="StepIndicatorType.ICON"
                                :stepSize="StepIndicatorSize.SM"
                                :hasStepper="true"
                            />
                        </div>
                    </div>
                </SectionBody>
            </Section>

            <!-- Workflow -->
            <Section
                id="workflow"
                :spacing="SectionSpacing.LG"
                hasContentMaxWidth
            >
                <SectionHeader class="mb-12">
                    <Heading
                        :title="$t('Cómo trabajo')"
                        :size="HeadingSize.LG"
                        headingTag="h2"
                    />
                </SectionHeader>
                <SectionBody>
                    <PhaseList :phases="workflowPhases" />
                </SectionBody>
            </Section>

            <!-- Skills -->
            <Section
                id="skills"
                :spacing="SectionSpacing.LG"
                hasContentMaxWidth
            >
                <SectionHeader class="mb-12">
                    <Heading
                        :title="$t('Skills')"
                        :size="HeadingSize.LG"
                        headingTag="h2"
                    />
                </SectionHeader>
                <SectionBody>
                    <div :class="['grid', 'gap-6', 'md:grid-cols-[1.2fr_1fr_1fr]']">
                        <FeatureCard
                            v-for="area in skillAreas"
                            :key="area.title"
                            :title="area.title"
                            :description="area.description"
                            :icon="area.icon"
                            :containedIconColor="area.color"
                        >
                            <template #footer>
                                <FeaturedBadgeStack :items="area.skills" />
                            </template>
                        </FeatureCard>
                    </div>

                    <!-- Languages -->
                    <div
                        :class="[
                            'flex',
                            'items-center',
                            'gap-6',
                            'mt-12',
                            'p-5',
                            'rounded-2xl',
                            'bg-background-neutral-subtle/20',
                            'border',
                            'border-border-neutral-subtle/50',
                            'w-fit',
                        ]"
                    >
                        <ContainedIcon
                            icon="mdi:translate"
                            :shape="IconContainerShape.CIRCLE"
                            :styleType="IconContainerStyleType.FILLED"
                            :color="ColorAccent.PRIMARY_BRAND"
                        />
                        <div :class="['flex', 'flex-wrap', 'gap-5']">
                            <div
                                v-for="language in languages"
                                :key="language.name"
                                :class="['flex', 'items-center', 'gap-2']"
                            >
                                <span :class="['text-sm', 'font-medium', 'text-text-default']">
                                    {{ language.flag }} {{ language.name }}
                                </span>
                                <span
                                    :class="[
                                        'text-xs',
                                        'text-text-neutral-subtle',
                                        'px-2',
                                        'py-0.5',
                                        'rounded-md',
                                        'bg-background-neutral-subtle/40',
                                    ]"
                                >
                                    {{ language.level }}
                                </span>
                            </div>
                        </div>
                    </div>
                </SectionBody>
            </Section>
        </ParallaxChildContainer>
    </ParallaxContainer>

    <!-- CTA -->
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
                    <DropdownMenu
                        :items="cvOptions"
                        :position="DropdownPosition.BOTTOM_LEFT"
                        :positionXOffset="0"
                        :positionYOffset="8"
                        positionClass=""
                        class="min-w-50"
                    >
                        <template #activator="{ isOpen }">
                            <ActionButton
                                :size="ButtonSize.XXL"
                                :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
                                :text="$t('Descargar CV')"
                                :iconPosition="IconPosition.RIGHT"
                                :icon="isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'"
                                :class="isDark && 'shadow-[0_0_20px_var(--color-background-primary-brand-default)]'"
                            />
                        </template>
                    </DropdownMenu>

                    <ActionButton
                        :actionType="ButtonActionType.LINK"
                        :size="ButtonSize.XXL"
                        :styleType="ButtonStyleType.NEUTRAL_OUTLINED"
                        :text="$t('Ver LinkedIn')"
                        :iconPosition="IconPosition.RIGHT"
                        icon="mdi:linkedin"
                        to="https://www.linkedin.com/in/rcvera/"
                        isExternal
                        :class="isDark && 'shadow-[0_0_20px_var(--color-background-neutral-subtle)]'"
                    />
                </div>
            </div>
        </SectionBody>
    </Section>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// SEO
useSeoMeta({
    title: () => `${t('UI/UX Designer & Frontend Developer')} — Roberto Carlos | Imaginario27`,
    description: () =>
        t(
            'Roberto Carlos, diseñador UI/UX y desarrollador frontend con 8+ años de experiencia. Vue, Nuxt, TypeScript, Figma y sistemas de diseño. Perfil híbrido desde Valladolid.',
        ),
    ogTitle: () => `${t('UI/UX Designer & Frontend Developer')} — Roberto Carlos`,
    ogDescription: () =>
        t(
            'Roberto Carlos, diseñador UI/UX y desarrollador frontend con 8+ años de experiencia. Vue, Nuxt, TypeScript, Figma y sistemas de diseño. Perfil híbrido desde Valladolid.',
        ),
    ogImage: '/images/about/roberto-carlos.png',
    twitterTitle: () => `${t('UI/UX Designer & Frontend Developer')} — Roberto Carlos`,
    twitterDescription: () =>
        t(
            'Roberto Carlos, diseñador UI/UX y desarrollador frontend con 8+ años de experiencia. Vue, Nuxt, TypeScript, Figma y sistemas de diseño. Perfil híbrido desde Valladolid.',
        ),
    twitterImage: '/images/about/roberto-carlos.png',
})

// Work experience
const workExperience = computed(() => [
    {
        title: t('UI/UX Designer & Frontend Developer'),
        metaTitle: t('abr. 2024 - Actualidad'),
        description: `AIR Institute · ${t('Remoto')}`,
        stepIcon: 'mdi:code-braces',
    },
    {
        title: t('Web & Graphic Designer'),
        metaTitle: '2022',
        description: `MaibornWolff GmbH · ${t('Híbrido')}`,
        stepIcon: 'mdi:palette-outline',
    },
    {
        title: t('Web Designer & Graphic Designer'),
        metaTitle: t('ene. 2017 - jul. 2022'),
        description: `I+DEAS · ${t('Híbrido')}`,
        stepIcon: 'mdi:brush',
    },
])

// Workflow phases
const workflowPhases = computed<PhaseListItem[]>(() => [
    {
        title: t('Investigación'),
        description: t('Entender el problema antes de abrir Figma o el editor.'),
    },
    {
        title: t('Diseño'),
        description: t('Sistemas de diseño, tokens y accesibilidad como base, no como extra.'),
    },
    {
        title: t('Desarrollo'),
        description: t('Arquitectura limpia, tipado estricto y orientación a producto.'),
    },
    {
        title: t('IA integrada'),
        description: t('Prompt engineering, MCPs y agentes con criterio.'),
    },
    {
        title: t('QA y entrega'),
        description: t('Testing, revisión y deploy. Sin dejar cabos sueltos.'),
    },
])

// Skills
const skillAreas = computed(() => [
    {
        title: t('UI/UX Design'),
        description: t('Proceso completo, desde la investigación hasta el prototipo listo para desarrollar.'),
        icon: 'mdi:palette-outline',
        color: ColorAccent.PRIMARY_BRAND,
        skills: ['Figma', 'Design Systems', 'Tokens', `${t('Accesibilidad')} WCAG`, 'UX Research', t('Prototipado'), 'Condens'],
    },
    {
        title: t('Frontend Development'),
        description: t('Código que se puede mantener. Interfaces que se pueden usar.'),
        icon: 'mdi:code-braces',
        color: ColorAccent.INFO,
        skills: [
            'Vue 3',
            'Nuxt',
            'TypeScript',
            'JavaScript ES6+',
            'Tailwind CSS',
            'GraphQL',
            'REST API',
            'Vitest',
            'Git',
            'Vite',
            'Netlify',
        ],
    },
    {
        title: t('IA y herramientas'),
        description: t('Integrada en el flujo, no añadida al final.'),
        icon: 'mdi:robot-outline',
        color: ColorAccent.SECONDARY_BRAND,
        skills: ['GitHub Copilot', 'Claude', 'Prompt Engineering', 'MCPs', t('Agentes'), 'Adobe Firefly', 'Adobe Creative Cloud'],
    },
])

// Languages
const languages = computed(() => [
    { flag: '🇪🇸', name: t('Español'), level: t('Nativo') },
    { flag: '🇩🇪', name: t('Alemán'), level: t('Nativo') },
    { flag: '🇬🇧', name: t('Inglés'), level: t('C1 — Cambridge') },
])

// CV dropdown
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
</script>
