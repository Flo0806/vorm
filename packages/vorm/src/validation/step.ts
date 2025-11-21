import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value takes a step of a given value.
 * @param stepValue
 * @returns
 */
export function step(stepValue: number): SyncValidatorFn<any> {
  return (value: any) => {
    const n = Number(value);
    if (isNaN(n)) return "vorm.validation.integer";
    return n % stepValue === 0 ? null : { message: "vorm.validation.step", params: [stepValue] };
  };
}
