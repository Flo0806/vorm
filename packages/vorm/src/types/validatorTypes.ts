/**
 * Defines a single validation rule
 */
export type SyncValidatorFn = (
  value: any,
  formData: Record<string, any>
) => string | null;

// TODO: add async validator
export interface ValidationRule {
  rule: string | SyncValidatorFn;
  message?: string;
  affects?: string[];
}
