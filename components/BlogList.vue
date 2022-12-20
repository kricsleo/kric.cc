<script lang="ts" setup>
import type { QueryBuilderParams } from '@nuxt/content/dist/runtime/types'
const query: QueryBuilderParams = { path: '/', sort: [{ date: -1 }] }
</script>

<template>
  <section>
    <ContentList v-slot="content" :query="query">
      <NuxtLink 
        v-for="article in content.list" 
        :key="article._path"
        :to="article._path"
        text-20 py-10 block text-soft hover:text-highlight> 
        {{article.title}} 
        <time v-if="article.date" block text-12 opacity80>{{article.date.slice(0, 10)}}</time>
      </NuxtLink>
    </ContentList>
  </section>
</template>
