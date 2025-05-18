<script setup lang="ts">
import { inject, provide, InjectionKey } from "vue";
import type { VormContext } from "../composables/useVorm";
import { VormContextKey } from "../core/formContext";

const props = defineProps<{
  contextKey?: symbol | string;
  modelValue: Record<string, any>;
}>();

const key = props.contextKey || VormContextKey;

// Hole den Context, der vorher mit useVorm bereitgestellt wurde
const context = inject<VormContext>(key as InjectionKey<VormContext>);

if (!context) {
  throw new Error(`[Vorm] No context provided for key: ${String(key)}`);
}

// Synchronisiere die Anfangswerte
Object.keys(props.modelValue).forEach((fieldKey) => {
  context.formData[fieldKey] = props.modelValue[fieldKey];
});

// Stelle ihn für alle Kinder erneut bereit
provide(key as InjectionKey<VormContext>, context);
</script>

<template>
  <slot />
</template>
