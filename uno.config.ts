import { defineConfig, presetIcons, presetWind4, } from 'unocss'

export default defineConfig({
  presets:[
    presetWind4(),
    presetIcons(),
  ],
  shortcuts: [
    ['viewport', 'block max-w-[min(100%,650px)] mx-auto px-3xl'],
    ['center', 'flex justify-center items-center'],
    ['x-center', 'flex justify-center'],
    ['y-center', 'flex items-center'],
    ['nav-link', 'text-soft hover:text-highlight transition-color'],
  ],
  rules: [
    ['text', {color: 'var(--k-prose-text)'}],
    ['text-soft', {color: 'var(--k-prose-text-soft)'}],
    ['text-highlight', {color: 'var(--k-prose-text-highlight)'}],
    ['bg', {background: 'var(--k-prose-bg)'}],
    ['dark', {'color-scheme': 'dark'}]
  ]
})