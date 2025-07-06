# Schema Definition

The schema is the heart of Vorm. It defines your form structure, field types, labels, validation, visibility rules, and more — all declaratively.

## Basic Structure

A schema is simply an array of field definitions:

```ts
const schema = [
  {
    name: "username",
    label: "Username",
    type: "text",
    validation: [{ rule: "required" }],
  },
  {
    name: "email",
    label: "E-Mail",
    type: "email",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
];
```

Each object describes one field. The `name` must be unique across the form, including nested levels.

## Field Types

Vorm supports the following field types out of the box:

- `text`
- `email`
- `password`
- `number`
- `date`
- `textarea`
- `select`
- `checkbox`
- `repeater`

You can extend this via your own components.

## Repeater Fields

`type: "repeater"` allows you to define repeatable groups of fields. Each repeater has its own `fields` array:

```ts
{
  name: "contacts",
  label: "Contacts",
  type: "repeater",
  fields: [
    { name: "name", type: "text" },
    { name: "phone", type: "text" },
  ]
}
```

Nested repeaters are fully supported.

## Conditional Visibility

You can conditionally show or hide a field using the `showIf` property:

```ts
{
  name: "adminCode",
  label: "Admin Code",
  type: "text",
  showIf: { role: "Admin" },
}
```

This field is only shown when the value of `role` is exactly `"Admin"`.

## Customization

### `classes`

Each field can define optional `classes`:

```ts
classes: {
  input: "border px-2 py-1",
  label: "text-sm text-gray-600",
  outer: "mb-4",
  help: "text-xs text-red-500"
}
```

These will be passed to the internal rendering or your own input components.

### `showError`

By default, Vorm shows validation errors. You can disable this per field:

```ts
{
  name: "info",
  label: "Info only",
  type: "text",
  showError: false
}
```

### `inheritWrapper`

This flag determines whether nested fields should inherit slot wrappers from their parent.

```ts
{
  name: "contacts",
  type: "repeater",
  fields: [
    { name: "email", type: "text", inheritWrapper: true }
  ]
}
```

This allows deeply nested fields to use higher-level slot wrappers like `wrapper:["email"]`.

## Field Paths

Fields inside repeaters are addressed using bracket notation, like:

```
contacts[0].name
contacts[1].email
```

You don't need to define these manually. Vorm builds all paths automatically from your schema.

---

- [Validation](./validation.md)
