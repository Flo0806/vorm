/**
 * Defines a single validation rule
 */
export type SyncValidatorFn = (value: any, formData: Record<string, any>) => string | null;

export interface ValidationRule {
  rule: string | SyncValidatorFn;
  message?: string;
}
