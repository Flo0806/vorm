import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value is greater than or equal to a minimum value.
 * @param minValue
 * @returns
 */
export function min(minValue: number): SyncValidatorFn<any> {
  return (value: any) => {
    return Number(value) >= minValue ? null : `Must be at least ${minValue}.`;
  };
}
