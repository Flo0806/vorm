<script setup lang="ts">
import { computed, useSlots, onMounted, h } from "vue";
import { useVormContext } from "../composables/useVormContext";
import type {
  FieldState,
  FormFieldSchema,
  VormSchema,
} from "../types/schemaTypes";

const props = defineProps<{
  schema: VormSchema;
  layout?: "stacked" | "horizontal" | "grid";
  columns?: number;
  gridClass?: string;
  fieldWrapperClass?: string;
  only?: string[];
  showError?: boolean;
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

const fieldStates = computed(() =>
  Object.fromEntries(
    validFieldNames.value.map((fieldName) => {
      const mode = vorm.getValidationMode(fieldName);
      const error = vorm.errors[fieldName];
      const value = vorm.formData[fieldName];
      const hasValue = value !== "" && value != null;
      const wasValidated = vorm.validatedFields?.[fieldName] === true;
      const touched = vorm.touched?.[fieldName] === true;
      const dirty = vorm.dirty?.[fieldName] === true;
      const initial = vorm.initial?.[fieldName];

      const state: FieldState = {
        error,
        valid: !error && hasValue && wasValidated,
        invalid: !!error && wasValidated,
        validationMode: mode,
        touched,
        dirty,
        initialValue: initial,
        classes: [
          wasValidated && error ? "vorm-invalid" : "",
          wasValidated && !error && hasValue ? "vorm-valid" : "",
          touched ? "vorm-touched" : "",
          dirty ? "vorm-dirty" : "",
        ]
          .filter(Boolean)
          .join(" "),
      };

      return [fieldName, state];
    })
  )
);

function maybeValidate(trigger: "onInput" | "onBlur", fieldName: string) {
  const mode = vorm.getValidationMode(fieldName);
  if (mode === trigger) {
    vorm.validateFieldByName(fieldName);
  }
}

function parseWrapperSlotNames(slotName: string): string[] {
  if (!slotName.startsWith("wrapper:")) return [];
  const raw = slotName.slice(8);
  const cleaned = raw.replace(/[\[\]\s]/g, "");
  return cleaned.split(/[:,]/);
}

function hasSlotMatchingWrapperMulti(fieldName: string): boolean {
  return Object.keys(slots).some((name) => {
    if (name === `wrapper:${fieldName}` || name === "wrapper") return false;
    return parseWrapperSlotNames(name).includes(fieldName);
  });
}

function getWrapperSlotName(fieldName: string): string {
  const match = Object.keys(slots).find((name) => {
    if (name === `wrapper:${fieldName}` || name === "wrapper") return false;
    return parseWrapperSlotNames(name).includes(fieldName);
  });
  return match || "wrapper";
}

function renderDefaultInput(fieldName: string) {
  return h("input", {
    id: fieldName,
    name: fieldName,
    type: getFieldConfig(fieldName).type,
    class: ["input", fieldStates.value[fieldName].classes],
    value: vorm.formData[fieldName],
    onInput: (e: any) => {
      const newValue = e.target.value;
      vorm.formData[fieldName] = newValue;
      vorm.dirty[fieldName] = newValue !== vorm.initial?.[fieldName];
      maybeValidate("onInput", fieldName);
    },
    onBlur: () => {
      vorm.touched[fieldName] = true;
      maybeValidate("onBlur", fieldName);
    },
  });
}

function renderFieldContent(fieldName: string) {
  if (hasSlot(fieldName)) {
    return h(
      "div",
      {},
      slots[fieldName]?.({
        field: getFieldConfig(fieldName),
        state: fieldStates.value[fieldName],
      })
    );
  }
  return renderDefaultInput(fieldName);
}

onMounted(() => {
  Object.keys(slots).forEach((slotName) => {
    const name = slotName.startsWith("#") ? slotName.slice(1) : slotName;
    const raw = name
      .replace(/^before-/, "")
      .replace(/^after-/, "")
      .replace(/^wrapper:/, "")
      .replace(/[\[\]\s]/g, "");
    const fieldCandidates = raw.split(/[:,]/).map((n) => n.trim());

    fieldCandidates.forEach((field) => {
      const exists = props.schema.some((f) => f.name === field);
      if (!exists) {
        console.error(
          `[AutoVorm] Slot "${slotName}" does not match any field in schema.`
        );
      }
    });
  });
});
</script>

<template>
  <div :class="gridClass || defaultGridClass">
    <template v-for="fieldName in validFieldNames" :key="fieldName">
      <slot
        v-if="hasSlot(`before-${fieldName}`)"
        :name="`before-${fieldName}`"
      />

      <slot
        v-if="hasSlot(`wrapper:${fieldName}`)"
        :name="`wrapper:${fieldName}`"
        :field="getFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
      />

      <slot
        v-else-if="hasSlotMatchingWrapperMulti(fieldName)"
        :name="getWrapperSlotName(fieldName)"
        :field="getFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
      />

      <slot
        v-else-if="hasSlot('wrapper')"
        name="wrapper"
        :field="getFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
      />

      <div v-else :class="fieldWrapperClass || 'flex flex-col gap-1'">
        <template v-if="hasSlot(fieldName)">
          <slot
            :name="fieldName"
            :field="getFieldConfig(fieldName)"
            :state="fieldStates[fieldName]"
          />
        </template>
        <template v-else>
          <label :for="fieldName">
            {{ getFieldConfig(fieldName).label || fieldName }}
          </label>
          <input
            :id="fieldName"
            :name="fieldName"
            :type="getFieldConfig(fieldName).type || 'text'"
            :class="['input', fieldStates[fieldName].classes]"
            :value="vorm.formData[fieldName]"
            @input="(e: any) => {
    const newValue = e.target.value;
    vorm.formData[fieldName] = newValue;
    vorm.dirty[fieldName] = newValue !== vorm.initial?.[fieldName];
    maybeValidate('onInput', fieldName);
  }"
            @blur="
              () => {
                vorm.touched[fieldName] = true;
                maybeValidate('onBlur', fieldName);
              }
            "
          />

          <p
            v-if="props.showError !== false && fieldStates[fieldName].error"
            class="text-red-500 text-sm"
          >
            {{ fieldStates[fieldName].error }}
          </p>
        </template>
      </div>

      <slot v-if="hasSlot(`after-${fieldName}`)" :name="`after-${fieldName}`" />
    </template>
  </div>
</template>
