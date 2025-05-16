<script setup lang="ts">
import VormInput from "./components/VormInput.vue";
import { useVorm, type FormSchema } from "vorm";
import { VormProvider } from "vorm/components";

const contextKey1 = Symbol("Form1");
const contextKey2 = Symbol("Form2");

const schema: FormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required", message: "Email required" }],
  },
];

const schema2: FormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required", message: "Email required" }],
  },
];

const { formData, errors, validate } = useVorm(schema, {
  key: contextKey1,
});

const test2 = useVorm(schema2, { key: contextKey2 });

function onSubmit() {
  if (validate()) {
    console.log("Valid data:", formData);
  } else {
    console.log("Errors:", errors);
  }

  if (test2.validate()) {
    console.log("Valid data:", test2.formData);
  } else {
    console.log("Errors:", test2.errors);
  }
}
</script>

<template>
  <VormProvider :contextKey="contextKey1" v-model="formData">
    <input v-model="formData.firstName" placeholder="First Name" />
    <VormInput :contextKey="contextKey1" name="email" placeholder="Email" />
    <button @click="onSubmit">Submit</button>
  </VormProvider>

  <VormProvider :contextKey="contextKey2" v-model="test2.formData">
    <input v-model="test2.formData.firstName" placeholder="First Name" />
    <VormInput :contextKey="contextKey2" name="email" placeholder="Email" />
    <button @click="onSubmit">Submit</button>
  </VormProvider>
</template>

<style scoped></style>
