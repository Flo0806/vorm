import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value is in a specific format using a regex pattern.
 * @param regex
 * @param message
 * @returns
 */
export function pattern(regex: RegExp, message?: string): SyncValidatorFn {
  return (value) =>
    typeof value === "string" && regex.test(value)
      ? null
      : message ?? "Invalid format.";
}
