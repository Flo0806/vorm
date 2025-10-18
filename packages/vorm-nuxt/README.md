# vorm-nuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

**Nuxt module for [vorm](https://github.com/Flo0806/vorm) - The intuitive form engine for Vue 3**

vorm-nuxt provides seamless integration of the powerful vorm form library into your Nuxt 3+ application with automatic imports and component registration.

- [✨ Release Notes](/CHANGELOG.md)
- [📖 vorm Documentation](https://vorm.fh-softdev.de)

## Features

- 🚀 **Auto-imports** - Composables and types available without imports
- 🎨 **Component registration** - All vorm components globally available
- ⚡ **Zero configuration** - Works out of the box
- 🔧 **Configurable** - Disable auto-imports or components if needed
- 💪 **TypeScript** - Full type safety with auto-imported types
- ✅ **SSR ready** - Works seamlessly with Nuxt's SSR

## Quick Setup

Install the module and its peer dependency to your Nuxt application:

```bash
pnpm add vorm-nuxt vorm-vue
```

> **Note:** Both packages are required. `vorm-nuxt` is the Nuxt module wrapper, while `vorm-vue` contains the core form library.

Alternatively, use the Nuxt CLI (this will prompt you to install vorm-vue):

```bash
npx nuxi module add vorm-nuxt
```

Then add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt']
})
```

That's it! You can now use vorm in your Nuxt app ✨

## Usage

Thanks to auto-imports, you can use vorm without any imports:

```vue
<script setup lang="ts">
// No imports needed! useVorm and VormSchema are auto-imported
const schema: VormSchema = [
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    validation: [{ rule: 'required' }, { rule: 'email' }]
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    validation: [{ rule: 'required' }, { rule: 'min', value: 8 }]
  }
]

const { formData, validate } = useVorm(schema)

function handleSubmit() {
  if (validate()) {
    console.log('Form data:', formData)
  }
}
</script>

<template>
  <!-- Components are globally registered -->
  <VormProvider>
    <VormSection title="Login">
      <AutoVorm />
    </VormSection>

    <button @click="handleSubmit">Submit</button>
  </VormProvider>
</template>
```

## Available Auto-Imports

### Composables
- `useVorm` - Main composable for form management
- `useVormContext` - Access form context from child components

### Types
- `VormSchema` - Type definition for your form schema

## Available Components

All vorm components are automatically registered:

- `<VormProvider>` - Form context provider
- `<AutoVorm>` - Automatic form generation from schema
- `<VormSection>` - Group form fields with a title
- `<VormRepeater>` - Repeatable field groups

## Configuration

You can customize the module in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt'],

  vorm: {
    // Disable auto-imports (default: true)
    autoImports: false,

    // Disable component registration (default: true)
    components: false
  }
})
```

## Module Options

### `autoImports`

- Type: `boolean`
- Default: `true`

Enable/disable auto-imports for composables and types.

### `components`

- Type: `boolean`
- Default: `true`

Enable/disable automatic component registration.

## Documentation

For comprehensive documentation about vorm features, validation, slots, and advanced usage:

👉 **[vorm Documentation](https://vorm.fh-softdev.de)**

## Examples

Check out these live examples to see vorm in action:

- [Basic Example](https://stackblitz.com/edit/vitejs-vite-vexqxvur)
- [Dynamic Layouts](https://stackblitz.com/edit/vitejs-vite-fj6nyh4z)
- [Real World Example](https://stackblitz.com/edit/vitejs-vite-pdfe4po5)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm run dev:prepare

# Develop with the playground
pnpm run dev

# Build the playground
pnpm run dev:build

# Run ESLint
pnpm run lint

# Run tests
pnpm run test
```

## License

MIT © [FH SoftDev - Flo0806](https://github.com/flo0806)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/vorm-nuxt/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/vorm-nuxt
[npm-downloads-src]: https://img.shields.io/npm/dm/vorm-nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/vorm-nuxt
[license-src]: https://img.shields.io/npm/l/vorm-nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/vorm-nuxt
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
