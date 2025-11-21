import type { Ref } from "vue";

/**
 * Vorm i18n configuration
 */
export interface VormI18n {
  /**
   * Current locale (reactive)
   */
  locale: Ref<string>;

  /**
   * Translation messages for each locale
   * @example
   * {
   *   en: { 'vorm.validation.required': 'This field is required.' },
   *   de: { 'vorm.validation.required': 'Dieses Feld ist erforderlich.' }
   * }
   */
  messages: Record<string, Record<string, string>>;

  /**
   * Translate a message key
   * @param key - Message key (e.g., 'vorm.validation.required')
   * @param params - Optional parameters for interpolation
   */
  t: (key: string, params?: Record<string, any> | (string | number)[]) => string;
}

/**
 * Internal error data structure that preserves reactivity
 */
export interface ErrorData {
  /**
   * The original message (can be a string, ref, computed, or message key)
   */
  messageRef: string | Ref<string>;

  /**
   * Optional parameters for message interpolation
   */
  params?: (string | number)[];
}
