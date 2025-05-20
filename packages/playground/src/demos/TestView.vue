<template><MyCompo :classes="{ 'my-button': true, pinker: true }" /></template>

<script setup>
import MyCompo from "../components/MyCompo.vue";
const myClasses = { "my-button": true, pinker: true };
</script>

<style scoped>
.my-button {
  background-color: green;
  border-radius: 1rem;
}

.pinker {
  background-color: pink;
  border-radius: 1rem;
}
</style>
