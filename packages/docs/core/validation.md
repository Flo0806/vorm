# Validation

Vorm offers a powerful and extensible validation system supporting both built-in and custom rules. Each field in your schema can define one or more `validation` rules that are evaluated automatically based on your validation mode (e.g., `onBlur`, `onInput`, or on submit).

## Basic Usage

Validation is defined per field using the `validation` property in the schema:

```ts
{
  name: "email",
  type: "email",
  label: "E-Mail",
  validation: [
    { rule: "required" },
    { rule: "email" }
  ]
}
```

You can also define a custom error message:

```ts
{
  name: "password",
  label: "Password",
  type: "password",
  validation: [
    { rule: "required", message: "Password is required" }
  ]
}
```

## Built-in Rules

| Rule         | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| `required`   | Field must not be empty                                       |
| `email`      | Must be a valid email address                                 |
| `minLength`  | Minimum string length (use as function: `minLength(5)`)       |
| `maxLength`  | Maximum string length (use as function: `maxLength(100)`)     |
| `min`        | Minimum numeric value (use as function: `min(0)`)             |
| `max`        | Maximum numeric value (use as function: `max(100)`)           |
| `between`    | Value must be between min and max: `between(1, 10)`           |
| `matchField` | Must match another field (e.g., confirm password)             |
| `step`       | Value must align to a given step (e.g., `step(0.5)`)          |
| `pattern`    | Must match a regex pattern                                    |
| `integer`    | Must be an integer                                            |
| `url`        | Must be a valid URL                                           |
| `alpha`      | Must contain only alphabetic characters                       |

### Using Validator Functions

For validators with parameters, import and use them as functions:

```ts
import { minLength, maxLength, between, min, max, step, matchField } from 'vorm-vue';

const schema: VormSchema = [
  {
    name: "username",
    label: "Username",
    type: "text",
    validation: [
      { rule: "required" },
      { rule: minLength(3) },
      { rule: maxLength(20) }
    ]
  },
  {
    name: "age",
    label: "Age",
    type: "number",
    validation: [
      { rule: between(18, 120) }
    ]
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    validation: [
      { rule: matchField("password") }
    ]
  }
];
```

## i18n Support

All built-in validators return **i18n message keys** instead of hardcoded strings. This allows automatic translation when you change the locale.

### Built-in Message Keys

| Validator    | Key                           | Params          |
| ------------ | ----------------------------- | --------------- |
| `required`   | `vorm.validation.required`    | -               |
| `email`      | `vorm.validation.email`       | -               |
| `minLength`  | `vorm.validation.minLength`   | `[min]`         |
| `maxLength`  | `vorm.validation.maxLength`   | `[max]`         |
| `min`        | `vorm.validation.min`         | `[min]`         |
| `max`        | `vorm.validation.max`         | `[max]`         |
| `between`    | `vorm.validation.between`     | `[min, max]`    |
| `step`       | `vorm.validation.step`        | `[step]`        |
| `pattern`    | `vorm.validation.pattern`     | -               |
| `matchField` | `vorm.validation.matchField`  | `[fieldName]`   |
| `url`        | `vorm.validation.url`         | -               |
| `integer`    | `vorm.validation.integer`     | -               |
| `alpha`      | `vorm.validation.alpha`       | -               |

### Default Translations

Vorm includes built-in translations for English and German. Messages are interpolated with `{0}`, `{1}`, etc. for parameters.

### Custom i18n Messages

Override the default messages or add your own:

```ts
const vorm = useVorm(schema, {
  i18n: {
    'vorm.validation.required': 'Dieses Feld ist erforderlich',
    'vorm.validation.minLength': 'Mindestens {0} Zeichen erforderlich',
  }
});
```

See [Internationalization](../advanced/i18n.md) for more details.

## Reactive Validation Messages

Validation messages support **ReactiveString** — just like labels and placeholders:

```ts
{
  name: "age",
  validation: [{
    rule: between(18, 100),
    // Dynamic message with FormContext
    message: (ctx) => locale.value === 'en'
      ? `Age must be 18-100 (you entered: ${ctx.formData.age || 'nothing'})`
      : `Alter muss 18-100 sein (eingegeben: ${ctx.formData.age || 'nichts'})`
  }]
}
```

::: tip Language changes don't re-validate
When you change the locale, error messages update automatically **without re-running validation**. This is achieved through Vorm's two-layer error system.
:::

## Custom Functions

You can also define your own validator as a function:

```ts
{
  name: "age",
  label: "Age",
  type: "number",
  validation: [
    {
      rule: (value: string): string | null =>
        value.length >= 3 ? null : "Minimum 3 characters required"
    }
  ]
}
```

The function can return:

- `null` → valid
- a `string` → interpreted as the error message
- a `ValidationResult` → message with optional params

### ValidationResult

```ts
export interface ValidationResult {
  message: string;
  params?: (string | number)[];
}
```

## Async Validation

Async functions are supported out of the box:

```ts
{
  name: "username",
  validation: [
    {
      rule: async (val) => {
        const taken = await api.checkUsername(val);
        return taken ? "Already taken" : null;
      }
    }
  ]
}
```

> Vorm automatically detects async rules and handles them just like sync ones — no configuration needed.

## Affects: Reactive Error Mirroring

Validation rules can define an `affects` property to mirror their validation result onto other fields. This is especially useful for matching fields like email confirmation or cross-field conditions.

```ts
{
  name: "confirmEmail",
  type: "email",
  validation: [
    {
      rule: matchField("email"),
      affects: "email"
    }
  ]
},
{
  name: "email",
  type: "email"
}
```

If `confirmEmail` is invalid (e.g. does not match email), the same error will also be displayed on the email field.

You can also affect multiple fields:

```ts
{
  rule: "myRule",
  validate: (value, formData) => true,
  affects: ["fieldA", "fieldB"]
}
```

`affects` does not revalidate other fields. Instead, it propagates the same error message to the specified fields if the current rule fails.

## Controlling Validation Flow

You can control when a field is validated using `validationMode`, set globally or per field:

- `onBlur` (default)
- `onInput`
- `onSubmit`

Set globally with:

```ts
const vorm = useVorm(schema, { validationMode: "onBlur" });
```

Or per field (inside the schema):

```ts
{
  name: "email",
  label: "E-Mail",
  type: "email",
  validationMode: "onInput",
  validation: [
    { rule: "required" },
    { rule: "email" }
  ]
}
```

## Programmatic Validation

You can trigger validation manually:

```ts
const vorm = useVorm(schema);

// Validate single field
await vorm.validateFieldByName('email');

// Validate all fields (including repeater subfields)
const isValid = await vorm.validate();

// Check validity (ComputedRef - use .value in templates)
const isCurrentlyValid = vorm.isValid.value;
```

## Accessing Errors

```ts
// Get all errors
console.log(vorm.errors);  // { email: 'Invalid email', username: null }

// Get single error
console.log(vorm.errors.email);  // 'Invalid email' or null

// Get a copy of errors
const errorsCopy = vorm.getErrors();

// Clear single error
vorm.errors.email = null;

// Reset form (clears all errors and values)
vorm.resetForm();
```

## Conditional Fields and Validation

When a field has a `showIf` condition that evaluates to `false`, the field is **not validated** and won't block form submission.

```ts
const schema: VormSchema = [
  {
    name: 'role',
    type: 'select',
    options: [
      { label: 'Personal', value: 'personal' },
      { label: 'Business', value: 'business' },
    ],
  },
  {
    name: 'companyName',
    type: 'text',
    showIf: { role: 'business' },  // Only visible when role is 'business'
    validation: [{ rule: 'required' }],
  },
];
```

**Behavior:**
- When `role` is `'personal'`: `companyName` is hidden and **not validated**
- When `role` is `'business'`: `companyName` is visible and validation applies
- Errors are automatically cleared when a field becomes hidden
- `isValid` only considers visible fields

This allows you to create complex conditional forms without worrying about hidden fields blocking submission.

---

> Validation is core to Vorm's architecture. Every rule is tracked, can be programmatically triggered, and integrates seamlessly with error display, repeater logic, and slot behavior.

- [Schema Definition](./schema.md)
- [Conditional Rendering](./conditions.md)
- [Internationalization](../advanced/i18n.md)
