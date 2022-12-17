// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@unocss/nuxt'],
  content: {
    highlight: {
      theme: {
        default: 'github-dark',
        dark: 'github-dark'
      }
    }
  }
})
