import { type ValidationRule } from "./validatorTypes";

export type ValidationMode = "onInput" | "onBlur" | "onSubmit";

export type Option =
  | string
  | {
      label: string;
      value: string | number;
      disabled?: boolean;
    };

export type ShowIfCondition =
  | Record<string, any>
  | ((formData: Record<string, any>, path: string) => boolean)
  | {
      dependsOn: string;
      condition: (
        value: any,
        formData: Record<string, any>,
        path: string
      ) => boolean;
    };

/**
 * Defines the types for a single form field
 */
export interface VormFieldSchema {
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
    | string; // Custom types can be added
  required?: boolean;
  disabled?: boolean;
  label?: string;
  showError?: boolean;
  // options?: Option[] | ((formData: any) => Option[]);
  placeholder?: string;
  helpText?: string;
  showIf?: ShowIfCondition; // Record<string, any> | ((formData: Record<string, any>) => boolean);
  validation?: ValidationRule[];
  visibility?: (formData: Record<string, any>) => boolean;
  validationMode?: ValidationMode;
  classes?: {
    outer?: string;
    input?: string;
    label?: string;
    help?: string;
  };
  fields?: VormSchema;
  inheritWrapper?: boolean;
}

/**
 * Defines the entire form schema
 */
export type VormSchema = VormFieldSchema[];

export interface FieldState {
  error: string | null;
  valid: boolean;
  invalid: boolean;
  validationMode: "onInput" | "onBlur" | "onSubmit";
  classes: string;
  touched: boolean;
  dirty: boolean;
  initialValue: any;
}
