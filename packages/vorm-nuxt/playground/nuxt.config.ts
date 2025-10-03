export default defineNuxtConfig({
  modules: ['../src/module', '@nuxtjs/tailwindcss'],
  vorm: { autoImports: true, components: true },
  devtools: { enabled: true },
  compatibilityDate: '2025-10-03'
})
