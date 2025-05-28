<script setup lang="ts">
import {
  computed,
  useSlots,
  onMounted,
  h,
  type StyleValue,
  getCurrentInstance,
  inject,
} from "vue";
import { useVormContext } from "../composables/useVormContext";
import type { FieldState, VormFieldSchema } from "../types/schemaTypes";
import { expandSchema } from "../utils/expandSchema";
import { getValueByPath } from "../utils/pathHelpers";
import {
  getAncestryNames,
  slotFieldMatchesPattern,
} from "../utils/slotMatcher";
import { updateFieldValue } from "../utils/eventHelper";

const register = inject<(meta: { as?: string }) => void>(
  "registerVorm",
  () => {}
);

const props = defineProps<{
  layout?: "stacked" | "horizontal" | "grid";
  columns?: number;
  fieldWrapperClass?: string;
  only?: string[];
  errorClass?: any;
  classes?: any;
  as?: string;
  containerClass?: string;
  containerStyle?: StyleValue;
}>();

const emit = defineEmits<{
  (e: "submit", evt: SubmitEvent): void;
  (e: "input", payload: any): void;
  (e: "blur", payload: any): void;
  (e: "validate", payload: any): void;
}>();

const vorm = useVormContext();
const slots = useSlots();

//#region Computed Properties
const expandedSchema = computed(() => expandSchema(vorm.schema, vorm.formData));

// Visibility of fields based on the `only` prop or schema `showIf` configuration
const visibleFieldNames = computed(() => {
  const baseNames = props.only || expandedSchema.value.map((f) => f.name);
  return baseNames.filter((name) => {
    const config = expandedSchema.value.find((f) => f.name === name);
    if (!config) return false;
    const showIf = config.showIf;
    if (!showIf) return true;
    return typeof showIf === "function"
      ? showIf(vorm.formData)
      : Object.entries(showIf).every(([k, v]) => vorm.formData[k] === v);
  });
});

// States of all fields in the form
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
//#endregion

//#region Helper Functions
/**
 * Emit an event for a field, handling input, blur, and validation events.
 * It prevents the default action if preventDefault is called.
 * @param type - The type of event: "input", "blur", or "validate"
 * @param name - The name of the field
 * @param value - The value of the field
 * @param originalEvent - The original event object (optional)
 */
function emitFieldEvent(
  type: "input" | "blur" | "validate",
  name: string,
  value: any,
  originalEvent?: Event
) {
  let prevented = false;

  const payload = {
    name,
    value,
    originalEvent,
    field: getFieldConfig(name),
    preventDefault: () => {
      prevented = true;
    },
  };

  // Call explicit event handlers
  if (type === "input") emit("input", payload);
  else if (type === "blur") emit("blur", payload);
  else if (type === "validate") emit("validate", payload);
  return !prevented;
}

/**
 * Get the configuration for a field by its name.
 * If the field is not found, it returns a default configuration.
 * @param name
 */
function getFieldConfig(name: string): VormFieldSchema {
  return (
    expandedSchema.value.find((f) => f.name === name) || {
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

/**
 * Check if the field should be validated based on the trigger and validation mode.
 * @param trigger
 * @param fieldName
 */
function maybeValidate(trigger: "onInput" | "onBlur", fieldName: string) {
  const mode = vorm.getValidationMode(fieldName);
  console.log(mode, trigger, fieldName);
  if (mode === trigger) {
    vorm.validateFieldByName(fieldName);
    emitFieldEvent("validate", fieldName, vorm.formData[fieldName]);
  }
}

/**
 * Parse the slot name for wrapper slots.
 * @param slotName
 */
function parseWrapperSlotNames(slotName: string): string[] {
  if (!slotName.startsWith("wrapper:")) return [];

  // Hold the format in [] → e.g. wrapper:[contacts:email,foo:bar]
  const raw = slotName.slice(8).trim(); // "contacts:email,foo:bar"

  if (raw.startsWith("[") && raw.endsWith("]")) {
    const list = raw.slice(1, -1); // ohne []
    return list.split(",").map((s) => s.trim()); // ['contacts:email', 'foo:bar']
  }

  return [raw];
}

/**
 * Check if there is a slot that matches the fieldName with a wrapper prefix in a list.
 * @param fieldName
 */
function hasSlotMatchingWrapperMulti(fieldName: string): boolean {
  const field = getFieldConfig(fieldName);

  return Object.keys(slots).some((slotName) => {
    if (!slotName.startsWith("wrapper:")) return false;
    if (slotName === `wrapper:${fieldName}` || slotName === "wrapper")
      return false;

    const patterns = parseWrapperSlotNames(slotName);

    return patterns.some((pattern) =>
      slotFieldMatchesPattern(fieldName, pattern, field.inheritWrapper === true)
    );
  });
}

/**
 * Get the slot name for a wrapper that matches the fieldName.
 * It checks for direct matches first, then looks for ancestor patterns.
 * If no match is found, it returns the default "wrapper" slot.
 
 * @param fieldName 
 */
function getWrapperSlotName(fieldName: string): string {
  const directName = `wrapper:${fieldName}`;
  if (hasSlot(directName)) return directName;

  const ancestry = getAncestryNames(fieldName); // e.g. ["contacts.business.email", "business.email", "email"]
  const candidateSlots = Object.keys(slots).filter(
    (slotName) => slotName.startsWith("wrapper:") && slotName !== "wrapper"
  );

  for (const ancestor of ancestry) {
    const match = candidateSlots.find((slotName) => {
      const patterns = parseWrapperSlotNames(slotName);
      return patterns.includes(ancestor);
    });
    if (match) return match;
  }

  return "wrapper"; // Fallback
}

/**
 * Resolve the options for a select field.
 * If options is a function, it calls it with the current form data.
 * Otherwise, it returns the options directly.
 * @param field
 */
function resolveOptions(
  field: VormFieldSchema
): { label: string; value: any; disabled?: boolean }[] {
  const raw =
    typeof field.options === "function"
      ? field.options(vorm.formData)
      : field.options || [];

  return raw.map((opt) => {
    if (typeof opt === "string") return { label: opt, value: opt };
    return opt;
  });
}

/**
 * Render the default input element based on the field type.
 * @param fieldName
 */
function renderDefaultInput(fieldName: string) {
  const config = getFieldConfig(fieldName);
  const value = getValueByPath(vorm.formData, fieldName);
  const inputProps = {
    id: fieldName,
    name: fieldName,
    class: ["input", config.classes?.input],
    type:
      config.type !== "select" && config.type !== "textarea"
        ? config.type
        : undefined,
    value,
    onInput: (e: any) => {
      updateFieldValue(e, config, vorm, emitFieldEvent, maybeValidate);
    },
    onBlur: (e: any) => {
      vorm.touched[fieldName] = true;
      maybeValidate("onBlur", fieldName);
      emitFieldEvent(
        "blur",
        fieldName,
        getValueByPath(vorm.formData, fieldName),
        e
      );
    },
  };

  if (config.type === "select") {
    return h(
      "select",
      inputProps,
      resolveOptions(config).map((opt) =>
        h("option", { value: opt.value, disabled: opt.disabled }, opt.label)
      )
    );
  }

  return h(config.type === "textarea" ? "textarea" : "input", inputProps);
}

/**
 * Render the content of a field. Check if a slot exists and return a wrapper if it does.
 * If no slot is found, it renders the default input based on the field type.
 * @param fieldName
 */
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
//#endregion

onMounted(() => {
  // Register the component with the parent VormProvider
  register({ as: props.as });

  Object.keys(slots).forEach((slotName) => {
    if (["default", "fallback", "root", "_", "wrapper"].includes(slotName))
      return;

    const name = slotName.startsWith("#") ? slotName.slice(1) : slotName;
    const raw = name
      .replace(/^before-/, "")
      .replace(/^after-/, "")
      .replace(/^wrapper:/, "")
      .replace(/[\[\]\s]/g, "");
    const fieldCandidates = raw.split(/[.,]/).map((n) => n.trim());

    fieldCandidates.forEach((field) => {
      const exists = vorm.schema.some((f) => f.name === field);
      if (!exists) {
        console.error(
          `[AutoVorm] Slot "${slotName}" does not match any field in schema.`
        );
      }
    });
  });

  // Submit warning checks
  const isForm = props.as === "form";
  const hasSubmitListener = !!getCurrentInstance()?.vnode.props?.onSubmit;

  if (import.meta.env.DEV) {
    if (isForm && !hasSubmitListener) {
      console.warn(
        "[AutoVorm] 'as=\"form\"' is set, but no @submit listener – the form cannot be submitted."
      );
    }

    if (!isForm && hasSubmitListener) {
      console.warn(
        "[AutoVorm] @submit listener is set, but 'as' is not 'form' – submit will never be triggered."
      );
    }
  }
});

defineExpose({
  reset: () => vorm.resetForm(),
  touchAll: () => vorm.touchAll(),
  getErrors: () => vorm.getErrors(),
  getTouched: () => vorm.getTouched(),
  getDirty: () => vorm.getDirty(),
  validate: () => vorm.validate(),
});
</script>

<template>
  <component
    :is="props.as || 'div'"
    :class="containerClass || undefined"
    :style="containerStyle"
    @submit.prevent="emit('submit', $event)"
  >
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
  </component>
</template>
