import type { VormFieldSchema } from "../types/schemaTypes";
import type { ErrorData } from "../types/i18nTypes";
import {
  builtInRules,
  isBuiltInRule,
  isValidatorFn,
} from "./ruleUtils";

export type CompiledValidator = (
  value: any,
  formData: any
) => Promise<ErrorData | null>;

export function compileField(field: VormFieldSchema): CompiledValidator[] {
  return (field.validation || []).map((rule) => {
    const r = rule.rule;

    const fn: CompiledValidator = async (value, formData) => {
      let raw: any = null;

      if (isBuiltInRule(r)) {
        raw = builtInRules[r](value, formData);
      } else if (isValidatorFn(r)) {
        raw = r(value, formData);
      } else {
        console.warn(`[AutoVorm] Invalid rule:`, rule);
        return null;
      }

      const final = raw instanceof Promise ? await raw : raw;

      if (!final) return null;

      const { message, params } =
        typeof final === "string"
          ? { message: final, params: undefined }
          : final;

      // Return ErrorData - preserve messageRef for reactive resolution
      return {
        messageRef: rule.message || message,
        params,
      };
    };

    return fn;
  });
}
