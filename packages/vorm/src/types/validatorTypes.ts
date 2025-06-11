import type { FieldValueType, FieldValueTypeMap } from "./schemaTypes.js";

/**
 * Default validation rules
 */
export type BuiltInRuleName =
  | "required"
  | "email"
  | "integer"
  | "url"
  | "alpha";

/**
 * Defines a single validation rule
 */
export type SyncValidatorFn<T extends keyof FieldValueTypeMap> = (
  value: FieldValueType<T>,
  formData: Record<string, any>
) => ValidationResult | string | null;

/**
 * Defines a single async validation rule
 */
export type AsyncValidatorFn<T extends keyof FieldValueTypeMap> = (
  value: FieldValueType<T>,
  formData: Record<string, any>
) => Promise<ValidationResult | string | null>;

/**
 * Represents a validation rule in the `VormFieldSchema`
 */
export interface ValidationRule<T extends keyof FieldValueTypeMap> {
  rule: BuiltInRuleName | SyncValidatorFn<T> | AsyncValidatorFn<T>;
  message?: string;
  affects?: string[];
}

/**
 * Represents a validation result
 */
export interface ValidationResult {
  message: string;
  params?: (string | number)[];
}
