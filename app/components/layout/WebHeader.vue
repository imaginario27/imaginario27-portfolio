<template>
    <CompactHeader
        :navMenuItems="menuItems"
        isSticky
        containerClass="h-[72px]"
        navMobileMenuClass="min-w-[326px]"
    >
        <template #header-logo>
            <AppLogo
                :src="isDark ? logoDark : logoLight"
                :to="localePath('/')"
                logoClass="w-[180px]!"
            />
        </template>

        <template #header-actions>
            <DropdownSelect
                v-if="languages.length && currentLanguage"
                v-model="currentLanguage"
                :options="languages"
                :type="SelectType.IMAGE"
                class="w-full min-w-40"
                selectBoxClass="bg-background-neutral-default"
                @update:model-value="onLanguageChanged"
            />

            <ThemeToggle
                :hasOnlyIcons="!isMobile"
                :customClass="isMobile ? 'pt-4 border-t border-border-neutral-subtle' : undefined"
            />
        </template>
    </CompactHeader>
</template>
<script setup lang="ts">
// Imports
import logoLight from '~~/public/images/logo/imaginario27-logo-color.svg?raw'
import logoDark from '~~/public/images/logo/imaginario27-logo-outline-white.svg?raw'

// Props
defineProps({
    showSidebarToggle: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
})

// Stores
const languageStore = useLanguageStore()
const { languages, setLanguage } = languageStore
const { currentLanguage } = storeToRefs(languageStore)
const switchLocalePath = useSwitchLocalePath()

const onLanguageChanged = async () => {
    if (!currentLanguage.value) return
    setLanguage(currentLanguage.value)

    const localizedPath = switchLocalePath(currentLanguage.value)
    if (localizedPath) {
        await navigateTo(localizedPath)
    }
}

const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

// Composables
const { isMobile } = useIsMobile()

// Translation dependencies
const { locale } = useI18n()
const localePath = useLocalePath()
const menuLanguage = computed(() => currentLanguage.value || locale.value || 'en')

// Data
const { data: menu } = await useAsyncQuery({
    operation: 'Menu',
    variables: {
        language: menuLanguage,
        location: MenuLocationEnum.PRIMARY_MENU,
    },
    options: {
        watch: [menuLanguage],
    },
})

// Computed
const menuItems = computed<MenuItem[]>(() => {
    const nodes: MenuNode[] = menu.value?.menuItems?.nodes ?? []

    return nodes
        .filter((item: MenuNode) => !item.parentId)
        .map((parent: MenuNode) => {
            const children = nodes
                .filter((item: MenuNode) => item.parentId === parent.id)
                .map((child: MenuNode) => ({
                    text: child.label ?? '',
                    to: localePath(child.uri || '/'),
                }))

            return {
                text: parent.label ?? '',
                to: localePath(parent.uri || '/'),
                children: children.length ? children : undefined,
            }
        })
})
</script>
