<script setup lang="ts">
const props2 = defineProps({
  href: {
    type: String,
    default: ''
  },
  blank: {
    type: Boolean,
    default: false
  }
})

const target = computed(() => {
  const isBlank = props2.blank || /^https?:/.test(props2.href)
  return isBlank ? '_blank' : undefined
})
</script>

<template>
  <NuxtLink :href="href" :target="target">
    <slot />
  </NuxtLink>
</template>
