import { inject, type InjectionKey } from "vue";
import { VormActiveContextKey, VormContextKey } from "../core/vormContext";
import { type VormContext } from "./useVorm";

export function useVormContext(key?: symbol | string): VormContext {
  const providedKey = inject(VormActiveContextKey, VormContextKey); // Get the current active context key

  const activeKey = key || providedKey;

  const context = inject<VormContext>(activeKey as InjectionKey<VormContext>);
  if (!context) {
    throw new Error(
      `[Vorm] No FormContext found for the provided key: ${String(activeKey)}`
    );
  }

  return context;
}
