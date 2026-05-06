export const useThemeStore = defineStore("theme", () => {
    const { t } = useI18n()
    const themes = computed<Array<SelectOption & { value: UITheme }>>(() => [
        {
            text: t("Claro"),
            value: "light",
            icon: "mdi:weather-sunny",
        },
        {
            text: t("Oscuro"),
            value: "dark",
            icon: "mdi:moon-waxing-crescent",
        },
        {
            text: t("Sistema"),
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