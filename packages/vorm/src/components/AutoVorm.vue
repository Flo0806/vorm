<script setup lang="ts">
/**
 * AutoVorm - Automatic form rendering from schema
 *
 * Uses VormField internally for isolated reactivity per field.
 * Each field is a separate component, so only the changed field re-renders.
 */
import {
  computed,
  useSlots,
  onMounted,
  type StyleValue,
  getCurrentInstance,
  inject,
} from "vue";
import { useVormContext } from "../composables/useVormContext";
import type { VormFieldSchema } from "../types/schemaTypes";
import { expandSchema } from "../utils/expandSchema";
import { getValueByPath } from "../utils/pathHelpers";
import {
  getAncestryNames,
  normalizeFieldName,
  slotFieldMatchesPattern,
} from "../utils/slotMatcher";
import VormField from "./VormField.vue";

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
  return "vorm-container";
});

// ============ SCHEMA HELPERS ============

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

function resolveRelativePath(basePath: string, relative: string): string {
  const baseParts = basePath.split(/(?=\[)|\./).filter(Boolean);
  baseParts.pop();
  const relativeParts = relative.split("/").filter(Boolean);

  const stack: string[] = [];
  for (const part of relativeParts) {
    if (part === "..") {
      const last = baseParts.pop();
      if (last?.startsWith("[") && baseParts.length) {
        baseParts.pop();
      }
    } else if (part !== ".") {
      stack.push(part);
    }
  }

  return [...baseParts, ...stack].reduce(
    (acc, part) =>
      acc + (part.startsWith("[") ? part : (acc ? "." : "") + part),
    ""
  );
}

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

  return { name, type: "text", label: "", showError: true };
}

// ============ VISIBLE FIELD NAMES ============

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

      return Object.entries(condition).every(
        ([key, val]) => vorm.formData[key] === val
      );
    })
    .map((f) => f.name);

  if (!props.only || props.only.length === 0) {
    return allFields;
  }

  return allFields.filter((name) =>
    props.only!.some(
      (pattern) =>
        name === pattern ||
        name.startsWith(`${pattern}.`) ||
        name.startsWith(`${pattern}[`)
    )
  );
});

// ============ SLOT HELPERS ============

function hasSlot(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(slots, name);
}

function parseWrapperSlotNames(slotName: string): string[] {
  if (!slotName.startsWith("wrapper:")) return [];
  const raw = slotName.slice(8).trim();
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw.slice(1, -1).split(",").map((s) => s.trim());
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

// ============ RENDER SLOT (for VormField) ============

function renderSlotForField(fieldName: string, slotProps: any) {
  // Check for direct field slot
  if (slots[fieldName]) {
    return slots[fieldName]!(slotProps);
  }
  // Check for ancestry slot (inheritWrapper)
  const field = getFieldConfig(fieldName);
  if (field.inheritWrapper) {
    const ancestry = getAncestryNames(fieldName);
    for (const name of ancestry) {
      const normalized = normalizeFieldName(name);
      if (slots[normalized]) {
        return slots[normalized]!(slotProps);
      }
    }
  }
  return null;
}

function getWrapperSlotForField(fieldName: string) {
  const wrapperSlotName = getWrapperSlotName(fieldName);
  if (slots[wrapperSlotName]) {
    return slots[wrapperSlotName];
  }
  return undefined;
}

function getBeforeSlotForField(fieldName: string) {
  const slotName = `before-${fieldName}`;
  return slots[slotName] || undefined;
}

function getAfterSlotForField(fieldName: string) {
  const slotName = `after-${fieldName}`;
  return slots[slotName] || undefined;
}

// ============ LIFECYCLE ============

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
    <!-- Each field is its own component = isolated reactivity -->
    <VormField
      v-for="fieldName in visibleFieldNames"
      :key="fieldName"
      :field-name="fieldName"
      :error-class="errorClass"
      :field-wrapper-class="fieldWrapperClass"
      :wrapper-slot="getWrapperSlotForField(fieldName)"
      :before-slot="getBeforeSlotForField(fieldName)"
      :after-slot="getAfterSlotForField(fieldName)"
      @input="emit('input', $event)"
      @blur="emit('blur', $event)"
      @validate="emit('validate', $event)"
    >
      <!-- Pass through field slots -->
      <template v-if="hasDirectOrAncestrySlot(fieldName)" #default="slotProps">
        <component :is="() => renderSlotForField(fieldName, slotProps)" />
      </template>
    </VormField>
  </component>
</template>
