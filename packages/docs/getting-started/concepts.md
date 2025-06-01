---

sidebar: 'docs'
title: Basic Concepts
outline: \[2,3]
---------------

# Basic Concepts

Vorm is built around **schema-driven** form generation with maximum flexibility. This page covers the key concepts that unlock Vorm's power:

---

## Schema-Driven Design

Each form is defined by a single `VormSchema` array.

```ts
const schema: VormSchema = [
  { name: "email", label: "E-Mail", type: "email" },
  {
    name: "password",
    label: "Password",
    type: "password",
    validation: [{ rule: "required" }],
  },
];
```

Each field supports:

- `type`: e.g. `text`, `email`, `checkbox`, `select`, `textarea`, `repeater`, or `custom`
- `validation`: built-in or custom rules
- `showIf`: conditionally show based on form values
- `classes`: styling per input/label/wrapper

---

## Styling Forms

Vorm gives you full control over appearance via `classes`, slots, or global layout props.

```ts
{
  name: "email",
  label: "E-Mail",
  type: "email",
  classes: {
    input: "border px-2 py-1",
    outer: "mb-4",
    help: "text-red-500 text-xs"
  }
}
```

You can also set layout globally:

```vue
<AutoVorm layout="grid" :columns="2" />
```

---

## Wrappers

Use wrapper slots to wrap inputs in cards, flex rows, grids, etc. The given component is the input control.

### Global Wrapper

```vue
<template #wrapper="{ field, content }">
  <div class="mb-4">
    <label :for="field.name">{{ field.label }}</label>
    <component :is="content()" />
  </div>
</template>
```

### Field-Specific

```vue
<template #wrapper:email="{ content }">
  <div class="email-wrapper">
    <component :is="content()" />
  </div>
</template>
```

### Multi-Wrappers

```vue
<template #wrapper:[email,username]="{ content }">
  <div class="auth-wrapper">
    <component :is="content()" />
  </div>
</template>
```

### Wrapper Inheritance

Enable `inheritWrapper: true` in your schema to let children inherit the closest matching wrapper.

_Example_:
`email` will then work on `main.sub.email`, too.

---

## Field Slots

Override the rendering of any field:

```vue
<template #email="{ field, path, state }">
  <MyCustomInput v-bind="{ field, path, state }" />
</template>
```

---

## Sections & Layout

`VormSection` is a lightweight wrapper component provided for visual grouping and layout clarity. It’s purely optional and carries no logic — its sole purpose is to help you organize your forms visually.

You can use `VormSection` to add titles, padding, borders, or other structural elements around a part of your form:

```vue
<VormSection title="Account Information">
  <AutoVorm :only="['username', 'email', 'password']" />
</VormSection>
```

Under the hood, this is equivalent to writing your own wrapper:

```vue
<div class="border p-4 rounded">
  <h2 class="text-lg font-bold mb-2">Account Information</h2>
  <AutoVorm :only="['username', 'email', 'password']" />
</div>
```

You’re free to replace VormSection with any container you prefer — including your own custom components. It’s just a convenience.

---

## Context Awareness

AutoVorm adapts based on its context:

- `only`: Only render selected fields
- `excludeRepeaters`: Skip nested repeater fields
- `includeChildren`: Include `contacts[0].email`, etc.
- `basePath`: Set implicit prefix for all fields

This makes nested or partial forms effortless.

---

## Custom Components

You can plug in your own inputs like `VormInput`, which receive:

- `field`: the schema definition
- `path`: full path, e.g. `contacts[0].email`
- `modelValue`: entire formData (or parent node)
- `error`: validation message (if any)

```vue
<VormInput :field="field" :path="path" v-model="formData" :error="error" />
```

## VormInput.vue

```vue
<script setup lang="ts">
import { useVormContext } from "vorm";
import { getValueByPath, setValueByPath } from "vorm";
import type { VormFieldSchema } from "vorm";
import { computed } from "vue";

const props = defineProps<{
  field: VormFieldSchema;
  path: string;
  modelValue?: any;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const vorm = useVormContext();

const isBoundToVorm = computed(() => vorm && vorm.formData && props.path);

const model = computed({
  get() {
    if (isBoundToVorm.value) {
      return getValueByPath(vorm!.formData, props.path);
    }
    return props.modelValue;
  },
  set(val: any) {
    if (isBoundToVorm.value) {
      setValueByPath(vorm!.formData, props.path, val);
    } else {
      emit("update:modelValue", val);
    }
  },
});

const error = computed(() => {
  if (isBoundToVorm.value && vorm?.errors) return vorm.errors[props.path];
  return props.error;
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="path">{{ field.label }}</label>
    <input
      :id="path"
      :name="path"
      :type="field.type"
      class="border px-2 py-1"
      v-model="model"
    />
    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
  </div>
</template>
```

---

## Events & State

AutoVorm emits events:

- `@input`: value changed
- `@blur`: field blurred
- `@validate`: triggered validation
- `@submit`: form submit

Form state includes:

- `touched`, `dirty`, `valid`, `errors`
- `initialValue` comparison

You can trigger validation manually:

```ts
vorm.validateFieldByName("email");
vorm.validate();
```

---

## Summary

Vorm gives you full control while staying declarative and elegant. Customize deeply — or go fast with defaults. Your form, your rules.
