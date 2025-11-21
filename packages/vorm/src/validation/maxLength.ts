import type { SyncValidatorFn } from "../types/validatorTypes.js";

/**
 * Validate that the string has at most `max` characters.
 * @param max - Maximum number of characters allowed
 */
export function maxLength(max: number): SyncValidatorFn<any> {
  return (value: any) => {
    if (typeof value !== "string") return { message: "vorm.validation.maxLength", params: [max] };
    return value.length <= max ? null : { message: "vorm.validation.maxLength", params: [max] };
  };
}
