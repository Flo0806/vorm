<script setup lang="ts">
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
    // Default: onSubmit
  },
];

const { formData, errors, validate } = useVorm(schema, {
  validationMode: "onSubmit",
});

async function onSubmit() {
  if (await validate()) {
    console.log("Valid data:", formData);
  } else {
    console.log("Errors:", errors);
  }
}
</script>

<template>
  <h1>🧪 Validation Mode Test (Automatic)</h1>
  <VormProvider v-model="formData">
    <div>
      <label>Email (on input):</label>
      <input
        name="email"
        v-model="formData.email"
        :class="{ 'error-border': errors.email }"
      />
      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
    </div>

    <div>
      <label>Username (on blur):</label>
      <input
        name="username"
        v-model="formData.username"
        :class="{ 'error-border': errors.username }"
      />
      <span v-if="errors.username" class="error-message">{{
        errors.username
      }}</span>
    </div>

    <div>
      <label>Password (on submit):</label>
      <input
        name="password"
        v-model="formData.password"
        type="password"
        :class="{ 'error-border': errors.password }"
      />
      <span v-if="errors.password" class="error-message">{{
        errors.password
      }}</span>
    </div>

    <button @click="onSubmit">Submit</button>
  </VormProvider>
</template>

<style scoped>
.error-border {
  border: 1px solid red;
  outline: none;
}
.error-message {
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}
</style>
