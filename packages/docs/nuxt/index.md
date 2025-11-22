# Nuxt Integration

**vorm-nuxt** is the official Nuxt module for Vorm. It provides seamless integration with Nuxt 3, including auto-imports, component registration, and SSR compatibility.

## Installation

::: code-group

```bash [pnpm]
pnpm add vorm-nuxt vorm-vue
```

```bash [npm]
npm install vorm-nuxt vorm-vue
```

```bash [yarn]
yarn add vorm-nuxt vorm-vue
```

:::

Then add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt'],

  // Optional: customize Vorm settings
  vorm: {
    autoImports: true,
    autoImportValidators: true,
    components: true,
  }
})
```

## Module Options

| Option                  | Type      | Default | Description                              |
| ----------------------- | --------- | ------- | ---------------------------------------- |
| `autoImports`           | `boolean` | `true`  | Auto-import composables and types        |
| `autoImportValidators`  | `boolean` | `true`  | Auto-import validator functions          |
| `components`            | `boolean` | `true`  | Auto-register Vorm components            |

## Auto-Imports

When `autoImports: true`, the following are available globally:

### Composables

- `useVorm` - Create a form instance
- `useVormContext` - Access form context from child components

### Types

- `VormSchema` - Schema array type
- `VormFieldSchema` - Field definition type
- `Option` - Select option type
- `FieldState` - Field state type
- `ValidationMode` - Validation mode type
- `FormContext` - Form context type (for reactive functions)
- `ReactiveString` - Reactive string type
- `ReactiveBoolean` - Reactive boolean type
- `ReactiveOptions` - Reactive options type

### Validators

When `autoImportValidators: true`:

- `minLength`
- `maxLength`
- `min`
- `max`
- `between`
- `step`
- `matchField`

## Components

When `components: true`, these are available globally:

- `<VormProvider>`
- `<AutoVorm>`
- `<VormSection>`
- `<VormRepeater>`

## Basic Usage

```vue
<script setup lang="ts">
const schema: VormSchema = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    validation: [
      { rule: 'required' },
      { rule: 'email' }
    ]
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    validation: [
      { rule: 'required' },
      { rule: minLength(8) }
    ]
  }
];

const vorm = useVorm(schema);

async function handleSubmit() {
  const isValid = await vorm.validateAll();
  if (isValid) {
    console.log('Form data:', vorm.formData);
  }
}
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm as="form" @submit="handleSubmit">
      <button type="submit">Submit</button>
    </AutoVorm>
  </VormProvider>
</template>
```

## With Nuxt I18n

Vorm's reactive strings work seamlessly with `@nuxtjs/i18n`:

```vue
<script setup lang="ts">
const { t, locale } = useI18n();

const schema: VormSchema = [
  {
    name: 'username',
    type: 'text',
    // No computed() needed!
    label: () => t('form.username'),
    placeholder: () => t('form.username.placeholder'),
    validation: [
      { rule: 'required' },
      { rule: minLength(3) }
    ]
  },
  {
    name: 'email',
    type: 'email',
    label: () => t('form.email'),
    validation: [
      { rule: 'required' },
      { rule: 'email' }
    ]
  }
];

const vorm = useVorm(schema);
</script>

<template>
  <div>
    <!-- Language switcher -->
    <button @click="locale = 'en'">EN</button>
    <button @click="locale = 'de'">DE</button>

    <VormProvider :vorm="vorm">
      <AutoVorm />
    </VormProvider>
  </div>
</template>
```

::: tip
When you change the locale, labels and validation messages update automatically **without re-running validation**.
:::

## Dynamic Placeholders

Use `FormContext` for dynamic text based on form state:

```ts
const schema: VormSchema = [
  {
    name: 'username',
    type: 'text',
    label: () => t('form.username'),
  },
  {
    name: 'email',
    type: 'email',
    label: () => t('form.email'),
    // Placeholder changes based on username
    placeholder: (ctx) => ctx.formData.username
      ? `${ctx.formData.username}@example.com`
      : t('form.email.placeholder'),
  }
];
```

## Server-Side Rendering

vorm-nuxt is fully SSR compatible. The module automatically:

- Transpiles `vorm-vue` for SSR
- Handles hydration correctly
- Maintains reactive state across client/server

No additional configuration needed.

## Custom Validation Messages

Override built-in validation messages:

```ts
const vorm = useVorm(schema, {
  i18n: {
    'vorm.validation.required': t('validation.required'),
    'vorm.validation.email': t('validation.email'),
    'vorm.validation.minLength': t('validation.minLength'),
  }
});
```

Or use Nuxt I18n's messages directly:

```yaml
# locales/en.yaml
validation:
  required: "This field is required"
  email: "Please enter a valid email"
  minLength: "Minimum {0} characters required"
```

```ts
const schema: VormSchema = [
  {
    name: 'password',
    validation: [{
      rule: minLength(8),
      message: () => t('validation.minLength', [8])
    }]
  }
];
```

## With Vuetify

Using Vorm with Vuetify in Nuxt:

```vue
<script setup lang="ts">
const schema: VormSchema = [
  {
    name: 'country',
    type: 'select',
    label: () => t('form.country'),
    options: [
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
    ]
  }
];

const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm>
      <template #wrapper:country="slotProps">
        <v-select
          v-bind="slotProps"
          :label="slotProps.field.label"
          variant="outlined"
        />
      </template>
    </AutoVorm>
  </VormProvider>
</template>
```

## TypeScript

All types are automatically available. For explicit imports:

```ts
import type {
  VormSchema,
  VormFieldSchema,
  FormContext,
  ReactiveString,
  Option
} from 'vorm-vue';
```

## Troubleshooting

### Components not found

Make sure `components: true` is set in your Nuxt config:

```ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt'],
  vorm: {
    components: true
  }
})
```

### Validators not imported

Ensure `autoImportValidators: true`:

```ts
export default defineNuxtConfig({
  modules: ['vorm-nuxt'],
  vorm: {
    autoImportValidators: true
  }
})
```

### Hydration mismatch

If you see hydration warnings, ensure your schema is created in `setup()` or uses `ref()`/`reactive()` for dynamic values.

---

- [Getting Started](../getting-started/installation.md)
- [Schema Definition](../core/schema.md)
- [Internationalization](../advanced/i18n.md)
