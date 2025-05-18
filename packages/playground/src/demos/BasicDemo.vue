<script setup lang="ts">
import VormInput from "../components/VormInput.vue";
import { useVorm, type FormSchema } from "vorm";
import { VormProvider } from "vorm/components";

const contextKey1 = Symbol("Form1");
const contextKey2 = Symbol("Form2");

const schema1: FormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const schema2: FormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const { formData, errors, validate } = useVorm(schema1, { key: contextKey1 });
const test2 = useVorm(schema2, { key: contextKey2 });

function onSubmit() {
  if (validate()) console.log("Form 1 valid:", formData);
  if (test2.validate()) console.log("Form 2 valid:", test2.formData);
}
</script>

<template>
  <h1>🧱 Basics Demo</h1>
  <span>
    This example demonstrates how to use two <code>VormProvider</code> instances
    within a single component. The results will be logged to the console.
  </span>
  >
  <h3>Context Key 1 (Form1)</h3>
  <VormProvider :contextKey="contextKey1" v-model="formData">
    <input v-model="formData.firstName" placeholder="First Name" />
    <VormInput :contextKey="contextKey1" name="email" placeholder="Email" />
  </VormProvider>
  <hr />
  <h3>Context Key 2 (Form2)</h3>
  <VormProvider :contextKey="contextKey2" v-model="test2.formData">
    <input v-model="test2.formData.firstName" placeholder="First Name" />
    <VormInput :contextKey="contextKey2" name="email" placeholder="Email" />
  </VormProvider>

  <button @click="onSubmit" style="margin-top: 1rem">Submit Both</button>
</template>
