import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value is between two numbers
 * @param min
 * @param max
 * @returns
 */
export function between(min: number, max: number): SyncValidatorFn {
  return (value) => {
    const num = Number(value);
    return num >= min && num <= max
      ? null
      : `Must be between ${min} and ${max}.`;
  };
}
