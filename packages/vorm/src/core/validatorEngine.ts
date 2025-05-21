import type { VormFieldSchema } from "../types/schemaTypes";
import type {
  AsyncValidatorFn,
  BuiltInRuleName,
  SyncValidatorFn,
  ValidationRule,
} from "../types/validatorTypes";

//#region Helpers
const builtInRules: Record<
  BuiltInRuleName,
  SyncValidatorFn | AsyncValidatorFn
> = {
  required: (value) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required.";
    }
    return null;
  },
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : "Invalid email address.";
  },
  integer: (value) => {
    return Number.isInteger(Number(value)) ? null : "Must be an integer.";
  },
};

function isBuiltInRule(rule: unknown): rule is BuiltInRuleName {
  return typeof rule === "string" && rule in builtInRules;
}

function isValidatorFn(
  rule: unknown
): rule is SyncValidatorFn | AsyncValidatorFn {
  return typeof rule === "function";
}
//#endregion

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
  const r = rule.rule;

  try {
    if (isBuiltInRule(r)) {
      const validator = builtInRules[r];
      if (!validator) {
        console.warn(`[AutoVorm] Unknown built-in rule: "${r}"`);
        return null;
      }

      const result = validator(value, formData);
      const final = result instanceof Promise ? await result : result;
      return final ? rule.message ?? final : null;
    }

    if (isValidatorFn(r)) {
      const result = r(value, formData);
      const final = result instanceof Promise ? await result : result;
      return final ? rule.message ?? final : null;
    }

    console.warn(`[AutoVorm] Invalid rule:`, rule);
    return null;
  } catch (error) {
    console.error(`[AutoVorm] Validator threw an error for rule:`, rule, error);
    return "Validation failed";
  }
}
