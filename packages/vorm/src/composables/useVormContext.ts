import { inject, InjectionKey } from "vue";
import { VormActiveContextKey, VormContextKey } from "../core/vormContext.js";
import { VormContext } from "./useVorm.js";

export function useVormContext(key?: symbol | string): VormContext {
  const providedKey = inject(VormActiveContextKey, VormContextKey); // Holt _aktuellen_ Key oder fallback

  const activeKey = key || providedKey;

  const context = inject<VormContext>(activeKey as InjectionKey<VormContext>);
  if (!context) {
    throw new Error(
      `[Vorm] No FormContext found for the provided key: ${String(activeKey)}`
    );
  }

  return context;
}
