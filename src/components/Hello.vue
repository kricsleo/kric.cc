<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { HELLO } from '../data/data'

const hellos = ref(genHellos(HELLO.slice(0, 1)))
const refreshDuration = computed(() => hellos.value[hellos.value.length - 1].chars[0].fadeOut)

onBeforeMount(() => refresh(0))

function refresh(timeout: number) {
  setTimeout(() => {
    hellos.value = genHellos([HELLO[0], ...shuffle(HELLO.slice(1))])
    refresh(refreshDuration.value)
  }, timeout)
}

function genHellos(hellos: typeof HELLO) {
  const duration = 3000
  let delay = 0
  return hellos.map(hello => {
    const chars = hello.text.split('')
    const intervals = Array.from({length: chars.length}, () => Math.round(50 + Math.random() * 100))
    const fadeOut = delay + sum(intervals) + duration
    const delayChars = chars.map((char, idx) => {
      const interval = intervals[idx]
      const fadeIn = delay + sum(intervals.slice(0, idx))
      return { char, interval, fadeIn, fadeOut }
    })
    delay = delay + sum(intervals) + duration
    return { ...hello, chars: delayChars }
  })
}

function sum(list: number[]) {
  return list.reduce((a, c) => a + c, 0)
}

function shuffle<T extends any[]>(list: T): T {
  return list.sort(() => Math.random() - 0.5)
}
</script>

<template>

<div class="relative">
  <span 
    v-for="hello, idx in hellos" 
    :key="idx + Math.random()"
    class="ws-nowrap absolute left-0">
    <span 
      class="fade text-soft text-sm absolute bottom-0 right-100% mr-sm"
      :style="{
        animationDelay: `${hello.chars[0].fadeIn}ms, ${hello.chars[0].fadeOut}ms`,
        animationDuration: '150ms'
      }">{{hello.lang}}</span>
    <span 
      v-for="char, idx in hello.chars" 
      :key="idx + Math.random()" 
      class="fade text-5xl" 
      :style="{
        animationDelay: `${char.fadeIn}ms, ${char.fadeOut}ms`,
        animationDuration: `${char.interval}ms`
      }">{{char.char}}</span>
  </span>
</div>
</template>


<style>
.fade {
  opacity: 0;
  animation: fade-in forwards, fade-out forwards;
}

@keyframes fade-in {
  0% { opacity: 0;}
  100% { opacity: 1;}
}
@keyframes fade-out {
  0% { opacity: 1;}
  100% { opacity: 0;}
}
</style>