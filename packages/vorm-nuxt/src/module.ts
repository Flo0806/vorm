import { defineNuxtModule, addPlugin, createResolver, addImportsDir } from '@nuxt/kit'
import type { NuxtModule } from '@nuxt/schema'

export interface ModuleOptions {
  autoImports?: boolean
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vorm-nuxt',
    configKey: 'vorm',
    compatibility: {
      nuxt: '>=3.0.0'
    }
  },

  defaults: {
    autoImports: true
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.build.transpile.push('vorm-vue')

    addPlugin(resolver.resolve('./runtime/plugin'))

    if (options.autoImports) {
      addImportsDir(resolver.resolve('./runtime/composables'))
    }

    console.log('✅ Vorm Nuxt Module loaded')
  }
})

export default module
