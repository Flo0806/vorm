<script setup lang="ts">
import { useVorm, type VormSchema } from "vorm";
import { AutoVorm, VormProvider } from "vorm/components";

const contextKey1 = Symbol("Form1");
const contextKey2 = Symbol("Form2");

const schema1: VormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const schema2: VormSchema = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "email", type: "email", label: "Email" },
];

const { formData, validate } = useVorm(schema1, { key: contextKey1 });
const test2 = useVorm(schema2, { key: contextKey2 });

async function onSubmit() {
  if (await validate()) console.log("Form 1 valid:", formData);
  if (await test2.validate()) console.log("Form 2 valid:", test2.formData);
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
  <!-- <VormProvider :contextKey="contextKey1" v-model="formData">
    <input v-model="formData.firstName" placeholder="First Name" />
    <VormInput name="email" placeholder="Email" />
  </VormProvider>
  <hr />
  <h3>Context Key 2 (Form2)</h3>
  <VormProvider :contextKey="contextKey2" v-model="test2.formData">
    <input v-model="test2.formData.firstName" placeholder="First Name" />
    <VormInput name="email" placeholder="Email" />
  </VormProvider> -->

  <VormProvider :contextKey="contextKey1" v-model="formData">
    <AutoVorm />
  </VormProvider>
  <hr />
  <h3>Context Key 2 (Form2)</h3>
  <VormProvider :contextKey="contextKey2" v-model="test2.formData">
    <AutoVorm />
  </VormProvider>

  <button @click="onSubmit" style="margin-top: 1rem">Submit Both</button>
</template>
