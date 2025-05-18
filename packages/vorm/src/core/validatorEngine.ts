// export function validateField(
//   field: FormFieldSchema,
//   formData: Record<string, any>
// ): string | null {
//   const value = formData[field.name];

//   if (!field.validation) return null;

//   for (const rule of field.validation) {
//     const result = applyRule(rule, value, formData);
//     if (result) return result; // first error stops further checks
//   }

//   return null;
// }

import type { FormFieldSchema } from "../types/schemaTypes";
import type { ValidationRule } from "../types/validatorTypes";

export function validateField(
  field: FormFieldSchema,
  formData: Record<string, any>,
  allErrors: Record<string, string | null>
): string | null {
  const value = formData[field.name];
  if (!field.validation) return null;

  for (const rule of field.validation) {
    const result = applyRule(rule, value, formData);
    if (result) {
      // Set error on the field
      allErrors[field.name] = result;

      // Set error on affected fields, too
      if (rule.affects) {
        rule.affects.forEach((affectedField) => {
          allErrors[affectedField] = result;
        });
      }

      return result; // Stop after the first error
    }
  }

  return null;
}

function applyRule(
  rule: ValidationRule,
  value: any,
  formData: Record<string, any>
): string | null {
  if (typeof rule.rule === "string") {
    // Handle built-in rules
    if (
      rule.rule === "required" &&
      (value === null || value === undefined || value === "")
    ) {
      return rule.message || "This field is required.";
    }

    // More built-in rules can go here
  }

  if (typeof rule.rule === "function") {
    return rule.rule(value, formData);
  }

  return null;
}
