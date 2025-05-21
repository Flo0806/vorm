import type { VormFieldSchema } from "../types/schemaTypes";
import type { ValidationRule } from "../types/validatorTypes";

export async function validateFieldAsync(
  field: VormFieldSchema,
  formData: Record<string, any>,
  allErrors: Record<string, string | null>
): Promise<string | null> {
  const value = formData[field.name];
  if (!field.validation) {
    allErrors[field.name] = null;
    return null;
  }

  for (const rule of field.validation) {
    const result = await applyRuleAsync(rule, value, formData);
    if (result) {
      allErrors[field.name] = result;
      if (rule.affects) {
        rule.affects.forEach((affectedField) => {
          allErrors[affectedField] = result;
        });
      }
      return result;
    }
  }

  // ✅ No error: clear all
  allErrors[field.name] = null;
  return null;
}

/**
 * Async validation function
 * @param rule
 * @param value
 * @param formData
 * @returns
 */
async function applyRuleAsync(
  rule: ValidationRule,
  value: any,
  formData: Record<string, any>
): Promise<string | null> {
  if (typeof rule.rule === "string") {
    if (rule.rule === "required" && (value === "" || value == null)) {
      return rule.message || "This field is required.";
    }
  }

  if (typeof rule.rule === "function") {
    const result = rule.rule(value, formData);
    return result instanceof Promise ? await result : result;
  }

  return null;
}
