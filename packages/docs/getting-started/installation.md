# Installation

Welcome to Vorm — the intuitive, dynamic, and extensible form engine for Vue 3.

Vorm is **zero-dependency**, **fully typed**, and designed with developer experience in mind. Whether you're building simple login forms or complex dynamic schemas with nested repeaters — Vorm scales with you.

## Requirements

- Vue 3
- Vite (or any modern bundler)

## Installation

Install Vorm via your preferred package manager:

### Using pnpm (recommended)

```bash
pnpm add vorm
```

### Using npm

```bash
npm install vorm
```

### Using yarn

```bash
yarn add vorm
```

## Project Setup

Vorm is **Vue-native** and doesn't require global plugin registration. Simply import the components and composables where needed.

> All components are available from:

```ts
import {
  VormProvider,
  AutoVorm,
  VormSection,
  VormRepeater,
} from "vorm/components";
```

## Standard Styles

Vorm has some standard styles for `vorm-group` or the `VormSection` component. To use this styles you must import it :

```ts
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "vorm-vue/vorm-vue.css"; // The important line

createApp(App).mount("#app");
```

## Optional: Tailwind CSS

Vorm comes unstyled — ready to adapt to your design system. We recommend Tailwind CSS for rapid styling:

## Tailwind CSS < v4

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Tailwind CSS v4

```bash
npm i tailwindcss @tailwindcss/vite;
```

and then inside your _vite.config.ts_

```ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
});
```

Configure `tailwind.config.js` and you're good to go.

---

## Playground Setup

If you want to explore Vorm before integrating it into your app:

```bash
pnpm create vite
# Choose Vue + TypeScript
cd your-project
pnpm install
pnpm add vorm
```

Then use `AutoVorm` in your first component — or continue with the next guide:

👉 [First Form Setup](/getting-started/first-form)

---

Happy coding 🎉
