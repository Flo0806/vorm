import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    console.log('🎨 Vorm is ready!')
  }

  return {
    provide: {
      vorm: {
        version: '1.0.2'
      }
    }
  }
})
