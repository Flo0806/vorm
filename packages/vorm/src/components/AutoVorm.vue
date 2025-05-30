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
import { getValueByPath, extractRepeaterIndexes } from "../utils/pathHelpers";
import {
  getAncestryNames,
  normalizeFieldName,
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
  excludeRepeaters?: boolean;
}>();

const basePath = computed(() => {
  if (props.only?.length === 1) return props.only[0];
  return "";
});

const emit = defineEmits<{
  (e: "submit", evt: SubmitEvent): void;
  (e: "input", payload: any): void;
  (e: "blur", payload: any): void;
  (e: "validate", payload: any): void;
}>();

const vorm = useVormContext();
const slots = useSlots();

const defaultGridClass = computed(() => {
  if (props.layout === "grid") {
    return `vorm-grid vorm-grid-cols-${props.columns || 1}`;
  }
  return "vorm-group";
});

/**
 * Retrieves a nested schema from a given path
 */
function getSubSchemaAt(
  schema: VormFieldSchema[],
  path: string
): VormFieldSchema[] {
  const parts = path.split(/\.|\[\d+\]/g).filter(Boolean);
  let current: VormFieldSchema[] = schema;

  for (const part of parts) {
    const found = current.find((f) => f.name === part && f.type === "repeater");
    if (!found || !found.fields) return [];
    current = found.fields;
  }

  return current;
}

/**
 * Collects all repeater paths from the schema recursively
 */
function collectRepeaterPaths(schema: VormFieldSchema[], path = ""): string[] {
  const paths: string[] = [];
  for (const field of schema) {
    const fullPath = path ? `${path}.${field.name}` : field.name;
    if (field.type === "repeater") {
      paths.push(fullPath);
      if (field.fields) {
        const nested = collectRepeaterPaths(field.fields, `${fullPath}[0]`);
        paths.push(...nested);
      }
    }
  }
  return paths;
}

/**
 * Resolves visible field names, respecting exclusion and only rules
 */
const visibleFieldNames = computed(() => {
  const schemaSegment = basePath.value
    ? getSubSchemaAt(vorm.schema, basePath.value)
    : vorm.schema;
  const pathPrefix = basePath.value || "";
  const excludePaths = props.excludeRepeaters
    ? collectRepeaterPaths(schemaSegment, pathPrefix)
    : [];

  const allFields = expandSchema(vorm.schema, vorm.formData, "", true)
    .map((f) => f.name)
    .filter((name) => {
      if (!props.excludeRepeaters) return true;
      return !excludePaths.some(
        (prefix) => name === prefix || name.startsWith(`${prefix}[`)
      );
    });

  if (!props.only || props.only.length === 0) return allFields;

  return allFields.filter((name) => {
    return props.only!.some((pattern) => {
      return (
        name === pattern ||
        name.startsWith(`${pattern}.`) ||
        name.startsWith(`${pattern}[`)
      );
    });
  });
});

/**
 * Builds up field states for each visible field
 */
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

/**
 * Returns the field config for the given field name
 */
function getFieldConfig(name: string): VormFieldSchema {
  const exact = expandSchema(vorm.schema, vorm.formData).find(
    (f) => f.name === name
  );
  if (exact) return exact;

  const rawValue = getValueByPath(vorm.formData, name);
  if (Array.isArray(rawValue)) {
    return {
      name,
      type: "repeater",
      label: name.split(".").pop() ?? "",
      fields: [],
    };
  }

  return {
    name,
    type: "text",
    label: "",
    showError: true,
  };
}

/**
 * Emits synthetic input/blur/validate events
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
  if (type === "input") emit("input", payload);
  else if (type === "blur") emit("blur", payload);
  else if (type === "validate") emit("validate", payload);
  return !prevented;
}

/**
 * Resolves field options if defined dynamically
 */
function resolveOptions(field: VormFieldSchema) {
  const raw =
    typeof field.options === "function"
      ? field.options(vorm.formData)
      : field.options || [];
  return raw.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
}

/**
 * Default renderer for native inputs
 */
function renderDefaultInput(fieldName: string) {
  const config = getFieldConfig(fieldName);
  const value = getValueByPath(vorm.formData, fieldName);
  if (typeof value === "object" && value !== null) return null;

  const inputProps = {
    id: `vorm-${fieldName}`,
    name: fieldName,
    class: config.classes?.input ?? `vorm-${config.type}`,
    type:
      config.type !== "select" && config.type !== "textarea"
        ? config.type
        : undefined,
    value,
    onInput: (e: any) =>
      updateFieldValue(e, config, vorm, emitFieldEvent, maybeValidate),
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
 * Renders slot or input content
 */
function renderFieldContent(fieldName: string) {
  const field = getFieldConfig(fieldName);
  if (slots[fieldName]) {
    return h(
      "div",
      {},
      slots[fieldName]?.({
        field,
        state: fieldStates.value[fieldName],
        path: fieldName,
        indexes: extractRepeaterIndexes(fieldName),
      })
    );
  }
  return renderDefaultInput(fieldName);
}

/**
 * Validation logic on interaction
 */
function maybeValidate(trigger: "onInput" | "onBlur", fieldName: string) {
  const mode = vorm.getValidationMode(fieldName);
  if (mode === trigger) {
    vorm.validateFieldByName(fieldName);
    emitFieldEvent("validate", fieldName, vorm.formData[fieldName]);
  }
}

/**
 * Wrapper slot matching and resolution
 */
function hasSlot(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(slots, name);
}

function parseWrapperSlotNames(slotName: string): string[] {
  if (!slotName.startsWith("wrapper:")) return [];
  const raw = slotName.slice(8).trim();
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim());
  }
  return [raw];
}

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

function getWrapperSlotName(fieldName: string): string {
  const directName = `wrapper:${fieldName}`;
  if (hasSlot(directName)) return directName;

  const ancestry = getAncestryNames(fieldName);
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

  return "wrapper";
}

function hasDirectOrAncestrySlot(fieldName: string): boolean {
  const field = getFieldConfig(fieldName);
  if (!field.inheritWrapper) {
    return hasSlot(normalizeFieldName(fieldName));
  }
  const ancestry = getAncestryNames(fieldName);
  return ancestry.some((name) => hasSlot(normalizeFieldName(name)));
}

onMounted(() => {
  register({ as: props.as });
  const isForm = props.as === "form";
  const hasSubmitListener = !!getCurrentInstance()?.vnode.props?.onSubmit;

  if (import.meta.env.DEV) {
    if (isForm && !hasSubmitListener) {
      console.warn("[AutoVorm] 'as=\"form\"' is set, but no @submit listener.");
    }
    if (!isForm && hasSubmitListener) {
      console.warn(
        "[AutoVorm] @submit listener is set, but 'as' is not 'form'."
      );
    }
  }
});
</script>

<template>
  <component
    :is="props.as || 'div'"
    :class="containerClass || defaultGridClass || undefined"
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
        :indexes="extractRepeaterIndexes(fieldName)"
        :path="fieldName"
      />

      <slot
        v-else-if="hasSlotMatchingWrapperMulti(fieldName)"
        :name="getWrapperSlotName(fieldName)"
        :field="getFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
        :indexes="extractRepeaterIndexes(fieldName)"
        :path="fieldName"
      />

      <slot
        v-else-if="hasSlot('wrapper')"
        name="wrapper"
        :field="getFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
        :indexes="extractRepeaterIndexes(fieldName)"
        :path="fieldName"
      />

      <component
        v-else-if="hasDirectOrAncestrySlot(fieldName)"
        :is="renderFieldContent(fieldName)"
      />

      <div
        v-else
        :class="getFieldConfig(fieldName).classes?.outer ? getFieldConfig(fieldName).classes!.outer : fieldWrapperClass || 'vorm-group'"
      >
        <label
          :for="'vorm-' + fieldName"
          v-bind="
            getFieldConfig(fieldName).classes?.label
              ? { class: getFieldConfig(fieldName).classes?.label }
              : null
          "
        >
          {{
            hasDirectOrAncestrySlot(fieldName)
              ? ""
              : getFieldConfig(fieldName).label
          }}
        </label>
        <component :is="renderFieldContent(fieldName)" />

        <p
          v-if="
            getFieldConfig(fieldName).showError !== false &&
            fieldStates[fieldName].error
          "
          :class="getFieldConfig(fieldName).classes?.help ? getFieldConfig(fieldName).classes!.help : 'vorm-help'"
        >
          {{ fieldStates[fieldName].error }}
        </p>
      </div>

      <slot v-if="hasSlot(`after-${fieldName}`)" :name="`after-${fieldName}`" />
    </template>
  </component>
</template>

<style scoped>
.vorm-grid {
  display: grid;
  gap: 1rem;
}

.vorm-grid-cols-1 {
  grid-template-columns: repeat(1, 1fr);
}
.vorm-grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.vorm-grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.vorm-group {
  display: flex;
  flex-direction: column;
}

.vorm-col-span-1 {
  grid-column: span 1 / span 1;
}
.vorm-col-span-2 {
  grid-column: span 2 / span 2;
}
.vorm-col-span-3 {
  grid-column: span 3 / span 3;
}
</style>
