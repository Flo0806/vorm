# Your First Form

Let's build your first form with Vorm. It's just a few lines of code away — and you'll immediately see the power of schema-driven forms in action.

## Complete Example

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm } from 'vorm-vue';

const schema: VormSchema = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    validation: [{ rule: 'required' }, { rule: 'email' }],
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    validation: [{ rule: 'required' }],
  },
  {
    name: 'remember',
    type: 'checkbox',
    label: 'Remember me',
  },
];

const vorm = useVorm(schema);

async function handleSubmit() {
  const isValid = await vorm.validateAll();
  if (isValid) {
    console.log('Form data:', vorm.formData);
    alert('Form submitted successfully!');
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

## Step by Step

### 1. Define your schema

The schema describes your form structure:

```ts
const schema: VormSchema = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    validation: [{ rule: 'required' }, { rule: 'email' }],
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    validation: [{ rule: 'required' }],
  },
];
```

### 2. Create the form context

Use `useVorm()` to create a reactive form instance:

```ts
const vorm = useVorm(schema);
```

This gives you access to:
- `vorm.formData` — reactive form values
- `vorm.errors` — validation errors per field
- `vorm.validateAll()` — validate all fields (async)
- `vorm.isValid` — computed validity state
- And much more...

### 3. Render the form

Wrap `AutoVorm` with `VormProvider`:

```vue
<template>
  <VormProvider :vorm="vorm">
    <AutoVorm as="form" @submit="handleSubmit">
      <button type="submit">Submit</button>
    </AutoVorm>
  </VormProvider>
</template>
```

## That's it!

You just built a fully validated, reactive form with:
- Automatic field rendering from schema
- Built-in validation (required, email, etc.)
- State tracking (touched, dirty, valid)
- Type-safe form data

## What's Next?

- [Schema Definition](/core/schema) — Learn all field options
- [Validation](/core/validation) — Built-in and custom rules
- [Custom Inputs](/advanced/custom-inputs) — Replace default rendering
- [Slots & Wrappers](/advanced/slots) — Full layout control
