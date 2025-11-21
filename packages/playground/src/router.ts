import { createRouter, createWebHistory } from "vue-router";
import BasicRegistrationDemo from "./demos/BasicRegistrationDemo.vue";
import BasicDemo from "./demos/BasicDemo.vue";
import ValidationModes from "./demos/ValidationModes.vue";
import ValidationModesCustomControls from "./demos/ValidationModesCustomControls.vue";
import AutoVormDemo from "./demos/AutoVormDemo.vue";
import AutoVormSplittedDemo from "./demos/AutoVormSplittedDemo.vue";
import AutoVormBigDemo from "./demos/AutoVormBigDemo.vue";
import AutoVormShowIfDemo from "./demos/AutoVormShowIfDemo.vue";

import AutoVormRepeaterDemo from "./demos/AutoVormRepeaterDemo.vue";
import PlaygroundBasics from "./demos/PlaygroundBasics.vue";
import PlaygroundExtended from "./demos/PlaygroundExtended.vue";
import PlaygroundRealWorld from "./demos/PlaygroundRealWorld.vue";
import MinMaxTestDemo from "./demos/MinMaxTestDemo.vue";
import FieldOptionsBugTest from "./demos/FieldOptionsBugTest.vue";
import FormStateDemo from "./demos/FormStateDemo.vue";
import I18nDemo from "./demos/I18nDemo.vue";

const routes = [
  {
    path: "/playground-basics",
    component: PlaygroundBasics,
    name: "PlaygroundBasics",
  },
  {
    path: "/playground-extended",
    component: PlaygroundExtended,
    name: "PlaygroundExtended",
  },
  {
    path: "/playground-realworld",
    component: PlaygroundRealWorld,
    name: "PlaygroundRealWorld",
  },
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
  {
    path: "/autovorm-showif",
    component: AutoVormShowIfDemo,
    name: "TestView",
  },
  {
    path: "/autovorm-repeater",
    component: AutoVormRepeaterDemo,
    name: "AutoVormRepeaterDemo",
  },
  {
    path: "/minmax-test",
    component: MinMaxTestDemo,
    name: "MinMaxTest",
  },
  {
    path: "/field-options-bugtest",
    component: FieldOptionsBugTest,
    name: "FieldOptionsBugTest",
  },
  {
    path: "/form-state",
    component: FormStateDemo,
    name: "FormStateDemo",
  },
  {
    path: "/i18n",
    component: I18nDemo,
    name: "I18nDemo",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
