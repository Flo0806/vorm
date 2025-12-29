import type { VormFieldSchema } from "../types/schemaTypes";
import type { ValidationRule } from "../types/validatorTypes";
import type { ErrorData } from "../types/i18nTypes";
import {
  builtInRules,
  isBuiltInRule,
  isValidatorFn,
} from "./ruleUtils.js";
import { resolveMessage } from "../i18n/messageResolver.js";
import { getValueByPath } from "../utils/pathHelpers.js";

/**
 * Internal validation function that returns ErrorData for reactive error messages
 * Used internally by useVorm to maintain reactive error state
 */
export async function validateFieldAsyncInternal(
  field: VormFieldSchema,
  formData: Record<string, any>,
  allErrors: Record<string, ErrorData | null>
): Promise<ErrorData | null> {
  const value = getValueByPath(formData, field.name);
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
 * Public validation function that returns resolved error strings (backward compatible)
 * @deprecated Internal use - prefer using vorm.validateFieldByName() from useVorm context
 */
export async function validateFieldAsync(
  field: VormFieldSchema,
  formData: Record<string, any>,
  allErrors: Record<string, string | null>
): Promise<string | null> {
  const value = getValueByPath(formData, field.name);
  if (!field.validation) {
    allErrors[field.name] = null;
    return null;
  }

  for (const rule of field.validation) {
    const result = await applyRuleAsync(rule, value, formData);
    if (result) {
      // Resolve ErrorData to string for backward compatibility
      const errorString = resolveMessage(result.messageRef, undefined, result.params);
      allErrors[field.name] = errorString;
      if (rule.affects) {
        rule.affects.forEach((affectedField) => {
          allErrors[affectedField] = errorString;
        });
      }
      return errorString;
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
 * @returns ErrorData object containing message ref and params for later resolution
 */
async function applyRuleAsync(
  rule: ValidationRule<any>,
  value: any,
  formData: Record<string, any>
): Promise<ErrorData | null> {
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

    // Extract message and params from validator result
    const { message, params } =
      typeof final === "string" ? { message: final, params: undefined } : final;

    // Return ErrorData - preserve the messageRef (could be ref/computed) for reactive resolution
    return {
      messageRef: rule.message || message,
      params,
    };
  } catch (error) {
    console.error(`[AutoVorm] Validator threw an error for rule:`, rule, error);
    return {
      messageRef: "Validation failed",
      params: undefined,
    };
  }
}
