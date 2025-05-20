import { reactive, provide, InjectionKey } from "vue";
import type { VormSchema, ValidationMode } from "../types/schemaTypes";
import { validateField } from "../core/validatorEngine";
import { VormContextKey } from "../core/vormContext";

export interface VormContext {
  schema: VormSchema;
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  validatedFields: Record<string, boolean>;
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

  schema.forEach((field) => {
    formData[field.name] = "";
    errors[field.name] = null;
    validatedFields[field.name] = false;
  });

  function validate(): boolean {
    let isValid = true;

    schema.forEach((field) => {
      const error = validateField(field, formData, errors);
      errors[field.name] = error;
      validatedFields[field.name] = true; // Select the field as validated

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
    validate,
    validateFieldByName,
    getValidationMode,
  };

  const key = options?.key || VormContextKey;
  provide(key as InjectionKey<VormContext>, context);

  return context;
}
