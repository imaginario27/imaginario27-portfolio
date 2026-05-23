<template>
    <OptionButtonsGroupField
        :id="id"
        :modelValue="modelValue"
        :buttons="buttons"
        :isMultiple="isMultiple"
        :hasAllButton="hasAllButton"
        :allButtonText="allButtonText"
        :allButtonValue="allValue"
        :buttonStyle="buttonStyle"
        :buttonSize="buttonSize"
        :isRounded="isRounded"
        :class="filterClass"
        @update:modelValue="onUpdate"
    />
</template>

<script setup lang="ts">
// Props
const props = defineProps({
    id: {
        type: String as PropType<string>,
        default: 'gallery-filter',
    },
    modelValue: {
        type: [String, Array] as PropType<string | string[]>,
        required: true,
    },
    options: {
        type: Array as PropType<GalleryFilterOption[]>,
        default: () => [],
    },
    isMultiple: {
        type: Boolean as PropType<boolean>,
        default: false,
    },
    hasAllButton: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    allButtonText: {
        type: String as PropType<string>,
        default: 'All',
    },
    allValue: {
        type: String as PropType<string>,
        default: '__all__',
    },
    buttonStyle: {
        type: String as PropType<ButtonStyleType.PRIMARY_BRAND_SOFT | ButtonStyleType.NEUTRAL_OUTLINED>,
        default: ButtonStyleType.NEUTRAL_OUTLINED,
        validator: (value: string) =>
            [ButtonStyleType.PRIMARY_BRAND_SOFT, ButtonStyleType.NEUTRAL_OUTLINED].includes(value as ButtonStyleType),
    },
    buttonSize: {
        type: String as PropType<ButtonSize>,
        default: ButtonSize.SM,
    },
    isRounded: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    filterClass: String as PropType<string>,
})

// Emits
const emit = defineEmits<{
    (e: 'update:modelValue', value: string | string[]): void
}>()

// Computed
const buttons = computed(() =>
    props.options.map((option) => ({
        value: option.value,
        text: option.text,
    })),
)

// Methods
const onUpdate = (value: string | string[]) => {
    emit('update:modelValue', value)
}
</script>
