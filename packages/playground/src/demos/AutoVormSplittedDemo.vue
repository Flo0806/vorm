<script setup lang="ts">
import { useVorm, type VormSchema } from "vorm";
import { VormProvider, AutoVorm, VormSection } from "vorm/components";

const schema: VormSchema = [
  { name: "firstName", label: "Vorname", type: "text" },
  { name: "email", label: "E-Mail", type: "email" },
  { name: "password", label: "Passwort", type: "password" },
];

const { formData, validate } = useVorm(schema);

function onSubmit() {
  if (validate()) {
    console.log("Valid!", formData);
  }
}
</script>

<template>
  <VormProvider v-model="formData" :schema="schema">
    <div style="background-color: green; padding: 1rem">
      <AutoVorm :only="['firstName', 'email']" layout="stacked" />
    </div>

    <VormSection title="Sicherheit">
      <AutoVorm :only="['password']" layout="stacked" />
    </VormSection>

    <button @click="onSubmit">Absenden</button>
  </VormProvider>
</template>
