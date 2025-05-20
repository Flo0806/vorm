import { createRouter, createWebHistory } from "vue-router";
import BasicRegistrationDemo from "./demos/BasicRegistrationDemo.vue";
import BasicDemo from "./demos/BasicDemo.vue";
import ValidationModes from "./demos/ValidationModes.vue";
import ValidationModesCustomControls from "./demos/ValidationModesCustomControls.vue";
import AutoVormDemo from "./demos/AutoVormDemo.vue";
import AutoVormSplittedDemo from "./demos/AutoVormSplittedDemo.vue";
import AutoVormBigDemo from "./demos/AutoVormBigDemo.vue";

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
  {
    path: "/autovorm-extended",
    component: AutoVormSplittedDemo,
    name: "AutoVormExtendedDemo",
  },
  {
    path: "/autovorm-splitted",
    component: AutoVormSplittedDemo,
    name: "AutoVormSplittedDemo",
  },
  {
    path: "/autovorm-big",
    component: AutoVormBigDemo,
    name: "AutoVormBigDemo",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
