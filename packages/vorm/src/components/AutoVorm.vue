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
import { resolveReactive } from "../utils/reactiveResolver";

const register = inject<(meta: { as?: string }) => void>(
  "registerVorm",
  () => {}
);

const props = defineProps<{
  layout?: "grid" | "stacked" | unknown;
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
  if (props.layout === "stacked") {
    return "vorm-stacked";
  }
  return "vorm-container"; // fallback
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
    .filter((field) => {
      // 1. Exclude repeater subfields
      if (
        props.excludeRepeaters &&
        excludePaths.some(
          (prefix) =>
            field.name === prefix || field.name.startsWith(`${prefix}[`)
        )
      ) {
        return false;
      }

      // 2. Apply showIf logic
      const condition = field.showIf;
      if (!condition) return true;

      const path = field.name;

      if (typeof condition === "function") {
        return condition(vorm.formData, path);
      }

      if (typeof condition === "object" && "dependsOn" in condition) {
        const relativePath = resolveRelativePath(path, condition.dependsOn);
        const value = getValueByPath(vorm.formData, relativePath);
        return condition.condition(value, vorm.formData, path);
      }

      // Default: match key/value pairs
      return Object.entries(condition).every(
        ([key, val]) => vorm.formData[key] === val
      );
    })
    .map((f) => f.name);

  if (!props.only || props.only.length === 0) return allFields;

  return allFields.filter((name) =>
    props.only!.some(
      (pattern) =>
        name === pattern ||
        name.startsWith(`${pattern}.`) ||
        name.startsWith(`${pattern}[`)
    )
  );
});

/**
 * Resolved reactive field properties (label, placeholder, helpText)
 * Returns plain strings, but computed updates on reactive changes
 */
const resolvedFields = computed(() => {
  const result: Record<string, { label: string; placeholder: string; helpText: string }> = {};

  for (const fieldName of visibleFieldNames.value) {
    const field = getFieldConfig(fieldName);
    const labelComputed = resolveReactive(field.label, vorm);
    const placeholderComputed = resolveReactive(field.placeholder, vorm);
    const helpTextComputed = resolveReactive(field.helpText, vorm);

    result[fieldName] = {
      label: labelComputed.value,
      placeholder: placeholderComputed.value,
      helpText: helpTextComputed.value,
    };
  }

  return result;
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
 * Resolves a relative path based on a base path and a relative path
 * @param basePath
 * @param relative
 */
function resolveRelativePath(basePath: string, relative: string): string {
  const baseParts = basePath.split(/(?=\[)|\./).filter(Boolean);
  baseParts.pop(); // Remove last part, because it is the field name
  const relativeParts = relative.split("/").filter(Boolean);
  console.log(baseParts);

  const stack: string[] = [];

  for (const part of relativeParts) {
    if (part === "..") {
      const last = baseParts.pop();
      if (last?.startsWith("[") && baseParts.length) {
        baseParts.pop();
      }
    } else if (part !== ".") {
      stack.push(part); // Neuen Teil anhängen
    }
  }
  console.log(
    "done",
    [...baseParts, ...stack].reduce(
      (acc, part) =>
        acc + (part.startsWith("[") ? part : (acc ? "." : "") + part),
      ""
    )
  );
  return [...baseParts, ...stack].reduce(
    (acc, part) =>
      acc + (part.startsWith("[") ? part : (acc ? "." : "") + part),
    ""
  );
}

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
 * Field schema with resolved reactive strings for direct template use
 * Plain strings are returned, but remain reactive through computed dependencies
 */
type ResolvedVormFieldSchema = Omit<VormFieldSchema, 'label' | 'placeholder' | 'helpText'> & {
  label?: string;
  placeholder?: string;
  helpText?: string;
};

/**
 * Returns the field config with resolved reactive strings for template use
 * Returns plain strings that update reactively through computed dependencies
 */
function getResolvedFieldConfig(name: string): ResolvedVormFieldSchema {
  const field = getFieldConfig(name);
  const resolved = resolvedFields.value[name];

  if (!resolved) {
    // If no resolved values, convert to strings for type safety
    return {
      ...field,
      label: typeof field.label === 'string' ? field.label : '',
      placeholder: typeof field.placeholder === 'string' ? field.placeholder : '',
      helpText: typeof field.helpText === 'string' ? field.helpText : '',
    };
  }

  // Return plain strings - reactivity maintained through resolvedFields computed
  return {
    ...field,
    label: resolved.label,
    placeholder: resolved.placeholder,
    helpText: resolved.helpText,
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
 * Resolves field options from schema or fieldOptionsMap
 */
function resolveOptions(field: VormFieldSchema) {
  // Get options from getFieldOptions (handles both schema.options and fieldOptionsMap)
  const options = vorm.getFieldOptions(field.name).value;
  if (!options || options.length === 0) return [];

  return options.map((opt) =>
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
    placeholder: resolvedFields.value[fieldName]?.placeholder || undefined,
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

  if (config.type === "checkbox") {
    return h("input", {
      ...inputProps,
      checked: !!value, // checked instead value
      value: undefined, // Remove value for checkbox
      onChange: (e: any) =>
        updateFieldValue(e, config, vorm, emitFieldEvent, maybeValidate),
    });
  }

  return h(config.type === "textarea" ? "textarea" : "input", inputProps);
}

/**
 * Renders slot or input content
 */
function renderFieldContent(fieldName: string) {
  const field = getResolvedFieldConfig(fieldName);
  if (slots[fieldName]) {
    return h(
      "div",
      {},
      slots[fieldName]?.({
        ...vorm.bindField(fieldName).value,
        slotName: fieldName,
        field,
        state: fieldStates.value[fieldName],
        path: fieldName,
        indexes: extractRepeaterIndexes(fieldName),
        content: () => renderDefaultInput(fieldName),
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
        :slotName="`wrapper:${fieldName}`"
        :field="getResolvedFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
        :indexes="extractRepeaterIndexes(fieldName)"
        :path="fieldName"
        v-bind="vorm.bindField(fieldName).value"
      />

      <slot
        v-else-if="hasSlotMatchingWrapperMulti(fieldName)"
        :name="getWrapperSlotName(fieldName)"
        :slotName="`wrapper:${fieldName}`"
        :field="getResolvedFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
        :indexes="extractRepeaterIndexes(fieldName)"
        :path="fieldName"
        v-bind="vorm.bindField(fieldName).value"
      />

      <slot
        v-else-if="hasSlot('wrapper')"
        name="wrapper"
        slotName="wrapper"
        :field="getResolvedFieldConfig(fieldName)"
        :state="fieldStates[fieldName]"
        :content="() => renderFieldContent(fieldName)"
        :indexes="extractRepeaterIndexes(fieldName)"
        :path="fieldName"
        v-bind="vorm.bindField(fieldName).value"
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
              : resolvedFields[fieldName].label
          }}
        </label>
        <component :is="renderFieldContent(fieldName)" />

        <p
          v-if="resolvedFields[fieldName].helpText"
          :class="getFieldConfig(fieldName).classes?.help ? getFieldConfig(fieldName).classes!.help : 'vorm-help'"
        >
          {{ resolvedFields[fieldName].helpText }}
        </p>

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
