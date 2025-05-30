import type { VormSchema, VormFieldSchema } from "../types/schemaTypes";
import { normalizeFieldName } from "./slotMatcher";

export function isFieldInSchema(name: string, schema: VormSchema): boolean {
  const normalized = normalizeFieldName(name); // z. B. contacts[0].name → contacts.name

  for (const field of schema) {
    if (normalizeFieldName(field.name) === normalized) {
      return true;
    }

    // Prüfe auch Repeater-Felder rekursiv
    if (field.type === "repeater" && Array.isArray(field.fields)) {
      for (const subField of field.fields) {
        const nestedName = `${field.name}.${subField.name}`; // e.g. contacts.name
        if (normalizeFieldName(nestedName) === normalized) {
          return true;
        }
      }
    }
  }

  return false;
}
