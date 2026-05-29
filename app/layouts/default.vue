<template>
    <div class="min-h-screen bg-background-surface">
        <WebHeader />
        <MainContent>
            <slot />
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
</script>
