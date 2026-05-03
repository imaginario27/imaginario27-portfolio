<template>
    <div
        :class="[
            'relative',
            'w-full',
            'h-[calc(100vh-72px)]',
            'overflow-hidden',
        ]"
    >
        <InfiniteLandscape
            width="100%"
            height="100%"
            :cameraZ="125"
            :planeSize="256"
            :speed="0.5"
        />
        <div
            :class="[
                'absolute',
                'inset-0',
                'z-2',
                'flex',
                'flex-col',
                'items-center',
                'justify-start',
                'text-center',
                'px-6',
                'pt-[18vh]',
            ]"
        >
            <h1
                :class="[
                    'm-0',
                    'font-bold',
                    'tracking-[-0.03em]',
                    'text-text-default',
                    'text-[clamp(2.5rem,8vw,6rem)]',
                ]"
            >
                Imaginario27
            </h1>

            <!-- Animated subtitle -->
            <p
                :class="[
                    'mt-3',
                    'max-w-xl',
                    'text-text-neutral-subtle',
                    'text-[clamp(1rem,1.5vw,1.25rem)]',
                    'flex',
                    'items-center',
                    'justify-center',
                    'gap-2',
                    'flex-wrap',
                ]"
            >
                Diseño &amp; desarrollo de
                <span class="relative inline-flex h-[1.4em] items-center overflow-hidden">
                    <Transition name="word-slide" mode="out-in">
                        <span
                            :key="currentExpertise"
                            class="inline-block font-semibold text-text-default whitespace-nowrap"
                        >
                            {{ currentExpertise }}
                        </span>
                    </Transition>
                </span>
            </p>

            <div
                :class="[
                    'mt-8',
                    'flex',
                    'flex-wrap',
                    'items-center',
                    'justify-center',
                    'gap-3',
                    'pointer-events-auto',
                ]"
            >
                <ActionButton
                    :size="ButtonSize.XXL"
                    :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
                    text="Ver proyectos"
                />
                <ActionButton
                    :size="ButtonSize.XXL"
                    :styleType="ButtonStyleType.NEUTRAL_OUTLINED"
                    text="Contáctame"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const expertise = [
    'experiencias digitales',
    'interfaces únicas',
    'productos web',
    'identidades visuales',
]

const index = ref(0)
const currentExpertise = computed(() => expertise[index.value])

let interval: ReturnType<typeof setInterval>

onMounted(() => {
    interval = setInterval(() => {
        index.value = (index.value + 1) % expertise.length
    }, 2800)
})

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.word-slide-enter-active,
.word-slide-leave-active {
    transition:
        transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
        opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.word-slide-enter-from {
    transform: translateY(60%);
    opacity: 0;
}

.word-slide-leave-to {
    transform: translateY(-60%);
    opacity: 0;
}
</style>