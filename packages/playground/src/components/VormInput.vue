<script setup lang="ts">
import { useFormContext } from "vorm";

const props = defineProps<{
  name: string;
  placeholder?: string;
  contextKey: symbol;
}>();

const { formData, errors } = useFormContext(props.contextKey);
console.log("Form data:", formData);
</script>

<template>
  <div>
    <input v-model="formData[props.name]" :placeholder="props.placeholder" />
    <div v-if="errors[props.name]" class="text-red-500">
      {{ errors[props.name] }}
    </div>
  </div>
</template>
