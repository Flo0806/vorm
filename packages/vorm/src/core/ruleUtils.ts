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
      return { message: "vorm.validation.required" };
    }
    return null;
  },
  email: (value: any) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : "vorm.validation.email";
  },
  integer: (value: any) => {
    return Number.isInteger(Number(value)) ? null : "vorm.validation.integer";
  },
  url: (value: any) => {
    if (typeof value !== "string") return "vorm.validation.url";

    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:"
        ? null
        : "vorm.validation.url.protocol";
    } catch {
      return "vorm.validation.url";
    }
  },
  alpha: (value: any) => {
    return typeof value === "string" && /^[A-Za-z]+$/.test(value)
      ? null
      : "vorm.validation.alpha";
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
