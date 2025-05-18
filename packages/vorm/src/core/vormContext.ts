import type { VormContext } from "../composables/useVorm";
import { InjectionKey } from "vue";

export const VormContextKey: InjectionKey<VormContext> = Symbol("VormContext");

export const VormActiveContextKey: InjectionKey<symbol | string> = Symbol(
  "VormActiveContextKey"
);
