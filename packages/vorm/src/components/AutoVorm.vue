<script setup lang="ts">
import { computed, useSlots, onMounted, h } from "vue";
import { useVormContext } from "../composables/useVormContext";
import type { FormFieldSchema, VormSchema } from "../types/schemaTypes";

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

const fieldStates = computed(() => {
  return Object.fromEntries(
    validFieldNames.value.map((fieldName) => {
      const mode = vorm.getValidationMode(fieldName);
      const error = vorm.errors[fieldName];
      const value = vorm.formData[fieldName];
      const hasValue = value !== "" && value != null;
      const wasValidated = vorm.validatedFields?.[fieldName] === true;

      const state: FieldState = {
        error,
        valid: !error && hasValue && wasValidated,
        invalid: !!error && wasValidated,
        validationMode: mode,
        classes: !wasValidated
          ? ""
          : error
          ? "vorm-invalid"
          : hasValue
          ? "vorm-valid"
          : "",
      };
      return [fieldName, state];
    })
  );
});

function maybeValidate(trigger: "onInput" | "onBlur", fieldName: string) {
  const mode = vorm.getValidationMode(fieldName);
  if (mode === trigger) {
    vorm.validateFieldByName(fieldName);
  }
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

interface FieldState {
  error: string | null;
  valid: boolean;
  invalid: boolean;
  validationMode: "onInput" | "onBlur" | "onSubmit";
  classes: string;
}
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
          :state="fieldStates[fieldName]"
          :content="() => {
            if (hasSlot(fieldName)) {
              return h('div', {}, slots[fieldName]?.({
                field: getFieldConfig(fieldName),
                state: fieldStates[fieldName]
              }))
            }

            return h('input', {
              id: fieldName,
              name: fieldName,
              type: getFieldConfig(fieldName).type,
              class: ['input', fieldStates[fieldName].classes],
              value: vorm.formData[fieldName],
              onInput: (e: any) => {
                vorm.formData[fieldName] = e.target.value
                maybeValidate('onInput', fieldName)
              },
              onBlur: () => maybeValidate('onBlur', fieldName)
            })
          }"
        />
      </template>

      <template v-else>
        <div :class="fieldWrapperClass || 'flex flex-col gap-1'">
          <template v-if="hasSlot(fieldName)">
            <slot
              :name="fieldName"
              :field="getFieldConfig(fieldName)"
              :state="fieldStates[fieldName]"
            />
          </template>
          <template v-else>
            <label :for="fieldName">{{
              getFieldConfig(fieldName).label || fieldName
            }}</label>
            <input
              :id="fieldName"
              :name="fieldName"
              :type="getFieldConfig(fieldName).type || 'text'"
              :class="['input', fieldStates[fieldName].classes]"
              v-model="vorm.formData[fieldName]"
              @input="maybeValidate('onInput', fieldName)"
              @blur="maybeValidate('onBlur', fieldName)"
            />
            <p
              v-if="props.showError !== false && fieldStates[fieldName].error"
              class="text-red-500 text-sm"
            >
              {{ fieldStates[fieldName].error }}
            </p>
          </template>
        </div>
      </template>

      <template v-if="hasSlot(`after-${fieldName}`)">
        <slot :name="`after-${fieldName}`" />
      </template>
    </template>
  </div>
</template>
