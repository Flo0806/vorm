<script setup lang="ts">
import { VormProvider, AutoVorm } from "vorm/components";
import { matchField, useVorm, type VormSchema } from "vorm";
import { onMounted, ref } from "vue";

const schema = ref<VormSchema>([
  {
    name: "firstName",
    type: "text",
    label: "FirstName",
    validation: [{ rule: "required" }],
    classes: {
      input: "my-input",
      help: "my-help",
      outer: "form-grid-item-basic ",
    },
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [
      { rule: "required" },
      { rule: matchField("firstName"), message: "Test test" },
    ],
    validationMode: "onBlur",
  },
  {
    name: "acceptTerms",
    type: "checkbox",
    label: "I accept the terms and conditions",
    validation: [{ rule: "required", message: "You must accept the terms" }],
  },
  {
    name: "startDate",
    type: "datetime-local",
    label: "Datum:",
    validation: [{ rule: "required", message: "You must set a date" }],
  },
]);

const { formData, errors, validate } = useVorm(schema.value, { key: "test" }); // { formData, errors, validate }

async function onSubmit() {
  if (await validate()) console.log("Form 1 valid:", formData);
  else console.log("Errors:", errors);
}

function submitEvent(e: SubmitEvent) {
  e.preventDefault();
  console.log("Form submitted");
}

onMounted(() => {
  // setTimeout(() => {
  //   schema.value[0].label = "Vorname";
  //   console.log("Label changed", schema);
  // }, 3000);
});
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

  <!-- <AutoVorm :schema="schema" :showError="true"> -->
  <VormProvider context-key="test" v-model="formData">
    <AutoVorm as="form" @submit="submitEvent" layout="grid" :columns="2">
      <template #before-email>
        <div class="text-xs text-blue-700 italic mb-2">
          Bitte gib deine geschäftliche E-Mail-Adresse an.
        </div>
      </template>

      <template #wrapper:[email]="{ field, content, state }">
        <div class="p-4 border rounded form-grid-item-2" :class="state.classes">
          <label :for="field.name">Hier: {{ field.label }}</label>
          <component :is="content()" />
          <p v-if="state.error" class="text-red-500 text-xs">
            {{ state.error }}
          </p>
        </div>
      </template>
      <template #after-email>
        <button class="form-grid-item-2" @click="onSubmit" type="submit">
          Absenden
        </button>
      </template>
    </AutoVorm>
  </VormProvider>
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

.form-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 Spalten */
  gap: 1.5rem;
  padding: 2rem;
  background-color: #5a3333;
  border-radius: 1rem;
  border: 1px solid #ddd;
}

.form-grid-item-basic {
  grid-column: 1;
}

.form-grid-item-2 {
  grid-column: 1;
}
</style>
