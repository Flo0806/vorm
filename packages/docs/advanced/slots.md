# Slot System

AutoVorm supports a powerful slot API:

### Wrapper Slots

- `wrapper:fieldName` — exact match
- `wrapper:[fieldA,fieldB]` — for multiple fields
- `wrapper` — fallback for all others

### Inline Field Slots

- `before-fieldName`
- `after-fieldName`

### Slot Context

Wrapper slots receive the following props:

```ts
{
  field: VormFieldSchema;
  state: FieldState;
  content: () => VNode;     // Renders the input
  path: string;             // Full field path (including repeaters)
  indexes: number[];        // E.g. [0, 1] for nested repeaters
}
```

This allows full control over how each field is rendered, while keeping reactivity and validation intact.

### Advanced: Slot and Wrapper Priorities

AutoVorm resolves slots in the following order:

1. `wrapper:fieldName`
2. `wrapper:[fieldA,fieldB]` if fieldName matches
3. Inherited wrapper via field.inheritWrapper + ancestor match (set `inheritWrapper=true` in schema field)
4. `wrapper` (global fallback)
5. Direct field slot (e.g. `#myField`)
6. Default rendering with label/input/error

This means you can globally override how fields look or provide fine-grained control for specific fields.

### Slots vs. Auto Layout

If you provide a slot for a field, AutoVorm won't render a label or error message unless you do it manually. This gives you complete design freedom.

### Example with Wrapper Slot

```vue
<template #wrapper:email="{ field, state, content }">
  <div class="my-wrapper">
    <label>{{ field.label }}</label>
    <div class="input-area">
      <component :is="content()" />
    </div>
    <p v-if="state.error">{{ state.error }}</p>
  </div>
</template>
```

---

> The slot system in Vorm is designed to give you full power over layout, structure, styling, and interaction — without losing the benefits of auto-validation or schema-driven logic.

## Field State

Each field in AutoVorm receives a derived state object containing:

- `slotName` (string: e.g. wrapper:notes)
- `state` (FieldState)\*
- `field` (VormFieldSchema)\*
- `indexes` (Repeater indexes)\*
- `path` (string: e.g. notes)

### Interfaces

```ts
interface FieldState {
  error: string | null;
  valid: boolean;
  invalid: boolean;
  validationMode: "onInput" | "onBlur" | "onSubmit";
  classes: string;
  touched: boolean;
  dirty: boolean;
  initialValue: any;
}

interface VormFieldSchema {
  name: string;
  type:
    | "text"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "date"
    | "datetime"
    | "email"
    | "password"
    | string; // Custom types can be added
  required?: boolean;
  disabled?: boolean;
  label?: string;
  showError?: boolean;
  placeholder?: string;
  helpText?: string;
  showIf?: ShowIfCondition;
  validation?: ValidationRule[];
  validationMode?: ValidationMode;
  classes?: {
    outer?: string;
    input?: string;
    label?: string;
    help?: string;
  };
  fields?: VormSchema;
  inheritWrapper?: boolean;
}

export type ShowIfCondition =
  | Record<string, any>
  | ((formData: Record<string, any>, path: string) => boolean)
  | {
      dependsOn: string;
      condition: (
        value: any,
        formData: Record<string, any>,
        path: string
      ) => boolean;
    };

// Repeater indexes like:
{
    contacts: 1
    ....
}
```

## Visibility

AutoVorm determines visible fields based on:

- `only` (explicit inclusion)
- `excludeRepeaters` (removes repeaters + nested children)
- `showIf` condition in the schema (function or relative path)

## Rendering Logic

- If wrapper slot is found → rendered with full slot context
- If field-specific slot exists → used directly
- If neither → default `<label>`, `<input|select|textarea>`, `<p>` (error) will be rendered

## Custom Inputs

You can fully replace how a field is rendered using a scoped slot and a custom input component. This gives you complete control over markup, logic, style, and behavior.

### Example Usage

```vue
<template #notes="{ field, state, path }">
  <VormInput
    :field="field"
    :path="path"
    v-model="formData"
    :error="state.error"
  />
</template>
```

### Example Implementation (`VormInput.vue`)

```vue
<script setup lang="ts">
import { useVormContext } from "vorm";
import { getValueByPath, setValueByPath } from "vorm";
import type { VormFieldSchema } from "vorm";
import { computed } from "vue";

const props = defineProps<{
  field: VormFieldSchema;
  path: string;
  modelValue?: any;
  error?: string | null;
}>();
const emit = defineEmits<{ (e: "update:modelValue", value: any): void }>();
const vorm = useVormContext();

const isBoundToVorm = computed(() => vorm && vorm.formData && props.path);

const model = computed({
  get() {
    return isBoundToVorm.value
      ? getValueByPath(vorm!.formData, props.path)
      : props.modelValue;
  },
  set(val: any) {
    if (isBoundToVorm.value) {
      setValueByPath(vorm!.formData, props.path, val);
    } else {
      emit("update:modelValue", val);
    }
  },
});

const error = computed(() =>
  isBoundToVorm.value && vorm?.errors ? vorm.errors[props.path] : props.error
);
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="path">{{ field.label }}</label>
    <input
      :id="path"
      :name="path"
      :type="field.type"
      class="border px-2 py-1"
      v-model="model"
    />
    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
  </div>
</template>
```

---

> AutoVorm is the fastest way to create a reactive, validated, schema-driven form — with a powerful slot system that enables full customization.
