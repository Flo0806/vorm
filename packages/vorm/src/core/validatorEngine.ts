import type { VormFieldSchema } from "../types/schemaTypes";
import type { ValidationRule } from "../types/validatorTypes";
import {
  builtInRules,
  formatMessage,
  isBuiltInRule,
  isValidatorFn,
} from "./ruleUtils.js";

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
  rule: ValidationRule<any>,
  value: any,
  formData: Record<string, any>
): Promise<string | null> {
  const r = rule.rule;

  try {
    let result: any;

    if (isBuiltInRule(r)) {
      const validator = builtInRules[r];
      if (!validator) {
        console.warn(`[AutoVorm] Unknown built-in rule: "${r}"`);
        return null;
      }

      result = validator(value, formData);
    } else if (isValidatorFn(r)) {
      result = r(value, formData);
    } else {
      console.warn(`[AutoVorm] Invalid rule:`, rule);
      return null;
    }

    // Handle both synchronous and asynchronous results
    const final = result instanceof Promise ? await result : result;
    if (!final) return null;

    const { message, params } =
      typeof final === "string" ? { message: final, params: undefined } : final;

    return rule.message
      ? formatMessage(rule.message, params)
      : formatMessage(message, params);
  } catch (error) {
    console.error(`[AutoVorm] Validator threw an error for rule:`, rule, error);
    return "Validation failed";
  }
}
