<template>
  <section>
    <ContentList v-slot="content">
      <NuxtLink 
        v-for="article in content.list" 
        :key="article._path"
        :to="article._path"
        text-20 py-10 block text-soft hover:text-highlight> 
        {{article.title}} 
        <time v-if="article.date" block text-12 opacity80>{{article.date}}</time>
      </NuxtLink>
    </ContentList>
  </section>
</template>
