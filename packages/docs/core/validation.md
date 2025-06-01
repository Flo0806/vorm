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
| `min`        | Minimum numeric or string length (use with `value`)           |
| `max`        | Maximum numeric or string length (use with `value`)           |
| `between`    | Value must be between min and max (use with `min` and `max`)  |
| `matchField` | Must match another field (e.g., confirm password)             |
| `step`       | Value must align to a given step (e.g., for numbers like 0.5) |
| `integer`    | Must be an integer                                            |
| `url`        | Must be a valid URL                                           |
| `alpha`      | Must contain only alphabetic characters                       |

## Custom Functions

You can also define your own validator as a function:

```ts
{
  name: "age",
  label: "Age",
  type: "number",
  validation: [
    {
      rule: (value: string): string | null => value.length >= 3 ? null : "Custom maxLength validator"
    }
  ]
}
```

The function can return:

- `null` → valid
- a `string` → interpreted as the error message
- a `ValidationResult` → interpreted as the error message

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

> ✅ Vorm automatically detects async rules and handles them just like sync ones — no configuration needed.

## Affects: Reactive Error Mirroring

Validation rules can define an affects property to mirror their validation result onto other fields. This is especially useful for matching fields like email confirmation or cross-field conditions.

```ts
{
  name: "confirmEmail",
  type: "email",
  validation: [
    {
      rule: "matchField",
      args: { field: "email" },
      affects: "email"
    }
  ]
},
{
  name: "email",
  type: "email"
}
```

If confirmEmail is invalid (e.g. does not match email), the same error will also be displayed on the email field.

You can also affect multiple fields:

```ts
{
  rule: "myRule",
  validate: (value, formData) => true,
  affects: ["fieldA", "fieldB"]
}
```

✅ Affects does not revalidate other fields. Instead, it propagates the same error message to the specified fields if the current rule fails.

## Controlling Validation Flow

You can control when a field is validated using `validationMode`, set globally or per field:

- `onBlur` (default)
- `onInput`
- `onSubmit`

Set globally with:

```ts
const { setValidationMode } = useVorm(schema, { validationMode: "onBlur" });
```

Or per field (inside the schema):

```ts
{
  name: "email",
  label: "E-Mail-Adresse",
  type: "email",
  validationMode: "onInput",
  validation: [
    { rule: "required" },
    { rule: "email" }
  ]
}
```

---

> Validation is core to Vorm’s architecture. Every rule is tracked, can be programmatically triggered, and integrates seamlessly with error display, repeater logic, and slot behavior.
