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
            'border-0',
            'border-border-neutral-subtle/50',
            'shadow-lg',
            'shadow-black/10',
            'bg-background-neutral-subtle/20',
            'h-fit',
        ]"
    >
        <CardHeader class="flex-col gap-1!">
            <CardTitle :title="name" />
            <span
                v-if="role"
                class="text-xs font-medium uppercase text-text-default/80"
                >{{ role }}</span
            >
        </CardHeader>
        <CardBody>
            <div
                v-if="email"
                class="flex gap-1.5 items-center"
            >
                <Icon name="mdi:at" />
                <span class="font-semibold text-sm">
                    {{ email }}
                </span>
            </div>

            <NavLink
                v-if="linkedin"
                :to="linkedin"
                :iconPosition="IconPosition.LEFT"
                icon="mdi:linkedin"
                text="LinkedIn"
                isExternal
            />

            <NavLink
                v-if="github"
                :to="github"
                :iconPosition="IconPosition.LEFT"
                icon="mdi:github"
                text="GitHub"
                isExternal
            />
        </CardBody>
    </Card>
</template>
<script setup lang="ts">
// Props
defineProps({
    name: {
        type: String as PropType<string>,
        default: 'John Doe',
    },
    role: String as PropType<string>,
    email: String as PropType<string>,
    linkedin: String as PropType<string>,
    github: String as PropType<string>,
})
</script>
