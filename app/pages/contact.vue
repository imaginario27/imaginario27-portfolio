<template>
    <Section hasContentMaxWidth>
        <SectionHeader class="mb-20">
            <Heading
                :title="$t('Contáctame')"
                :description="
                    $t(
                        '¿Tienes alguna duda sobre alguno de mis proyectos o quieres descrubir más sobre mi perfil profesional? No dudes en contactarme a través del siguiente formulario.',
                    )
                "
                :align="Align.LEFT"
                :size="HeadingSize.LG"
                headingTag="h1"
                descriptionClass="max-w-[800px]"
            />
        </SectionHeader>
        <SectionBody>
            <div class="flex flex-col md:flex-row gap-8">
                <ContactForm class="md:max-w-[800px]" />
                <ContactDetailsCard
                    name="Roberto Carlos Vera"
                    :role="$t('Diseñador UX/UI · Desarrollador Frontend')"
                    email="designer@imaginario27.com"
                    linkedin="https://www.linkedin.com/in/roberto-carlos-vera"
                    github="https://github.com/roberto-carlos-vera"
                    class="w-full md:max-w-[400px]"
                />
            </div>
        </SectionBody>
    </Section>
</template>
<script setup lang="ts">
const path = defineI18nRoute({
    paths: {
        es: '/contactar',
        en: '/contact',
        de: '/kontakt',
    },
})

definePageMeta({
    fullPageParallax: true,
})

const { data: seoData } = await useAsyncQuery({
    operation: 'GetPageSEO',
    variables: { slug: path },
})

const { t } = useI18n()

useWPSeo(
    computed(() => seoData.value?.page?.seo),
    t,
)
</script>
