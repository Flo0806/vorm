<script setup lang="ts">
import VormInput from "../components/VormInput.vue";
import { VormProvider } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";

const schema: VormSchema = [
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required" }],
    validationMode: "onInput",
  },
  {
    name: "username",
    type: "text",
    label: "Username",
    validation: [{ rule: "required" }],
    validationMode: "onBlur",
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    validation: [{ rule: "required" }],
    // Default onSubmit
  },
];

const { formData, errors, validate } = useVorm(schema);

async function onSubmit() {
  if (await validate()) {
    console.log("Valid data:", formData);
  } else {
    console.log("Errors:", errors);
  }
}
</script>

<template>
  <h1>🧪 Validation Mode Test (VormInput)</h1>
  <VormProvider v-model="formData">
    <VormInput name="email" placeholder="Email" />
    <VormInput name="username" placeholder="Username" />

    <div>
      <label>Password (on submit):</label>
      <input name="password" v-model="formData.password" />
    </div>

    <button @click="onSubmit">Submit</button>
  </VormProvider>
</template>
