<template>
  <ContentList v-slot="content">
    <ul class="prose">
      <li v-for="article in content.list" :key="article._path" text-20 py-10>
        <NuxtLink :to="article._path"> {{article.title}} </NuxtLink>
        <time v-if="article.date" block text-12 text-normal>{{article.date}}</time>
      </li>
    </ul>
  </ContentList>
</template>
