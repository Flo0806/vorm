import { createRouter, createWebHistory } from "vue-router";
import BasicRegistrationDemo from "./demos/BasicRegistrationDemo.vue";
import BasicDemo from "./demos/BasicDemo.vue";

const routes = [
  { path: "/basics", component: BasicDemo, name: "Basic" },
  {
    path: "/registration",
    component: BasicRegistrationDemo,
    name: "Registration",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
