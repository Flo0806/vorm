import type { FormFieldSchema } from "../types/schemaTypes";

export function isFieldVisible(
  field: FormFieldSchema,
  formData: Record<string, any>
): boolean {
  if (typeof field.visibility === "function") {
    return field.visibility(formData);
  }
  return true;
}

export function getFieldOptions(
  field: FormFieldSchema,
  formData: Record<string, any>
): string[] {
  if (typeof field.options === "function") {
    return field.options(formData);
  }
  return field.options || [];
}
