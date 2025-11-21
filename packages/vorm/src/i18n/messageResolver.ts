import { unref, type Ref } from "vue";
import type { VormI18n } from "../types/i18nTypes.js";
import type { ReactiveString, FormContext } from "../types/contextTypes.js";
import { formatMessage } from "../core/ruleUtils.js";
import { defaultMessages } from "./messages.js";

/**
 * Resolves a validation message to a plain string
 * Handles: static strings, refs, computed values, functions, and i18n keys
 *
 * @param messageOrKey - The message (string, ref, computed, function) or i18n key
 * @param i18nContext - Optional i18n context for translation
 * @param params - Optional parameters for message interpolation
 * @param formContext - Optional form context for functions that need access to formData
 * @returns The resolved message string
 */
export function resolveMessage(
  messageOrKey: ReactiveString | undefined,
  i18nContext: VormI18n | undefined,
  params?: (string | number)[],
  formContext?: FormContext
): string {
  // No message provided
  if (!messageOrKey) return "";

  // 1. Handle functions
  let resolved: string;
  if (typeof messageOrKey === "function") {
    if (formContext && messageOrKey.length > 0) {
      // Function with FormContext parameter
      resolved = (messageOrKey as (ctx: FormContext) => string)(formContext);
    } else {
      // Function without parameters
      resolved = (messageOrKey as () => string)();
    }
  } else {
    // 2. Resolve refs/computed to plain string
    resolved = unref(messageOrKey);
  }

  // 3. Check if it's an i18n key (starts with 'vorm.')
  if (resolved.startsWith("vorm.")) {
    // Try custom i18n context first
    if (i18nContext) {
      const translated = i18nContext.t(resolved, params);
      return formatMessage(translated, params);
    }

    // Fallback to default messages
    const locale = "en"; // Default locale when no i18n context
    const defaultMessage =
      defaultMessages[locale]?.[resolved] || resolved;
    return formatMessage(defaultMessage, params);
  }

  // 4. Regular message (not a key)
  return formatMessage(resolved, params);
}

/**
 * Creates a simple i18n context with the default Vorm messages
 *
 * @param locale - Reactive locale ref
 * @param customMessages - Optional custom messages to merge with defaults
 * @returns VormI18n context
 */
export function createVormI18n(
  locale: Ref<string>,
  customMessages?: Record<string, Record<string, string>>
): VormI18n {
  // Merge default messages with custom messages
  const messages = customMessages
    ? Object.keys({ ...defaultMessages, ...customMessages }).reduce(
        (acc, key) => {
          acc[key] = {
            ...defaultMessages[key],
            ...customMessages[key],
          };
          return acc;
        },
        {} as Record<string, Record<string, string>>
      )
    : defaultMessages;

  return {
    locale,
    messages,
    t: (key: string, params?: Record<string, any> | (string | number)[]) => {
      const currentLocale = unref(locale);
      const message = messages[currentLocale]?.[key] || messages["en"]?.[key] || key;

      // Handle both array and object params
      if (Array.isArray(params)) {
        return formatMessage(message, params);
      }

      // Convert object params to indexed params for formatMessage
      if (params && typeof params === "object") {
        const values = Object.values(params);
        return formatMessage(message, values as (string | number)[]);
      }

      return message;
    },
  };
}
