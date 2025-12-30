# Form State API

Vorm provides full access to the internal form state through the `useVorm()` composable. It returns a powerful context object with reactive values and methods to interact with your form.

## Basic Setup

```ts
import { useVorm, type VormSchema } from 'vorm-vue';

const schema: VormSchema = [/* ... */];

const vorm = useVorm(schema, {
  validationMode: 'onBlur'  // 'onBlur' | 'onInput' | 'onSubmit'
});
```

## Reactive State

### Form Data

```ts
vorm.formData          // Reactive form values
vorm.errors            // Error messages per field (string | null)
vorm.touched           // Whether field has been touched
vorm.dirty             // Whether field value has changed
vorm.initial           // Initial values at time of setFormData
vorm.validatedFields   // Which fields have been validated
```

### Computed State

```ts
vorm.isValid           // ComputedRef<boolean> - all validated fields pass
vorm.isDirty           // ComputedRef<boolean> - any field is dirty
vorm.isTouched         // ComputedRef<boolean> - any field is touched
```

::: warning ComputedRef in Templates
These are `ComputedRef` values, not plain booleans. In templates you need `.value`:

```vue
<!-- Option 1: Use .value -->
<button :disabled="!vorm.isValid.value">Submit</button>

<!-- Option 2: Destructure for auto-unwrapping -->
<script setup>
const { isValid } = vorm
</script>
<button :disabled="!isValid">Submit</button>
```

This is standard Vue behavior for composables returning refs in objects (same as VueUse, TanStack Query, etc.).
:::

## Validation Methods

### `validate()`

Validates all fields including repeater subfields. Returns `true` if all pass:

```ts
async function handleSubmit() {
  const isValid = await vorm.validate();
  if (isValid) {
    // Submit form
  }
}
```

### `validateFieldByName(name)`

Validates a single field:

```ts
await vorm.validateFieldByName('email');
```

### `getValidationMode(name)`

Returns the validation trigger for a field:

```ts
vorm.getValidationMode('email');  // 'onBlur' | 'onInput' | 'onSubmit'
```

## Update Methods

### `updateField(name, value, options?)`

Updates a single field with options:

```ts
vorm.updateField('role', 'Admin', {
  touched: true,
  dirty: true,
  validate: true,
  fieldOptions: [
    { label: 'User', value: 'User' },
    { label: 'Admin', value: 'Admin' },
  ],
});
```

### `updateFields(updates, options?)`

Update multiple fields at once:

```ts
vorm.updateFields(
  { role: 'Admin', username: 'flo' },
  {
    touched: true,
    validate: true,
    fieldOptions: {
      role: [
        { label: 'User', value: 'User' },
        { label: 'Admin', value: 'Admin' },
      ],
    },
  }
);
```

### `setFormData(data, options?)`

Replace entire form data and reset state:

```ts
vorm.setFormData(
  { username: 'flo', role: 'Moderator' },
  {
    fieldOptions: {
      role: [
        { label: 'User', value: 'User' },
        { label: 'Moderator', value: 'Moderator' },
      ],
    },
  }
);
```

### `resetForm()`

Clears all values, errors, and state:

```ts
vorm.resetForm();
```

## Error Methods

### `getErrors()`

Returns a copy of current errors:

```ts
const errors = vorm.getErrors();
```

### Clearing Errors

To clear errors, set them directly on the `errors` object:

```ts
// Clear single error
vorm.errors.email = null;

// Clear all errors
Object.keys(vorm.errors).forEach(key => {
  vorm.errors[key] = null;
});

// Or use resetForm() to reset everything
vorm.resetForm();
```

## Options Methods

### `getFieldOptions(name)`

Returns resolved options for a select field:

```ts
const options = vorm.getFieldOptions('country');
// Returns ComputedRef<Option[]>
```

### `bindField(name)`

Returns all bindings needed for custom components:

```ts
const bindings = vorm.bindField('country');
// Returns ComputedRef<{
//   modelValue: any;
//   'onUpdate:modelValue': (v) => void;
//   items: Option[];
//   options: Option[];
//   error: string | undefined;
//   errorMessages: string[];
// }>
```

Usage with Vuetify:

```vue
<v-select v-bind="vorm.bindField('country').value" />
```

## Repeater Methods

### `addRepeaterItem(path, item, index?)`

Add item to repeater. The `item` parameter is **required**:

```ts
// Add with initial data structure (recommended)
vorm.addRepeaterItem('contacts', { name: '', email: '' });

// Add empty object
vorm.addRepeaterItem('contacts', {});

// Insert at specific index
vorm.addRepeaterItem('contacts', { name: '' }, 0);
```

::: warning Required Parameter
Unlike some form libraries, `item` is **required**. Always pass at least an empty object `{}`.
:::

### `removeRepeaterItem(path, index)`

Remove item by index:

```ts
vorm.removeRepeaterItem('contacts', 2);
```

### `moveRepeaterItem(path, from, to)`

Reorder repeater items:

```ts
vorm.moveRepeaterItem('contacts', 0, 2);  // Move first to third position
```

### `clearRepeater(path)`

Empty the repeater:

```ts
vorm.clearRepeater('contacts');
```

## Utility Methods

### `touchAll()`

Marks all fields as touched:

```ts
vorm.touchAll();
```

### `getTouched()` / `getDirty()`

Returns copies of state maps:

```ts
const touchedFields = vorm.getTouched();
const dirtyFields = vorm.getDirty();
```

## Complete Example

```vue
<script setup lang="ts">
import { useVorm, type VormSchema, minLength } from 'vorm-vue';
import { VormProvider, AutoVorm } from 'vorm-vue';

const schema: VormSchema = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    validation: [{ rule: 'required' }, { rule: 'email' }],
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    validation: [{ rule: 'required' }, { rule: minLength(8) }],
  },
];

const vorm = useVorm(schema, { validationMode: 'onBlur' });

async function handleSubmit() {
  const isValid = await vorm.validate();
  if (isValid) {
    console.log('Submitting:', vorm.formData);
  }
}

function handleReset() {
  vorm.resetForm();
}
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm as="form" @submit="handleSubmit">
      <div class="buttons">
        <button type="submit" :disabled="!vorm.isValid.value">Submit</button>
        <button type="button" @click="handleReset">Reset</button>
      </div>
    </AutoVorm>
  </VormProvider>

  <!-- Debug info -->
  <pre>{{ { isValid: vorm.isValid.value, isDirty: vorm.isDirty.value } }}</pre>
</template>
```

---

> The `useVorm()` context is your gateway to dynamic form behavior, programmatic control, and granular state access.
