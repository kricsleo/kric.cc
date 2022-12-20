<script setup lang="ts">
import { toggleDark } from '~/composables/theme'
</script>

<template>
  <header>
    <nav flex items-center justify-end gap-20 pt-25 pb-10 text-18 text-soft>
      <NavLink to="/projects">Projects</NavLink>
      <NavLink to="/blogs">Blogs</NavLink>
      <a i-carbon:logo-github href="https://github.com/kricsleo/kric.cc" target="_blank" hover:text-highlight />
      <button i-carbon:sun dark:i-carbon:moon @click="toggleDark()" hover:text-highlight />
    </nav>
  </header>
</template>
