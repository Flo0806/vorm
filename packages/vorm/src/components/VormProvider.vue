<script setup lang="ts">
import { ref, onMounted, inject, provide, InjectionKey } from "vue";
import type { VormContext } from "../composables/useVorm";
import { VormContextKey, VormActiveContextKey } from "../core/vormContext";

const props = defineProps<{
  contextKey?: symbol | string;
  modelValue: Record<string, any>;
}>();

const key = props.contextKey || VormContextKey;

// Context holen
const context = inject<VormContext>(key as InjectionKey<VormContext>);
if (!context) {
  throw new Error(`[Vorm] No context provided for key: ${String(key)}`);
}

// Model synchronisieren
Object.keys(props.modelValue).forEach((fieldKey) => {
  context.formData[fieldKey] = props.modelValue[fieldKey];
});

// Context bereitstellen
provide(key as InjectionKey<VormContext>, context);

// New get the current key
provide(VormActiveContextKey, key);

// DOM Zugriff vorbereiten
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
});
</script>

<template>
  <div ref="wrapperRef">
    <slot />
  </div>
</template>
