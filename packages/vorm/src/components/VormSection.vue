<script setup lang="ts">
defineProps<{
  title?: string;
  classes?: string;
  titleClasses?: string;
}>();
</script>

<template>
  <div :class="classes || 'vorm-section'">
    <h3 v-if="title" :class="titleClasses || 'vorm-section-title'">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>
