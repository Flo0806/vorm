# Component: VormProvider

`<VormProvider>` is the context bridge component in Vorm. It connects the form context from `useVorm()` to all child components, enabling them to access, modify, and validate fields.

## Basic Usage

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm } from 'vorm-vue';

const schema: VormSchema = [
  { name: 'email', type: 'email', label: 'Email' },
  { name: 'password', type: 'password', label: 'Password' },
];

const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm />
  </VormProvider>
</template>
```

## Props

| Prop         | Type                  | Description                                           |
| ------------ | --------------------- | ----------------------------------------------------- |
| `vorm`       | `VormContext`         | The form context from `useVorm()` (required)          |
| `contextKey` | `symbol` or `string`  | Custom context key for multiple forms on same page    |

## When to Use VormProvider

### Required: Multiple Forms

When you have multiple forms on the same page:

```vue
<script setup lang="ts">
const loginSchema: VormSchema = [/* ... */];
const registerSchema: VormSchema = [/* ... */];

const loginForm = useVorm(loginSchema);
const registerForm = useVorm(registerSchema);
</script>

<template>
  <VormProvider :vorm="loginForm">
    <AutoVorm as="form" @submit="handleLogin" />
  </VormProvider>

  <VormProvider :vorm="registerForm">
    <AutoVorm as="form" @submit="handleRegister" />
  </VormProvider>
</template>
```

### Required: Custom Components

When building custom input components that need form access:

```vue
<!-- Parent -->
<VormProvider :vorm="vorm">
  <MyCustomForm />
</VormProvider>

<!-- MyCustomForm.vue -->
<script setup>
import { useVormContext } from 'vorm-vue';

const vorm = useVormContext();
// Now has access to vorm.formData, vorm.errors, etc.
</script>
```

### Optional: Single Form with AutoVorm

For simple cases with a single form, VormProvider is still recommended for clarity:

```vue
<VormProvider :vorm="vorm">
  <AutoVorm />
</VormProvider>
```

## Using Context Keys

For complex pages with multiple forms that might conflict:

```vue
<script setup lang="ts">
const FORM_A = Symbol('formA');
const FORM_B = Symbol('formB');

const formA = useVorm(schemaA, { key: FORM_A });
const formB = useVorm(schemaB, { key: FORM_B });
</script>

<template>
  <VormProvider :vorm="formA" :context-key="FORM_A">
    <AutoVorm />
  </VormProvider>

  <VormProvider :vorm="formB" :context-key="FORM_B">
    <AutoVorm />
  </VormProvider>
</template>
```

Access specific context in child components:

```ts
import { useVormContext } from 'vorm-vue';

const formA = useVormContext(FORM_A);
const formB = useVormContext(FORM_B);
```

## Manual Form Building

You can build forms without AutoVorm using the context:

```vue
<VormProvider :vorm="vorm">
  <div class="form">
    <div class="field">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="vorm.formData.email"
        @blur="vorm.validateFieldByName('email')"
      />
      <span v-if="vorm.errors.email" class="error">
        {{ vorm.errors.email }}
      </span>
    </div>

    <button @click="handleSubmit">Submit</button>
  </div>
</VormProvider>
```

## Accessing Context in Children

Child components can access the form context:

```vue
<script setup lang="ts">
import { useVormContext } from 'vorm-vue';

const vorm = useVormContext();

// Access reactive state
const email = computed(() => vorm.formData.email);
const emailError = computed(() => vorm.errors.email);

// Use methods
function validateEmail() {
  vorm.validateFieldByName('email');
}
</script>
```

---

- [AutoVorm](./autovorm.md)
- [VormRepeater](./repeater.md)
- [Custom Inputs](../advanced/custom-inputs.md)

---

> VormProvider is the essential bridge that connects your form context to the component tree. It's invisible in the UI but powers all dynamic behavior in Vorm forms.
