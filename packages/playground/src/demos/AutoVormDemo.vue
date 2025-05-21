<script setup lang="ts">
import { VormProvider, AutoVorm } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";
import VormInput from "../components/VormInput.vue";

const schema: VormSchema = [
  {
    name: "firstName",
    type: "text",
    label: "First Name",
    validation: [{ rule: "required" }],
    classes: {
      input: "my-input",
      help: "my-help",
      outer: "my-outer",
    },
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required" }],
    validationMode: "onBlur",
  },
];

const { formData, errors, validate } = useVorm(schema); // { formData, errors, validate }

function onSubmit() {
  if (validate()) console.log("Form 1 valid:", formData);
  else console.log("Errors:", errors);
}
</script>

<template>
  <!-- <VormProvider v-model="formData">
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
  </AutoVorm> -->

  <AutoVorm :schema="schema" :showError="true">
    <template #before-email>
      <p class="text-xs text-blue-700 italic mb-2">
        Bitte gib deine geschäftliche E-Mail-Adresse an.
      </p>
    </template>
    <template #wrapper:[email]="{ field, content, state }">
      <div class="p-4 border rounded" :class="state.classes">
        <label :for="field.name">Hier: {{ field.label }}</label>
        <component :is="content()" />
        <p v-if="state.error" class="text-red-500 text-xs">{{ state.error }}</p>
      </div>
    </template>
  </AutoVorm>
  <button @click="onSubmit" type="submit">Absenden</button>
</template>

<style>
label {
  font-weight: bold;
}

.my-button {
  background-color: green;
  border-radius: 1rem;
}

.my-input {
  background-color: pink;
  border-radius: 1rem;
}

.my-outer {
  background-color: red;
  border-radius: 1rem;
}

.my-label {
  background-color: yellow;
  border-radius: 1rem;
}

.my-help {
  background-color: green;
  border-radius: 1rem;
}

.vorm-invalida {
  border: 1px solid red !important;
}
</style>
