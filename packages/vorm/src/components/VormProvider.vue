<script setup lang="ts">
import { ref, onMounted, inject, provide, type InjectionKey } from "vue";
import type { VormContext } from "../composables/useVorm";
import { VormContextKey, VormActiveContextKey } from "../core/vormContext";

const props = defineProps<{
  contextKey?: symbol | string;
  modelValue: Record<string, any>;
}>();

const key = props.contextKey || VormContextKey;

const registeredVorms = ref<{ as?: string | undefined }[]>([]);

function registerVorm(meta: { as?: string }) {
  registeredVorms.value.push(meta);
}

provide("registerVorm", registerVorm);

// Get context from parent
const context = inject<VormContext>(key as InjectionKey<VormContext>);
if (!context) {
  throw new Error(`[Vorm] No context provided for key: ${String(key)}`);
}

// Sync modelValue with context formData
Object.keys(props.modelValue).forEach((fieldKey) => {
  context.formData[fieldKey] = props.modelValue[fieldKey];
});

// Provide the context to child components
provide(key as InjectionKey<VormContext>, context);

// New get the current key
provide(VormActiveContextKey, key);

// Reference to the wrapper element
const wrapperRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const inputs = wrapperRef.value?.querySelectorAll("[name]");
  if (!inputs) return;

  inputs.forEach((input) => {
    const name = input.getAttribute("name");
    if (!name) return;

    const mode = context.getValidationMode(name);

    if (mode === "onInput") {
      input.addEventListener("input", () => context.validateFieldByName(name));
    }

    if (mode === "onBlur") {
      input.addEventListener("blur", () => context.validateFieldByName(name));
    }
  });

  // Check for multiple forms in the same VormProvider
  const forms = registeredVorms.value.filter((v) => v.as === "form");
  if (forms.length > 0 && registeredVorms.value.length > 1) {
    console.warn(
      `[VormProvider] Multiple AutoVorms registered with 'as="form"' – this may cause conflicts.`
    );
  }
});
</script>

<template>
  <div ref="wrapperRef">
    <slot />
  </div>
</template>
