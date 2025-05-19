import { createRouter, createWebHistory } from "vue-router";
import BasicRegistrationDemo from "./demos/BasicRegistrationDemo.vue";
import BasicDemo from "./demos/BasicDemo.vue";
import ValidationModes from "./demos/ValidationModes.vue";
import ValidationModesCustomControls from "./demos/ValidationModesCustomControls.vue";
import AutoVormDemo from "./demos/AutoVormDemo.vue";

const routes = [
  { path: "/basics", component: BasicDemo, name: "Basic" },
  {
    path: "/registration",
    component: BasicRegistrationDemo,
    name: "Registration",
  },
  {
    path: "/validation-modes",
    component: ValidationModes,
    name: "ValidationModes",
  },
  {
    path: "/validation-modes-custom",
    component: ValidationModesCustomControls,
    name: "ValidationModesCustomControls",
  },
  {
    path: "/autovorm-basics",
    component: AutoVormDemo,
    name: "AutoVormDemo",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
