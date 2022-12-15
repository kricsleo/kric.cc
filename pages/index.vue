<template>
  <main>
    <ContentList>
      <template #default="value">
        <ul>
          <li v-for="article in value.list" :key="article._path">
            <NuxtLink :to="article._path"> {{article.title}} </NuxtLink>
          </li>
        </ul>
      </template>
      <template #not-found>
        Not found.
      </template>
    </ContentList>
  </main>
</template>
