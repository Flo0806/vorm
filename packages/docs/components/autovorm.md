# Component: AutoVorm

`<AutoVorm>` is the central dynamic rendering component in Vorm. It automatically renders all visible fields based on the schema and current form state. It integrates layouting, validation, conditional visibility (`showIf`), slot resolution, and wrapper support — all declaratively.

## Responsibilities

AutoVorm handles:

- Field visibility (`showIf`, `only`, `excludeRepeaters`)
- Layout and structure (`grid`, `stacked`, `horizontal`)
- Validation state per field (`error`, `touched`, `dirty`, `valid`)
- Automatic rendering of `<label>`, `<input>`, error message
- Wrapper resolution and scoped slot injection (per field, grouped, or fallback)
- Reactive label/placeholder/helpText resolution

## Props

| Prop                | Type         | Description                                         |
| ------------------- | ------------ | --------------------------------------------------- |
| `layout`            | `grid`       | Enable grid layout                                  |
| `columns`           | `number`     | Only for `grid`: defines the number of columns      |
| `fieldWrapperClass` | `string`     | CSS class for field wrapper (when no slot is used)  |
| `only`              | `string[]`   | Restrict rendering to specific fields (or prefixes) |
| `excludeRepeaters`  | `boolean`    | Hides all repeater fields and their children        |
| `errorClass`        | `any`        | CSS class for fields in error state                 |
| `classes`           | `any`        | Global class definitions (optional)                 |
| `as`                | `string`     | HTML wrapper tag, e.g. `form`, `section`, `div`     |
| `containerClass`    | `string`     | CSS class for the outermost element                 |
| `containerStyle`    | `StyleValue` | Inline style for the outermost element              |

## Events

| Event      | Payload                                                 |
| ---------- | ------------------------------------------------------- |
| `submit`   | The native `SubmitEvent` (only if `as` is `form`)       |
| `input`    | `{ name, value, field, originalEvent, preventDefault }` |
| `blur`     | `{ name, value, field, originalEvent, preventDefault }` |
| `validate` | `{ name, value, field, originalEvent, preventDefault }` |

## Slot Support

AutoVorm supports a flexible slot system:

### Field Slots

Use a slot named after the field to completely override rendering:

```vue
<AutoVorm>
  <template #email="{ field, state }">
    <div class="custom-field">
      <label>{{ field.label }}</label>
      <input v-model="vorm.formData.email" />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

### Wrapper Slots

Wrapper slots let you customize the field container while keeping the default input:

- `wrapper:fieldName` - Specific field wrapper
- `wrapper:[fieldA,fieldB]` - Multi-field wrapper
- `wrapper` - Global fallback

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

Add content before or after specific fields:

- `before-fieldName`
- `after-fieldName`

```vue
<AutoVorm>
  <template #before-password>
    <div class="hint">Password requirements:</div>
  </template>
  <template #after-password>
    <div class="strength-indicator">Strength: Strong</div>
  </template>
</AutoVorm>
```

## Slot Props

Each slot receives comprehensive props for building custom fields:

### Field Slots

```ts
{
  field: ResolvedVormFieldSchema,  // Schema with resolved strings
  state: FieldState,               // Validation state
  path: string,                    // Full field path (e.g., "contacts[0].email")
  indexes: number[]                // Repeater indexes (e.g., [0, 1])
}
```

### Wrapper Slots

Wrapper slots receive all field slot props, plus:

```ts
{
  // All field slot props...
  content: () => VNode,            // Rendered input component
  modelValue: any,                 // Current field value
  'onUpdate:modelValue': (v) => void,  // Update handler
  items: Option[],                 // Resolved options (for select)
  options: Option[],               // Alias for items
  error: string | undefined,       // Error message
  errorMessages: string[]          // Array format (Vuetify style)
}
```

### Resolved Field Schema

All reactive strings (labels, placeholders, etc.) are **pre-resolved** to plain strings:

```ts
interface ResolvedVormFieldSchema {
  name: string;
  type: string;
  label: string;           // Already resolved!
  placeholder: string;     // Already resolved!
  helpText: string;        // Already resolved!
  // ... other properties
}
```

This means you can use them directly in templates:

```vue
<template #email="{ field }">
  <label>{{ field.label }}</label>  <!-- Works directly! -->
</template>
```

## Using with Third-Party Components

### Vuetify Integration

AutoVorm's wrapper slots are designed for seamless Vuetify integration:

```vue
<AutoVorm>
  <template #wrapper:country="slotProps">
    <!-- v-bind spreads all necessary props -->
    <v-select v-bind="slotProps" />
  </template>
</AutoVorm>
```

The slot props include:
- `modelValue` / `onUpdate:modelValue` - for v-model
- `items` - Vuetify's naming convention for options
- `errorMessages` - Array format Vuetify expects

### Custom Components

```vue
<AutoVorm>
  <template #wrapper:city="{ modelValue, options, 'onUpdate:modelValue': update, error }">
    <CustomSelect
      :value="modelValue"
      :options="options"
      @change="update"
    />
    <span v-if="error">{{ error }}</span>
  </template>
</AutoVorm>
```

## The `bindField()` Method

For cases where you need field bindings outside of AutoVorm, use `vorm.bindField()`:

```ts
const vorm = useVorm(schema);

// Get all bindings for a field
const countryBindings = vorm.bindField('country');
```

Returns a ComputedRef with:

```ts
{
  modelValue: any;
  'onUpdate:modelValue': (value: any) => void;
  items: Option[];           // Vuetify convention
  options: Option[];         // Generic convention
  error: string | undefined;
  errorMessages: string[];   // Vuetify convention
}
```

**Usage outside AutoVorm:**

```vue
<template>
  <v-select v-bind="vorm.bindField('country').value" />
</template>
```

## Validation State

Each field gets a reactive `FieldState`:

- `error` (`string | null`)
- `valid` (`boolean`)
- `invalid` (`boolean`)
- `validationMode` (`"onBlur"`, etc.)
- `touched` (`boolean`)
- `dirty` (`boolean`)
- `initialValue` (`any`)
- `classes` (combined CSS classes string)

## Field Visibility

AutoVorm automatically determines which fields to render based on:

- `only` → restricts to specific field names or path prefixes
- `excludeRepeaters` → skips repeaters and all nested fields
- `showIf` → per-field conditional logic (function or relative path)

## Rendering Strategy

1. If a matching **field slot** exists: use it
2. If a matching **wrapper slot** exists: use it with `content()`
3. If no slot: render `<label>`, `<input|select|textarea>`, and `<p>` (error)

## Recommendations

- Use `<AutoVorm>` when you want a fully dynamic, schema-driven form
- Combine with `wrapper` slots for layout customization
- Use `v-bind` with slot props for third-party component integration
- For advanced control, you can render manually using `VormProvider`

---

- [VormProvider](./provider.md)
- [VormRepeater](./repeater.md)
- [VormSection](./section.md)
- [Options & Custom Components](../advanced/options.md)

---

> AutoVorm is the fastest way to get a fully reactive, validated, and maintainable form rendered — with flexibility and performance built-in.
