<script setup lang="ts">
defineProps<{
  title?: string;
  classes?: string;
}>();
</script>

<template>
  <div :class="classes || 'vorm-section'">
    <h3 v-if="title" class="vorm-section-title">{{ title }}</h3>
    <slot />
  </div>
</template>

<style scoped>
.vorm-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}
.vorm-section-title {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
}
</style>
