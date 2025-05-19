<script setup lang="ts">
import { VormProvider, AutoVorm } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";
import VormInput from "../components/VormInput.vue";

const schema: VormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const { formData, errors, validate } = useVorm(schema);

function onSubmit() {
  if (validate()) console.log("Form 1 valid:", formData);
}
</script>

<template>
  <VormProvider v-model="formData">
    <AutoVorm :schema="schema" layout="stacked">
      <template #email2="{ field }">
        <VormInput :name="field.name" :placeholder="field?.label" />
      </template>
    </AutoVorm>
    <button @click="onSubmit" type="submit">Absenden</button>
  </VormProvider>
</template>
