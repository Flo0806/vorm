import type { SyncValidatorFn } from "../types/validatorTypes";

/**
 * Function to validate if a field matches another field
 * @param otherFieldName
 * @param message
 * @returns
 */
export function matchField(otherFieldName: string): SyncValidatorFn {
  return (value, formData) => {
    if (value !== formData[otherFieldName]) {
      return `Must match ${otherFieldName}`;
    }
    return null;
  };
}
