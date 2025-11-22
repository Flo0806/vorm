# Installation

Welcome to Vorm — the intuitive, dynamic, and extensible form engine for Vue 3.

Vorm is **zero-dependency**, **fully typed**, and designed with developer experience in mind. Whether you're building simple login forms or complex dynamic schemas with nested repeaters — Vorm scales with you.

## Requirements

- Vue 3.3+
- Vite (or any modern bundler)

## Installation

Install Vorm via your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add vorm-vue
```

```bash [npm]
npm install vorm-vue
```

```bash [yarn]
yarn add vorm-vue
```

:::

## Nuxt Integration

For Nuxt 3 projects, use the official module:

::: code-group

```bash [pnpm]
pnpm add vorm-nuxt vorm-vue
```

```bash [npm]
npm install vorm-nuxt vorm-vue
```

:::

Then add it to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt']
})
```

See [Nuxt Integration](/nuxt/) for more details.

## Project Setup

Vorm is **Vue-native** and doesn't require global plugin registration. Simply import the components and composables where needed:

```ts
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm } from 'vorm-vue';
```

## Standard Styles

Vorm includes some default styles for components like `VormSection`. To use them:

```ts
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import 'vorm-vue/vorm-vue.css';

createApp(App).mount('#app');
```

## Optional: Tailwind CSS

Vorm comes unstyled — ready to adapt to your design system. We recommend Tailwind CSS for rapid styling.

### Tailwind CSS v4

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

In your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
});
```

### Tailwind CSS v3

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js` and you're good to go.

---

## Quick Start

```bash
pnpm create vite my-vorm-app --template vue-ts
cd my-vorm-app
pnpm install
pnpm add vorm-vue
```

Then continue with the next guide:

[First Form Setup](/getting-started/first-form)
