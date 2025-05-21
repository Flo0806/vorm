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
  rule: string | SyncValidatorFn | AsyncValidatorFn;
  message?: string;
  affects?: string[];
}
