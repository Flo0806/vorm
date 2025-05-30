import type { VormSchema } from "../types/schemaTypes";

/**
 * Converts a nested VormSchema into a flat list with name paths like "contacts[0].email"
 */
export function expandSchema(
  schema: VormSchema,
  formData: Record<string, any>,
  pathPrefix = "",
  exposeRepeaters = false
): VormSchema {
  const flat: VormSchema = [];

  for (const field of schema) {
    const fullName = pathPrefix ? `${pathPrefix}.${field.name}` : field.name;

    if (field.type === "repeater") {
      const items = formData[field.name];

      // ✅ Defensive check
      if (!Array.isArray(items)) continue;

      if (exposeRepeaters) {
        flat.push({ ...field, name: fullName });
      }

      for (let i = 0; i < items.length; i++) {
        const nestedPath = pathPrefix
          ? `${pathPrefix}.${field.name}[${i}]`
          : `${field.name}[${i}]`;

        const nestedSchema = expandSchema(
          field.fields || [],
          items[i],
          nestedPath,
          exposeRepeaters
        );

        flat.push(...nestedSchema);
      }

      continue;
    } else {
      flat.push({ ...field, name: fullName });
    }
  }

  return flat;
}
