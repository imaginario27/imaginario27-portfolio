<template>
    <div :class="['relative', 'w-full', 'pt-[12vh]', 'pb-[18vh]', 'lg:h-[calc(100vh-72px)]', 'lg:py-0', 'overflow-hidden']">
        <div :class="['absolute', 'inset-0']">
            <ShaderLines
                width="100%"
                height="100%"
                :mosaic="ShaderMosaic.RADIAL"
                overlayClass="bg-background-surface/70"
            />
        </div>
        <div
            :class="[
                'relative',
                'z-2',
                'flex',
                'flex-col',
                'items-center',
                'justify-center',
                'text-center',
                'px-6',
                'lg:absolute',
                'lg:inset-0',
                'lg:pb-[15vh]',
            ]"
        >
            <!-- Rotating role text -->
            <h1
                :class="[
                    'm-0',
                    'font-bold',
                    'tracking-[-0.03em]',
                    'text-text-default',
                    'text-[clamp(2rem,8vw,6rem)]',
                    'relative',
                    'inline-flex',
                    'h-[1.2em]',
                    'items-center',
                    'overflow-hidden',
                ]"
            >
                <Transition
                    name="word-slide"
                    mode="out-in"
                >
                    <span
                        :key="currentRole"
                        class="inline-block whitespace-nowrap"
                    >
                        {{ currentRole }}
                    </span>
                </Transition>
            </h1>

            <!-- Tagline -->
            <p
                :class="[
                    'subheading-font',
                    'mt-4',
                    'max-w-3xl',
                    'text-text-default',
                    'text-[clamp(1.1rem,2vw,1.75rem)]',
                    'font-medium',
                    'text-text-secondary-brand-default',
                    isDark ? 'brightness-125' : 'brightness-100',
                ]"
            >
                {{ $t('De la idea al producto. Sin intermediarios.') }}
            </p>

            <!-- CTAs -->
            <div :class="['mt-8', 'flex', 'flex-wrap', 'items-center', 'justify-center', 'gap-3', 'pointer-events-auto']">
                <ActionButton
                    :size="ButtonSize.XXL"
                    :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
                    :text="$t('Ver proyectos')"
                    :class="isDark && 'shadow-[0_0_20px_var(--color-background-primary-brand-default)]'"
                />
                <ActionButton
                    :size="ButtonSize.XXL"
                    :styleType="ButtonStyleType.NEUTRAL_OUTLINED"
                    :text="$t('Contactar')"
                    :class="isDark && 'shadow-[0_0_20px_var(--color-background-neutral-subtle)]'"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Translations
const { t } = useI18n()

// Computed
const roles = computed(() => [t('UI/UX Designer'), t('Frontend Developer'), t('AI-driven workflow')])

// Stores
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// States
const index = ref(0)
const currentRole = computed(() => roles.value[index.value])

let interval: ReturnType<typeof setInterval>

onMounted(() => {
    interval = setInterval(() => {
        index.value = (index.value + 1) % roles.value.length
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
