<template>
    <Card
        :class="[
            'lg:py-7',
            'lg:px-8',
            'rounded-2xl',
            'backdrop-blur-xl',
            'bg-linear-to-br',
            'from-background-neutral-hover/60',
            'to-transparent',
            'border',
            'border-border-neutral-subtle/50',
            'shadow-lg',
            'shadow-black/10',
            'bg-background-neutral-subtle/20',
        ]"
    >
        <CardHeader :class="['!flex-col', align === Align.CENTER && 'items-center']">
            <ContainedIcon
                v-if="icon"
                :icon
                :shape="containedIconShape"
                :styleType="containedIconStyleType"
                :color="containedIconColor"
            />
            <CardTitle
                :title
                :class="[align === Align.CENTER && 'text-center']"
            />
        </CardHeader>
        <CardBody class="flex-1">
            <p :class="['text-sm', align === Align.CENTER && 'text-center']">
                {{ description }}
            </p>
        </CardBody>
        <CardFooter v-if="$slots.footer">
            <slot name="footer" />
        </CardFooter>
    </Card>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String as PropType<string>,
        default: 'Feature title',
    },
    description: {
        type: String as PropType<string>,
        default: 'Feature description',
    },
    icon: String as PropType<string>,
    containedIconShape: {
        type: String as PropType<IconContainerShape>,
        default: IconContainerShape.CIRCLE,
        validator: (value: IconContainerShape) => Object.values(IconContainerShape).includes(value),
    },
    containedIconStyleType: {
        type: String as PropType<IconContainerStyleType>,
        default: IconContainerStyleType.FILLED,
        validator: (value: IconContainerStyleType) => Object.values(IconContainerStyleType).includes(value),
    },
    containedIconColor: {
        type: String as PropType<ColorAccent>,
        default: ColorAccent.SECONDARY_BRAND,
        validator: (value: ColorAccent) => Object.values(ColorAccent).includes(value),
    },
    align: {
        type: String as PropType<Align.LEFT | Align.CENTER>,
        default: Align.LEFT,
        validator: (value: Align) => [Align.LEFT, Align.CENTER].includes(value),
    },
})

defineEmits(['footerBtnClick'])
</script>
