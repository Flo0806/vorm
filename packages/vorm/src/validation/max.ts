import { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value is less than or equal to a maximum value.
 * @param maxValue
 * @returns
 */
export function max(maxValue: number): SyncValidatorFn {
  return (value) => {
    return Number(value) <= maxValue ? null : `Must be at most ${maxValue}.`;
  };
}
