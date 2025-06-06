<script setup lang="ts">
import { VormProvider, AutoVorm, VormSection } from "vorm/components";
import { useVorm, type VormSchema, type Option } from "vorm";
import { reactive } from "vue";

const schema: VormSchema = reactive([
  {
    name: "role",
    label: "Rolle:",
    type: "select",
    options: [
      { label: "User", value: 1 },
      { label: "Admin", value: 2 },
      { label: "Moderator", value: 3, disabled: true },
    ],
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
    validation: [{ rule: "required" }],
  },
]);

const { formData, validate, resetForm } = useVorm(schema);

function submit() {
  const ok = validate();
  console.log("✅ Valid:", ok);
  console.log("📦 Data:", JSON.stringify(formData));
}

function reset() {
  resetForm();
  console.log("🔄 Form zurückgesetzt");
}

function logEvent(type: string, e: any) {
  console.log(`📣 ${type}`, e);
}

setTimeout(() => {
  const modOption = (schema[0].options as Option[]).find(
    (opt) => typeof opt === "object" && opt.label === "Moderator"
  );
  if (modOption && typeof modOption === "object") {
    modOption.disabled = false;
  }
}, 3000);
</script>

<template>
  <VormProvider v-model="formData">
    <VormSection title="Rollenbasierte Anzeige">
      <AutoVorm
        layout="grid"
        :columns="2"
        @input="(e) => logEvent('input', e)"
        @blur="(e) => logEvent('blur', e)"
        @validate="(e) => logEvent('validate', e)"
      />
    </VormSection>
    <div class="flex gap-4 mt-4">
      <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
        Absenden
      </button>
      <button @click="reset" class="bg-gray-500 text-white px-4 py-2 rounded">
        Zurücksetzen
      </button>
    </div>
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
  min-width: 0;
}
</style>
