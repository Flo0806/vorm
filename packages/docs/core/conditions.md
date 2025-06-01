# Conditional Visibility

Vorm supports dynamic field visibility using the `showIf` property. You can use this to conditionally display fields based on values elsewhere in the form.

## Basic Usage

Use `showIf` as a function that receives the entire form:

```ts
{
  name: "adminCode",
  type: "text",
  showIf: (form) => form.role === "Admin"
}
```

This approach works well when the dependent value is on the same level.

## Relative Paths

For nested structures (like repeaters), you can use a relative path and a condition function:

```ts
{
  name: "modLevel",
  type: "number",
  showIf: {
    dependsOn: "../../role",
    condition: (value) => value === "Moderator"
  }
}
```

The path will be resolved relative to the current field. You can go up (`..`) to access parent values.

## Notes

- `showIf` only controls visibility — not validation or required state.
- You can combine `showIf` with `repeater` and deeply nested structures.
- Absolute paths are not supported; relative resolution is preferred.

---

> Conditional visibility is fully integrated into Vorm. It works in repeaters, nested sections, and with all dynamic rendering logic — no extra setup needed.
