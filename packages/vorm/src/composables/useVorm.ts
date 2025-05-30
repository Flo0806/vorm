import { reactive, provide, watch, toRaw, type InjectionKey } from "vue";
import type { VormSchema, ValidationMode } from "../types/schemaTypes";
import { validateFieldAsync } from "../core/validatorEngine";
import { VormContextKey } from "../core/vormContext";
import {
  compileField,
  type CompiledValidator,
} from "../core/validatorCompiler.js";
import { getValueByPath, setValueByPath } from "../utils/pathHelpers.js";
import { normalizeFieldName } from "../utils/slotMatcher.js";
import { isFieldInSchema } from "../utils/isFieldInSchema.js";

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
  setFormData: (newData: Record<string, any>) => void;
  updateField: (
    name: string,
    value: any,
    options?: { touched?: boolean; dirty?: boolean; validate?: boolean }
  ) => void;
  updateFields: (
    updates: Record<string, any>,
    options?: { touched?: boolean; dirty?: boolean; validate?: boolean }
  ) => void;
  resetForm: () => void;
  addRepeaterItem: (path: string, item: any, index?: number) => void;
  removeRepeaterItem: (path: string, index: number) => void;
  moveRepeaterItem: (path: string, fromIndex: number, toIndex: number) => void;
  clearRepeater: (path: string) => void;
  touchAll: () => void;
  getErrors: () => Record<string, string | null>;
  getTouched: () => Record<string, boolean>;
  getDirty: () => Record<string, boolean>;
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

    // Set default showError if not defined
    field.showError === undefined
      ? (field.showError = true)
      : (field.showError = false);
  });

  const compiledValidators = new Map<string, CompiledValidator[]>();

  schema.forEach((field) => {
    compiledValidators.set(field.name, compileField(field));
  });

  watch(
    () => schema,
    (newSchema) => {
      syncSchema(newSchema);
    },
    { deep: true }
  );

  /**
   * Sync the schema with the current form data
   * @param newSchema - The new schema to sync with
   */
  function syncSchema(newSchema: VormSchema) {
    // Update schema reference
    const validNames = new Set(newSchema.map((f) => f.name));
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

    // Remove fields that are no longer in the schema
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

  function setFormData(newData: Record<string, any>) {
    resetForm();

    for (const key of Object.keys(newData)) {
      setValueByPath(formData, key, newData[key]);
      setValueByPath(initial, key, newData[key]);
    }
  }

  function updateField(
    name: string,
    value: any,
    options?: {
      touched?: boolean;
      dirty?: boolean;
      validate?: boolean;
    }
  ) {
    if (!isFieldInSchema(name, schema)) {
      console.warn(`[Vorm] updateField: "${name}" is not defined in schema.`);
      return;
    }

    setValueByPath(formData, name, value);

    if (options?.touched) touched[name] = true;
    if (options?.dirty) dirty[name] = value !== initial[name];

    if (options?.validate) {
      validateFieldByName(name);
      validatedFields[name] = true;
    }
  }

  function updateFields(
    updates: Record<string, any>,
    options?: {
      touched?: boolean;
      dirty?: boolean;
      validate?: boolean;
    }
  ) {
    for (const name in updates) {
      updateField(name, updates[name], options);
    }
  }
  //#region Repeater handling
  function addRepeaterItem(path: string, item: any, index?: number) {
    const target = getValueByPath(formData, path);
    if (!Array.isArray(target)) {
      console.warn(`[Vorm] Cannot add item: "${path}" is not an array.`);
      return;
    }

    const clone = JSON.parse(JSON.stringify(item)); // prevent reactivity pollution

    if (typeof index === "number" && index >= 0 && index <= target.length) {
      target.splice(index, 0, clone);
    } else {
      target.push(clone);
    }

    // mark as dirty
    setValueByPath(dirty, path, true);
  }

  function removeRepeaterItem(path: string, index: number) {
    const target = getValueByPath(formData, path);
    if (!Array.isArray(target)) {
      console.warn(`[Vorm] Cannot remove item: "${path}" is not an array.`);
      return;
    }

    if (index < 0 || index >= target.length) return;

    target.splice(index, 1);

    // mark as dirty
    setValueByPath(dirty, path, true);
  }

  function moveRepeaterItem(path: string, fromIndex: number, toIndex: number) {
    const target = getValueByPath(formData, path);
    if (!Array.isArray(target)) {
      console.warn(`[Vorm] Cannot move item: "${path}" is not an array.`);
      return;
    }

    if (
      fromIndex < 0 ||
      fromIndex >= target.length ||
      toIndex < 0 ||
      toIndex >= target.length
    )
      return;

    const [moved] = target.splice(fromIndex, 1);
    target.splice(toIndex, 0, moved);

    setValueByPath(dirty, path, true);
  }

  function clearRepeater(path: string) {
    setValueByPath(formData, path, []);
    setValueByPath(dirty, path, true);
  }

  //#endregion

  /**
   * Complete form validation function
   */
  async function validate(): Promise<boolean> {
    const raw = toRaw(formData);

    const validations = schema.map(async (field) => {
      const value = raw[field.name];
      touched[field.name] = true;

      const validators = compiledValidators.get(field.name) || [];

      for (const validateFn of validators) {
        const error = await validateFn(value, raw);
        if (error) {
          errors[field.name] = error;
          validatedFields[field.name] = true;
          return false; // early exit for this field
        }
      }

      errors[field.name] = null;
      validatedFields[field.name] = true;
      return true;
    });

    const results = await Promise.all(validations);
    return results.every(Boolean);
  }

  /**
   * Validate a specific field by name
   * @param fieldName - The name of the field to validate
   * @returns A promise that resolves when the field is validated
   */
  async function validateFieldByName(fieldName: string): Promise<void> {
    const field = schema.find((f) => f.name === fieldName);
    if (field) {
      touched[field.name] = true;
      const error = await validateFieldAsync(field, formData, errors);
      errors[field.name] = error;
      validatedFields[field.name] = true;
    }
  }

  /**
   * Get the validation mode for a specific field
   * @param fieldName
   * @returns
   */
  function getValidationMode(fieldName: string): ValidationMode {
    const field = schema.find((f) => f.name === fieldName);
    return field?.validationMode || globalValidationMode;
  }

  /**
   * Reset the form data, states (touched, dirty) and errors
   */
  function resetForm() {
    schema.forEach((field) => {
      const key = field.name;
      const defaultValue =
        field.type === "checkbox" ? false : field.type === "repeater" ? [] : "";

      setValueByPath(formData, key, defaultValue);
      initial[key] = defaultValue;

      errors[key] = null;
      validatedFields[key] = false;
      touched[key] = false;
      dirty[key] = false;
    });
  }

  /**
   * Mark all fields as touched
   */
  function touchAll() {
    schema.forEach((field) => {
      touched[field.name] = true;
    });
  }

  /**
   * Returns the current errors
   * @returns The current errors
   */
  function getErrors() {
    return { ...errors };
  }

  /**
   * Returns the current touched state
   * @returns The current touched state of the form
   */
  function getTouched() {
    return { ...touched };
  }

  /**
   * Returns the current dirty state
   * @returns The current dirty state of the form
   */
  function getDirty() {
    return { ...dirty };
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
    setFormData,
    updateField,
    updateFields,
    resetForm,
    addRepeaterItem,
    removeRepeaterItem,
    moveRepeaterItem,
    clearRepeater,
    touchAll,
    getErrors,
    getTouched,
    getDirty,
  };

  const key = options?.key || VormContextKey;
  provide(key as InjectionKey<VormContext>, context);

  return context;
}
