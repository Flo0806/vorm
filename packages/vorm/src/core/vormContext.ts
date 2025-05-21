import type { VormContext } from "../composables/useVorm";
import { type InjectionKey } from "vue";

export const VormContextKey: InjectionKey<VormContext> = Symbol("VormContext");

export const VormActiveContextKey: InjectionKey<symbol | string> = Symbol(
  "VormActiveContextKey"
);
