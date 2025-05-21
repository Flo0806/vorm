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
export type SyncValidatorFn = (
  value: any,
  formData: Record<string, any>
) => ValidationResult | string | null;

/**
 * Defines a single async validation rule
 */
export type AsyncValidatorFn = (
  value: any,
  formData: Record<string, any>
) => Promise<ValidationResult | string | null>;

/**
 * Represents a validation rule in the `VormFieldSchema`
 */
export interface ValidationRule {
  rule: BuiltInRuleName | SyncValidatorFn | AsyncValidatorFn;
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
