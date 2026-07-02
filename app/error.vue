<template>
    <ErrorDisplay
        v-if="isVisible"
        :statusCode="error?.status ?? -1"
        :errorMappings="errorMappings"
        :backToHomeText="$t('Volver al inicio')"
    >
        <template #actions>
            <ActionButton
                :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
                :text="$t('Volver al inicio')"
                icon="mdi:home-outline"
                :iconPosition="IconPosition.LEFT"
                class="w-full md:w-auto"
                @click="handleGoHome"
            />
        </template>
    </ErrorDisplay>
</template>

<script setup lang="ts">
const error = useError()
const { t } = useI18n()
const isVisible = ref(true)

const isProjectNotFound = computed(() => error.value?.status === 404 && error.value?.statusText === 'project-not-found')

const handleGoHome = () => {
    isVisible.value = false
    clearError({ redirect: '/' })
}

const errorMappings = computed<ErrorMapping[]>(() => [
    {
        statusCode: 404,
        title: isProjectNotFound.value ? t('Proyecto no encontrado') : t('Página no encontrada'),
        message: isProjectNotFound.value
            ? t('El proyecto que buscas no existe o ha sido movido.')
            : t('La página que buscas no existe o ha sido movida.'),
    },
    {
        statusCode: 500,
        title: t('Error interno del servidor'),
        message: t('Algo salió mal. Por favor, inténtalo de nuevo más tarde.'),
    },
    {
        statusCode: -1,
        title: t('Error inesperado'),
        message: t('Ha ocurrido un error desconocido. Por favor, inténtalo de nuevo.'),
    },
])
</script>
