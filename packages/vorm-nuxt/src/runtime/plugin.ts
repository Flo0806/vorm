import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      vorm: {
        version: '1.1.0'
      }
    }
  }
})
