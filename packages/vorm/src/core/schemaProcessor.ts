import type { Option, VormFieldSchema } from "../types/schemaTypes";

export function isFieldVisible(
  field: VormFieldSchema,
  formData: Record<string, any>
): boolean {
  if (typeof field.visibility === "function") {
    return field.visibility(formData);
  }
  return true;
}

export function getFieldOptions(
  field: VormFieldSchema,
  formData: Record<string, any>
): Option[] {
  if (typeof field.options === "function") {
    return field.options(formData);
  }
  return field.options || [];
}
