import { ValidationRule } from "./validatorTypes.js";

export type ValidationMode = "onInput" | "onBlur" | "onSubmit";

/**
 * Defines the types for a single form field
 */
export interface FormFieldSchema {
  name: string;
  type:
    | "text"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "date"
    | "datetime"
    | "email"
    | "password"
    | string; // erweiterbar für Custom-Types
  label?: string;
  options?: string[] | ((formData: Record<string, any>) => string[]);
  class?: string;
  validation?: ValidationRule[];
  visibility?: (formData: Record<string, any>) => boolean;
  validationMode?: ValidationMode;
}

/**
 * Defines the entire form schema
 */
export type FormSchema = FormFieldSchema[];
