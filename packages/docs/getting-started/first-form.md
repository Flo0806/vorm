# Your First Form

Let’s build your first form with Vorm. It’s just a few lines of code away — and you’ll immediately see the power of schema-driven forms in action.

---

## Step 1: Set up your schema

```ts
const schema: VormSchema = [
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    validation: [{ rule: "required" }],
  },
  { name: "remember", type: "checkbox", label: "Remember me" },
];
```

---

## Step 2: Provide the Vorm context

```vue
<script setup lang="ts">
import { VormProvider, AutoVorm } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";

const schema: VormSchema = [
  /* ...as above */
];
const { formData, validate } = useVorm(schema);

function submit() {
  const valid = validate();
  if (valid) alert("✅ Valid!" + JSON.stringify(formData));
}
</script>
```

---

## Step 3: Render the form

```vue
<template>
  <AutoVorm />
  <button @click="submit">Submit</button>
</template>
```

---

## That’s it!

You just built a fully validated, reactive form with one component and **zero manual wiring**.

Vorm automatically renders fields based on the schema, tracks their state (touched, dirty, valid), and handles validation for you.

Want more control? Read next:

- [Custom Inputs](../advanced/custom-inputs.md)
- [Field Slots](../advanced/slots.md)
- [Validation Rules](../core/validation.md)
