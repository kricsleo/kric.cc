<script setup lang="ts">
import { toggleDark } from '~/composables/theme'
</script>

<template>
  <header>
    <nav flex items-center gap-10 max-w-1024 mx-auto p-10 bg-light dark:bg-dark text-20>
      <button i-carbon:sun dark:i-carbon:moon @click="toggleDark()" />
    </nav>
  </header>
</template>

<style scoped lang="scss">
</style>
