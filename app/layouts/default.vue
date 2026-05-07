<template>
    <div class="min-h-screen bg-background-surface">
        <WebHeader />
        <MainContent>
            <slot />
        </MainContent>

        <Footer />
    </div>
</template>

<script setup lang="ts">
await useRouteWPSeo()
</script>
