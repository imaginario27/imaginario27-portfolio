<template>
    <Section>
        <SectionBody>
            <div :class="['mx-auto', 'max-w-7xl', 'space-y-12', 'px-4', 'py-12']">
                <header class="space-y-2">
                    <h1 class="text-3xl font-bold text-text-default">Gallery demo</h1>
                    <p class="text-text-neutral-subtle">
                        Local demo using static images. Swap <code>:items</code> for <code>:mediaIds</code> to fetch from WP.
                    </p>
                </header>

                <section class="space-y-4">
                    <h2 class="text-xl font-semibold text-text-default">Grid layout</h2>
                    <Gallery
                        id="grid-demo"
                        :items="demoItems"
                        :layout="GalleryLayout.GRID"
                        :columnsSm="2"
                        :columnsMd="3"
                        :columnsLg="4"
                        :gap="12"
                        :captionPlacement="GalleryCaptionPlacement.HOVER"
                    />
                </section>

                <section class="space-y-4">
                    <h2 class="text-xl font-semibold text-text-default">Justified (masonry) layout</h2>
                    <Gallery
                        id="masonry-demo"
                        :items="demoItems"
                        :layout="GalleryLayout.MASONRY"
                        :targetRowHeight="220"
                        :gap="8"
                        :widowAlign="GalleryWidowAlign.JUSTIFY"
                        :captionPlacement="GalleryCaptionPlacement.HOVER"
                    />
                </section>

                <section class="space-y-4">
                    <h2 class="text-xl font-semibold text-text-default">With filter + load-more</h2>
                    <Gallery
                        id="filter-demo"
                        :items="demoItems"
                        :layout="GalleryLayout.MASONRY"
                        :targetRowHeight="300"
                        :gap="8"
                        :showFilter="true"
                        :filterIsMultiple="true"
                        :filterOptions="filterOptions"
                        :paginationMode="GalleryPaginationMode.LOAD_MORE"
                        :pageSize="6"
                        :limit="6"
                    />
                </section>
            </div>
        </SectionBody>
    </Section>
</template>

<script setup lang="ts">
definePageMeta({
    title: 'Gallery demo',
})

const sample = (id: string, width: number, height: number, tags: string[], caption: string) => ({
    id,
    src: `https://picsum.photos/seed/${id}/${width}/${height}`,
    alt: caption,
    caption,
    width,
    height,
    tags,
})

const demoItems: GalleryImage[] = [
    sample('a', 1200, 800, ['nature'], 'Mountain'),
    sample('b', 800, 1200, ['nature'], 'Forest'),
    sample('c', 1000, 1000, ['urban'], 'Square'),
    sample('d', 1600, 900, ['urban'], 'Skyline'),
    sample('e', 900, 1200, ['portrait'], 'Portrait'),
    sample('f', 1200, 800, ['nature'], 'Lake'),
    sample('g', 1400, 900, ['urban'], 'Bridge'),
    sample('h', 800, 800, ['portrait'], 'Studio'),
    sample('i', 1200, 1500, ['portrait'], 'Window light'),
    sample('j', 1600, 1000, ['nature'], 'Coast'),
    sample('k', 1000, 1400, ['urban'], 'Alley'),
    sample('l', 1800, 1000, ['nature'], 'Valley'),
]

const filterOptions = [
    { value: 'nature', text: 'Nature' },
    { value: 'urban', text: 'Urban' },
    { value: 'portrait', text: 'Portrait' },
]
</script>
