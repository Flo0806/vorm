<script setup lang="ts">
import { useVormContext } from "vorm";

const props = defineProps<{
  name: string;
  placeholder?: string;
}>();

// Holt automatisch den nächsten Context
const { formData, errors } = useVormContext();
</script>

<template>
  <div>
    <input
      v-model="formData[props.name]"
      :placeholder="props.placeholder"
      :name="props.name"
      :class="{ 'error-border': errors[props.name] }"
    />
    <span v-if="errors[props.name]" class="error-message">{{
      errors[props.name]
    }}</span>
  </div>
</template>
