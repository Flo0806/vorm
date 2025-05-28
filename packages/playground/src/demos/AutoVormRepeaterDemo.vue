<script setup lang="ts">
import { AutoVorm } from "vorm/components";
import { matchField, useVorm, type VormSchema } from "vorm";
import { onMounted, reactive, ref } from "vue";
const testDisabled = ref<boolean>(true);

const schema: VormSchema = reactive([
  {
    name: "firstName",
    type: "text",
    label: "FirstName",
    validation: [{ rule: "required" }],
    classes: {
      input: "my-input",
      help: "my-help",
      outer: "form-grid-item",
    },
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    validation: [
      { rule: "required" },
      { rule: matchField("firstName"), message: "Test test" },
    ],
    validationMode: "onBlur",
  },
  {
    name: "contacts",
    type: "repeater",
    label: "Ansprechpartner",
    validation: [{ rule: "required" }],
    fields: [
      { name: "name", type: "text", label: "Name" },
      { name: "email", type: "email", label: "E-Mail", inheritWrapper: true },
      {
        name: "phones",
        type: "repeater",
        fields: [
          { name: "number", label: "Nummer", type: "text" },
          {
            name: "Testoption",
            type: "select",
            options: [
              { label: "User", value: 1 },
              { label: "Admin", value: 2 },
              { label: "Moderator", value: 3, disabled: testDisabled },
            ],
          },
        ],
      },
    ],
  },
]);

const { formData, errors, validate } = useVorm(schema); // { formData, errors, validate }

onMounted(() => {
  setTimeout(() => {
    formData.contacts[0].phones[1].number = "123456789";
  }, 5000);

  setTimeout(() => {
    testDisabled.value = false;
    // console.log("schema", schema[2]);
    // const modOption = (
    //   schema[2].fields![2].fields![1].options as Option[]
    // ).find((opt) => typeof opt === "object" && opt.label === "Moderator");
    // if (modOption && typeof modOption === "object") {
    //   modOption.disabled = false;
    // }
  }, 3000);
});

async function onSubmit() {
  if (await validate()) console.log("Form 1 valid:", formData);
  else console.log("Errors:", errors);
}

function submitEvent(e: SubmitEvent) {
  e.preventDefault();
  console.log("Form submitted");
}
</script>

<template>
  <!-- <AutoVorm :schema="schema" :showError="true"> -->
  <AutoVorm as="form" @submit="submitEvent">
    <template #before-email>
      <p class="text-xs text-blue-700 italic mb-2">
        Bitte gib deine geschäftliche E-Mail-Adresse an.
      </p>
    </template>
    <template #wrapper:email="{ field, content, state }">
      <div class="p-4 border rounded form-grid-item-2" :class="state.classes">
        <label :for="field.name">Hier: {{ field.label }}</label>
        <component :is="content()" />
        <p v-if="state.error" class="text-red-500 text-xs">{{ state.error }}</p>
      </div>
    </template>
    <template #wrapper:[contacts.email]="{ field, content, state }">
      <div class="p-4 border rounded form-grid-item-2" :class="state.classes">
        <label :for="field.name">Hier teswt: {{ field.label }}</label>
        <component :is="content()" />
        <p v-if="state.error" class="text-red-500 text-xs">{{ state.error }}</p>
      </div>
    </template>
    <template #after-email>
      <button class="form-grid-item-2" @click="onSubmit" type="submit">
        Absenden
      </button>
    </template>

    <!-- <template #wrapper:[contacts.email]="{ field, content, state }">
      <div class="p-4 border rounded form-grid-item-2" :class="state.classes">
        <label :for="field.name">Hier2: {{ field.label }}</label>
        <component :is="content()" />
        <p v-if="state.error" class="text-red-500 text-xs">{{ state.error }}</p>
      </div>
    </template> -->
  </AutoVorm>
  <button
    type="button"
    class="btn mt-4"
    @click="
      {
        const newContact = {
          name: '',
          email: '',
          phones: [{ number: 'Test123' }],
        };

        formData.contacts.push(newContact);

        // optional: direkt weiteren phone-Eintrag hinzufügen
        newContact.phones.push({ number: 'Zweitnummer' });

        console.log(formData.contacts);
      }
    "
  >
    ➕ Ansprechpartner hinzufügen
  </button>

  <button class="form-grid-item-2" @click="onSubmit" type="submit">
    Absenden
  </button>
</template>

<style>
.form-grid-wrapper {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 Spalten */
  gap: 1.5rem;
  padding: 2rem;
  background-color: #5a3333;
  border-radius: 1rem;
  border: 1px solid #ddd;
}

.form-grid-item {
  grid-column: span 2;
}

.form-grid-item-2 {
  grid-column: 1;
}
</style>
