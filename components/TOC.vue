<script setup lang="ts">
interface Link {
  id: string
  depth: number
  text: string
  children?: Link[]
}
const props = defineProps<{links: Link[]}>()
</script>

<template>
  <ul pl-15 leading-30 list-disc>
    <li v-for="link in props.links" :key="link.id">
      <NuxtLink :to="`#${link.id}`" block overflow-hidden whitespace-nowrap text-ellipsis>{{ link.text }}</NuxtLink>
      <TOC v-if="link.children" :links="link.children" />
    </li>
  </ul>
</template>
