import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(nuxtApp => {
  if (process.dev) {
    console.log('🎨 Vorm is ready!')
  }

  return {
    provide: {
      vorm: {
        version: '1.0.0'
      }
    }
  }
})
