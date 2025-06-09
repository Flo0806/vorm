# Component: VormRepeater

`<VormRepeater>` is a flexible utility component in Vorm designed to iterate over any repeater field in your form schema. It renders a list of children and exposes useful props like `fullName`, `index`, and `data` for every item.

> ⚠️ `VormRepeater` must be used **within a VormProvider or AutoVorm context** and **only for fields of type `repeater`**.

---

## Basic Usage

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName }">
    <AutoVorm :only="[fullName]" :exclude-repeaters="true"> </AutoVorm>
  </template>
</VormRepeater>
```

---

## Props

| Prop | Type     | Description                                  |
| ---- | -------- | -------------------------------------------- |
| name | `string` | The path to the repeater field in the schema |

---

## Slot API

The default slot exposes the following values per repeater item:

```ts
interface SlotProps {
  fullName: string; // e.g. "contacts[0]"
  index: number; // current index
  data: any; // reference to formData entry (reactive)
  indexes: number[]; // array of nesting indexes (e.g. [0, 1])
}
```

---

## Combined with AutoVorm

Use `<AutoVorm>` inside a repeater template to automatically render nested fields.

```vue
<VormRepeater name="contacts.business">
  <template #default="{ fullName, index }">
    <AutoVorm :only="[fullName]" :exclude-repeaters="true">
      <template #[`after-${fullName}.email`]>
        <button @click="removeBusiness(index)">Remove</button>
      </template>
    </AutoVorm>
  </template>
</VormRepeater>
```

---

## Manual Field Composition

You can also manually render all inputs:

```vue
<VormRepeater name="contacts">
  <template #default="{ fullName, index, data }">
    <VormInput
      :field="{ name: 'name', label: 'Name', type: 'text' }"
      :path="`${fullName}.name`"
      :model-value="data"
      @update:modelValue="(val) => (data.name = val.name)"
    />
    <button @click="removeContact(index)">Remove</button>
  </template>
</VormRepeater>
```

### VormInput Component

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

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const vorm = useVormContext();

const isBoundToVorm = computed(() => vorm && vorm.formData && props.path);

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
      emit("update:modelValue", val);
    }
  },
});

const error = computed(() => {
  if (isBoundToVorm.value && vorm?.errors) return vorm.errors[props.path];
  return props.error;
});
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

## Tips

- `VormRepeater` automatically watches the array and updates slot contents when items change
- The `data` object is reactive and synced to the formData
- The `fullName` helps to reference nested names inside AutoVorm or VormInput
- Use `excludeRepeaters` on inner AutoVorm to prevent infinite loops

---

- [Custom Inputs](../advanced/custom-inputs)

---

> VormRepeater is essential for handling dynamic, nested arrays of form data. It offers full control and plays nicely with both AutoVorm and manual rendering.
