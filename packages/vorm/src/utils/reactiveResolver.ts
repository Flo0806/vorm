import { computed, unref, isRef, type ComputedRef, type Ref } from "vue";
import type { ReactiveString, FormContext } from "../types/contextTypes";
import type { ReactiveOptions, Option } from "../types/schemaTypes";
import type { VormContext } from "../composables/useVorm";

/**
 * Resolves a ReactiveString to a ComputedRef<string>
 * Handles: string, Ref, ComputedRef, Function, Function with FormContext
 *
 * @param value - The reactive string value to resolve
 * @param vormContext - Optional vorm context for functions that need formData access
 * @returns ComputedRef that updates when dependencies change
 */
export function resolveReactive(
  value: ReactiveString | undefined,
  vormContext?: VormContext
): ComputedRef<string> {
  return computed(() => {
    if (value === undefined || value === null) {
      return "";
    }

    // Handle functions
    if (typeof value === "function") {
      // Check if function expects FormContext parameter
      if (vormContext && value.length > 0) {
        // Create lazy FormContext to avoid unnecessary reactivity tracking
        const ctx: FormContext = {
          formData: vormContext.formData,
          get errors() {
            return vormContext.errors;
          },
          get isValid() {
            return vormContext.isValid.value;
          },
          get isDirty() {
            return vormContext.isDirty.value;
          },
          get isTouched() {
            return vormContext.isTouched.value;
          },
          get touched() {
            return vormContext.touched;
          },
          get dirty() {
            return vormContext.dirty;
          },
        };
        return (value as (ctx: FormContext) => string)(ctx);
      }

      // Function without parameters (e.g., () => t('key'))
      return (value as () => string)();
    }

    // Handle Ref/ComputedRef/String
    return unref(value);
  });
}

/**
 * Resolves a ReactiveString to a plain string (non-reactive)
 * Use this when you need a one-time resolution without reactivity
 *
 * @param value - The reactive string value to resolve
 * @param vormContext - Optional vorm context for functions that need formData access
 * @returns Plain string value
 */
export function resolveReactiveOnce(
  value: ReactiveString | undefined,
  vormContext?: VormContext
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "function") {
    if (vormContext && value.length > 0) {
      const ctx: FormContext = {
        formData: vormContext.formData,
        get errors() {
          return vormContext.errors;
        },
        get isValid() {
          return vormContext.isValid.value;
        },
        get isDirty() {
          return vormContext.isDirty.value;
        },
        get isTouched() {
          return vormContext.isTouched.value;
        },
        get touched() {
          return vormContext.touched;
        },
        get dirty() {
          return vormContext.dirty;
        },
      };
      return (value as (ctx: FormContext) => string)(ctx);
    }

    return (value as () => string)();
  }

  return unref(value);
}

/**
 * Resolves ReactiveOptions to a ComputedRef<Option[]>
 * Handles: Option[], Ref<Option[]>, ComputedRef<Option[]>, () => Option[], () => Promise<Option[]>
 *
 * @param options - The reactive options value to resolve
 * @returns ComputedRef that updates when dependencies change
 */
export function resolveReactiveOptions(
  options: ReactiveOptions | undefined
): ComputedRef<Option[]> {
  return computed(() => {
    if (options === undefined || options === null) {
      return [];
    }

    // Handle functions
    if (typeof options === "function") {
      const result = options();

      // Handle async functions - for now return empty array
      // In the future we could track loading state
      if (result instanceof Promise) {
        // Note: This will return empty until the promise resolves
        // A more sophisticated implementation would track the promise state
        return [];
      }

      return result;
    }

    // Handle Ref/ComputedRef/Array
    if (isRef(options)) {
      return unref(options);
    }

    // Handle plain array
    if (Array.isArray(options)) {
      return options;
    }

    return [];
  });
}
