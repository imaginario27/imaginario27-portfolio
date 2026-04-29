import type { UITheme } from "~/models/types/themes";

export const useThemeStore = defineStore("theme", () => {
    // Translation composable
    const { t } = useI18n();

    const themes = computed<Array<SelectOption & { value: UITheme }>>(() => [
        {
            text: t("Light"),
            value: "light",
            icon: "mdi:weather-sunny",
        },
        {
            text: t("Dark"),
            value: "dark",
            icon: "mdi:moon-waxing-crescent",
        },
        {
            text: t("System"),
            value: "system",
            icon: "mdi:theme-light-dark",
        },
    ]);

    const { isDark, themeMode, preferredDark, setTheme } = useDarkMode();

    return {
        themes,
        selectedTheme: themeMode,
        preferredDark,
        isDark,
        setTheme,
    };
});