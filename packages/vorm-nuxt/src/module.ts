import type { NuxtModule } from '@nuxt/schema'
import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  autoImports?: boolean
  components?: boolean
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
    autoImports: true,
    components: true
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.build.transpile.push('vorm-vue')

    addPlugin(resolver.resolve('./runtime/plugin'))

    if (options.autoImports) {
      addImports([
        { name: 'useVorm', from: 'vorm-vue' },
        { name: 'useVormContext', from: 'vorm-vue' },
        // Types
        { name: 'VormSchema', from: 'vorm-vue', type: true }
      ])
    }

    if (options.components) {
      // Register each component explicitly
      addComponent({
        name: 'VormProvider',
        export: 'VormProvider',
        filePath: 'vorm-vue/components'
      })

      addComponent({
        name: 'AutoVorm',
        export: 'AutoVorm',
        filePath: 'vorm-vue/components'
      })

      addComponent({
        name: 'VormSection',
        export: 'VormSection',
        filePath: 'vorm-vue/components'
      })

      // Add more components...
    }

    console.log('✅ Vorm Nuxt Module loaded')
  }
})

export default module
