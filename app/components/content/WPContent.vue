<template>
    <div
        v-if="blocks.length"
        :class="['flex', 'flex-col', 'gap-8', 'overflow-hidden']"
    >
        <template
            v-for="(block, blockIndex) in blocks"
            :key="blockIndex"
        >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
                v-if="block.type === WPContentBlockType.HTML"
                :class="proseClasses"
                v-html="block.html"
            />

            <button
                v-else-if="block.type === WPContentBlockType.IMAGE"
                type="button"
                class="cursor-pointer"
                :aria-label="block.image.alt || $t('Ver imagen')"
                @click="openLightbox(blockIndex)"
            >
                <NuxtImg
                    :src="block.image.src"
                    :alt="block.image.alt"
                    :width="block.image.width"
                    :height="block.image.height"
                    class="h-auto w-full rounded-lg"
                    loading="lazy"
                />
            </button>

            <Gallery
                v-else-if="block.type === WPContentBlockType.GALLERY"
                :mediaIds="block.mediaIds"
                :items="block.images ?? null"
                :layout="GalleryLayout.GRID"
                :columnsSm="1"
                :columnsMd="2"
                :columnsLg="3"
                :gap="8"
                enableLightbox
            />
        </template>

        <Lightbox
            v-model="lightboxOpen"
            :images="lightboxImages"
            :initialIndex="0"
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    content: {
        type: String,
        required: true,
    },
})

const { blocks } = useWPContentTransform(() => props.content)

const lightboxOpen = ref(false)
const lightboxImages = ref<GalleryImage[]>([])

const openLightbox = (blockIndex: number) => {
    const block = blocks.value[blockIndex]
    if (block?.type !== WPContentBlockType.IMAGE) return
    lightboxImages.value = [block.image]
    lightboxOpen.value = true
}

const proseClasses = [
    'prose',
    'prose-lg',
    'max-w-none',
    'break-words',
    'prose-img:max-w-full',
    'prose-img:h-auto',
    'prose-headings:text-text-default',
    'prose-p:text-text-default',
    'prose-a:text-text-primary-brand-default',
    'prose-a:underline',
    'prose-strong:text-text-default',
    'prose-blockquote:border-border-neutral-subtle',
    'prose-blockquote:text-text-default',
    'prose-code:text-text-default',
    'prose-pre:bg-background-neutral-subtle',
    'prose-pre:overflow-x-auto',
    'prose-hr:border-border-neutral-subtle',
    'prose-li:text-text-default',
]
</script>
