<script setup lang="ts">
import '@unocss/reset/tailwind.css'
import 'uno.css'
</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 1.1rem;
  height: 1.1rem;
  background-color: transparent;
}

.dark body::-webkit-scrollbar {
  background: #222;
}

::-webkit-resizer,
::-webkit-scrollbar-corner,
::-webkit-scrollbar-button,
::-webkit-scrollbar-track {
  display: none;
}

::-webkit-scrollbar-thumb {
  border-radius: 999rem;
  background-color: #d1d5db;
  border: 5px solid transparent;
  background-clip: content-box;
}
.dark *::-webkit-scrollbar-thumb {
  background-color: #475569;
}
* {
  border-color: rgba(229, 231, 235, 1)
}
.dark * {
  border-color: rgba(229, 231, 235, 0.5)
}

html.dark {
  background-color: #222222;
}
</style>
