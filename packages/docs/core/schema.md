# Schema Definition

The schema is the heart of Vorm. It defines your form structure, field types, labels, validation, visibility rules, and more — all declaratively.

## Basic Structure

A schema is simply an array of field definitions:

```ts
const schema: VormSchema = [
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

## Reactive Labels, Placeholders & Help Text

All text properties in Vorm support **reactive values**. This means you can use:

- Static strings
- Vue `Ref<string>` or `ComputedRef<string>`
- Functions `() => string`
- Functions with form context `(ctx: FormContext) => string`

### ReactiveString Type

```ts
type ReactiveString =
  | string                              // Static: "Username"
  | Ref<string>                         // Vue Ref: ref('Username')
  | ComputedRef<string>                 // Vue Computed
  | (() => string)                      // Function (no computed needed!)
  | ((ctx: FormContext) => string);     // Function with form context
```

### Examples

**Simple reactive label (i18n):**

```ts
{
  name: 'username',
  label: () => locale.value === 'en' ? 'Username' : 'Benutzername',
}
```

**Dynamic placeholder based on form data:**

```ts
{
  name: 'email',
  placeholder: (ctx) => ctx.formData.username
    ? `${ctx.formData.username}@example.com`
    : 'your@email.com',
}
```

**Dynamic help text:**

```ts
{
  name: 'password',
  helpText: (ctx) => ctx.formData.email
    ? `Secure password for ${ctx.formData.email}`
    : 'At least 8 characters',
}
```

::: tip No `computed()` wrapper needed!
Unlike other libraries, Vorm accepts plain functions. You don't need to wrap everything in `computed()`:

```ts
// This works!
label: () => t('form.username')

// This also works (but unnecessary)
label: computed(() => t('form.username'))
```
:::

## FormContext

When using functions with a `ctx` parameter, you get access to the full form state:

```ts
interface FormContext {
  formData: Record<string, any>;
  readonly errors: Record<string, string | null>;
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly isTouched: boolean;
  readonly touched: Record<string, boolean>;
  readonly dirty: Record<string, boolean>;
}
```

## Field Options

For `select` fields, you can define options directly in the schema:

### Static Options

```ts
{
  name: 'country',
  type: 'select',
  label: 'Country',
  options: [
    { label: 'Germany', value: 'DE' },
    { label: 'USA', value: 'US' },
  ]
}
```

### Reactive Options

Options can also be reactive:

```ts
const showAdvanced = ref(false);

const schema: VormSchema = [
  {
    name: 'city',
    type: 'select',
    label: 'City',
    options: () => {
      const base = ['Berlin', 'Munich'];
      return showAdvanced.value ? [...base, 'Frankfurt', 'Cologne'] : base;
    }
  }
];
```

### Extended Option Properties

Options support custom data via index signature:

```ts
{
  name: 'language',
  type: 'select',
  label: 'Language',
  options: [
    { label: 'English', value: 'en', icon: '🇬🇧', metadata: { code: 'en-US' } },
    { label: 'German', value: 'de', icon: '🇩🇪', metadata: { code: 'de-DE' } },
  ]
}
```

See [Options & Custom Components](../advanced/options.md) for more details.

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

See [Conditional Logic](./conditions.md) for more details.

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
- [Conditional Logic](./conditions.md)
- [Options & Custom Components](../advanced/options.md)
