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
      return { message: "This field is required.", params: ["Test"] };
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
  url: (value) => {
    if (typeof value !== "string") return "Must be a valid URL.";

    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:"
        ? null
        : "URL must start with http or https.";
    } catch {
      return "Must be a valid URL.";
    }
  },
  alpha: (value) => {
    return typeof value === "string" && /^[A-Za-z]+$/.test(value)
      ? null
      : "Only letters allowed.";
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

function formatMessage(base: string, params?: (string | number)[]): string {
  if (!params) return base;
  let result = base;
  params.forEach((val, i) => {
    result = result.replace(new RegExp(`\\{${i + 1}\\}`, "g"), String(val));
  });
  return result;
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

    // Nur awaiten, wenn nötig
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

// async function applyRuleAsync(
//   rule: ValidationRule,
//   value: any,
//   formData: Record<string, any>
// ): Promise<string | null> {
//   const r = rule.rule;

//   try {
//     if (isBuiltInRule(r)) {
//       const validator = builtInRules[r];
//       if (!validator) {
//         console.warn(`[AutoVorm] Unknown built-in rule: "${r}"`);
//         return null;
//       }

//       const result = validator(value, formData);
//       const final = result instanceof Promise ? await result : result;
//       if (!final) return null;

//       const { message, params } =
//         typeof final === "string"
//           ? { message: final, params: undefined }
//           : final;

//       return rule.message
//         ? formatMessage(rule.message, params)
//         : formatMessage(message, params);
//     }

//     if (isValidatorFn(r)) {
//       const result = r(value, formData);
//       const final = result instanceof Promise ? await result : result;
//       if (!final) return null;

//       const { message, params } =
//         typeof final === "string"
//           ? { message: final, params: undefined }
//           : final;

//       return rule.message
//         ? formatMessage(rule.message, params)
//         : formatMessage(message, params);
//     }

//     console.warn(`[AutoVorm] Invalid rule:`, rule);
//     return null;
//   } catch (error) {
//     console.error(`[AutoVorm] Validator threw an error for rule:`, rule, error);
//     return "Validation failed";
//   }
// }
