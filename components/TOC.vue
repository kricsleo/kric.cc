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
  <ul>
    <li v-for="link in props.links" :key="link.id">
      <NuxtLink :to="`#${link.id}`">{{ link.text }}</NuxtLink>
      <TOC v-if="link.children" :links="link.children" />
    </li>
  </ul>
</template>
