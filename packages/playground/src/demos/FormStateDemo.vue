<script setup lang="ts">
import { useVorm, type VormSchema, minLength } from "vorm";
import { AutoVorm, VormProvider } from "vorm/components";
import { watch } from "vue";

const schema: VormSchema = [
  {
    name: "username",
    type: "text",
    label: "Username",
    validation: [{ rule: "required" }, { rule: minLength(3) }]
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [{ rule: "required"}]
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    validation: [{ rule: "required" }, { rule: minLength(6) }]
  },
];

const vorm = useVorm(schema, { validationMode: "onInput" });

async function onSubmit() {
  if (await vorm.validate()) {
    console.log("✅ Form is valid! Data:", vorm.formData);
    alert("Form submitted successfully! Check console for data.");
  } else {
    console.log("❌ Form has errors:", vorm.errors);
  }
}

watch(
  () => vorm.isValid,
  (newData) => {
    console.log("📝 Form Validity Changed:", newData);
  },
  { deep: true }
);

function resetForm() {
  vorm.resetForm();
  console.log("🔄 Form reset");
}
</script>

<template>
  <div style="padding: 2rem; max-width: 600px;">
    <h1>🚦 Form State Demo</h1>
    <p style="color: #666; margin-bottom: 2rem;">
      This demo showcases the new reactive form-level flags:
      <code>isValid</code>, <code>isDirty</code>, and <code>isTouched</code>.
    </p>

    <!-- Form State Indicators -->
    <div style="
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      font-family: monospace;
    ">
      <h3 style="margin-top: 0;">📊 Form State</h3>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
        <div>
          <strong>isValid:</strong>
          <span :style="{
            color: vorm.isValid ? '#22c55e' : '#ef4444',
            fontWeight: 'bold'
          }">
            {{ vorm.isValid.value ? '✓ true' : '✗ false' }}
          </span>
        </div>
        <div>
          <strong>isDirty:</strong>
          <span :style="{
            color: vorm.isDirty ? '#f59e0b' : '#6b7280',
            fontWeight: 'bold'
          }">
            {{ vorm.isDirty.value ? '⚠ true' : '○ false' }}
          </span>
        </div>
        <div>
          <strong>isTouched:</strong>
          <span :style="{
            color: vorm.isTouched.value ? '#3b82f6' : '#6b7280',
            fontWeight: 'bold'
          }">
            {{ vorm.isTouched.value ? '👆 true' : '○ false' }}
          </span>
        </div>
      </div>
    </div>

    <!-- The Form -->
    <VormProvider v-model="vorm.formData">
      <AutoVorm />
    </VormProvider>

    <!-- Actions -->
    <div style="display: flex; gap: 1rem; margin-top: 2rem;">
      <button
        @click="onSubmit"
        :disabled="!vorm.isValid"
        :style="{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          cursor: vorm.isValid ? 'pointer' : 'not-allowed',
          opacity: vorm.isValid ? 1 : 0.5,
          background: vorm.isValid ? '#22c55e' : '#d1d5db',
          color: vorm.isValid ? 'white' : '#6b7280',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold'
        }"
      >
        {{ vorm.isValid ? '✓ Submit' : '✗ Submit (disabled)' }}
      </button>

      <button
        @click="resetForm"
        style="
          padding: 0.75rem 1.5rem;
          fontSize: 1rem;
          cursor: pointer;
          background: #6b7280;
          color: white;
          border: none;
          borderRadius: 6px;
        "
      >
        🔄 Reset
      </button>
    </div>

    <!-- Usage Info -->
    <div style="
      margin-top: 3rem;
      padding: 1.5rem;
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 4px;
    ">
      <h3 style="margin-top: 0; color: #1e40af;">💡 How to use</h3>
      <ol style="margin: 0; padding-left: 1.5rem; color: #1e3a8a;">
        <li>Type in the fields to see <code>isDirty</code> and <code>isTouched</code> change</li>
        <li>Enter valid data to see <code>isValid</code> turn true</li>
        <li>Notice how the Submit button is only enabled when form is valid</li>
        <li>Click Reset to reset all states</li>
      </ol>

      <details style="margin-top: 1rem;">
        <summary style="cursor: pointer; color: #1e40af; font-weight: bold;">
          Show Code Example
        </summary>
        <pre style="
          background: white;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin-top: 0.5rem;
        "><code>const vorm = useVorm(schema, { validationMode: 'onChange' });

// Use the reactive flags in your template:
&lt;button :disabled="!vorm.isValid"&gt;Submit&lt;/button&gt;
&lt;div v-if="vorm.isDirty"&gt;Unsaved changes&lt;/div&gt;
&lt;div v-if="vorm.isTouched"&gt;Form was touched&lt;/div&gt;

// Or in script (need .value):
if (vorm.isValid.value) { /* ... */ }</code></pre>
      </details>
    </div>
  </div>
</template>
