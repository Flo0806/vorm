import { defineNuxtPlugin } from 'nuxt/app'
import { version } from '../../package.json'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      vorm: {
        version
      }
    }
  }
})
