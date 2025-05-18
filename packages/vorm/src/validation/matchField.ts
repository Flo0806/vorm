import type { SyncValidatorFn } from "../types/validatorTypes";

export function matchField(
  otherFieldName: string,
  message?: string
): SyncValidatorFn {
  return (value, formData) => {
    if (value !== formData[otherFieldName]) {
      return message || `Must match ${otherFieldName}`;
    }
    return null;
  };
}
