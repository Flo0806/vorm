<script setup lang="ts">
/**
 * AutoVorm Demo
 * Shows: Auto-generated forms, all field types, layouts, slots, custom rendering
 */
import { ref } from "vue";
import { useVorm, type VormSchema, maxLength, between } from "vorm-vue";
import { AutoVorm, VormSection } from "vorm-vue/components";
import "./demo-styles.css";

const activeTab = ref<"basic" | "slots" | "sections">("basic");

// Schema with all field types
const allFieldTypesSchema: VormSchema = [
  {
    name: "textField",
    type: "text",
    label: "Text Field",
    placeholder: "Enter text...",
    validation: [{ rule: "required" }]
  },
  {
    name: "emailField",
    type: "email",
    label: "Email Field",
    placeholder: "your@email.com",
    validation: [{ rule: "email" }]
  },
  {
    name: "passwordField",
    type: "password",
    label: "Password Field",
    placeholder: "Secret password"
  },
  {
    name: "numberField",
    type: "number",
    label: "Number Field",
    placeholder: "0-100",
    validation: [{ rule: between(0, 100) }]
  },
  {
    name: "textareaField",
    type: "textarea",
    label: "Textarea Field",
    placeholder: "Enter multiple lines...",
    validation: [{ rule: maxLength(500) }]
  },
  {
    name: "selectField",
    type: "select",
    label: "Select Field",
    options: [
      { label: "Choose...", value: "", disabled: true },
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
      { label: "Option C", value: "c" }
    ]
  },
  {
    name: "checkboxField",
    type: "checkbox",
    label: "Checkbox Field"
  },
  {
    name: "dateField",
    type: "date",
    label: "Date Field"
  },
  {
    name: "colorField",
    type: "color",
    label: "Color Field"
  },
  {
    name: "rangeField",
    type: "range",
    label: "Range Field"
  }
];

// Schema for slot demo
const slotDemoSchema: VormSchema = [
  {
    name: "customInput",
    type: "text",
    label: "Custom Styled Input",
    placeholder: "This uses a custom slot",
    validation: [{ rule: "required" }]
  },
  {
    name: "rating",
    type: "number",
    label: "Rating (1-5)",
    validation: [{ rule: between(1, 5) }]
  }
];

// Schema for sections demo
const sectionsSchema: VormSchema = [
  // Personal Info Section
  { name: "firstName", type: "text", label: "First Name", validation: [{ rule: "required" }] },
  { name: "lastName", type: "text", label: "Last Name", validation: [{ rule: "required" }] },
  { name: "email", type: "email", label: "Email", validation: [{ rule: "required" }, { rule: "email" }] },
  // Address Section
  { name: "street", type: "text", label: "Street" },
  { name: "city", type: "text", label: "City" },
  { name: "zip", type: "text", label: "ZIP Code" },
  { name: "country", type: "select", label: "Country", options: [
    { label: "Select...", value: "", disabled: true },
    { label: "Germany", value: "DE" },
    { label: "Austria", value: "AT" },
    { label: "Switzerland", value: "CH" }
  ]},
  // Preferences
  { name: "theme", type: "select", label: "Theme", options: [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" }
  ]},
  { name: "notifications", type: "checkbox", label: "Enable notifications" }
];

const basicForm = useVorm(allFieldTypesSchema);
const slotForm = useVorm(slotDemoSchema);
const sectionsForm = useVorm(sectionsSchema);

const currentLayout = ref<"stacked" | "inline" | "horizontal">("stacked");
</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>AutoVorm - Auto-Generated Forms</h1>
      <p>Generate complete forms from schema with zero template code</p>
    </div>

    <div class="feature-box">
      <h3>This demo shows:</h3>
      <ul>
        <li><code>&lt;AutoVorm /&gt;</code> - Auto-render all fields from schema</li>
        <li>All field types: text, email, password, number, textarea, select, checkbox, date, color, range</li>
        <li>Layout modes: <code>stacked</code>, <code>inline</code>, <code>horizontal</code></li>
        <li>Custom slots for complete control over field rendering</li>
        <li><code>&lt;VormSection&gt;</code> - Group fields into sections</li>
      </ul>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'basic' }"
        @click="activeTab = 'basic'"
      >
        All Field Types
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'slots' }"
        @click="activeTab = 'slots'"
      >
        Custom Slots
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'sections' }"
        @click="activeTab = 'sections'"
      >
        Sections
      </button>
    </div>

    <!-- Basic: All Field Types -->
    <div v-if="activeTab === 'basic'" class="form-container">
      <h2>All Field Types</h2>

      <div class="info-box">
        <p>
          <strong>Layout:</strong>
          <select v-model="currentLayout" style="margin-left: 0.5rem; padding: 0.25rem;">
            <option value="stacked">Stacked (default)</option>
            <option value="inline">Inline</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </p>
      </div>

      <AutoVorm :layout="currentLayout" />

      <div class="btn-group">
        <button class="btn btn-primary" @click="basicForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="basicForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Slots: Custom Rendering -->
    <div v-if="activeTab === 'slots'" class="form-container">
      <h2>Custom Slots</h2>

      <div class="info-box">
        <p>Use slots to customize how individual fields are rendered. Access field data via slot props.</p>
      </div>

      <AutoVorm>
        <!-- Custom slot for specific field -->
        <template #field-customInput="{ field, error }">
          <div class="form-group">
            <label :for="field.name" style="color: #667eea; font-weight: bold;">
              {{ field.label }} (Custom!)
            </label>
            <input
              :id="field.name"
              type="text"
              v-model="slotForm.formData[field.name]"
              :placeholder="field.placeholder"
              style="border: 2px dashed #667eea; background: #f0f4ff;"
              :class="{ error: error }"
            />
            <span v-if="error" class="error-message">{{ error }}</span>
          </div>
        </template>

        <!-- Custom slot for rating field - star rating -->
        <template #field-rating="{ field, error }">
          <div class="form-group">
            <label>{{ field.label }}</label>
            <div style="display: flex; gap: 0.5rem; font-size: 1.5rem; cursor: pointer;">
              <span
                v-for="star in 5"
                :key="star"
                @click="slotForm.formData.rating = star"
                :style="{ color: slotForm.formData.rating >= star ? '#f59e0b' : '#e2e8f0' }"
              >
                ★
              </span>
              <span style="font-size: 1rem; color: #64748b; margin-left: 0.5rem;">
                {{ slotForm.formData.rating || 0 }}/5
              </span>
            </div>
            <span v-if="error" class="error-message">{{ error }}</span>
          </div>
        </template>
      </AutoVorm>

      <div class="btn-group">
        <button class="btn btn-primary" @click="slotForm.validate()">Validate</button>
        <button class="btn btn-secondary" @click="slotForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Sections: Grouped Fields -->
    <div v-if="activeTab === 'sections'" class="form-container">
      <h2>Form with Sections</h2>

      <VormSection title="Personal Information" titleClasses="section-title">
        <AutoVorm :fields="['firstName', 'lastName', 'email']" layout="stacked" />
      </VormSection>

      <VormSection title="Address" titleClasses="section-title" style="margin-top: 1.5rem;">
        <AutoVorm :fields="['street', 'city', 'zip', 'country']" layout="stacked" />
      </VormSection>

      <VormSection title="Preferences" titleClasses="section-title" style="margin-top: 1.5rem;">
        <AutoVorm :fields="['theme', 'notifications']" layout="stacked" />
      </VormSection>

      <div class="btn-group">
        <button class="btn btn-primary" @click="sectionsForm.validate()">Validate All</button>
        <button class="btn btn-secondary" @click="sectionsForm.resetForm()">Reset</button>
      </div>
    </div>

    <!-- Debug -->
    <details class="debug-section">
      <summary>Debug: Form Data</summary>
      <pre>{{ JSON.stringify({
  basic: basicForm.formData,
  slots: slotForm.formData,
  sections: sectionsForm.formData
}, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #475569;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
}
</style>
