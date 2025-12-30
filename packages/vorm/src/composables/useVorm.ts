import { reactive, provide, watch, watchEffect, toRaw, computed, type InjectionKey, type ComputedRef } from "vue";
import type { VormSchema, ValidationMode, Option, VormFieldSchema } from "../types/schemaTypes";
import type { VormI18n, ErrorData } from "../types/i18nTypes";
import type { FormContext } from "../types/contextTypes";
import { validateFieldAsyncInternal } from "../core/validatorEngine";
import { VormContextKey } from "../core/vormContext";
import {
  compileField,
  type CompiledValidator,
} from "../core/validatorCompiler.js";
import { getValueByPath, setValueByPath, resolveRelativePath } from "../utils/pathHelpers.js";
import { isFieldInSchema } from "../utils/isFieldInSchema.js";
import { expandSchema } from "../utils/expandSchema.js";
import { resolveMessage } from "../i18n/messageResolver.js";
import { resolveReactiveOptions, resolveReactiveBoolean } from "../utils/reactiveResolver.js";

/**
 * Check if a field should be visible based on its showIf condition
 */
function isFieldVisible(
  field: VormFieldSchema,
  formData: Record<string, unknown>
): boolean {
  const condition = field.showIf;
  if (!condition) return true;

  const path = field.name;

  if (typeof condition === "function") {
    return condition(formData, path);
  }

  if (typeof condition === "object" && "dependsOn" in condition) {
    const relativePath = resolveRelativePath(path, condition.dependsOn);
    const value = getValueByPath(formData, relativePath);
    return condition.condition(value, formData, path);
  }

  // Simple object match: { key: value }
  return Object.entries(condition).every(
    ([key, val]) => formData[key] === val
  );
}

export interface VormContext {
  schema: VormSchema;
  formData: Record<string, any>;
  errors: Record<string, string | null>;
  validatedFields: Record<string, boolean>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  initial: Record<string, any>;
  fieldOptionsMap: Record<string, Option[]>;
  i18n?: VormI18n;
  isValid: ComputedRef<boolean>;
  isDirty: ComputedRef<boolean>;
  isTouched: ComputedRef<boolean>;
  validate: () => Promise<boolean>;
  validateFieldByName: (fieldName: string) => Promise<void>;
  getValidationMode: (fieldName: string) => ValidationMode;
  setFormData: (
    newData: Record<string, any>,
    options?: {
      fieldOptions?: Record<string, Option[]>;
    }
  ) => void;
  updateField: (
    name: string,
    value: any,
    options?: {
      touched?: boolean;
      dirty?: boolean;
      validate?: boolean;
      fieldOptions?: Option[];
    }
  ) => void;
  updateFields: (
    updates: Record<string, any>,
    options?: {
      touched?: boolean;
      dirty?: boolean;
      validate?: boolean;
      fieldOptions?: Record<string, Option[]>;
    }
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
  getFieldOptions: (fieldName: string) => ComputedRef<Option[]>;
  bindField: (fieldName: string) => ComputedRef<{
    modelValue: any;
    'onUpdate:modelValue': (value: any) => void;
    items: Option[];
    options: Option[];
    error: string | undefined;
    errorMessages: string[];
    disabled: boolean;
  }>;
}

export function useVorm(
  schema: VormSchema,
  options?: { validationMode?: ValidationMode; key?: symbol | string; i18n?: VormI18n }
): VormContext {
  const formData = reactive<Record<string, any>>({});
  const errorData = reactive<Record<string, ErrorData | null>>({});
  const validatedFields = reactive<Record<string, boolean>>({});

  const globalValidationMode = options?.validationMode || "onSubmit";
  const i18nContext = options?.i18n;

  const touched = reactive<Record<string, boolean>>({});
  const dirty = reactive<Record<string, boolean>>({});
  const initial = reactive<Record<string, any>>({});

  const compiledValidators = new Map<string, CompiledValidator[]>();
  const compiledAffects = new Map<string, string[]>();
  const fieldOptionsMap = reactive<Record<string, Option[]>>({});

  // Reactive errors object - updated by watchEffect when errorData or i18n changes
  const errors = reactive<Record<string, string | null>>({});

  // Forward declaration for computed flags
  let isValid: ComputedRef<boolean>;
  let isDirty: ComputedRef<boolean>;
  let isTouched: ComputedRef<boolean>;

  // Create FormContext for reactive functions - using lazy getters
  const createFormContext = (): FormContext => ({
    formData,
    get errors() {
      return errors;
    },
    get isValid() {
      return isValid.value;
    },
    get isDirty() {
      return isDirty.value;
    },
    get isTouched() {
      return isTouched.value;
    },
    get touched() {
      return touched;
    },
    get dirty() {
      return dirty;
    },
  });

  // Watch errorData and update errors reactively - resolves ErrorData to strings
  watchEffect(() => {
    const formContext = createFormContext();

    // Remove keys that are no longer in errorData
    for (const key in errors) {
      if (!(key in errorData)) {
        delete errors[key];
      }
    }

    // Update/add keys from errorData
    for (const fieldName in errorData) {
      const error = errorData[fieldName];
      if (!error) {
        errors[fieldName] = null;
      } else {
        // Resolve message reactively with form context
        errors[fieldName] = resolveMessage(error.messageRef, i18nContext, error.params, formContext);
      }
    }
  });

  // Computed form-level flags for better DX
  // Only considers visible fields (fields whose showIf condition returns true)
  isValid = computed(() => {
    // Get only visible field names
    const visibleFieldNames = schema
      .filter((field) => isFieldVisible(field, formData))
      .map((field) => field.name);

    // Form is only valid if:
    // 1. It has visible fields
    // 2. All visible fields have been validated
    // 3. All visible fields have no errors
    // Note: Fields without validation rules are considered validated by default (set in schema init)
    return (
      visibleFieldNames.length > 0 &&
      visibleFieldNames.every((name) => validatedFields[name] === true) &&
      visibleFieldNames.every((name) => errors[name] === null)
    );
  });
  isDirty = computed(() => Object.values(dirty).some(d => d === true));
  isTouched = computed(() => Object.values(touched).some(t => t === true));

  schema.forEach((field) => {
    const name = field.name;
    const isRepeater = field.type === "repeater";

    formData[name] = isRepeater ? [] : "";
    errorData[name] = null;
    touched[name] = false;
    dirty[name] = false;
    initial[name] = isRepeater ? [] : "";

    // Fields without validation rules are considered valid by default
    const hasValidation = field.validation && field.validation.length > 0;
    validatedFields[name] = !hasValidation;

    // Set default showError if not defined
    field.showError = field.showError !== false;

    // Compile validators
    compiledValidators.set(name, compileField(field));

    // Extract affects for cascading validation
    const affects = (field.validation ?? []).flatMap((v) =>
      typeof v === "object" && v.affects
        ? Array.isArray(v.affects)
          ? v.affects
          : [v.affects]
        : []
    );
    if (affects.length > 0) compiledAffects.set(name, affects);
  });

  watch(
    () => schema,
    (newSchema) => {
      syncSchema(newSchema);
    },
    { deep: true }
  );

  // Watch formData to clear errors when fields become hidden
  // This ensures that when a showIf condition changes, hidden fields don't block form submission
  watch(
    () => formData,
    () => {
      for (const field of schema) {
        if (!isFieldVisible(field, formData)) {
          // Clear errors and mark as validated for hidden fields
          if (errorData[field.name] !== null) {
            errorData[field.name] = null;
          }
          if (!validatedFields[field.name]) {
            validatedFields[field.name] = true;
          }
        }
      }
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
      if (!(name in errorData)) errorData[name] = null;
      if (!(name in touched)) touched[name] = false;
      if (!(name in dirty)) dirty[name] = false;
      if (!(name in validatedFields)) {
        // Fields without validation rules are considered valid by default
        const hasValidation = field.validation && field.validation.length > 0;
        validatedFields[name] = !hasValidation;
      }
      if (!(name in initial)) initial[name] = "";
      if (field.showError === undefined) field.showError = true;
    }

    // Remove fields that are no longer in the schema
    for (const key of Object.keys(formData)) {
      if (!validNames.has(key)) {
        delete formData[key];
        delete errorData[key];
        delete touched[key];
        delete dirty[key];
        delete validatedFields[key];
        delete initial[key];
      }
    }
  }

  function setFormData(
    newData: Record<string, any>,
    options?: {
      fieldOptions?: Record<string, Option[]>;
    }
  ) {
    resetForm();

    for (const key of Object.keys(newData)) {
      setValueByPath(formData, key, newData[key]);
      setValueByPath(initial, key, newData[key]);
    }

    // Clear old field options before setting new ones
    Object.keys(fieldOptionsMap).forEach(key => delete fieldOptionsMap[key]);

    // Set fieldOptions separately (even if newData is empty)
    if (options?.fieldOptions) {
      for (const key of Object.keys(options.fieldOptions)) {
        fieldOptionsMap[key] = options.fieldOptions[key];
      }
    }
  }

  function updateField(
    name: string,
    value: any,
    options?: {
      touched?: boolean;
      dirty?: boolean;
      validate?: boolean;
      fieldOptions?: Option[];
    }
  ) {
    if (!isFieldInSchema(name, schema)) {
      console.warn(`[Vorm] updateField: "${name}" is not defined in schema.`);
      return;
    }

    setValueByPath(formData, name, value);

    if (options?.touched) touched[name] = true;
    if (options?.dirty) dirty[name] = value !== initial[name];

    if (options?.fieldOptions) {
      fieldOptionsMap[name] = options.fieldOptions;
    }

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
      fieldOptions?: Record<string, Option[]>;
    }
  ) {
    for (const name in updates) {
      updateField(name, updates[name], {
        ...options,
        fieldOptions: options?.fieldOptions?.[name],
      });
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
   * Only validates visible fields (fields whose showIf condition returns true)
   */
  async function validate(): Promise<boolean> {
    const raw = toRaw(formData);

    const tempErrors: Record<string, ErrorData | null> = {};
    const tempValidated: Record<string, boolean> = {};
    const tempTouched: Record<string, boolean> = {};

    const validations = schema.map(async (field) => {
      const name = field.name;

      // Skip validation for hidden fields
      if (!isFieldVisible(field, raw)) {
        // Clear any existing error for hidden fields
        tempErrors[name] = null;
        tempValidated[name] = true;
        return true;
      }

      const value = raw[name];
      const validators = compiledValidators.get(name) || [];

      tempTouched[name] = true;

      for (const validateFn of validators) {
        const error = await validateFn(value, raw);
        if (error) {
          tempErrors[name] = error;
          tempValidated[name] = true;

          const affects = compiledAffects.get(name);
          if (affects?.length) {
            for (const dep of affects) {
              if (!tempErrors[dep]) {
                tempErrors[dep] = error;
                tempValidated[dep] = true;
              }
            }
          }

          return false; // early exit for this field
        }
      }

      tempErrors[name] = null;
      tempValidated[name] = true;
      return true;
    });

    const results = await Promise.all(validations);

    // Update the context state with the results
    for (const key in tempTouched) {
      if (!touched[key]) touched[key] = true;
    }

    for (const key in tempValidated) {
      validatedFields[key] = true;
    }

    for (const key in tempErrors) {
      if (errorData[key] !== tempErrors[key]) {
        errorData[key] = tempErrors[key];
      }
    }

    return results.every(Boolean);
  }

  /**
   * Validate a specific field by name
   * Skips validation for hidden fields (fields whose showIf condition returns false)
   * @param fieldName - The name of the field to validate
   * @returns A promise that resolves when the field is validated
   */
  async function validateFieldByName(fieldName: string): Promise<void> {
    // Use expandSchema to find fields in repeaters (e.g., "projects[0].url")
    const expandedSchema = expandSchema(schema, formData);
    const field = expandedSchema.find((f) => f.name === fieldName);
    if (field) {
      // Skip validation for hidden fields
      if (!isFieldVisible(field, formData)) {
        // Clear any existing error for hidden fields
        errorData[field.name] = null;
        validatedFields[field.name] = true;
        return;
      }

      touched[field.name] = true;
      const error = await validateFieldAsyncInternal(field, formData, errorData);
      errorData[field.name] = error;
      validatedFields[field.name] = true;

      // Cascade re-validation to affected fields when validation passes
      // This ensures affected fields clear errors that were propagated from this field
      if (!error) {
        const affects = compiledAffects.get(fieldName);
        if (affects?.length) {
          for (const dep of affects) {
            const depField = expandedSchema.find((f) => f.name === dep);
            if (depField && isFieldVisible(depField, formData)) {
              const depError = await validateFieldAsyncInternal(depField, formData, errorData);
              errorData[dep] = depError;
            }
          }
        }
      }
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

      errorData[key] = null;
      // Fields without validation rules are considered valid by default
      const hasValidation = field.validation && field.validation.length > 0;
      validatedFields[key] = !hasValidation;
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

  /**
   * Get options for a specific field
   * First checks if field has options in schema, then falls back to fieldOptionsMap
   * @param fieldName - The name of the field
   * @returns ComputedRef with the field's options
   */
  function getFieldOptions(fieldName: string): ComputedRef<Option[]> {
    return computed(() => {
      // Find field in schema
      const field = schema.find(f => f.name === fieldName);

      // If field has options in schema, resolve them
      if (field?.options) {
        const resolved = resolveReactiveOptions(field.options);
        return resolved.value;
      }

      // Fallback to fieldOptionsMap for backward compatibility
      return fieldOptionsMap[fieldName] || [];
    });
  }

  /**
   * Helper to bind vorm field data to custom components (e.g. Vuetify)
   * Returns reactive props that can be spread with v-bind
   *
   * @param fieldName - The name of the field
   * @returns ComputedRef with modelValue, options, error, and event handler
   *
   * @example
   * <VTextField v-bind="vorm.bindField('username')" />
   * <VSelect v-bind="vorm.bindField('country')" />
   */
  function bindField(fieldName: string) {
    const fieldOptions = getFieldOptions(fieldName);
    const field = schema.find(f => f.name === fieldName);

    // Create a minimal VormContext-like object for resolveReactiveBoolean
    // We can't use `context` here as it's defined later in the scope
    const vormContextLike = {
      formData,
      errors,
      isValid,
      isDirty,
      isTouched,
      touched,
      dirty,
    } as VormContext;

    const disabledComputed = resolveReactiveBoolean(field?.disabled, vormContextLike);

    return computed(() => ({
      modelValue: formData[fieldName],
      'onUpdate:modelValue': (value: any) => {
        updateField(fieldName, value, {
          touched: true,
          dirty: true,
          validate: true,
        });
      },
      // Include both 'items' (Vuetify) and 'options' (generic)
      items: fieldOptions.value,
      options: fieldOptions.value,
      error: errors[fieldName] || undefined,
      errorMessages: errors[fieldName] ? [errors[fieldName]] : [],
      disabled: disabledComputed.value,
    }));
  }

  const context: VormContext = {
    schema,
    formData,
    errors,
    validatedFields,
    touched,
    dirty,
    initial,
    fieldOptionsMap,
    i18n: i18nContext,
    isValid,
    isDirty,
    isTouched,
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
    getFieldOptions,
    bindField,
  };

  const key = options?.key || VormContextKey;
  provide(key as InjectionKey<VormContext>, context);

  return context;
}
