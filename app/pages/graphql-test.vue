<template>
    <div>
        <h2>Pages</h2>

        <p
            v-for="page of data?.pages?.nodes"
            :key="page.id"
        >
            {{ page.title }}
        </p>
    </div>
</template>

<script lang="ts" setup>
const { data } = await useAsyncGql('Pages')
</script>
