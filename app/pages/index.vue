<template>
    <Section :isDark class="p-0!">
        <SectionBody>
            <div class="min-h-screen flex items-center justify-center bg-background-surface">
                <div class="flex flex-col items-center max-w-xl w-full text-center gap-6">
                    <AppLogo 
                        :src="isDark ? darkLogo : lightLogo"
                        logoClass="max-w-[200px] mb-8"
                    />

                    <div class="space-y-2">
                        <Heading 
                            :size="HeadingSize.MD"
                            :align="Align.CENTER"
                            title="Welcome to Air UI"
                        />

                        <p class="text-text-neutral-subtle">
                            Your Nuxt 4 project is up and running — powered by the Air UI design system.
                        </p>
                    </div>

                    <div class="grid gap-3 pt-4">
                        <Card :has-shadow="false" class="!gap-2 !text-left">
                            <CardHeader>
                                <CardTitle title="✨ AirUI Design system ready" />
                            </CardHeader>
                            <CardBody>
                                <p class="text-sm text-text-neutral-subtle">
                                    Preconfigured tokens, components, and themes — all styled with Tailwind CSS.
                                </p>
                            </CardBody>
                        </Card>

                        <Card :has-shadow="false" class="!gap-2 !text-left">
                            <CardHeader>
                                <CardTitle title="⚡ Modern Nuxt 4 setup" />
                            </CardHeader>
                            <CardBody>
                                <p class="text-sm text-text-neutral-subtle">
                                    Uses Nuxt’s app directory, auto-imports, and latest Composition API conventions.
                                </p>
                            </CardBody>
                        </Card>

                        <Card :has-shadow="false" class="!gap-2 !text-left">
                            <CardHeader>
                                <CardTitle title="🧪 Ready for testing" />
                            </CardHeader>
                            <CardBody>
                                <p class="text-sm text-text-neutral-subtle">
                                    Easily integrate unit or E2E testing with a clean, modular architecture.
                                </p>
                            </CardBody>
                        </Card>

                        <Card :has-shadow="false" class="!gap-2 !text-left">
                            <CardHeader>
                                <CardTitle title="🌗 Dark mode included" />
                            </CardHeader>
                            <CardBody>
                                <p class="text-sm text-text-neutral-subtle">
                                    Toggle between light and dark themes seamlessly with full design system support.
                                </p>

                                <ActionButton 
                                    :text="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                                    :styleType="ButtonStyleType.NEUTRAL_FILLED"
                                    :iconPosition="IconPosition.LEFT"
                                    :icon="isDark ? 'mdi:moon-waning-crescent' : 'mdi:weather-sunny'"
                                    isMobileFullWidth
                                    @click="setTheme(isDark ? 'light' : 'dark')"
                                />  
                            </CardBody>
                        </Card>
                    </div>

                    <p class="pt-6 text-sm text-text-neutral-subtle">
                        Start building in 
                        <code class="px-1 py-0.5 rounded bg-background-neutral-subtle">app/pages</code>
                        or explore the full range of UI components.
                    </p>
                </div>
            </div>
        </SectionBody>
    </Section>
</template>

<script setup lang="ts">
import lightLogo from '../../public/images/logo/air-ui-logo-color.svg?raw'
import darkLogo from '../../public/images/logo/air-ui-logo-white.svg?raw'

useHead({
    title: 'Welcome to Air UI',
    meta: [
        {
            name: 'description',
            content: 'Your Nuxt 4 project powered by Air UI',
        },
    ],
})

const darkModeStore = useDarkMode()
const { setTheme, isDark} = darkModeStore
</script>
