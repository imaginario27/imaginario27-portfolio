
export const useLanguageStore = defineStore("language", () => {
    // Constants
    const LANGUAGE_PREFERENCE_KEY = "language";
    const LANGUAGE_CODES = new Set<LanguageCode>(["es", "en", "de"]);

    // Translation composable
    const { locale, locales, setLocale } = useI18n();

    // Methods
    const setLanguagePreference = (code: LanguageCode) => {
        if (import.meta.client) {
            localStorage.setItem(LANGUAGE_PREFERENCE_KEY, code);
        }
    };

    const getLanguagePreference = (): LanguageCode | "" => {
        if (!import.meta.client) {
            return "";
        }

        const savedCode = localStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        if (savedCode && LANGUAGE_CODES.has(savedCode as LanguageCode)) {
            return savedCode as LanguageCode;
        }

        return "";
    };

    // States
    const currentLanguage = ref<LanguageCode>();

    // Computed
    const languages = computed<Language[]>(() =>
        locales.value.map((lang, index) => ({
            id: String(index + 1),
            text: lang.name ?? "Language name not found",
            imgUrl: `/flags/flag-${lang.code}.png`,
            value: lang.code,
            callback: () => setLanguage(lang.code as LanguageCode),
        })),
    );

    // Methods
    const setLanguage = (code: LanguageCode) => {
        currentLanguage.value = code;
        setLanguagePreference(code);
    };

    // Initial language setup
    const initialLanguage = ((): LanguageCode => {
        const initialLocale = getLanguagePreference();
        return initialLocale || (locale.value as LanguageCode);
    })();

    // Set i18n locale explicitly
    if (initialLanguage !== locale.value) {
        setLocale(initialLanguage);
    }

    currentLanguage.value = initialLanguage;

    // Watchers
    watch(currentLanguage, async (newLanguage) => {
        if (newLanguage && newLanguage !== locale.value) {
            await setLocale(newLanguage);
        }
    });

    watch(
        locale,
        (newLocale) => {
            if (newLocale !== currentLanguage.value) {
                currentLanguage.value = newLocale as LanguageCode;
            }
        },
        { immediate: true },
    );

    return {
        currentLanguage,
        languages,
        setLanguage,
        locales,
    };
});