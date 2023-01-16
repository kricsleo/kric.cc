<script setup lang="ts">
import { omit } from 'lodash-es'
interface Link {
  id: string
  depth: number
  text: string
  children?: Link[]
}
const {
  // Global references
  globals,
  navigation,
  surround,
  page,
  // Computed properties from `page` key
  excerpt,
  toc,
  type,
  layout,
  // Computed properties from `surround` key
  next,
  prev
} = useContent()

const maxDepth = 3
const limittedDepthToc = computed(() => {
  return toc.value.links?.map((link: Link) => limitLinkDepth(link))

  function limitLinkDepth(link: Link): Link {
    const { children, ...rest } = link
    return link.depth >= maxDepth || !children
      ? rest
      : {...rest, children: children?.map(l => limitLinkDepth(l))}
  }
})
</script>

<template>
  <div>
    <nav fixed top-140 w-220 hidden xl:block class="left-[calc(50%+385px)]">
      <TOC v-if="limittedDepthToc" :links="limittedDepthToc" />
    </nav>
    <article class="prose">
      <ContentDoc>
        <template #not-found>
          No content here.
        </template>
      </ContentDoc>
    </article>
  </div>
</template>
