import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Validate that the string has at least `min` characters.
 * @param min - Minimum number of characters required
 */
export function minLength(min: number): SyncValidatorFn<any> {
  return (value: any) => {
    if (typeof value !== "string") return `Must be at least ${min} characters.`;
    return value.length >= min ? null : `Must be at least ${min} characters.`;
  };
}
