<script setup lang="ts">
import { computed, onMounted, useSlots, h } from "vue";
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
  return (
    props.schema.find((f) => f.name === name) || {
      name,
      type: "text",
      label: "",
    }
  );
}

function hasSlot(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(slots, name);
}

function renderFieldContent(fieldName: string) {
  const field = getFieldConfig(fieldName);
  if (!field) return null;

  if (hasSlot(fieldName)) {
    return h("div", {}, slots[fieldName]?.({ field }));
  }

  return h("div", {}, [
    h("label", { for: fieldName }, field.label || fieldName),
    h("input", {
      id: fieldName,
      name: fieldName,
      type: field.type || "text",
      class: "input",
      onInput: (e: any) => (vorm.formData[fieldName] = e.target.value),
      value: vorm.formData[fieldName],
    }),
  ]);
}

onMounted(() => {
  const slotNames = Object.keys(slots);
  slotNames.forEach((slotName) => {
    const clean = slotName.replace(/^before-|^after-/, "");
    const exists = props.schema.find((f) => f.name === clean);
    if (!exists && slotName !== "wrapper") {
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

      <template v-if="hasSlot('wrapper')">
        <slot
          name="wrapper"
          :field="getFieldConfig(fieldName)"
          :content="renderFieldContent(fieldName)"
        />
      </template>
      <template v-else>
        <div :class="fieldWrapperClass || 'flex flex-col gap-1'">
          <component :is="renderFieldContent(fieldName)" />
        </div>
      </template>

      <template v-else>
        <div :class="fieldWrapperClass || 'flex flex-col gap-1'">
          <component :is="renderFieldContent(fieldName)" />
        </div>
      </template>

      <template v-if="hasSlot(`after-${fieldName}`)">
        <slot :name="`after-${fieldName}`" />
      </template>
    </template>
  </div>
</template>
