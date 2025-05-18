import { ref, reactive, computed, provide, InjectionKey } from "vue";
import type { FormSchema } from "../types/schemaTypes";
import { validateField } from "../core/validatorEngine.js";
import { VormContextKey } from "../core/formContext.js";

export interface VormContext {
  schema: FormSchema;
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  validate: () => boolean;
}

export function useVorm(
  schema: FormSchema,
  options?: { key?: string | symbol }
) {
  const formData = reactive<Record<string, any>>({});
  const errors = reactive<Record<string, string | null>>({});

  // Initialize emtpy values
  schema.forEach((field) => {
    formData[field.name] = "";
    errors[field.name] = null;
  });

  function validate() {
    let isValid = true;
    schema.forEach((field) => {
      const error = validateField(field, formData, errors);
      errors[field.name] = error;
      if (error) isValid = false;
    });
    return isValid;
  }

  const key = options?.key || VormContextKey;

  const context: VormContext = {
    schema,
    formData,
    errors,
    validate,
  };

  provide(key as InjectionKey<VormContext>, context);

  return context;
}
