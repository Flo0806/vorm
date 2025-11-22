<script setup lang="ts">
/**
 * Performance Comparison: Vorm vs VeeValidate
 * Tests input responsiveness with 400 fields each
 */
import { ref, onMounted, nextTick, reactive } from "vue";
import { useVorm, type VormSchema } from "vorm-vue";
import { AutoVorm, VormProvider } from "vorm-vue/components";
import { useField } from "vee-validate";
import "./demo-styles.css";

const FIELD_COUNT = 400;

const activeTab = ref<"vorm" | "veevalidate" | "raw">("vorm");

// Metrics
const vormRenderTime = ref<number | null>(null);
const veeRenderTime = ref<number | null>(null);
const rawRenderTime = ref<number | null>(null);

// ============ VORM SETUP ============
const vormKey = Symbol("vormComparison");
const vormStartTime = ref(0);

function generateVormSchema(): VormSchema {
  const schema: VormSchema = [];
  for (let i = 1; i <= FIELD_COUNT; i++) {
    schema.push({
      name: `field_${i}`,
      type: "text",
      label: `Field ${i}`,
      placeholder: `Enter value ${i}`,
    });
  }
  return schema;
}

vormStartTime.value = performance.now();
const vormSchema = generateVormSchema();
const _vorm = useVorm(vormSchema, { validationMode: "onSubmit", key: vormKey });

// ============ VEEVALIDATE SETUP ============
const veeStartTime = ref(0);
const veeFields = ref<Array<{ name: string; value: ReturnType<typeof useField<string>> }>>([]);

function setupVeeValidate() {
  veeStartTime.value = performance.now();
  const fields: Array<{ name: string; value: ReturnType<typeof useField<string>> }> = [];

  for (let i = 1; i <= FIELD_COUNT; i++) {
    const fieldName = `vee_field_${i}`;
    fields.push({
      name: fieldName,
      value: useField<string>(fieldName),
    });
  }

  veeFields.value = fields;
}

// ============ RAW VUE SETUP (baseline) ============
const rawStartTime = ref(0);
const rawFormData = reactive<Record<string, string>>({});

function setupRawVue() {
  rawStartTime.value = performance.now();
  for (let i = 1; i <= FIELD_COUNT; i++) {
    rawFormData[`raw_field_${i}`] = "";
  }
}

// Initialize
setupVeeValidate();
setupRawVue();

// Measure render times
onMounted(async () => {
  await nextTick();

  // These are approximate - actual render happens when tab is active
  vormRenderTime.value = Math.round((performance.now() - vormStartTime.value) * 100) / 100;
  veeRenderTime.value = Math.round((performance.now() - veeStartTime.value) * 100) / 100;
  rawRenderTime.value = Math.round((performance.now() - rawStartTime.value) * 100) / 100;
});

// Re-measure when switching tabs
async function measureTab(tab: "vorm" | "veevalidate" | "raw") {
  const start = performance.now();
  activeTab.value = tab;
  await nextTick();
  await nextTick(); // Double nextTick for accurate DOM measurement

  const time = Math.round((performance.now() - start) * 100) / 100;

  if (tab === "vorm") vormRenderTime.value = time;
  else if (tab === "veevalidate") veeRenderTime.value = time;
  else rawRenderTime.value = time;
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>Performance Comparison</h1>
      <p>Vorm vs VeeValidate vs Raw Vue - {{ FIELD_COUNT }} text fields each</p>
    </div>

    <!-- Metrics -->
    <div class="metrics-panel">
      <div class="metric" :class="{ active: activeTab === 'vorm' }">
        <span class="metric-label">Vorm</span>
        <span class="metric-value">{{ vormRenderTime ?? '-' }} ms</span>
      </div>
      <div class="metric" :class="{ active: activeTab === 'veevalidate' }">
        <span class="metric-label">VeeValidate</span>
        <span class="metric-value">{{ veeRenderTime ?? '-' }} ms</span>
      </div>
      <div class="metric" :class="{ active: activeTab === 'raw' }">
        <span class="metric-label">Raw Vue</span>
        <span class="metric-value">{{ rawRenderTime ?? '-' }} ms</span>
      </div>
    </div>

    <div class="feature-box">
      <h3>Test Instructions:</h3>
      <ol>
        <li>Click each tab to render that form</li>
        <li>Type quickly in any field - notice the <strong>input lag</strong></li>
        <li>Compare responsiveness between libraries</li>
      </ol>
      <p style="margin-top: 0.5rem; color: #64748b;">
        <strong>Key question:</strong> How smooth is typing with 400 fields rendered?
      </p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'vorm' }" @click="measureTab('vorm')">
        Vorm ({{ FIELD_COUNT }} fields)
      </button>
      <button class="tab" :class="{ active: activeTab === 'veevalidate' }" @click="measureTab('veevalidate')">
        VeeValidate ({{ FIELD_COUNT }} fields)
      </button>
      <button class="tab" :class="{ active: activeTab === 'raw' }" @click="measureTab('raw')">
        Raw Vue ({{ FIELD_COUNT }} fields)
      </button>
    </div>

    <!-- VORM -->
    <div v-if="activeTab === 'vorm'" class="form-container" style="max-height: 500px; overflow-y: auto;">
      <h2>Vorm - Schema-driven</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        One reactive formData object, AutoVorm renders all fields
      </p>
      <VormProvider :context-key="vormKey">
        <AutoVorm />
      </VormProvider>
    </div>

    <!-- VEEVALIDATE -->
    <div v-if="activeTab === 'veevalidate'" class="form-container" style="max-height: 500px; overflow-y: auto;">
      <h2>VeeValidate - useField per field</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        Each field has isolated reactivity via useField()
      </p>
      <div class="vee-form">
        <div v-for="field in veeFields" :key="field.name" class="form-group">
          <label>{{ field.name.replace('vee_field_', 'Field ') }}</label>
          <input
            type="text"
            v-model="field.value.value"
            :placeholder="`Enter value`"
          />
        </div>
      </div>
    </div>

    <!-- RAW VUE -->
    <div v-if="activeTab === 'raw'" class="form-container" style="max-height: 500px; overflow-y: auto;">
      <h2>Raw Vue - reactive object</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        Simple reactive() object with v-model, no library overhead
      </p>
      <div class="raw-form">
        <div v-for="i in FIELD_COUNT" :key="`raw_${i}`" class="form-group">
          <label>Field {{ i }}</label>
          <input
            type="text"
            v-model="rawFormData[`raw_field_${i}`]"
            :placeholder="`Enter value ${i}`"
          />
        </div>
      </div>
    </div>

    <!-- Architecture Comparison -->
    <details class="debug-section" style="margin-top: 1.5rem;">
      <summary>Architecture Comparison</summary>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
        <div>
          <h4>Vorm</h4>
          <pre style="font-size: 0.75rem;">formData = reactive({
  field_1: "",
  field_2: "",
  ...field_400: ""
})
// ONE object = ALL watchers fire</pre>
        </div>
        <div>
          <h4>VeeValidate</h4>
          <pre style="font-size: 0.75rem;">field_1 = useField('field_1')
field_2 = useField('field_2')
...
// ISOLATED refs per field</pre>
        </div>
        <div>
          <h4>Ideal for Vorm</h4>
          <pre style="font-size: 0.75rem;">// Per-field refs:
fields = {
  field_1: shallowRef(""),
  field_2: shallowRef(""),
}
// Only changed field triggers</pre>
        </div>
      </div>
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
  transition: all 0.2s;
}

.metric.active {
  background: rgba(99, 102, 241, 0.3);
  border: 2px solid #6366f1;
}

.metric-label {
  display: block;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  font-family: monospace;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group label {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.vee-form,
.raw-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}
</style>
