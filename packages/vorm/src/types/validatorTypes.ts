/**
 * Default validation rules
 */
export type BuiltInRuleName = "required" | "email" | "integer"; // + später z. B. 'url', 'alpha'

/**
 * Defines a single validation rule
 */
export type SyncValidatorFn = (
  value: any,
  formData: Record<string, any>
) => string | null;

/**
 * Defines a single async validation rule
 */
export type AsyncValidatorFn = (
  value: any,
  formData: Record<string, any>
) => Promise<string | null>;

export interface ValidationRule {
  rule: BuiltInRuleName | SyncValidatorFn | AsyncValidatorFn;
  message?: string;
  affects?: string[];
}
