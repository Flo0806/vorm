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

function getFieldConfig(name: string): FormFieldSchema {
  const exists = props.schema.find((f) => f.name === name);
  // This method helps to guarantee that the field exists in the schema
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

// Check if all slots match the schema
onMounted(() => {
  const slotNames = Object.keys(slots);
  slotNames.forEach((slotName) => {
    const base = slotName.replace(/^before-|^after-/, "");
    const exists = props.schema.find((f) => f.name === base);
    if (!exists) {
      console.error(
        `[AutoVorm] Slot "${slotName}" does not match any field in schema.`
      );
    }
  });
});
</script>

<template>
  <div :class="gridClass || defaultGridClass">
    <template v-for="fieldName in validFieldNames" :key="fieldName">
      <template v-if="hasSlot(`before-${fieldName}`)">
        <slot :name="`before-${fieldName}`" />
      </template>

      <div :class="fieldWrapperClass || 'flex flex-col gap-1'">
        <template v-if="hasSlot(fieldName)">
          <slot :name="fieldName" :field="getFieldConfig(fieldName)" />
        </template>
        <template v-else>
          <label :for="fieldName">{{
            getFieldConfig(fieldName)?.label || fieldName
          }}</label>
          <input
            :id="fieldName"
            :name="fieldName"
            :type="getFieldConfig(fieldName)?.type || 'text'"
            v-model="vorm.formData[fieldName]"
          />
        </template>
      </div>

      <template v-if="hasSlot(`after-${fieldName}`)">
        <slot :name="`after-${fieldName}`" />
      </template>
    </template>
  </div>
</template>

<!-- <template>
  <div :class="gridClass || defaultGridClass">
    <template v-for="fieldName in validFieldNames" :key="fieldName">
      <div :class="fieldWrapperClass || 'flex flex-col gap-1'">
        <template v-if="hasSlot(fieldName)">
          <slot :name="fieldName" :field="assertFieldExists(fieldName)" />
        </template>
        <template v-else>
          <label :for="fieldName">{{
            assertFieldExists(fieldName)?.label
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
</template> -->
