<script setup lang="ts">
import { computed, onMounted, useSlots } from "vue";
import { useVormContext } from "../composables/useVormContext";
import type { FormFieldSchema, VormSchema } from "../types/schemaTypes";

const props = defineProps<{
  schema: VormSchema;
  layout?: "stacked" | "horizontal" | "grid";
  columns?: number;
  gridClass?: string;
  fieldWrapperClass?: string;
  only?: string[];
}>();

const vorm = useVormContext();
const slots = useSlots();
console.log(props.schema.map((f) => f.name));
const fieldNames = computed(
  () => props.only || props.schema.map((f) => f.name)
);

const defaultGridClass = computed(() => {
  if (props.layout === "grid") {
    return `grid grid-cols-${props.columns || 1} gap-4`;
  }
  return "flex flex-col gap-4";
});

const validFieldNames = computed(() =>
  (props.only || props.schema.map((f) => f.name)).filter((name) =>
    props.schema.some((f) => f.name === name)
  )
);

function assertFieldExists(name: string) {
  const exists = props.schema.find((f) => f.name === name);
  if (!exists) {
    throw new Error(
      `[AutoVorm] Field "${name}" is not defined in the provided schema.`
    );
  }
  return exists;
}

function hasSlot(name: string) {
  return Object.prototype.hasOwnProperty.call(slots, name);
}

onMounted(() => {
  const slotNames = Object.keys(slots);
  slotNames.forEach((slotName) => {
    const exists = props.schema.find((f) => f.name === slotName);
    if (!exists) {
      console.error(
        `[AutoVorm] Slot "${slotName}" does not match any field in the provided schema.`
      );
    }
  });
});
</script>

<template>
  <div :class="gridClass || defaultGridClass">
    <template v-for="fieldName in validFieldNames" :key="fieldName">
      <div :class="fieldWrapperClass || 'flex flex-col gap-1'">
        <template v-if="hasSlot(fieldName)">
          <slot
            :name="fieldName"
            :field="assertFieldExists(fieldName) || { name: fieldName }"
          />
        </template>
        <template v-else>
          <label :for="fieldName">{{
            assertFieldExists(fieldName)?.label || fieldName
          }}</label>
          <input
            :id="fieldName"
            :name="fieldName"
            :type="assertFieldExists(fieldName)?.type || 'text'"
            v-model="vorm.formData[fieldName]"
          />
        </template>
      </div>
    </template>
  </div>
</template>
