import type { VormContext } from "../composables/useVorm";
import type { VormFieldSchema } from "../types/schemaTypes";
import { setValueByPath } from "./pathHelpers";

export function getValueFromEvent(e: Event, fieldType: string): any {
  const target = e.target as HTMLInputElement | HTMLSelectElement;
  console.log(fieldType);
  switch (fieldType) {
    case "checkbox":
      if (target instanceof HTMLInputElement) {
        return target.checked;
      }
      return false;
    case "radio":
      return target.value;
    case "number":
      if (target instanceof HTMLInputElement) {
        return target.valueAsNumber;
      }
      return Number(target.value);
    case "date":
    case "datetime": // If customer is using a custom date picker, handle it accordingly
      return target.value;
    case "datetime-local":
      if (target instanceof HTMLInputElement) {
        return target.valueAsDate; // For datetime-local, we can use valueAsDate
      }
    case "select":
      if ((target as HTMLSelectElement).multiple) {
        return Array.from((target as HTMLSelectElement).selectedOptions).map(
          (o) => o.value
        );
      }
      return target.value;
    default:
      return target.value;
  }
}

export function updateFieldValue(
  e: Event,
  field: VormFieldSchema,
  vorm: VormContext,
  emitFieldEvent: (
    type: "input" | "blur" | "validate",
    name: string,
    value: any,
    originalEvent?: Event
  ) => boolean,
  maybeValidate: (trigger: "onInput" | "onBlur", fieldName: string) => void
) {
  const value = getValueFromEvent(e, field.type);
  if (emitFieldEvent("input", field.name, value, e)) {
    setValueByPath(vorm.formData, field.name, value);
    vorm.dirty[field.name] = value !== vorm.initial?.[field.name];
    maybeValidate("onInput", field.name);
  }
}
