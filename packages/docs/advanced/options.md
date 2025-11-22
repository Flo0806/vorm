# Options & Custom Components

Vorm provides powerful features for working with select fields and integrating with third-party UI libraries like Vuetify, PrimeVue, or your own custom components.

## Options in Schema

Define options directly in your field schema:

### Static Options

```ts
const schema: VormSchema = [
  {
    name: 'country',
    type: 'select',
    label: 'Country',
    options: [
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' },
      { label: 'USA', value: 'US' },
    ]
  }
];
```

### Simple String Options

For simple cases, strings work too:

```ts
{
  name: 'size',
  type: 'select',
  label: 'Size',
  options: ['Small', 'Medium', 'Large']
}
```

### Extended Option Properties

Options can contain any custom data:

```ts
{
  name: 'language',
  type: 'select',
  label: 'Language',
  options: [
    { label: 'English', value: 'en', icon: '🇬🇧', metadata: { code: 'en-US' } },
    { label: 'German', value: 'de', icon: '🇩🇪', metadata: { code: 'de-DE' } },
    { label: 'French', value: 'fr', icon: '🇫🇷', metadata: { code: 'fr-FR' } },
  ]
}
```

Access custom properties in your templates:

```vue
<template #wrapper:language="{ options }">
  <select v-model="vorm.formData.language">
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.icon }} {{ opt.label }}
    </option>
  </select>
</template>
```

## Reactive Options

Options can be reactive — they update automatically when dependencies change:

### Function-Based Options

```ts
const showAdvanced = ref(false);

const schema: VormSchema = [
  {
    name: 'city',
    type: 'select',
    label: 'City',
    options: () => {
      const base = [
        { label: 'Berlin', value: 'berlin' },
        { label: 'Munich', value: 'munich' },
      ];
      if (showAdvanced.value) {
        return [...base,
          { label: 'Frankfurt', value: 'frankfurt' },
          { label: 'Hamburg', value: 'hamburg' },
        ];
      }
      return base;
    }
  }
];
```

### Computed Options

```ts
const selectedRegion = ref('europe');

const schema: VormSchema = [
  {
    name: 'country',
    type: 'select',
    label: 'Country',
    options: computed(() => {
      if (selectedRegion.value === 'europe') {
        return [
          { label: 'Germany', value: 'DE' },
          { label: 'France', value: 'FR' },
        ];
      }
      return [
        { label: 'USA', value: 'US' },
        { label: 'Canada', value: 'CA' },
      ];
    })
  }
];
```

## ReactiveOptions Type

```ts
type ReactiveOptions =
  | Option[]                        // Static array
  | Ref<Option[]>                   // Vue Ref
  | ComputedRef<Option[]>           // Vue Computed
  | (() => Option[])                // Function
  | (() => Promise<Option[]>);      // Async function
```

## getFieldOptions()

Access resolved options programmatically:

```ts
const vorm = useVorm(schema);

// Returns ComputedRef<Option[]>
const countryOptions = vorm.getFieldOptions('country');

// Use in template
<option v-for="opt in countryOptions.value" :key="opt.value">
  {{ opt.label }}
</option>
```

## bindField()

Get all bindings needed for a field in one call:

```ts
const vorm = useVorm(schema);

const countryBindings = vorm.bindField('country');
// Returns ComputedRef<FieldBindings>
```

### Return Type

```ts
interface FieldBindings {
  modelValue: any;
  'onUpdate:modelValue': (value: any) => void;
  items: Option[];           // Vuetify naming
  options: Option[];         // Generic naming
  error: string | undefined;
  errorMessages: string[];   // Vuetify naming
}
```

### Usage

```vue
<template>
  <!-- Spread all bindings -->
  <v-select v-bind="vorm.bindField('country').value" />

  <!-- Or destructure what you need -->
  <custom-select
    :model-value="vorm.bindField('country').value.modelValue"
    :options="vorm.bindField('country').value.options"
    @update:model-value="vorm.bindField('country').value['onUpdate:modelValue']"
  />
</template>
```

## AutoVorm Slot Bindings

When using AutoVorm with wrapper slots, you get all bindings automatically:

```vue
<AutoVorm>
  <template #wrapper:country="slotProps">
    <!-- slotProps includes everything from bindField() -->
    <v-select v-bind="slotProps" />
  </template>
</AutoVorm>
```

### Available Slot Props

```ts
{
  field: ResolvedVormFieldSchema,
  state: FieldState,
  content: () => VNode,
  path: string,
  indexes: number[],
  // Plus all bindField() props:
  modelValue: any,
  'onUpdate:modelValue': (v) => void,
  items: Option[],
  options: Option[],
  error: string | undefined,
  errorMessages: string[]
}
```

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
  <template #wrapper:country="{ modelValue, options, 'onUpdate:modelValue': update, error }">
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

### Custom Components

```vue
<AutoVorm>
  <template #wrapper:tags="{ modelValue, 'onUpdate:modelValue': update }">
    <TagInput
      :tags="modelValue"
      @update:tags="update"
    />
  </template>
</AutoVorm>
```

## Backward Compatibility

The old `fieldOptionsMap` method still works:

```ts
// Via setFormData
vorm.setFormData({ country: 'DE' }, {
  fieldOptions: {
    country: [{ label: 'Germany', value: 'DE' }]
  }
});

// Via updateField
vorm.updateField('country', 'DE', {
  fieldOptions: [{ label: 'Germany', value: 'DE' }]
});
```

### Priority

Schema `options` take precedence over `fieldOptionsMap`:

1. If field has `options` in schema → use schema options
2. Otherwise → fallback to `fieldOptionsMap`

## Complete Example

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVorm, type VormSchema } from 'vorm-vue';

const selectedRegion = ref('europe');

const schema: VormSchema = [
  {
    name: 'region',
    type: 'select',
    label: 'Region',
    options: [
      { label: 'Europe', value: 'europe' },
      { label: 'Americas', value: 'americas' },
      { label: 'Asia', value: 'asia' },
    ]
  },
  {
    name: 'country',
    type: 'select',
    label: 'Country',
    options: () => {
      const regions = {
        europe: [
          { label: 'Germany', value: 'DE', flag: '🇩🇪' },
          { label: 'France', value: 'FR', flag: '🇫🇷' },
        ],
        americas: [
          { label: 'USA', value: 'US', flag: '🇺🇸' },
          { label: 'Canada', value: 'CA', flag: '🇨🇦' },
        ],
        asia: [
          { label: 'Japan', value: 'JP', flag: '🇯🇵' },
          { label: 'South Korea', value: 'KR', flag: '🇰🇷' },
        ],
      };
      return regions[vorm.formData.region] || [];
    }
  }
];

const vorm = useVorm(schema);
</script>

<template>
  <VormProvider :vorm="vorm">
    <AutoVorm>
      <template #wrapper:country="{ field, options, modelValue, 'onUpdate:modelValue': update, error }">
        <label>{{ field.label }}</label>
        <select :value="modelValue" @change="update($event.target.value)">
          <option value="">Select a country</option>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.flag }} {{ opt.label }}
          </option>
        </select>
        <span v-if="error" class="error">{{ error }}</span>
      </template>
    </AutoVorm>
  </VormProvider>
</template>
```

---

- [AutoVorm](../components/autovorm.md)
- [Schema Definition](../core/schema.md)
- [Slots & Wrappers](./slots.md)
