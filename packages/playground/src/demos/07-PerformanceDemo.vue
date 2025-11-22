<script setup lang="ts">
/**
 * Performance Demo - Stress test with 500 fields
 * Measures: Initial render time, validation duration
 */
import { ref, onMounted, nextTick } from "vue";
import { useVorm, type VormSchema, minLength, min, max } from "vorm-vue";
import { AutoVorm, VormProvider } from "vorm-vue/components";
import "./demo-styles.css";

const formKey = Symbol("performance");

// Performance metrics
const renderTime = ref<number | null>(null);
const validationTime = ref<number | null>(null);
const isValidating = ref(false);
const validationResult = ref<{ valid: boolean; errorCount: number } | null>(null);

// Field type distribution
const fieldTypes = ["text", "email", "number", "select", "checkbox", "textarea"] as const;
const selectOptions = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

// Generate 500 fields programmatically
function generateSchema(): VormSchema {
  const schema: VormSchema = [];

  // Section 1: Basic fields (200 fields)
  for (let i = 1; i <= 200; i++) {
    const typeIndex = i % fieldTypes.length;
    const fieldType = fieldTypes[typeIndex];

    const field: any = {
      name: `field_${i}`,
      type: fieldType,
      label: `Field ${i} (${fieldType})`,
      placeholder: `Enter value for field ${i}`,
    };

    // Add validation to every 3rd field
    if (i % 3 === 0) {
      if (fieldType === "text" || fieldType === "email" || fieldType === "textarea") {
        field.validation = [{ rule: minLength(2) }];
      } else if (fieldType === "number") {
        field.validation = [{ rule: min(0) }, { rule: max(100) }];
      }
    }

    // Add options for select fields
    if (fieldType === "select") {
      field.options = selectOptions;
    }

    schema.push(field);
  }

  // Section 2: Fields with showIf conditions (100 fields)
  // First add toggle fields
  for (let i = 1; i <= 10; i++) {
    schema.push({
      name: `toggle_${i}`,
      type: "checkbox",
      label: `Show section ${i} (toggle)`,
    });
  }

  // Then add conditional fields (10 per toggle = 100 fields)
  for (let i = 1; i <= 10; i++) {
    for (let j = 1; j <= 10; j++) {
      const fieldNum = 200 + ((i - 1) * 10) + j;
      schema.push({
        name: `conditional_${fieldNum}`,
        type: "text",
        label: `Conditional Field ${fieldNum}`,
        placeholder: `Visible when toggle ${i} is checked`,
        showIf: { [`toggle_${i}`]: true },
        validation: j % 2 === 0 ? [{ rule: "required" }] : undefined,
      });
    }
  }

  // Section 3: Nested repeater (contributes ~100 fields when expanded)
  schema.push({
    name: "companies",
    type: "repeater",
    label: "Companies (Nested Repeater)",
    fields: [
      {
        name: "name",
        type: "text",
        label: "Company Name",
        validation: [{ rule: "required" }],
      },
      {
        name: "email",
        type: "email",
        label: "Company Email",
        validation: [{ rule: "email" }],
      },
      {
        name: "employees",
        type: "repeater",
        label: "Employees",
        fields: [
          { name: "firstName", type: "text", label: "First Name", validation: [{ rule: "required" }] },
          { name: "lastName", type: "text", label: "Last Name", validation: [{ rule: "required" }] },
          { name: "role", type: "select", label: "Role", options: [
            { label: "Developer", value: "dev" },
            { label: "Designer", value: "design" },
            { label: "Manager", value: "manager" },
          ]},
          { name: "salary", type: "number", label: "Salary", validation: [{ rule: min(0) }] },
        ],
      },
    ],
  });

  // Section 4: More basic fields to reach ~500 (90 more)
  for (let i = 311; i <= 400; i++) {
    const typeIndex = i % fieldTypes.length;
    const fieldType = fieldTypes[typeIndex];

    schema.push({
      name: `extra_${i}`,
      type: fieldType,
      label: `Extra Field ${i}`,
      placeholder: fieldType === "select" ? undefined : `Value ${i}`,
      options: fieldType === "select" ? selectOptions : undefined,
      validation: i % 5 === 0 ? [{ rule: "required" }] : undefined,
    });
  }

  return schema;
}

// Track render start time
const renderStartTime = performance.now();

const schema = generateSchema();
const vorm = useVorm(schema, { validationMode: "onSubmit", key: formKey });

// Initialize repeater with some data
vorm.formData.companies = [
  {
    name: "Acme Corp",
    email: "info@acme.com",
    employees: [
      { firstName: "John", lastName: "Doe", role: "dev", salary: 50000 },
      { firstName: "Jane", lastName: "Smith", role: "manager", salary: 70000 },
    ],
  },
];

// Prefill some fields
for (let i = 1; i <= 50; i++) {
  vorm.formData[`field_${i}`] = `Value ${i}`;
}

// Measure render time after mount
onMounted(async () => {
  await nextTick();
  renderTime.value = Math.round((performance.now() - renderStartTime) * 100) / 100;
});

// Validation with timing
async function handleValidate() {
  isValidating.value = true;
  validationResult.value = null;

  const startTime = performance.now();
  const isValid = await vorm.validate();
  const endTime = performance.now();

  validationTime.value = Math.round((endTime - startTime) * 100) / 100;

  // Count errors
  const errorCount = Object.values(vorm.errors.value || {}).filter(e => e !== null).length;
  validationResult.value = { valid: isValid, errorCount };

  isValidating.value = false;
}

// Count fields in schema
function countFields(s: VormSchema): number {
  let count = 0;
  for (const field of s) {
    count++;
    if (field.type === "repeater" && field.fields) {
      count += countFields(field.fields);
    }
  }
  return count;
}

const totalFieldsInSchema = countFields(schema);
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Performance Stress Test</h1>
      <p>{{ totalFieldsInSchema }} fields in schema - measuring render and validation speed</p>
    </div>

    <!-- Performance Metrics -->
    <div class="metrics-panel">
      <div class="metric">
        <span class="metric-label">Schema Fields</span>
        <span class="metric-value">{{ totalFieldsInSchema }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Render Time</span>
        <span class="metric-value" :class="{ highlight: renderTime !== null }">
          {{ renderTime !== null ? `${renderTime} ms` : 'measuring...' }}
        </span>
      </div>
      <div class="metric">
        <span class="metric-label">Validation Time</span>
        <span class="metric-value" :class="{ highlight: validationTime !== null }">
          {{ validationTime !== null ? `${validationTime} ms` : '-' }}
        </span>
      </div>
      <div class="metric" v-if="validationResult">
        <span class="metric-label">Result</span>
        <span class="metric-value" :class="validationResult.valid ? 'valid' : 'invalid'">
          {{ validationResult.valid ? 'Valid' : `${validationResult.errorCount} errors` }}
        </span>
      </div>
    </div>

    <div class="feature-box">
      <h3>Test Includes:</h3>
      <ul>
        <li>200 basic fields (text, email, number, select, checkbox, textarea)</li>
        <li>10 toggle checkboxes + 100 conditional fields (showIf)</li>
        <li>1 nested repeater (companies with employees)</li>
        <li>90 additional fields</li>
        <li>~67 fields with validation rules</li>
        <li>50 fields prefilled with data</li>
      </ul>
    </div>

    <!-- Actions -->
    <div class="btn-group" style="margin-bottom: 1.5rem;">
      <button
        class="btn btn-primary"
        @click="handleValidate"
        :disabled="isValidating"
      >
        {{ isValidating ? 'Validating...' : 'Validate All Fields' }}
      </button>
      <button class="btn btn-secondary" @click="vorm.resetForm(); validationTime = null; validationResult = null;">
        Reset Form
      </button>
    </div>

    <!-- The massive form -->
    <div class="form-container" style="max-height: 600px; overflow-y: auto;">
      <h2>Form Fields (scroll to see all)</h2>
      <VormProvider :context-key="formKey">
        <AutoVorm />
      </VormProvider>
    </div>

    <!-- Debug -->
    <details class="debug-section">
      <summary>Debug: Form Data (first 20 fields)</summary>
      <pre>{{ JSON.stringify(
        Object.fromEntries(
          Object.entries(vorm.formData).slice(0, 20)
        ), null, 2
      ) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.metrics-panel {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 12px;
}

.metric {
  flex: 1;
  min-width: 140px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  font-family: monospace;
}

.metric-value.highlight {
  color: #22d3ee;
}

.metric-value.valid {
  color: #4ade80;
}

.metric-value.invalid {
  color: #f87171;
}
</style>
