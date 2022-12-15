<template>
  <main>
    <div max-w-1024 mxauto>
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
    </div>
  </main>
</template>
