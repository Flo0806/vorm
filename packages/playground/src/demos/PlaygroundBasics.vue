<script setup lang="ts">
import { AutoVorm, VormSection } from "vorm/components";
import { createField, useVorm, type VormSchema } from "vorm";
import { onMounted } from "vue";

const schema: VormSchema = [
  {
    name: "username",
    label: "Benutzername",
    type: "text",
    validation: [{ rule: "required" }],
  },
  {
    name: "email",
    label: "E-Mail-Adresse",
    type: "email",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
  {
    name: "password",
    label: "Passwort",
    type: "password",
    validation: [{ rule: "required" }],
  },
  {
    name: "notes",
    label: "Notizen",
    type: "textarea",
  },
  {
    name: "role",
    label: "Rolle",
    type: "select",
    validation: [{ rule: "required" }],
  },
  {
    name: "adminCode",
    label: "Admin-Code",
    type: "text",
    showIf: { role: "Admin" },
  },
  {
    name: "tos",
    label: "AGB akzeptieren",
    type: "checkbox",
    validation: [{ rule: "required" }],
  },
  createField({
    name: "upload",
    type: "file",
    label: "Upload your CV",
    validation: [
      {
        rule: (value) => {
          // ✅ value: File | null
          return value && value.size < 5_000_000 ? null : "Max 5MB allowed";
        },
      },
    ],
  }),
];

const { formData, validate, resetForm, updateField } = useVorm(schema, {
  validationMode: "onInput",
});

function submit() {
  const ok = validate();
  console.log("✅ Valid:", ok);
  console.log("📦 Data:", JSON.stringify(formData));
}

onMounted(() => {
  updateField("role", "Admin", {
    fieldOptions: [
      { label: "User", value: "User" },
      { label: "Admin", value: "Admin" },
      { label: "Moderator 1", value: "Moderator" },
    ],
  });
});
</script>

<template>
  <VormSection title="Basis-Beispiel">
    <AutoVorm layout="grid" :columns="1" />
  </VormSection>
  <div class="flex gap-4 mt-4">
    <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
      Absenden
    </button>
    <button
      @click="resetForm"
      class="bg-black-500 text-white px-4 py-2 rounded"
    >
      Zurücksetzen
    </button>
  </div>

  <pre class="mt-6 text-xs bg-black-100 p-2 border rounded">
Data: {{ formData }}
    </pre
  >
</template>
