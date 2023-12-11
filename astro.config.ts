import { defineConfig } from 'astro/config';
import UnoCSS from 'unocss/astro';
import vue from "@astrojs/vue";
import robotsTxt from "astro-robots-txt";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://kric.cc',
  prefetch: {
    defaultStrategy: 'viewport'
  },
  integrations: [
    vue(), 
    UnoCSS({ injectReset: true }), 
    robotsTxt(), 
    sitemap(),
  ]
});