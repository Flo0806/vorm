<script setup lang="ts">
/**
 * VormField - Internal component for isolated reactivity
 *
 * This component exists PURELY for Vue's component-level reactivity boundary.
 * Each VormField instance only re-renders when its own field data changes,
 * NOT when other fields change.
 *
 * This is NOT exported to users - AutoVorm uses it internally.
 */
import { computed, h, type VNode } from "vue";
import { useVormContext } from "../composables/useVormContext";
import type { FieldState, VormFieldSchema } from "../types/schemaTypes";
import { expandSchema } from "../utils/expandSchema";
import { getValueByPath, extractRepeaterIndexes } from "../utils/pathHelpers";
import { updateFieldValue } from "../utils/eventHelper";
import { resolveReactive, resolveReactiveBoolean } from "../utils/reactiveResolver";

const props = defineProps<{
  fieldName: string;
  errorClass?: string;
  fieldWrapperClass?: string;
  // Slot render functions from AutoVorm
  wrapperSlot?: (props: any) => any;
  beforeSlot?: () => any;
  afterSlot?: () => any;
}>();

const emit = defineEmits<{
  (e: "input", payload: any): void;
  (e: "blur", payload: any): void;
  (e: "validate", payload: any): void;
}>();

const vorm = useVormContext();

// ============ FIELD CONFIG ============
const fieldConfig = computed<VormFieldSchema>(() => {
  const exact = expandSchema(vorm.schema, vorm.formData).find(
    (f) => f.name === props.fieldName
  );
  if (exact) return exact;

  const rawValue = getValueByPath(vorm.formData, props.fieldName);
  if (Array.isArray(rawValue)) {
    return {
      name: props.fieldName,
      type: "repeater",
      label: props.fieldName.split(".").pop() ?? "",
      fields: [],
    };
  }

  return { name: props.fieldName, type: "text", label: "", showError: true };
});

// ============ RESOLVED VALUES ============
const resolved = computed(() => {
  const field = fieldConfig.value;
  return {
    label: resolveReactive(field.label, vorm).value,
    placeholder: resolveReactive(field.placeholder, vorm).value,
    helpText: resolveReactive(field.helpText, vorm).value,
    disabled: resolveReactiveBoolean(field.disabled, vorm).value,
  };
});

// ============ FIELD STATE ============
const state = computed<FieldState>(() => {
  const name = props.fieldName;
  const error = vorm.errors[name];
  const value = vorm.formData[name];
  const hasValue = value !== "" && value != null;
  const wasValidated = vorm.validatedFields?.[name] === true;

  return {
    error,
    valid: !error && hasValue && wasValidated,
    invalid: !!error && wasValidated,
    validationMode: vorm.getValidationMode(name),
    touched: vorm.touched?.[name] === true,
    dirty: vorm.dirty?.[name] === true,
    initialValue: vorm.initial?.[name],
    classes: [
      wasValidated && error ? props.errorClass : "",
      wasValidated && !error && hasValue ? "vorm-valid" : "",
      vorm.touched?.[name] ? "vorm-touched" : "",
      vorm.dirty?.[name] ? "vorm-dirty" : "",
    ].filter(Boolean).join(" "),
  };
});

// ============ EVENT HANDLERS ============
function emitEvent(type: "input" | "blur" | "validate", value: any, e?: Event) {
  let prevented = false;
  const payload = {
    name: props.fieldName,
    value,
    originalEvent: e,
    field: fieldConfig.value,
    preventDefault: () => { prevented = true; },
  };
  emit(type, payload);
  return !prevented;
}

function maybeValidate(trigger: "onInput" | "onBlur") {
  if (vorm.getValidationMode(props.fieldName) === trigger) {
    vorm.validateFieldByName(props.fieldName);
    emitEvent("validate", vorm.formData[props.fieldName]);
  }
}

function onInput(e: Event) {
  updateFieldValue(e, fieldConfig.value, vorm, emitEvent, maybeValidate);
}

function onBlur(e: Event) {
  vorm.touched[props.fieldName] = true;
  maybeValidate("onBlur");
  emitEvent("blur", vorm.formData[props.fieldName], e);
}

// ============ OPTIONS (for select) ============
function getOptions() {
  const field = fieldConfig.value;
  let opts: any[] | undefined;

  if (field.options) {
    if (typeof field.options === 'function') {
      const result = field.options();
      if (Array.isArray(result)) opts = result;
    } else if (Array.isArray(field.options)) {
      opts = field.options;
    }
  }

  if (!opts?.length) opts = vorm.getFieldOptions(field.name).value;
  if (!opts?.length) return [];

  return opts.map((o) => typeof o === "string" ? { label: o, value: o } : o);
}

// ============ RENDER INPUT ============
function renderInput(): VNode | null {
  const config = fieldConfig.value;
  const value = getValueByPath(vorm.formData, props.fieldName);
  if (typeof value === "object" && value !== null) return null;

  const attrs = {
    id: `vorm-${props.fieldName}`,
    name: props.fieldName,
    class: config.classes?.input ?? `vorm-${config.type}`,
    placeholder: resolved.value.placeholder || undefined,
    disabled: resolved.value.disabled || undefined,
    onInput,
    onBlur,
  };

  if (config.type === "select") {
    return h("select", { ...attrs, value }, getOptions().map((o) =>
      h("option", { value: o.value, disabled: o.disabled }, o.label)
    ));
  }

  if (config.type === "checkbox") {
    return h("input", { ...attrs, type: "checkbox", checked: !!value, onChange: onInput });
  }

  if (config.type === "textarea") {
    return h("textarea", { ...attrs, value });
  }

  return h("input", { ...attrs, type: config.type, value });
}

// Expose for slot usage
const slotProps = computed(() => ({
  ...vorm.bindField(props.fieldName).value,
  field: { ...fieldConfig.value, ...resolved.value },
  state: state.value,
  path: props.fieldName,
  indexes: extractRepeaterIndexes(props.fieldName),
  content: renderInput,
}));

defineExpose({ slotProps, renderInput });
</script>

<template>
  <!-- Before slot -->
  <component v-if="beforeSlot" :is="beforeSlot" />

  <!-- Wrapper slot wraps everything -->
  <component v-if="wrapperSlot" :is="() => wrapperSlot!(slotProps)" />

  <!-- Default rendering (no wrapper slot) -->
  <div v-else :class="['vorm-group', fieldWrapperClass, state.classes]">
    <label
      v-if="resolved.label && fieldConfig.type !== 'hidden'"
      :for="'vorm-' + fieldName"
      class="vorm-label"
    >
      {{ resolved.label }}
    </label>

    <slot :="slotProps">
      <component :is="renderInput" />
    </slot>

    <span v-if="state.error && fieldConfig.showError !== false" class="vorm-error">
      {{ state.error }}
    </span>

    <span v-if="resolved.helpText && !state.error" class="vorm-help">
      {{ resolved.helpText }}
    </span>
  </div>

  <!-- After slot -->
  <component v-if="afterSlot" :is="afterSlot" />
</template>
