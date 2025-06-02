<script setup lang="ts">
import { VormProvider, AutoVorm } from "vorm/components";
import { matchField, max, useVorm, type VormSchema } from "vorm";
import { onMounted, ref } from "vue";
import VormInput from "../components/VormInput.vue";

const schema: VormSchema = [
  {
    name: "username",
    type: "text",
    label: "Username",
    validation: [{ rule: "required" }],
  },
  {
    name: "gender",
    type: "select",
    label: "Gender",
    options: ["Male", "Female", "Other"],
  },
  {
    name: "subscribe",
    type: "checkbox",
    label: "Subscribe",
  },
  {
    name: "bio",
    type: "textarea",
    label: "Short Bio",
    validation: [{ rule: "required" }, { rule: max(50) }],
    classes: {
      input: "my-input",
      outer: "my-outer",
      label: "my-label",
      help: "my-help",
    },
  },
  {
    name: "dob",
    type: "date",
    label: "Date of Birth",
    validation: [{ rule: "required" }],
  },
];

const { formData, errors, validate } = useVorm(schema); // { formData, errors, validate }

async function onSubmit() {
  if (await validate()) console.log("Form 1 valid:", formData);
  else console.log("Errors:", errors);
}

function submitEvent(e: SubmitEvent) {
  onSubmit();
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

  <AutoVorm as="form" @submit="submitEvent" containerClass="container-test">
    <template #wrapper:username="{ field, content, state }">
      <div class="flex flex-col">
        <label for="username">Username</label>
        <component :is="content()" />
        <span v-if="state.error" class="text-red-500 text-sm">{{
          state.error
        }}</span>
      </div>
    </template>

    <template #wrapper:gender="{ field, content, state }">
      <div>
        <label for="gender">Gender</label>
        <component :is="content()" />
      </div>
    </template>

    <template #wrapper:subscribe="{ field, content, state }">
      <div>
        <component :is="content()" />
        <label for="subscribe">Subscribe to newsletter</label>
      </div>
    </template>

    <!-- <template #wrapper:bio="{ field, content, state }">
      <div>
        <label for="bio">Short Bio</label>
        <component :is="content()" />
      </div>
    </template> -->

    <template #bio="{ field, state }">
      <VormInput
        :name="field.name"
        v-model="formData[field.name]"
        :label="field.label"
        placeholder="Custom Email"
      />
    </template>

    <!-- <template #wrapper:dob="{ field, content, state }">
      <div>
        <label for="dob">Date of Birth</label>
        <component :is="content()" />
      </div>
    </template> -->
    <template #after-dob>
      <button type="submit" class="bg-blue-600 text-white py-2 rounded">
        Register
      </button>
    </template>
  </AutoVorm>

  <form class="container-test">
    <div>
      <input type="text" />
    </div>
  </form>
</template>

<style>
.my-input {
  background-color: lightblue;
  border-radius: 1rem;
}

.container-test {
  max-width: 600px;
  margin: 0 auto;
  background-color: green;
  border-radius: 1rem;
  display: flex;

  align-items: center;
  flex-wrap: wrap;
}

.container-test * {
  width: 100%;
  box-sizing: border-box;
  border: none;
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

.form-grid-item {
  grid-column: span 2;
}

.form-grid-item-2 {
  grid-column: 1;
}
</style>
