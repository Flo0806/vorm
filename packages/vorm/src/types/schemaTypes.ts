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
 * Maps form input types to their corresponding value types
 */
export type FieldValueTypeMap = {
  text: string;
  number: number;
  email: string;
  password: string;
  textarea: string;
  checkbox: boolean;
  radio: string;
  select: string | number; // For single select
  "select-multiple": string[] | number[]; // For multi-select
  date: string; // Usually ISO format (e.g., "2025-06-09")
  "datetime-local": string; // Format: "YYYY-MM-DDTHH:mm"
  file: File | null;
  "file-multiple": File[]; // For multiple file input
  [key: string]: any; // For custom or unknown types
};

export type FieldValueType<T> = T extends keyof FieldValueTypeMap
  ? FieldValueTypeMap[T]
  : any;

export function createField<T extends keyof FieldValueTypeMap>(
  field: VormFieldSchema<T>
): VormFieldSchema<T> {
  return field;
}

/**
 * Defines the types for a single form field
 */
export interface VormFieldSchema<
  T extends keyof FieldValueTypeMap = keyof FieldValueTypeMap
> {
  name: string;
  type: T;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  showError?: boolean;
  showIf?: Record<string, any> | ((formData: Record<string, any>) => boolean);
  visibility?: (formData: Record<string, any>) => boolean;
  validation?: ValidationRule<T>[];
  validationMode?: ValidationMode;
  inheritWrapper?: boolean;
  classes?: {
    outer?: string;
    input?: string;
    label?: string;
    help?: string;
  };
  fields?: VormSchema;
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
