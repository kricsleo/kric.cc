<template>
  <ContentList v-slot="content">
    <ul class="prose">
      <li v-for="article in content.list" :key="article._path" text-20 py-10>
        <NuxtLink :to="article._path"> {{article.title}} </NuxtLink>
      </li>
    </ul>
  </ContentList>
</template>
