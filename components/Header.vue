<script setup lang="ts">
import { toggleDark } from '~/composables/theme'
</script>

<template>
  <header>
    <nav flex items-center justify-end gap-20 py-15 text-20>
      <NuxtLink to="/projects">Projects</NuxtLink>
      <NuxtLink to="/blogs">Blogs</NuxtLink>
      <a i-carbon:logo-github href="https://github.com/kricsleo/kric.cc" target="_blank" />
      <button i-carbon:sun dark:i-carbon:moon @click="toggleDark()" />
    </nav>
  </header>
</template>

<style scoped lang="scss">
</style>
