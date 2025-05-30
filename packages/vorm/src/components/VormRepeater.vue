<script setup lang="ts">
import { inject, computed, onMounted } from "vue";
import { getValueByPath } from "../utils/pathHelpers";
import { extractRepeaterIndexes } from "../utils/pathHelpers";
import { useVormContext } from "../composables/useVormContext";

const props = defineProps<{
  name: string;
  includeChildren?: boolean;
}>();

const normalizedName = computed(() => normalizeRepeaterPath(props.name));

const vorm = useVormContext();
if (!vorm) throw new Error("VormRepeater must be used inside a VormProvider");

const items = computed(() => {
  const parts = props.name.split(".");
  if (parts.length < 2) {
    // Simple repeater (e.g., "contacts")
    const val = getValueByPath(vorm.formData, props.name);
    return Array.isArray(val)
      ? val.map((entry, i) => ({
          data: entry,
          fullName: `${props.name}[${i}]`,
          index: i,
          parentIndex: i,
          childIndex: i,
        }))
      : [];
  }

  // Nested repeater (e.g., "contacts.business")
  const [parentArray, ...rest] = parts;
  const remainingPath = rest.join(".");

  const parent = getValueByPath(vorm.formData, parentArray);
  if (!Array.isArray(parent)) return [];

  const result: {
    data: any;
    fullName: string;
    index: number;
    parentIndex: number;
    childIndex: number;
  }[] = [];

  parent.forEach((entry, parentIndex) => {
    const nested = getValueByPath(entry, remainingPath);
    if (Array.isArray(nested)) {
      nested.forEach((child, childIndex) => {
        result.push({
          data: child,
          fullName: `${parentArray}[${parentIndex}].${remainingPath}[${childIndex}]`,
          index: childIndex,
          parentIndex,
          childIndex,
        });
      });
    }
  });

  return result;
});

function getFullName(index: number) {
  return `${normalizedName.value}[${index}]`;
}

function normalizeRepeaterPath(name: string): string {
  const parts = name.split(".");
  let normalized = "";
  let current: any = vorm.formData;

  for (const part of parts) {
    if (Array.isArray(current)) {
      normalized += `[0]`;
      current = current[0];
    }

    normalized += (normalized ? "." : "") + part;
    current = current?.[part];
  }

  return normalized;
}

onMounted(() => {
  console.log("VormRepeater normalizedName:", normalizedName.value);
});
</script>

<template>
  <div>
    <slot
      v-for="(entry, i) in items"
      :key="i"
      :index="entry.childIndex"
      :parentIndex="entry.parentIndex"
      :value="entry.data"
      :fullName="entry.fullName"
      :indexes="extractRepeaterIndexes(entry.fullName)"
      :data="getValueByPath(vorm.formData, getFullName(i))"
    />
  </div>
</template>
