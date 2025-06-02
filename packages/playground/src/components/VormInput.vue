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
