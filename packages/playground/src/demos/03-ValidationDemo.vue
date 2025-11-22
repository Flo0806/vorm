<script setup lang="ts">
/**
 * Validation Demo - All validation via Schema + AutoVorm
 */
import { ref } from "vue";
import { useVorm, type VormSchema, minLength, maxLength, min, max, between, step, matchField } from "vorm-vue";
import { AutoVorm, VormProvider } from "vorm-vue/components";
import "./demo-styles.css";

const activeTab = ref<"builtin" | "modes" | "custom" | "cross">("builtin");

// Built-in validators - all defined in schema
const builtinSchema: VormSchema = [
  { name: "required", type: "text", label: "Required", placeholder: "Cannot be empty", validation: [{ rule: "required" }] },
  { name: "email", type: "email", label: "Email", placeholder: "must@be.valid", validation: [{ rule: "email" }] },
  { name: "minLength", type: "text", label: "Min Length (5)", placeholder: "At least 5 chars", validation: [{ rule: minLength(5) }] },
  { name: "maxLength", type: "text", label: "Max Length (10)", placeholder: "Max 10 chars", validation: [{ rule: maxLength(10) }] },
  { name: "minNumber", type: "number", label: "Min Value (10)", placeholder: ">= 10", validation: [{ rule: min(10) }] },
  { name: "maxNumber", type: "number", label: "Max Value (100)", placeholder: "<= 100", validation: [{ rule: max(100) }] },
  { name: "between", type: "number", label: "Between (18-65)", placeholder: "Age 18-65", validation: [{ rule: between(18, 65) }] },
  { name: "step", type: "number", label: "Step (5)", placeholder: "Multiple of 5", validation: [{ rule: step(5) }] },
  { name: "alpha", type: "text", label: "Alpha Only", placeholder: "Letters only", validation: [{ rule: "alpha" }] },
  { name: "url", type: "text", label: "URL", placeholder: "https://...", validation: [{ rule: "url" }] }
];

// Validation Modes - per field in schema!
const modesSchema: VormSchema = [
  {
    name: "onInputField",
    type: "text",
    label: "Text (onInput)",
    placeholder: "Validates as you type",
    helpText: "validationMode: 'onInput' - min 3 chars",
    validationMode: "onInput",
    validation: [{ rule: "required" }, { rule: minLength(3) }]
  },
  {
    name: "emailField",
    type: "email",
    label: "Email (onInput)",
    placeholder: "email@example.com",
    helpText: "validationMode: 'onInput' - validates while typing!",
    validationMode: "onInput",
    validation: [{ rule: "email" }]
  },
  {
    name: "onBlurField",
    type: "text",
    label: "Username (onBlur)",
    placeholder: "Validates when you leave",
    helpText: "validationMode: 'onBlur'",
    validationMode: "onBlur",
    validation: [{ rule: "required" }, { rule: minLength(3) }]
  },
  {
    name: "onSubmitField",
    type: "password",
    label: "Password (onSubmit)",
    placeholder: "Only validates on submit",
    helpText: "validationMode: 'onSubmit'",
    validationMode: "onSubmit",
    validation: [{ rule: "required" }, { rule: minLength(8) }]
  }
];

// Custom validators - as functions
const isEven = (value: any) => {
  if (!value) return null;
  if (parseInt(value) % 2 !== 0) return "Must be an even number";
  return null;
};

const startsWithA = (value: any) => {
  if (!value) return null;
  if (!value.toLowerCase().startsWith("a")) return "Must start with 'A'";
  return null;
};

const customSchema: VormSchema = [
  { name: "evenNumber", type: "number", label: "Even Number", placeholder: "2, 4, 6...", validation: [{ rule: isEven }] },
  { name: "startsWithA", type: "text", label: "Starts with A", placeholder: "Apple, Ant...", validation: [{ rule: startsWithA }] },
  { name: "combined", type: "text", label: "Combined (required + minLength + custom)", placeholder: "A...",
    validation: [{ rule: "required" }, { rule: minLength(3) }, { rule: startsWithA }] }
];

// Cross-field validation with affects
const crossFieldSchema: VormSchema = [
  { name: "password", type: "password", label: "Password", placeholder: "Enter password",
    validation: [{ rule: "required" }, { rule: minLength(8) }] },
  { name: "confirmPassword", type: "password", label: "Confirm Password", placeholder: "Repeat password",
    validation: [{ rule: "required" }, { rule: matchField("password"), affects: ["password"] }] },
  { name: "email", type: "email", label: "Email", placeholder: "Enter email",
    validation: [{ rule: "required" }, { rule: "email" }] },
  { name: "confirmEmail", type: "email", label: "Confirm Email", placeholder: "Repeat email",
    validation: [{ rule: "required" }, { rule: matchField("email"), affects: ["email"] }] }
];

// Form keys for VormProvider
const builtinKey = Symbol("builtin");
const modesKey = Symbol("modes");
const customKey = Symbol("custom");
const crossFieldKey = Symbol("crossField");

const builtinForm = useVorm(builtinSchema, { validationMode: "onBlur", key: builtinKey });
const modesForm = useVorm(modesSchema, { key: modesKey });
const customForm = useVorm(customSchema, { validationMode: "onBlur", key: customKey });
const crossFieldForm = useVorm(crossFieldSchema, { validationMode: "onBlur", key: crossFieldKey });
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Validation</h1>
      <p>All validation in schema - AutoVorm does the rest!</p>
    </div>

    <div class="feature-box">
      <h3>Everything in schema:</h3>
      <ul>
        <li>Built-in: <code>required</code>, <code>email</code>, <code>minLength</code>, <code>maxLength</code>, <code>min</code>, <code>max</code>, <code>between</code>, <code>step</code>, <code>alpha</code>, <code>url</code></li>
        <li>Per-field: <code>validationMode: 'onInput' | 'onBlur' | 'onSubmit'</code></li>
        <li>Custom: <code>validation: [{ rule: myFunction }]</code></li>
        <li>Cross-field: <code>matchField('other')</code> + <code>affects: ['other']</code></li>
      </ul>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'builtin' }" @click="activeTab = 'builtin'">Built-in</button>
      <button class="tab" :class="{ active: activeTab === 'modes' }" @click="activeTab = 'modes'">Modes</button>
      <button class="tab" :class="{ active: activeTab === 'custom' }" @click="activeTab = 'custom'">Custom</button>
      <button class="tab" :class="{ active: activeTab === 'cross' }" @click="activeTab = 'cross'">Cross-Field</button>
    </div>

    <!-- Built-in Validators -->
    <div v-if="activeTab === 'builtin'" class="form-container">
      <h2>Built-in Validators</h2>
      <VormProvider :context-key="builtinKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="builtinForm.validate()">Validate All</button>
        <button class="btn btn-secondary" @click="builtinForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Validation Modes -->
    <div v-if="activeTab === 'modes'" class="form-container">
      <h2>Validation Modes (per Field)</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">Each field has its own validationMode - try typing in Email!</p>
      <VormProvider :context-key="modesKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="modesForm.validate()">Validate All</button>
        <button class="btn btn-secondary" @click="modesForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Custom Validators -->
    <div v-if="activeTab === 'custom'" class="form-container">
      <h2>Custom Validators</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        Custom functions: <code>(value, formData) => errorMessage | null</code>
      </p>
      <VormProvider :context-key="customKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="customForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="customForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Cross-Field Validation -->
    <div v-if="activeTab === 'cross'" class="form-container">
      <h2>Cross-Field Validation</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        <code>matchField('password')</code> + <code>affects: ['password']</code> shows error on both fields
      </p>
      <VormProvider :context-key="crossFieldKey">
        <AutoVorm />
      </VormProvider>
      <div class="btn-group">
        <button class="btn btn-primary" @click="crossFieldForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="crossFieldForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Debug -->
    <details class="debug-section">
      <summary>Debug</summary>
      <pre>{{ JSON.stringify({ errors: activeTab === 'builtin' ? builtinForm.errors : activeTab === 'modes' ? modesForm.errors : activeTab === 'custom' ? customForm.errors : crossFieldForm.errors }, null, 2) }}</pre>
    </details>
  </div>
</template>
