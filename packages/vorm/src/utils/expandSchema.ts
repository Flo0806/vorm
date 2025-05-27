import type { VormSchema } from "../types/schemaTypes";

/**
 * Converts a nested VormSchema into a flat list with name paths like "contacts[0].email"
 */
export function expandSchema(
  schema: VormSchema,
  formData: Record<string, any>,
  basePath = ""
): VormSchema {
  const result: VormSchema = [];

  for (const field of schema) {
    const fullName = basePath ? `${basePath}.${field.name}` : field.name;
    if (field.type === "repeater") {
      const items = formData[field.name];
      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          const prefix = basePath
            ? `${basePath}.${field.name}[${index}]`
            : `${field.name}[${index}]`;
          const nested = expandSchema(field.fields || [], item, prefix);
          result.push(...nested);
        });
      }
    } else {
      result.push({ ...field, name: fullName });
    }
  }

  return result;
}
