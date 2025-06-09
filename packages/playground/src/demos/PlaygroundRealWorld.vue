<script setup lang="ts">
import {
  AutoVorm,
  VormProvider,
  VormRepeater,
  VormSection,
} from "vorm/components";
import { minLength, useVorm, type VormSchema } from "vorm";
import { onMounted } from "vue";

const schema: VormSchema = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    validation: [{ rule: "required" }],
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
  {
    name: "role",
    label: "Desired Role",
    type: "select",
    validation: [{ rule: "required" }],
  },
  {
    name: "motivation",
    label: "Motivation",
    type: "textarea",
    validation: [{ rule: "required" }, { rule: minLength(20) }],
  },
  {
    name: "availableImmediately",
    label: "Available Immediately?",
    type: "checkbox",
  },
  {
    name: "startDate",
    label: "Desired Start Date",
    type: "date",
    showIf: { availableImmediately: false },
  },
  {
    name: "experience",
    label: "Work Experience",
    type: "repeater",
    fields: [
      {
        name: "company",
        label: "Company",
        type: "text",
        validation: [{ rule: "required" }],
      },
      { name: "position", label: "Position", type: "text" },
      { name: "duration", label: "Duration", type: "text" },
    ],
  },
  {
    name: "tos",
    label: "I accept the terms",
    type: "checkbox",
    validation: [{ rule: "required" }],
  },
];

const {
  formData,
  validate,
  resetForm,
  setFormData,
  addRepeaterItem,
  removeRepeaterItem,
} = useVorm(schema);

async function submit() {
  console.log(await validate());
  if (await validate()) {
    alert("✅ Submitted!\n" + JSON.stringify(formData, null, 2));
  }
}

function addExperience() {
  addRepeaterItem("experience", { company: "", position: "", duration: "" });
}

function removeLastExperience() {
  const count = formData.experience?.length || 0;
  if (count > 0) removeRepeaterItem("experience", count - 1);
}

onMounted(() => {
  setFormData(
    {
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "Developer",
      motivation: "I love building intuitive interfaces and solving problems.",
      availableImmediately: false,
      startDate: "2025-07-01",
      tos: true,
      experience: [
        { company: "ACME Corp", position: "Engineer", duration: "2020–2023" },
        { company: "Techify", position: "Intern", duration: "2019" },
      ],
    },
    {
      fieldOptions: {
        role: [
          { label: "Developer", value: "Developer" },
          { label: "Designer", value: "Designer" },
          { label: "Product Manager", value: "PM" },
        ],
      },
    }
  );
});
</script>

<template>
  <VormProvider v-model="formData" :schema="schema">
    <VormSection title="👤 Personal Information">
      <AutoVorm
        :only="['fullName', 'email', 'role']"
        layout="grid"
        :columns="2"
      />
    </VormSection>

    <VormSection title="📝 Motivation">
      <AutoVorm :only="['motivation']" layout="stacked" />
    </VormSection>

    <VormSection title="📅 Availability">
      <AutoVorm
        :only="['availableImmediately', 'startDate']"
        layout="stacked"
      />
    </VormSection>

    <VormSection title="💼 Experience">
      <VormRepeater name="experience">
        <template #default="{ fullName }">
          <AutoVorm :only="[fullName]" layout="grid" :columns="2" />
        </template>
      </VormRepeater>
      <div class="flex gap-2 mt-2">
        <button
          @click="addExperience"
          class="bg-green-600 text-white px-3 py-1 rounded"
        >
          Add Experience
        </button>
        <button
          @click="removeLastExperience"
          class="bg-red-600 text-white px-3 py-1 rounded"
        >
          Remove Last
        </button>
      </div>
    </VormSection>

    <VormSection title="✅ Consent">
      <AutoVorm :only="['tos']" layout="stacked" />
    </VormSection>

    <div class="flex gap-4 mt-6">
      <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      <button
        @click="resetForm"
        class="bg-gray-600 text-white px-4 py-2 rounded"
      >
        Reset
      </button>
    </div>

    <pre class="mt-6 text-xs bg-gray-100 p-2 rounded">
Live Data: {{ formData }}
    </pre>
  </VormProvider>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
