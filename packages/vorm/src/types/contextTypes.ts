import type { ComputedRef } from "vue";

/**
 * Context provided to reactive functions in schema fields
 * Uses lazy getters for optimal performance - only accessed properties are tracked
 */
export interface FormContext {
  /**
   * Reactive form data
   */
  formData: Record<string, any>;

  /**
   * Current validation errors (lazy getter)
   */
  readonly errors: Record<string, string | null>;

  /**
   * Whether the form is valid (lazy getter)
   */
  readonly isValid: boolean;

  /**
   * Whether the form has been modified (lazy getter)
   */
  readonly isDirty: boolean;

  /**
   * Whether any field has been touched (lazy getter)
   */
  readonly isTouched: boolean;

  /**
   * Touched state for each field
   */
  readonly touched: Record<string, boolean>;

  /**
   * Dirty state for each field
   */
  readonly dirty: Record<string, boolean>;
}

/**
 * Reactive string that can be static, ref, computed, or function
 */
export type ReactiveString =
  | string
  | import("vue").Ref<string>
  | ComputedRef<string>
  | (() => string)
  | ((ctx: FormContext) => string);

/**
 * Reactive boolean that can be static, ref, computed, or function
 * Useful for disabled, readonly, or other boolean properties that depend on form state
 */
export type ReactiveBoolean =
  | boolean
  | import("vue").Ref<boolean>
  | ComputedRef<boolean>
  | (() => boolean)
  | ((ctx: FormContext) => boolean);
