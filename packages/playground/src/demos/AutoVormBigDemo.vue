<script setup lang="ts">
import { AutoVorm, VormSection } from "vorm/components";
import { useVorm, type VormSchema } from "vorm";

const schema: VormSchema = Array.from({ length: 500 }).map((_, i) => {
  const name = `field${i}`;
  // const isEmail = i % 10 === 0;
  // const isPassword = i % 15 === 0;
  // const isOnInput = i % 7 === 0;

  return {
    name,
    label: `Feld ${i + 1}`,
    type: "text", // isEmail ? "email" : isPassword ? "password" : "text",
    validation: [{ rule: "required" }],
    //min: 2,
    //validationMode: isOnInput ? "onInput" : "onBlur",
  };
});

// Custom Control for special field
// const CustomColor = defineComponent({
//   props: ["modelValue"],
//   emits: ["update:modelValue"],
//   render() {
//     return h("input", {
//       type: "color",
//       value: this.modelValue,
//       class: "w-16 h-10 border",
//       onInput: (e: Event) =>
//         this.$emit("update:modelValue", (e.target as HTMLInputElement).value),
//     });
//   },
// });

const { validate } = useVorm(schema);

async function onSubmit() {
  console.time("validate");
  await validate();
  console.timeEnd("validate");
  const t0 = performance.now();
  const ok = await validate();
  const t1 = performance.now();
  console.log("✅ Valid:", ok);
  console.log(`⏱ Validation time: ${Math.round(t1 - t0)}ms`);
}
</script>

<template>
  <VormSection title="Erste Hälfte (1-50)">
    <AutoVorm
      :only="schema.slice(0, 50).map((f) => f.name)"
      layout="grid"
      :columns="2"
    >
      <!-- <template #wrapper="{ field, content, state }">
        <div class="p-4 border rounded form-grid-item-2" :class="state.classes">
          <label :for="field.name">Hier: {{ field.label }}</label>
          <component :is="content()" />
          <p v-if="state.error" class="text-red-500 text-xs">
            {{ state.error }}
          </p>
        </div>
      </template> -->

      <!-- <template #field20="{ field, state }">
          <VormInput
            :name="field.name"
            v-model="formData[field.name]"
            :label="field.label"
            placeholder="Custom Email"
          />
        </template> -->
    </AutoVorm>
  </VormSection>

  <VormSection title="Zweite Hälfte (51-100)">
    <AutoVorm
      :only="schema.slice(50).map((f) => f.name)"
      layout="grid"
      :columns="2"
    >
      <template #wrapper="{ field, content, state }">
        <div class="p-4 border rounded form-grid-item-2" :class="state.classes">
          <label :for="field.name">Hier: {{ field.label }}</label>
          <component :is="content()" />
          <!-- <p v-if="state.error" class="text-red-500 text-xs">
            {{ state.error }}
          </p> -->
        </div>
      </template>
      <!-- <template #field77="{ field }">
          <label class="text-sm">{{ field.label }}</label>
          <CustomColor v-model="formData[field.name]" />
        </template> -->
    </AutoVorm>
  </VormSection>

  <button
    class="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
    @click="onSubmit"
  >
    Absenden
  </button>
</template>

<style>
label {
  font-weight: bold;
}

input.input.vorm-invalid1 {
  border: 1px solid red !important;
}
</style>
