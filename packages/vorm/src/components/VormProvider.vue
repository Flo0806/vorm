<script setup lang="ts">
import { ref, onMounted, inject, provide, type InjectionKey } from "vue";
import type { VormContext } from "../composables/useVorm";
import { VormContextKey, VormActiveContextKey } from "../core/vormContext";

// Props: Optional contextKey to allow multiple Vorm instances
const props = defineProps<{
  contextKey?: symbol | string;
}>();

// Resolve the effective key (default to VormContextKey)
const key = props.contextKey || VormContextKey;

// Track registered AutoVorms (used for conflict warnings)
const registeredVorms = ref<{ as?: string | undefined }[]>([]);

// Method for AutoVorms to register themselves
function registerVorm(meta: { as?: string }) {
  registeredVorms.value.push(meta);
}
provide("registerVorm", registerVorm);

// Try to get the Vorm context from parent (must exist!)
const context = inject<VormContext>(key as InjectionKey<VormContext>);
if (!context) {
  throw new Error(`[VormProvider] No context found for key: ${String(key)}`);
}

// Provide the Vorm context to all children
provide(key as InjectionKey<VormContext>, context);
provide(VormActiveContextKey, key); // Save active context key (for VormInput, etc.)

// Used to bind validation triggers
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

  // Warn if multiple top-level <form> elements are used
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
