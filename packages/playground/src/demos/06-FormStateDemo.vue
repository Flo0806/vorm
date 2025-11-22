<script setup lang="ts">
/**
 * Form State Demo - Reactive form-level flags
 * Shows: isValid, isDirty, isTouched, per-field dirty/touched tracking
 */
import { useVorm, type VormSchema, minLength } from "vorm-vue";
import { AutoVorm, VormProvider } from "vorm-vue/components";
import "./demo-styles.css";

const formKey = Symbol("formState");

const schema: VormSchema = [
  {
    name: "username",
    type: "text",
    label: "Username",
    placeholder: "At least 3 characters",
    validation: [{ rule: "required" }, { rule: minLength(3) }]
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "your@email.com",
    validation: [{ rule: "required" }, { rule: "email" }]
  },
  {
    name: "password",
    type: "password",
    label: "Password",
    placeholder: "At least 6 characters",
    validation: [{ rule: "required" }, { rule: minLength(6) }]
  }
];

const vorm = useVorm(schema, { validationMode: "onInput", key: formKey });

async function onSubmit() {
  if (await vorm.validate()) {
    console.log("Form is valid! Data:", vorm.formData);
    alert("Form submitted successfully! Check console for data.");
  } else {
    console.log("Form has errors:", vorm.errors.value);
  }
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Form State</h1>
      <p>Reactive form-level flags: isValid, isDirty, isTouched</p>
    </div>

    <div class="feature-box">
      <h3>Form State Features:</h3>
      <ul>
        <li><code>isValid</code> - true when all fields pass validation</li>
        <li><code>isDirty</code> - true when any field value differs from initial</li>
        <li><code>isTouched</code> - true when any field has been focused/blurred</li>
        <li><code>dirty[fieldName]</code> - per-field dirty tracking</li>
        <li><code>touched[fieldName]</code> - per-field touched tracking</li>
      </ul>
    </div>

    <!-- Form State Indicators -->
    <div class="form-container">
      <h2>Live Form State</h2>

      <div class="state-indicators">
        <div class="state-item">
          <span class="state-label">isValid</span>
          <span class="state-value" :class="vorm.isValid.value ? 'valid' : 'invalid'">
            {{ vorm.isValid.value ? 'true' : 'false' }}
          </span>
        </div>
        <div class="state-item">
          <span class="state-label">isDirty</span>
          <span class="state-value" :class="vorm.isDirty.value ? 'dirty' : 'clean'">
            {{ vorm.isDirty.value ? 'true' : 'false' }}
          </span>
        </div>
        <div class="state-item">
          <span class="state-label">isTouched</span>
          <span class="state-value" :class="vorm.isTouched.value ? 'touched' : 'untouched'">
            {{ vorm.isTouched.value ? 'true' : 'false' }}
          </span>
        </div>
      </div>

      <!-- Per-field State -->
      <div class="field-states">
        <h4>Per-Field State</h4>
        <table class="state-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Dirty</th>
              <th>Touched</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in schema" :key="field.name">
              <td><code>{{ field.name }}</code></td>
              <td :class="vorm.dirty[field.name] ? 'dirty' : ''">{{ vorm.dirty[field.name] ? 'Yes' : '-' }}</td>
              <td :class="vorm.touched[field.name] ? 'touched' : ''">{{ vorm.touched[field.name] ? 'Yes' : '-' }}</td>
              <td class="error-cell">{{ vorm.errors.value?.[field.name as keyof typeof vorm.errors.value] || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- The Form -->
      <h4>Form Fields</h4>
      <VormProvider :context-key="formKey">
        <AutoVorm />
      </VormProvider>

      <!-- Actions -->
      <div class="btn-group">
        <button
          class="btn btn-primary"
          :class="{ disabled: !vorm.isValid.value }"
          :disabled="!vorm.isValid.value"
          @click="onSubmit"
        >
          {{ vorm.isValid.value ? 'Submit' : 'Submit (form invalid)' }}
        </button>
        <button class="btn btn-secondary" @click="vorm.resetForm()">Reset</button>
      </div>

      <!-- Tips -->
      <div class="tips-box">
        <h4>Try this:</h4>
        <ol>
          <li>Type in fields to see <code>isDirty</code> and <code>isTouched</code> change</li>
          <li>Enter valid data to see <code>isValid</code> turn true</li>
          <li>Notice how Submit button is only enabled when form is valid</li>
          <li>Click Reset to restore initial values and states</li>
        </ol>
      </div>
    </div>

    <!-- Debug -->
    <details class="debug-section">
      <summary>Debug: Raw Form State</summary>
      <pre>{{ JSON.stringify({
  formData: vorm.formData,
  isValid: vorm.isValid.value,
  isDirty: vorm.isDirty.value,
  isTouched: vorm.isTouched.value,
  dirty: vorm.dirty,
  touched: vorm.touched,
  errors: vorm.errors.value
}, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.state-indicators {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.state-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  min-width: 100px;
}

.state-label {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
  margin-bottom: 0.25rem;
}

.state-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: monospace;
}

.state-value.valid { color: #22c55e; }
.state-value.invalid { color: #ef4444; }
.state-value.dirty { color: #f59e0b; }
.state-value.clean { color: #94a3b8; }
.state-value.touched { color: #3b82f6; }
.state-value.untouched { color: #94a3b8; }

.field-states {
  margin-bottom: 1.5rem;
}

.field-states h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #475569;
}

.state-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.state-table th,
.state-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.state-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.state-table td.dirty { color: #f59e0b; font-weight: 600; }
.state-table td.touched { color: #3b82f6; font-weight: 600; }
.state-table .error-cell { color: #ef4444; font-size: 0.75rem; }

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tips-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 4px;
}

.tips-box h4 {
  margin: 0 0 0.5rem 0;
  color: #1e40af;
  font-size: 0.9rem;
}

.tips-box ol {
  margin: 0;
  padding-left: 1.25rem;
  color: #1e3a8a;
  font-size: 0.85rem;
}

.tips-box li {
  margin-bottom: 0.25rem;
}

h4 {
  margin: 1rem 0 0.75rem 0;
  font-size: 0.95rem;
  color: #334155;
}
</style>
