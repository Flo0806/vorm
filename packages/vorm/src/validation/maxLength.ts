import type { SyncValidatorFn } from "../types/validatorTypes.js";

/**
 * Validate that the string has at most `max` characters.
 * @param max - Maximum number of characters allowed
 */
export function maxLength(max: number): SyncValidatorFn<any> {
  return (value: any) => {
    if (typeof value !== "string") return `Must be at most ${max} characters.`;
    return value.length <= max ? null : `Must be at most ${max} characters.`;
  };
}
