# Slot System

AutoVorm supports a powerful slot API that gives you complete control over field rendering while maintaining all the benefits of automatic validation and state management.

## Slot Types

### Field Slots

Replace the entire field rendering:

```vue
<AutoVorm>
  <template #email="{ field, state }">
    <div class="custom-email">
      <label>{{ field.label }}</label>
      <input v-model="vorm.formData.email" type="email" />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

### Wrapper Slots

Wrap the default input while keeping automatic rendering:

- `wrapper:fieldName` — specific field wrapper
- `wrapper:[fieldA,fieldB]` — multi-field wrapper
- `wrapper` — global fallback

```vue
<AutoVorm>
  <template #wrapper:email="{ field, state, content }">
    <div class="my-wrapper">
      <label>{{ field.label }}</label>
      <component :is="content" />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

### Before/After Slots

Add content before or after fields:

```vue
<AutoVorm>
  <template #before-password>
    <div class="hint">Password must be at least 8 characters</div>
  </template>
  <template #after-password>
    <div class="strength">Strength: Strong</div>
  </template>
</AutoVorm>
```

## Slot Props

### Field Slot Props

```ts
{
  field: ResolvedVormFieldSchema,  // Schema with resolved strings
  state: FieldState,               // Validation state
  path: string,                    // Full path (e.g., "contacts[0].email")
  indexes: number[]                // Repeater indexes
}
```

### Wrapper Slot Props

Wrapper slots receive all field props plus bindings for third-party components:

```ts
{
  // Field slot props
  field: ResolvedVormFieldSchema,
  state: FieldState,
  path: string,
  indexes: number[],
  content: () => VNode,            // Renders default input

  // Bindings for custom/third-party components
  modelValue: any,                 // Current value
  'onUpdate:modelValue': (v) => void,  // Update handler
  items: Option[],                 // Options (Vuetify naming)
  options: Option[],               // Options (generic naming)
  error: string | undefined,       // Error message
  errorMessages: string[]          // Errors as array (Vuetify)
}
```

## FieldState Interface

```ts
interface FieldState {
  error: string | null;
  valid: boolean;
  invalid: boolean;
  validationMode: 'onInput' | 'onBlur' | 'onSubmit';
  touched: boolean;
  dirty: boolean;
  initialValue: any;
  classes: string;
}
```

## ResolvedVormFieldSchema

All reactive strings are **pre-resolved** to plain strings:

```ts
interface ResolvedVormFieldSchema {
  name: string;
  type: string;
  label: string;           // Already resolved!
  placeholder: string;     // Already resolved!
  helpText: string;        // Already resolved!
  disabled: boolean;       // Already resolved!
  required: boolean;
  showError: boolean;
  classes: { /* ... */ };
  // ... other properties
}
```

## Slot Resolution Priority

AutoVorm resolves slots in this order:

1. `wrapper:fieldName` — exact wrapper match
2. `wrapper:[fieldA,fieldB]` — multi-field wrapper match
3. Inherited wrapper via `inheritWrapper: true`
4. `wrapper` — global fallback
5. Direct field slot (`#fieldName`)
6. Default rendering

## Third-Party Integration

### Vuetify

```vue
<AutoVorm>
  <template #wrapper:country="slotProps">
    <v-select
      v-bind="slotProps"
      :label="slotProps.field.label"
      variant="outlined"
    />
  </template>
</AutoVorm>
```

### PrimeVue

```vue
<AutoVorm>
  <template #wrapper:city="{ modelValue, options, 'onUpdate:modelValue': update, error }">
    <Dropdown
      :model-value="modelValue"
      :options="options"
      option-label="label"
      option-value="value"
      @update:model-value="update"
      :class="{ 'p-invalid': error }"
    />
    <small v-if="error" class="p-error">{{ error }}</small>
  </template>
</AutoVorm>
```

### Headless UI

```vue
<AutoVorm>
  <template #wrapper:status="{ modelValue, options, 'onUpdate:modelValue': update, field }">
    <Listbox :model-value="modelValue" @update:model-value="update">
      <ListboxLabel>{{ field.label }}</ListboxLabel>
      <ListboxButton>{{ modelValue || 'Select...' }}</ListboxButton>
      <ListboxOptions>
        <ListboxOption v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </ListboxOption>
      </ListboxOptions>
    </Listbox>
  </template>
</AutoVorm>
```

## Wrapper Inheritance

Enable `inheritWrapper: true` on a field to let nested fields use parent wrappers:

```ts
const schema: VormSchema = [
  {
    name: 'contacts',
    type: 'repeater',
    fields: [
      { name: 'email', type: 'email', inheritWrapper: true }
    ]
  }
];
```

Now `wrapper:email` will also apply to `contacts[0].email`, `contacts[1].email`, etc.

## Multi-Field Wrappers

Apply the same wrapper to multiple fields:

```vue
<AutoVorm>
  <template #wrapper:[email,phone,address]="{ field, state, content }">
    <div class="contact-field">
      <label>{{ field.label }}</label>
      <component :is="content" />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

## Visibility Control

AutoVorm determines visible fields based on:

- `only` — explicit field inclusion
- `excludeRepeaters` — skip repeaters and children
- `showIf` — conditional visibility in schema

## Complete Example

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm } from 'vorm-vue';

const schema: VormSchema = [
  { name: 'name', type: 'text', label: 'Name' },
  { name: 'email', type: 'email', label: 'Email' },
  {
    name: 'country',
    type: 'select',
    label: 'Country',
    options: [
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
    ]
  },
];

const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm>
      <!-- Custom wrapper for all fields -->
      <template #wrapper="{ field, state, content }">
        <div class="field-group" :class="{ 'has-error': state.error }">
          <label class="label">{{ field.label }}</label>
          <component :is="content" class="input" />
          <p v-if="state.error" class="error">{{ state.error }}</p>
          <p v-if="field.helpText" class="help">{{ field.helpText }}</p>
        </div>
      </template>

      <!-- Custom select rendering -->
      <template #wrapper:country="{ field, modelValue, options, 'onUpdate:modelValue': update }">
        <div class="field-group">
          <label>{{ field.label }}</label>
          <select :value="modelValue" @change="update($event.target.value)">
            <option value="">Select...</option>
            <option v-for="opt in options" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </template>
    </AutoVorm>
  </VormProvider>
</template>
```

---

- [AutoVorm](../components/autovorm.md)
- [Custom Inputs](./custom-inputs.md)
- [Options & Custom Components](./options.md)

---

> The slot system gives you full control over layout, structure, and styling — without losing automatic validation or schema-driven logic.
