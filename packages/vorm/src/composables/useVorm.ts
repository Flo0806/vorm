import { reactive, provide, type InjectionKey, watch, toRaw } from "vue";
import type { VormSchema, ValidationMode } from "../types/schemaTypes";
import { validateFieldAsync } from "../core/validatorEngine";
import { VormContextKey } from "../core/vormContext";

export interface VormContext {
  schema: VormSchema;
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  validatedFields: Record<string, boolean>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  initial: Record<string, any>;
  validate: () => Promise<boolean>;
  validateFieldByName: (fieldName: string) => Promise<void>;
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

    const isRepeater = field.type === "repeater";

    formData[name] = isRepeater ? [] : "";
    errors[name] = null;
    touched[name] = false;
    dirty[name] = false;
    initial[name] = isRepeater ? [] : "";
    validatedFields[name] = false;

    // formData[name] = "";
    // errors[name] = null;
    // touched[name] = false;
    // dirty[name] = false;
    // initial[name] = "";
    // Default set `showError` to true if not defined
    field.showError === undefined
      ? (field.showError = true)
      : (field.showError = false);
  });

  watch(
    () => schema,
    (newSchema) => {
      syncSchema(newSchema);
    },
    { deep: true }
  );

  function syncSchema(newSchema: VormSchema) {
    const validNames = new Set(newSchema.map((f) => f.name));
    console.log(newSchema);
    for (const field of newSchema) {
      const name = field.name;
      if (!(name in formData)) formData[name] = "";
      if (!(name in errors)) errors[name] = null;
      if (!(name in touched)) touched[name] = false;
      if (!(name in dirty)) dirty[name] = false;
      if (!(name in validatedFields)) validatedFields[name] = false;
      if (!(name in initial)) initial[name] = "";
      if (field.showError === undefined) field.showError = true;
    }

    // Optional: alte Felder entfernen
    for (const key of Object.keys(formData)) {
      if (!validNames.has(key)) {
        delete formData[key];
        delete errors[key];
        delete touched[key];
        delete dirty[key];
        delete validatedFields[key];
        delete initial[key];
      }
    }
  }

  async function validate(): Promise<boolean> {
    const rawData = toRaw(formData); // entkoppelt von Vue-Reaktivität
    let isValid = true;

    const validations = schema.map(async (field) => {
      touched[field.name] = true;

      const error = await validateFieldAsync(field, rawData, errors);
      errors[field.name] = error;
      validatedFields[field.name] = true;

      if (error) isValid = false;
      return !error;
    });

    await Promise.all(validations);
    return isValid;
  }

  // async function validate(): Promise<boolean> {
  //   const validations = schema.map(async (field) => {
  //     touched[field.name] = true;
  //     const error = await validateFieldAsync(field, formData, errors);
  //     errors[field.name] = error;
  //     validatedFields[field.name] = true;
  //     return !error;
  //   });

  //   const results = await Promise.all(validations);
  //   return results.every(Boolean);
  // }

  async function validateFieldByName(fieldName: string): Promise<void> {
    const field = schema.find((f) => f.name === fieldName);
    if (field) {
      touched[field.name] = true;
      const error = await validateFieldAsync(field, formData, errors);
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
