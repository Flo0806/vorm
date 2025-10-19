import type {
  AsyncValidatorFn,
  BuiltInRuleName,
  SyncValidatorFn,
} from "../types/validatorTypes.js";

export const builtInRules: Record<
  BuiltInRuleName,
  SyncValidatorFn<any> | AsyncValidatorFn<any>
> = {
  required: (value: any) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === false
    ) {
      return { message: "This field is required.", params: ["Test"] };
    }
    return null;
  },
  email: (value: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : "Invalid email address.";
  },
  integer: (value: any) => {
    return Number.isInteger(Number(value)) ? null : "Must be an integer.";
  },
  url: (value: any) => {
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
  alpha: (value: any) => {
    return typeof value === "string" && /^[A-Za-z]+$/.test(value)
      ? null
      : "Only letters allowed.";
  },
};

export function isBuiltInRule(rule: unknown): rule is BuiltInRuleName {
  return typeof rule === "string" && rule in builtInRules;
}

export function isValidatorFn(
  rule: unknown
): rule is SyncValidatorFn<any> | AsyncValidatorFn<any> {
  return typeof rule === "function";
}

export function formatMessage(
  base: string,
  params?: (string | number)[]
): string {
  if (!params) return base;
  let result = base;
  params.forEach((val, i) => {
    result = result.replace(new RegExp(`\\{${i + 1}\\}`, "g"), String(val));
  });
  return result;
}
