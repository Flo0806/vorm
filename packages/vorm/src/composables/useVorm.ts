import { reactive, provide, InjectionKey } from "vue";
import type { VormSchema, ValidationMode } from "../types/schemaTypes";
import { validateField } from "../core/validatorEngine";
import { VormContextKey } from "../core/vormContext";

export interface VormContext {
  schema: VormSchema;
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  validatedFields: Record<string, boolean>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  initial: Record<string, any>;
  validate: () => boolean;
  validateFieldByName: (fieldName: string) => void;
  getValidationMode: (fieldName: string) => ValidationMode;
}

export function useVorm(
  schema: VormSchema,
  options?: { validationMode?: ValidationMode; key?: symbol | string }
): VormContext {
  const formData = reactive<Record<string, any>>({});
  const errors = reactive<Record<string, string | null>>({});
  const validatedFields = reactive<Record<string, boolean>>({});

  const globalValidationMode = options?.validationMode || "onSubmit";

  const touched = reactive<Record<string, boolean>>({});
  const dirty = reactive<Record<string, boolean>>({});
  const initial = reactive<Record<string, any>>({});

  schema.forEach((field) => {
    const name = field.name;
    formData[name] = "";
    errors[name] = null;
    touched[name] = false;
    dirty[name] = false;
    initial[name] = "";
    // Default set `showError` to true if not defined
    field.showError === undefined
      ? (field.showError = true)
      : (field.showError = false);
  });

  function validate(): boolean {
    let isValid = true;

    schema.forEach((field) => {
      touched[field.name] = true;

      const error = validateField(field, formData, errors);
      errors[field.name] = error;
      validatedFields[field.name] = true;

      if (error) isValid = false;
    });

    return isValid;
  }

  function validateFieldByName(fieldName: string) {
    const field = schema.find((f) => f.name === fieldName);
    if (field) {
      const error = validateField(field, formData, errors);
      errors[field.name] = error;
      validatedFields[field.name] = true;
    }
  }

  function getValidationMode(fieldName: string): ValidationMode {
    const field = schema.find((f) => f.name === fieldName);
    return field?.validationMode || globalValidationMode;
  }

  const context: VormContext = {
    schema,
    formData,
    errors,
    validatedFields,
    touched,
    dirty,
    initial,
    validate,
    validateFieldByName,
    getValidationMode,
  };

  const key = options?.key || VormContextKey;
  provide(key as InjectionKey<VormContext>, context);

  return context;
}
