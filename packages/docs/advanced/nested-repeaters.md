# Advanced: Nested Repeaters

Vorm fully supports deeply nested repeater structures. These allow complex form hierarchies like `contacts -> business -> emails` and so on.

## Two Ways to Render

### 1. With AutoVorm (recommended)

Use `<AutoVorm>` recursively inside the `VormRepeater` slot with `:only`:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, index }">
    <AutoVorm :only="[fullName]" :exclude-repeaters="true" />
  </template>
</VormRepeater>
```

This ensures:

- Only the fields for this repeater item are rendered.
- Nested repeaters inside are ignored unless explicitly rendered again.
- use the `default` slot to get the current fullName

To render sub-repeaters:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName }">
    <AutoVorm :only="[fullName]" :exclude-repeaters="true" />
    <VormRepeater :name="`${fullName}.business`">
      <template #default="{ fullName: subName }">
        <AutoVorm :only="[subName]" :exclude-repeaters="true" />
      </template>
    </VormRepeater>
  </template>
</VormRepeater>
```

### 2. Fully Manual (custom UI)

You can use `VormInput` and manually bind values:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, data }">
    <VormInput :field="{ name: 'email', label: 'E-Mail', type: 'email' }"
               :path="`${fullName}.email`"
               :model-value="data"
               @update:modelValue="(val) => data.email = val.email" />
  </template>
</VormRepeater>
```

---

## What Slot Props Provide

Inside a `VormRepeater` slot you get:

- `fullName`: the full indexed path like `contacts.0.business.0`
- `index`: the current index (0-based)
- `data`: the actual data object
- `indexes`: an array of all indexes, e.g. `[0, 1]`

You can use `fullName` directly as input paths or in `:only`.

---

## Relative showIf Support

When using `showIf` logic inside a nested repeater, Vorm supports relative paths like:

```ts
showIf: {
  dependsOn: "../../role",
  condition: (val) => val === "Admin",
}
```

This resolves correctly even in nested repeaters like:
`contacts[0].business[0].modLevel` → `../../role` resolves to `contacts[0].role`.

---

## Wrapper Slots in Nested Contexts

Wrapper resolution (like `wrapper:email`) still works for nested fields. The field name passed will be the **full name**, e.g. `contacts.0.business.0.email`, but matching works via:

- Exact match (rare in nested cases)
- Pattern slots: `wrapper:[email]`
- Global fallback: `wrapper`

---

> Vorm makes nested repeater rendering predictable, safe, and flexible — regardless of layout, slot use, or custom components.
