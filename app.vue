<script setup lang="ts">
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './prose-light.css'
</script>

<template>
  <div max-w-900 mx-auto px-40 text-dark-9 dark:text-light-9>
    <Header />
    <div>
      <NuxtPage />
    </div>
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
  background-color: #ddd;
  border: 5px solid transparent;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #bbb;
}
.dark *::-webkit-scrollbar-thumb {
  background-color: #44403c;
}
.dark *::-webkit-scrollbar-thumb:hover {
  background-color: #78716c;
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
