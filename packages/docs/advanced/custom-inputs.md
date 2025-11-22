# Custom Input Components

You can fully replace how a field is rendered using scoped slots and custom input components. This gives you complete control over markup, logic, style, and behavior.

## Using Slots

The simplest way to customize a field is with a slot:

```vue
<AutoVorm>
  <template #email="{ field, state, path }">
    <div class="custom-email">
      <label>{{ field.label }}</label>
      <input
        v-model="vorm.formData.email"
        type="email"
        :class="{ error: state.error }"
      />
      <span v-if="state.error">{{ state.error }}</span>
    </div>
  </template>
</AutoVorm>
```

## Reusable Custom Input

For reusable components, create a custom input that integrates with Vorm:

### CustomInput.vue

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useVormContext, getValueByPath, setValueByPath } from 'vorm-vue';
import type { VormFieldSchema } from 'vorm-vue';

const props = defineProps<{
  field: VormFieldSchema;
  path: string;
  modelValue?: any;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
}>();

const vorm = useVormContext();

// Check if connected to Vorm context
const isBoundToVorm = computed(() => vorm && vorm.formData && props.path);

// Reactive model that works with or without Vorm
const model = computed({
  get() {
    if (isBoundToVorm.value) {
      return getValueByPath(vorm!.formData, props.path);
    }
    return props.modelValue;
  },
  set(val: any) {
    if (isBoundToVorm.value) {
      setValueByPath(vorm!.formData, props.path, val);
    } else {
      emit('update:modelValue', val);
    }
  },
});

// Error from Vorm context or prop
const error = computed(() => {
  if (isBoundToVorm.value && vorm?.errors) {
    return vorm.errors[props.path];
  }
  return props.error;
});
</script>

<template>
  <div class="custom-input">
    <label :for="path">{{ field.label }}</label>
    <input
      :id="path"
      :name="path"
      :type="field.type"
      :placeholder="field.placeholder"
      v-model="model"
      class="input"
      :class="{ 'input-error': error }"
    />
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="field.helpText" class="help-text">{{ field.helpText }}</p>
  </div>
</template>

<style scoped>
.custom-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}
.input {
  border: 1px solid #ccc;
  padding: 0.5rem;
  border-radius: 4px;
}
.input-error {
  border-color: #ef4444;
}
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}
.help-text {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
```

### Usage

```vue
<AutoVorm>
  <template #username="{ field, state, path }">
    <CustomInput :field="field" :path="path" :error="state.error" />
  </template>
</AutoVorm>
```

## Standalone Usage

Custom inputs work outside AutoVorm too:

```vue
<template>
  <CustomInput
    :field="{ name: 'email', type: 'email', label: 'Email' }"
    path="email"
    v-model="localData"
    :error="localError"
  />
</template>
```

## Using useVormContext

Access the form context in any child component:

```vue
<script setup lang="ts">
import { useVormContext } from 'vorm-vue';
import { computed } from 'vue';

const vorm = useVormContext();

// Access any form data
const email = computed(() => vorm.formData.email);

// Access errors
const emailError = computed(() => vorm.errors.email);

// Trigger validation
function validateEmail() {
  vorm.validateFieldByName('email');
}

// Update a value
function updateEmail(value: string) {
  vorm.updateField('email', value, { validate: true });
}
</script>
```

## Using bindField()

For quick integration with custom components:

```vue
<script setup lang="ts">
import { useVorm } from 'vorm-vue';

const vorm = useVorm(schema);

// Get all bindings for a field
const emailBindings = vorm.bindField('email');
</script>

<template>
  <MyCustomInput v-bind="emailBindings.value" />
</template>
```

The bindings include:
- `modelValue` — current value
- `onUpdate:modelValue` — update handler
- `error` — error string
- `errorMessages` — error as array
- `items` / `options` — for select fields

## Path Helpers

Vorm exports utilities for working with nested paths:

```ts
import { getValueByPath, setValueByPath } from 'vorm-vue';

// Get nested value
const email = getValueByPath(formData, 'contacts[0].email');

// Set nested value
setValueByPath(formData, 'contacts[0].email', 'new@email.com');
```

## Complete Example

```vue
<script setup lang="ts">
import { useVorm, type VormSchema } from 'vorm-vue';
import { VormProvider, AutoVorm } from 'vorm-vue';
import CustomInput from './CustomInput.vue';
import CustomSelect from './CustomSelect.vue';

const schema: VormSchema = [
  {
    name: 'username',
    type: 'text',
    label: 'Username',
    validation: [{ rule: 'required' }],
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    helpText: 'We will never share your email',
    validation: [{ rule: 'required' }, { rule: 'email' }],
  },
  {
    name: 'country',
    type: 'select',
    label: 'Country',
    options: [
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
    ],
  },
];

const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm>
      <!-- Custom text input -->
      <template #username="{ field, state, path }">
        <CustomInput :field="field" :path="path" :error="state.error" />
      </template>

      <!-- Custom email input -->
      <template #email="{ field, state, path }">
        <CustomInput :field="field" :path="path" :error="state.error" />
      </template>

      <!-- Custom select using wrapper slot props -->
      <template #wrapper:country="{ field, modelValue, options, 'onUpdate:modelValue': update, error }">
        <CustomSelect
          :label="field.label"
          :options="options"
          :model-value="modelValue"
          :error="error"
          @update:model-value="update"
        />
      </template>
    </AutoVorm>
  </VormProvider>
</template>
```

---

- [Slots & Wrappers](./slots.md)
- [Options & Custom Components](./options.md)
- [AutoVorm](../components/autovorm.md)

---

> Custom inputs let you maintain your design system while leveraging Vorm's validation and state management.
