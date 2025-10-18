# Vorm

**The intuitive form engine for Vue 3 — dynamic, schema-driven, fully validated.**

**Also available as [Nuxt module](https://npmjs.com/package/vorm-nuxt) for seamless Nuxt integration**

![npm](https://img.shields.io/npm/v/vorm-vue)
![License](https://img.shields.io/github/license/flo0806/vorm?cacheBust=1)
![Vue 3](https://img.shields.io/badge/vue-3.x-brightgreen)

---

Vorm is a powerful form library for Vue 3 that lets you define your entire form using a schema. With built-in validation, conditional logic, repeater support and full slot control, it gives you everything you need — without boilerplate.

---

## 🚀 Features

- ✅ **Schema-driven** form generation
- 🛡 **Built-in validation** (sync & async)
- 🔁 **Repeater fields** with nesting support
- 🎭 **Conditional fields** (`showIf`)
- 🎨 **Fully customizable** via slots and wrapper logic
- 💡 **Minimal API surface**, fully typed
- 🧩 **Vue 3 Composition API** with `<script setup>`
- ⚡ **Performance-optimized** — only validates touched/visible fields

---

## ✨ Example

```vue
<script setup lang="ts">
import { AutoVorm, VormProvider, VormSection } from "vorm-vue/components";
import { useVorm, type VormSchema } from "vorm-vue";

const schema: VormSchema = [
  {
    name: "username",
    label: "Username",
    type: "text",
    validation: [{ rule: "required" }],
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    validation: [{ rule: "required" }],
  },
  { name: "notes", label: "Notes", type: "textarea" },
  {
    name: "role",
    label: "Role",
    type: "select",
    validation: [{ rule: "required" }],
  },
  {
    name: "adminCode",
    label: "Admin Code",
    type: "text",
    showIf: { role: "Admin" },
  },
  {
    name: "tos",
    label: "Accept terms",
    type: "checkbox",
    validation: [{ rule: "required" }],
  },
];

const { formData, validate, resetForm, updateField } = useVorm(schema, {
  validationMode: "onInput",
});

function submit() {
  const ok = validate();
  console.log("✅ Valid:", ok);
  console.log("📦 Data:", JSON.stringify(formData));
}
</script>

<template>
  <VormSection title="Register">
    <AutoVorm layout="grid" :columns="2" />
  </VormSection>
  <button @click="submit">Submit</button>
</template>
```

---

## 📚 Documentation

Full documentation (including advanced examples, slot usage, nested repeaters, and async validation):

👉 [https://vorm.fh-softdev.de](https://vorm.fh-softdev.de)

---

## 📦 Installation

```bash
npm install vorm-vue
```

Or using pnpm:

```bash
pnpm add vorm-vue
```

## 🛝 Playground and Live Examples

- [Basic Example](https://stackblitz.com/edit/vitejs-vite-vexqxvur)
- [Dynamic Layouts](https://stackblitz.com/edit/vitejs-vite-fj6nyh4z)
- [Real World Example](https://stackblitz.com/edit/vitejs-vite-pdfe4po5)

---

## 🔗 License

MIT © [FH SoftDev - Flo0806](https://github.com/flo0806)
