# Component: VormProvider

`<VormProvider>` is the context bridge component in Vorm. It connects a schema and all form state to its children and enables them to access, modify, and validate fields.

It is required for any Vorm input, repeater, or section component to function.

---

## Purpose

- Injects `useVorm()` context to its children.
- Provides access to `formData`, `errors`, `touched`, `dirty`, `initial`, `validate`, etc.
- Allows nesting (each instance can provide a different schema segment).
- Enables scoped field rendering via `only` prop.

---

## Props

| Prop         | Type                 | Description                                           |
| ------------ | -------------------- | ----------------------------------------------------- |
| `contextKey` | `symbol` or `string` | A custom context key. Needed if using multple schemas |

---

## Slots

The default slot will render all children within the Vorm context. These children can use `<AutoVorm>`, or custom components that consume the context via `useVormContext()`.

---

## Example

```ts
const contextKey1 = Symbol("Form1");
const contextKey2 = Symbol("Form2");

const schema1: VormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const schema2: VormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const { formData, validate } = useVorm(schema1, { key: contextKey1 });
```

```vue
<VormProvider :contextKey="contextKey1">
  <AutoVorm layout="grid" :columns="2" />
</VormProvider>
```

---

## Notes

- `VormProvider` does not render any form fields itself. Use it in combination with `AutoVorm`, `VormRepeater`, etc.
- You can nest providers to isolate parts of your form or switch schemas in-place.
- Every `VormProvider` registers itself via injection and re-provides the context.
- `AutoVorm` itself don't need `VormProvider` for working. Only for multiple schema using you should use `VormProvider` around `AutoVorm`.

---

> VormProvider is essential infrastructure. It’s invisible in the UI, but it powers all dynamic behavior in Vorm forms.
