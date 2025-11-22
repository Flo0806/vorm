<script setup lang="ts">
/**
 * Getting Started Demo
 * Shows: How easy it is to create forms with Vorm using AutoVorm
 */
import { useVorm, type VormSchema, minLength, matchField } from "vorm-vue";
import { AutoVorm } from "vorm-vue/components";
import "./demo-styles.css";

// 1. Define your schema - that's it!
const schema: VormSchema = [
  {
    name: "username",
    type: "text",
    label: "Username",
    placeholder: "Enter your username",
    validation: [
      { rule: "required", message: "Username is required" },
      { rule: minLength(3), message: "At least 3 characters" }
    ]
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
    validation: [
      { rule: "required" },
      { rule: "email" }
    ]
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "Min. 8 characters",
    validation: [
      { rule: "required" },
      { rule: minLength(8) }
    ]
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirm Password",
    placeholder: "Repeat your password",
    validation: [
      { rule: "required" },
      { rule: matchField("password"), message: "Passwords must match" }
    ]
  },
  {
    name: "role",
    type: "select",
    label: "Role",
    options: [
      { label: "Select a role...", value: "", disabled: true },
      { label: "Developer", value: "dev" },
      { label: "Designer", value: "design" },
      { label: "Manager", value: "manager" }
    ],
    validation: [{ rule: "required" }]
  },
  {
    name: "bio",
    type: "textarea",
    label: "Bio (optional)",
    placeholder: "Tell us about yourself..."
  },
  {
    name: "newsletter",
    type: "checkbox",
    label: "Subscribe to newsletter"
  },
  {
    name: "acceptTerms",
    type: "checkbox",
    label: "I accept the terms and conditions",
    validation: [{ rule: "required", message: "You must accept the terms" }]
  }
];

// 2. Create form instance
const vorm = useVorm(schema, { validationMode: "onBlur" });

// 3. Handle submit
async function handleSubmit() {
  const isValid = await vorm.validate();
  if (isValid) {
    alert("Form submitted!\n\n" + JSON.stringify(vorm.formData, null, 2));
  }
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Getting Started with Vorm</h1>
      <p>Create complete forms with just a schema - zero template code!</p>
    </div>

    <div class="feature-box">
      <h3>3 simple steps:</h3>
      <ul>
        <li>1. Define your <code>schema</code> (fields, types, validation)</li>
        <li>2. Create form with <code>useVorm(schema)</code></li>
        <li>3. Render with <code>&lt;AutoVorm /&gt;</code> - done!</li>
      </ul>
    </div>

    <!-- Form State Display -->
    <div class="state-grid">
      <div class="state-item">
        <div class="label">Valid</div>
        <div class="value" :class="vorm.isValid.value ? 'true' : 'false'">
          {{ vorm.isValid.value ? 'Yes' : 'No' }}
        </div>
      </div>
      <div class="state-item">
        <div class="label">Dirty</div>
        <div class="value" :class="vorm.isDirty.value ? 'true' : 'false'">
          {{ vorm.isDirty.value ? 'Yes' : 'No' }}
        </div>
      </div>
      <div class="state-item">
        <div class="label">Touched</div>
        <div class="value" :class="vorm.isTouched.value ? 'true' : 'false'">
          {{ vorm.isTouched.value ? 'Yes' : 'No' }}
        </div>
      </div>
    </div>

    <!-- THE MAGIC: One component renders the entire form! -->
    <div class="form-container">
      <h2>Registration Form</h2>

      <form @submit.prevent="handleSubmit">
        <!-- AutoVorm generates all fields automatically -->
        <AutoVorm layout="stacked" />

        <!-- Just add your buttons -->
        <div class="btn-group">
          <button type="submit" class="btn btn-primary">
            Submit
          </button>
          <button type="button" class="btn btn-secondary" @click="vorm.resetForm()">
            Reset
          </button>
        </div>
      </form>
    </div>

    <!-- Code Example -->
    <div class="form-container" style="margin-top: 1.5rem;">
      <h2>That's all the code you need!</h2>
      <pre style="background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; overflow: auto; font-size: 0.85rem;">
&lt;script setup&gt;
const schema = [
  { name: 'email', type: 'email', label: 'Email', validation: [{ rule: 'required' }, { rule: 'email' }] },
  { name: 'password', type: 'password', label: 'Password', validation: [{ rule: 'required' }] }
];

const vorm = useVorm(schema);
&lt;/script&gt;

&lt;template&gt;
  &lt;AutoVorm /&gt;
  &lt;button @click="vorm.validate()"&gt;Submit&lt;/button&gt;
&lt;/template&gt;</pre>
    </div>

    <!-- Debug Section -->
    <details class="debug-section">
      <summary>Debug: Form State</summary>
      <pre>{{ JSON.stringify({
  formData: vorm.formData,
  errors: vorm.errors,
  isValid: vorm.isValid.value,
  isDirty: vorm.isDirty.value
}, null, 2) }}</pre>
    </details>
  </div>
</template>
