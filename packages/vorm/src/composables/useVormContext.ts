import { inject, InjectionKey } from "vue";
import { VormContextKey } from "../core/formContext.js";
import { VormContext } from "./useVorm.js";

export function useFormContext(key: symbol | string = VormContextKey) {
  const context = inject<VormContext>(key as InjectionKey<VormContext>);
  if (!context) {
    throw new Error("[Vorm] No FormContext found for the provided key.");
  }
  return context;
}
