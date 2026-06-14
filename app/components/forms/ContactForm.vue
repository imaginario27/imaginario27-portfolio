<template>
    <Form
        @submit="handleSubmit"
        @reset="resetForm"
    >
        <FormRow>
            <InputField
                id="full-name"
                v-model="formData.fullName"
                v-model:error="formErrors.fullName"
                :label="$t('Nombre completo')"
                :placeholder="$t('Escribe tu nombre completo')"
                required
                :validator="validateField"
                :size="InputSize.LG"
                class=""
            />
        </FormRow>
        <FormRow>
            <InputField
                id="email"
                v-model="formData.email"
                v-model:error="formErrors.email"
                :label="$t('Correo electrónico')"
                :placeholder="$t('Escribe tu correo electrónico')"
                :validator="validateEmail"
                type="email"
                :size="InputSize.LG"
                required
            />
        </FormRow>
        <FormRow>
            <InputField
                id="subject"
                v-model="formData.subject"
                v-model:error="formErrors.subject"
                :label="$t('Asunto')"
                :placeholder="$t('Escribe el asunto')"
                required
                :validator="validateField"
                :size="InputSize.LG"
            />
        </FormRow>
        <FormRow>
            <TextareaField
                id="message"
                v-model="formData.message"
                v-model:error="formErrors.message"
                :label="$t('Mensaje')"
                :placeholder="$t('Escribe tu mensaje')"
                required
                :validator="validateField"
                minHeightClass="min-h-[200px] md:min-h-[500px]"
                :maxLength="1000"
            />
        </FormRow>
        <FormActions class="justify-end">
            <ActionButton
                type="submit"
                :text="$t('Enviar')"
                :styleType="ButtonStyleType.PRIMARY_BRAND_FILLED"
                :size="ButtonSize.XL"
                class="min-w-[112px]"
            />
        </FormActions>
    </Form>
</template>
<script setup lang="ts">
// Initialize toast
const { $toast } = useNuxtApp()

// States
const formData = reactive({
    fullName: '',
    email: '',
    subject: '',
    message: '',
})

// Validation
const { formErrors, resetForm, validateFormFields } = useForm({
    formData,
    requiredFields: ['fullName', 'email', 'subject', 'message'],
    validators: {
        fullName: (value) => validateField(value, $t('Campo requerido')),
        email: (value) => validateEmail(value, $t('Correo electrónico no válido')),
        subject: (value) => validateField(value, $t('Campo requerido')),
        message: (value) => validateField(value, $t('Campo requerido')),
    },
})

// Methods
const handleSubmit = () => {
    const isValid = validateFormFields()

    const hasErrors = !isValid

    if (hasErrors) {
        $toast.error($t('Rellena todos los campos correctamente'), {
            toastId: 'form-error',
        })
        return
    }

    $toast.success($t('Formulario enviado correctamente'), {
        toastId: 'form-success',
    })

    resetForm()
}
</script>
