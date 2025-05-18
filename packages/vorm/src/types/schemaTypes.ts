import { ValidationRule } from "./validatorTypes.js";

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
}

/**
 * Defines the entire form schema
 */
export type FormSchema = FormFieldSchema[];
