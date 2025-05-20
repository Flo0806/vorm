<script setup lang="ts">
import { VormProvider, AutoVorm } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";
import VormInput from "../components/VormInput.vue";

const schema: VormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const { formData, validate } = useVorm(schema); // { formData, errors, validate }

function onSubmit() {
  if (validate()) console.log("Form 1 valid:", formData);
}
</script>

<template>
  <VormProvider v-model="formData">
    <AutoVorm :schema="schema" layout="stacked">
      <template #email="{ field }">
        <VormInput :name="field.name" :placeholder="field?.label" />
      </template>
    </AutoVorm>
    <button @click="onSubmit" type="submit">Absenden</button>
  </VormProvider>

  <AutoVorm :schema="schema">
    <template #before-firstName>
      <p class="text-sm text-gray-600">
        Wir brauchen deine echte E-Mail-Adresse.
      </p>
    </template>

    <template #after-email>
      <small>⚠️ Dein Passwort muss mindestens 8 Zeichen enthalten.</small>
    </template>
  </AutoVorm>
</template>
