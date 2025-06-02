<script setup lang="ts">
import {
  AutoVorm,
  VormProvider,
  VormRepeater,
  VormSection,
} from "vorm/components";
import { useVorm, type Option, type VormSchema } from "vorm";
import VormInput from "../components/VormInput.vue";
import { onMounted } from "vue";

const schema: VormSchema = [
  {
    name: "username",
    label: "Benutzername",
    type: "text",
    validation: [
      { rule: "required" },
      {
        rule: (value: string): string | null => {
          return value.length >= 3 ? null : "Minimum 3 characters required";
        },
      },
    ],
    classes: { input: "border border-gray-400 rounded px-2 py-1" },
  },
  {
    name: "email",
    label: "E-Mail-Adresse",
    type: "email",
    validationMode: "onBlur",
    validation: [{ rule: "required" }, { rule: "email" }],
  },
  {
    name: "password",
    label: "Passwort",
    type: "password",
    validation: [{ rule: "required" }],
  },
  {
    name: "adminCode",
    label: "Admin-Code",
    type: "text",
    showIf: { role: "Admin" },
  },
  {
    name: "role",
    label: "Rolle",
    type: "select",
    // options: ["User", "Admin", "Moderator"],
  },
  {
    name: "modLevel",
    label: "Mod-Stufe",
    type: "number",
    showIf: (form) => form.role === "Moderator",
  },
  { name: "info", label: "Hinweistext", type: "text", showError: false },
  {
    name: "notes",
    label: "Notizen",
    type: "textarea",
    validation: [{ rule: "required" }],
  },
  {
    name: "tos",
    label: "AGB akzeptieren",
    type: "checkbox",
    validation: [{ rule: "required" }],
  },
  {
    name: "contacts",
    label: "Kontakte",
    type: "repeater",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "phone", label: "Telefon", type: "text" },
      { name: "email", label: "Email", type: "email", inheritWrapper: true },
      {
        name: "business",
        label: "Geschäftlich",
        type: "repeater",
        fields: [
          {
            name: "email",
            label: "E-Mail",
            type: "text",
            inheritWrapper: true,
          },
          { name: "department", label: "Abteilung", type: "text" },
          {
            name: "modLevel",
            label: "Mod-Stufe",
            type: "number",
            showIf: {
              dependsOn: "../../role",
              condition: (val) => val === "Admin",
            },
          },
        ],
      },
    ],
  },
];

const {
  formData,
  validate,
  resetForm,
  setFormData,

  updateField,
  updateFields,
  addRepeaterItem,
  removeRepeaterItem,
  moveRepeaterItem,
} = useVorm(schema);

async function submit() {
  const ok = await validate();
  console.log("✅ Valid:", ok);
  console.log("📦 Data:", JSON.stringify(formData));
}

function addContact() {
  addRepeaterItem("contacts", { name: "", phone: "" });
}

function removeContact(index: number) {
  removeRepeaterItem("contacts", index);
}

function logEvent(type: string, e: any) {
  console.log(`📣 ${type}`, e);
}

onMounted(() => {
  setFormData(
    {
      username: "flo0806",
      email: "flo@example.com",
      password: "secret123",
      role: "Admin",
      adminCode: "ADM-42",
      info: "Nur sichtbar, kein Fehlertext",
      notes: "Das ist ein interner Hinweis",
      tos: true,
      contacts: [
        {
          name: "Anna Müller",
          phone: "01234 567890",
          email: "tester@test.de",
          business: [
            { email: "anna@firma.de", department: "HR" },
            { email: "anna.sales@firma.de", department: "Sales" },
          ],
        },
        {
          name: "Ben Schulz",
          phone: "09876 543210",
          email: "tester@te22st.de",
          business: [
            { email: "anna2@firma.de", department: "HR" },
            { email: "anna3.sales@firma.de", department: "Sales" },
          ],
        },
      ],
    },
    {
      fieldOptions: {
        role: [
          { label: "User", value: "User" },
          { label: "Admin", value: "Admin" },
        ],
      },
    }
  );

  // updateField("role", "Admin", {
  //   fieldOptions: [
  //     { label: "User", value: "User" },
  //     { label: "Admin", value: "Admin" },
  //     { label: "Moderator 1", value: "Moderator" },
  //   ] as Option[],
  // });

  setTimeout(() => {
    updateFields(
      { "contacts[0].name": "Max Mustermann" },
      { touched: true, validate: true }
    );
  }, 4000);

  setTimeout(() => {
    moveRepeaterItem("contacts", 1, 0);
  }, 7000);
});
</script>

<template>
  <VormProvider v-model="formData">
    <VormSection title="Erweitertes Beispiel mit Kontakten">
      <AutoVorm
        @input="(e) => logEvent('input', e)"
        :exclude-repeaters="true"
        :include-children="false"
        layout="grid"
        :columns="1"
      >
        <template #wrapper:[info]="{ slotName, field, state, content }">
          <div class="form-grid-item-2 italic text-sm text-gray-500">
            <label :for="field.name">{{ field.label }} {{ slotName }}</label>
            <component :is="content()" />
          </div>
        </template>

        <template #notes="{ field, state, path }">
          <div>{{ path }}</div>
          <VormInput
            :field="field"
            :path="path"
            v-model="formData"
            :error="state.error"
          />
        </template>
      </AutoVorm>

      <VormRepeater name="contacts">
        <template #default="{ fullName }">
          <AutoVorm
            :only="[fullName]"
            :exclude-repeaters="true"
            @input="(e) => logEvent('input', e)"
          >
          </AutoVorm>
        </template>
      </VormRepeater>

      <!-- <VormRepeater name="contacts">
        <template #default="{ fullName, index, data, indexes }">
          <div class="p-4 border mb-2 rounded">
            <h3>Kontakt {{ index + 1 }} {{ fullName }}</h3>
            <VormInput
              :field="{ name: 'name', label: 'Name', type: 'text' }"
              :path="${fullName}.name"
              :model-value="data"
              :error="undefined"
              @update:modelValue="(val) => (data.name = val.name)"
            />

            <VormInput
              :field="{ name: 'phone', label: 'Telefon', type: 'text' }"
              :path="${fullName}.phone"
              :model-value="data"
              :error="undefined"
              @update:modelValue="(val) => (data.phone = val.phone)"
            />

            <VormInput
              :field="{ name: 'email', label: 'E-Mail', type: 'email' }"
              :path="${fullName}.email"
              :model-value="data"
              :error="undefined"
              @update:modelValue="(val) => (data.email = val.email)"
            />

            <button
              @click="removeContact(index)"
              class="mt-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Entfernen
            </button>
          </div>
        </template>
      </VormRepeater> -->
    </VormSection>

    <div class="flex gap-2 my-4">
      <button
        @click="addContact"
        class="bg-green-600 text-white px-3 py-1 rounded"
      >
        Kontakt hinzufügen
      </button>
      <button
        v-if="formData.contacts?.length > 0"
        @click="removeContact(formData.contacts.length - 1)"
        class="bg-red-600 text-white px-3 py-1 rounded"
      >
        Letzten Kontakt entfernen
      </button>
    </div>

    <div class="flex gap-4 mt-4">
      <button @click="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
        Absenden
      </button>
      <button
        @click="resetForm"
        class="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Zurücksetzen
      </button>
    </div>

    <pre class="mt-6 text-xs bg-black-100 p-2 border rounded">
Data: {{ formData }}
    </pre>
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
