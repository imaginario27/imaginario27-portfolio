<template>
    <div class="min-h-screen bg-background-surface">
        <WebHeader />
        <MainContent>
            <ParallaxContainer v-if="useFullPageParallax && route.meta.fullPageParallax === true">
                <WebsiteParallaxBackground fadeTop />

                <ParallaxChildContainer>
                    <div :class="['w-full', 'flex', 'flex-col', 'transition-all', 'duration-300']">
                        <slot />
                    </div>
                </ParallaxChildContainer>
            </ParallaxContainer>
            <slot v-else />
        </MainContent>

        <Footer
            :credits="$t('© 2026 Imaginario27')"
            :socialNetworks
        />
    </div>
</template>

<script setup lang="ts">
await useRouteWPSeo()

const socialNetworks: SocialNetwork[] = [
    { name: 'GitHub', link: 'https://github.com/imaginario27', icon: 'mdi:github' },
    { name: 'LinkedIn', link: 'https://www.linkedin.com/in/rcvera/', icon: 'mdi:linkedin' },
]

const route = useRoute()

const useFullPageParallax = computed(() => {
    return route.meta.fullPageParallax === true
})
</script>
