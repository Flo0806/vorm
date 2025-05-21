<script setup lang="ts">
import { VormProvider, AutoVorm, VormSection } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";

const schema: VormSchema = [
  {
    name: "role",
    label: "Rolle:",
    type: "select",
    options: ["User", "Admin", "Moderator"],
    validation: [{ rule: "required" }],
  },
  {
    name: "adminCode",
    label: "Admin-Code",
    type: "text",
    showIf: { role: "Admin" },
  },
  {
    name: "modLevel",
    label: "Mod-Stufe",
    type: "number",
    showIf: (form) => form.role === "Moderator",
  },
  {
    name: "notes",
    label: "Allgemeine Notiz",
    type: "textarea",
  },
];

const { formData, validate } = useVorm(schema);

function submit() {
  const ok = validate();
  console.log("✅ Valid:", ok);
  console.log("📦 Data:", JSON.stringify(formData));
}
</script>

<template>
  <VormProvider v-model="formData">
    <VormSection title="Rollenbasierte Anzeige">
      <AutoVorm layout="grid" :columns="2" />
    </VormSection>
    <button
      @click="submit"
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      Absenden
    </button>
  </VormProvider>
</template>

<style scoped>
:slotted(.vorm-horizontal) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vorm-horizontal label {
  flex: 0 0 150px;
}

.vorm-horizontal input,
.vorm-horizontal select,
.vorm-horizontal textarea {
  flex: 1 1 auto;
  min-width: 0; /* wichtig für overflow */
}
</style>
