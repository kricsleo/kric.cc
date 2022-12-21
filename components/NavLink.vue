<script setup lang="ts">
const props = defineProps<{
  to: string
}>()

const route = useRoute()
const active = computed(() => route.path === props.to)
</script>

<template>
  <NuxtLink :to="to" text-soft hover:text-normal :class="{'!text-highlight': active}">
    <slot />
  </NuxtLink>
</template>

<style scoped lang="scss">
</style>
