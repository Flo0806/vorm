import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value takes a step of a given value.
 * @param stepValue
 * @returns
 */
export function step(stepValue: number): SyncValidatorFn<any> {
  return (value: any) => {
    const n = Number(value);
    if (isNaN(n)) return "Must be a number.";
    return n % stepValue === 0 ? null : `Must be a multiple of ${stepValue}.`;
  };
}
