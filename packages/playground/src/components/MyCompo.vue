<script setup lang="ts">
const props = defineProps<{
  classes?: any;
}>();
</script>
<template>
  <div class="my-button">
    <div class="pinker">asdf{{ props.classes.pinker }}</div>
  </div>
</template>
