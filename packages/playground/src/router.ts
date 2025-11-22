import { createRouter, createWebHistory } from "vue-router";

// New structured demos
import GettingStartedDemo from "./demos/01-GettingStartedDemo.vue";
import AutoVormDemo from "./demos/02-AutoVormDemo.vue";
import ValidationDemo from "./demos/03-ValidationDemo.vue";
import ReactiveDemo from "./demos/04-ReactiveDemo.vue";

import RepeaterDemo from "./demos/05-RepeaterDemo.vue";
import FormStateDemo from "./demos/06-FormStateDemo.vue";
import PerformanceDemo from "./demos/07-PerformanceDemo.vue";
import ComparisonDemo from "./demos/08-ComparisonDemo.vue";

const routes = [
  {
    path: "/",
    redirect: "/getting-started"
  },
  {
    path: "/getting-started",
    component: GettingStartedDemo,
    name: "GettingStarted",
  },
  {
    path: "/autovorm",
    component: AutoVormDemo,
    name: "AutoVorm",
  },
  {
    path: "/validation",
    component: ValidationDemo,
    name: "Validation",
  },
  {
    path: "/reactive",
    component: ReactiveDemo,
    name: "Reactive",
  },
  {
    path: "/repeater",
    component: RepeaterDemo,
    name: "Repeater",
  },
  {
    path: "/form-state",
    component: FormStateDemo,
    name: "FormState",
  },
  {
    path: "/performance",
    component: PerformanceDemo,
    name: "Performance",
  },
  {
    path: "/comparison",
    component: ComparisonDemo,
    name: "Comparison",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
