import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate that a value is between two numbers
 * @param min
 * @param max
 * @returns
 */
export function between(min: number, max: number): SyncValidatorFn<any> {
  return (value: any) => {
    const num = Number(value);
    return num >= min && num <= max
      ? null
      : { message: "vorm.validation.between", params: [min, max] };
  };
}
