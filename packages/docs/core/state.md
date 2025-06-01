# Form State API

Vorm provides full access to the internal form state through the `useVorm()` composable. It returns a powerful context object with reactive values and methods to interact with your form.

## Basic Setup

```ts
const {
  formData,
  errors,
  touched,
  dirty,
  initial,
  validatedFields,
  fieldOptionsMap,
  updateField,
  updateFields,
  setFormData,
  resetForm,
  validate,
  validateFieldByName,
  getValidationMode,
  addRepeaterItem,
  removeRepeaterItem,
  moveRepeaterItem,
  clearRepeater,
  touchAll,
  getErrors,
  getTouched,
  getDirty,
} = useVorm(schema, { validationMode: "onSubmit" });
```

## State Fields

- `formData`: reactive form values
- `errors`: error messages per field (null if no error)
- `touched`: whether a field has been touched
- `dirty`: whether a field's value has changed
- `initial`: initial values at time of `setFormData`
- `validatedFields`: tracks which fields have been validated
- `fieldOptionsMap`: dynamically injected options for select/radio fields

## Core Methods

### `updateField(name, value, options?)`

Updates a single field. You can mark it as touched, dirty, trigger validation, and assign new options:

```ts
updateField("role", "Admin", {
  touched: true,
  dirty: true,
  validate: true,
  fieldOptions: [
    { label: "User", value: "User" },
    { label: "Admin", value: "Admin" },
  ],
});
```

### `updateFields(updates, options?)`

Update multiple fields at once. Options like `touched`, `dirty`, and `validate` apply to all, while `fieldOptions` can be set per field:

```ts
updateFields(
  { role: "Admin", username: "flo" },
  {
    touched: true,
    validate: true,
    fieldOptions: {
      role: [
        { label: "User", value: "User" },
        { label: "Admin", value: "Admin" },
      ],
    },
  }
);
```

### `setFormData(data, options?)`

Replace the entire form data and reset internal state. Optionally pass `fieldOptions` per field:

```ts
setFormData(
  {
    username: "flo",
    role: "Moderator",
  },
  {
    fieldOptions: {
      role: [
        { label: "User", value: "User" },
        { label: "Moderator", value: "Moderator" },
      ],
    },
  }
);
```

### `resetForm()`

Clears all values, errors, touched/dirty states. Resets to default values based on field types.

### `validate()`

Validates all fields. Updates errors, marks fields as touched and validated. Returns `true` if all pass:

```ts
const ok = await validate();
```

### `validateFieldByName(name)`

Validates a single field. Updates its error state.

### `getValidationMode(name)`

Returns the validation trigger for the field: `onBlur`, `onInput`, or `onSubmit`.

## Repeater Helpers

- `addRepeaterItem(path, item, index?)`: Insert item (default to end)
- `removeRepeaterItem(path, index)`: Remove item by index
- `moveRepeaterItem(path, from, to)`: Reorder repeater array
- `clearRepeater(path)`: Empties the repeater

## Utilities

- `touchAll()`: Marks all fields as touched
- `getErrors()`: Returns a copy of current errors
- `getTouched()`: Returns touched map
- `getDirty()`: Returns dirty map

---

> The returned context from `useVorm` is your gateway to dynamic form behavior, programmatic control, and granular state access.

You can bind it to `<VormProvider>` with `v-model="formData"` to keep it reactive across components.
