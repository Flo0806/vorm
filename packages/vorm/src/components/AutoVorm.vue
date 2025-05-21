<script setup lang="ts">
import { computed, useSlots, onMounted, h, StyleValue } from "vue";
import { useVormContext } from "../composables/useVormContext";
import type { FieldState, FormFieldSchema } from "../types/schemaTypes";

const props = defineProps<{
  layout?: "stacked" | "horizontal" | "grid";
  columns?: number;
  gridClass?: string;
  fieldWrapperClass?: string;
  only?: string[];
  errorClass?: any;
  classes?: any;
}>();

const vorm = useVormContext();
const slots = useSlots();

const defaultGridClass = computed(() => {
  if (props.layout === "grid") {
    return `grid grid-cols-${props.columns || 1} gap-4`;
  }
  return "flex flex-col gap-4";
});

const visibleFieldNames = computed(() => {
  const baseNames = props.only || vorm.schema.map((f) => f.name);
  return baseNames.filter((name) => {
    const config = vorm.schema.find((f) => f.name === name);
    if (!config) return false;
    const showIf = config.showIf;
    if (!showIf) return true;
    return typeof showIf === "function"
      ? showIf(vorm.formData)
      : Object.entries(showIf).every(([k, v]) => vorm.formData[k] === v);
  });
});

function getFieldConfig(name: string): FormFieldSchema {
  return (
    vorm.schema.find((f) => f.name === name) || {
      name,
      type: "text",
      label: "",
      showError: true,
    }
  );
}

function hasSlot(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(slots, name);
}

const fieldStates = computed(() =>
  Object.fromEntries(
    visibleFieldNames.value.map((fieldName) => {
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
          wasValidated && error ? props.errorClass : "",
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
  const raw = slotName.slice(8).replace(/[[\]\s]/g, "");
  return raw.split(/[:,]/);
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

function resolveOptions(field: FormFieldSchema): string[] {
  return typeof field.options === "function"
    ? field.options(vorm.formData)
    : field.options || [];
}

function renderDefaultInput(fieldName: string) {
  const config = getFieldConfig(fieldName);
  const state = fieldStates.value[fieldName];
  const value = vorm.formData[fieldName];
  const inputProps = {
    id: fieldName,
    name: fieldName,
    class: ["input", config.classes?.input],
    value,
    onInput: (e: any) => {
      vorm.formData[fieldName] = e.target.value;
      vorm.dirty[fieldName] = e.target.value !== vorm.initial?.[fieldName];
      maybeValidate("onInput", fieldName);
    },
    onBlur: () => {
      vorm.touched[fieldName] = true;
      maybeValidate("onBlur", fieldName);
    },
  };

  if (config.type === "select") {
    return h(
      "select",
      inputProps,
      resolveOptions(config).map((opt) => h("option", { value: opt }, opt))
    );
  }

  return h(config.type === "textarea" ? "textarea" : "input", inputProps);
}

function renderFieldContent(fieldName: string) {
  console.log("renderFieldContent", fieldName);
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
      const exists = vorm.schema.some((f) => f.name === field);
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
  <div :class="(gridClass || defaultGridClass, classes?.outer || '')">
    <template v-for="fieldName in visibleFieldNames" :key="fieldName">
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

      <div
        v-else
        :class="getFieldConfig(fieldName).classes?.outer ? getFieldConfig(fieldName).classes!.outer : fieldWrapperClass || 'flex flex-col gap-1'"
      >
        <label
          :for="fieldName"
          :class="getFieldConfig(fieldName).classes?.label"
        >
          {{ hasSlot(fieldName) ? "" : getFieldConfig(fieldName).label }}
        </label>
        <component :is="renderFieldContent(fieldName)" />

        <p
          v-if="
            getFieldConfig(fieldName).showError !== false &&
            fieldStates[fieldName].error
          "
          :class="getFieldConfig(fieldName).classes?.help ? getFieldConfig(fieldName).classes!.help : 'text-red-500 text-sm'"
        >
          {{ fieldStates[fieldName].error }}
        </p>
      </div>

      <slot v-if="hasSlot(`after-${fieldName}`)" :name="`after-${fieldName}`" />
    </template>
  </div>
</template>
