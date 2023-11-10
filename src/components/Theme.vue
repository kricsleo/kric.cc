<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const toggleDark = useToggle(useDark())
</script>

<template>
  <button class="i-carbon:sun dark:i-carbon:moon" @click="toggleDark()" />
</template>