# Custom Input Controls

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
