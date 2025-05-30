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

// export function expandSchema(
//   schema: VormSchema,
//   formData: Record<string, any>,
//   basePath = ""
// ): VormSchema {
//   const result: VormSchema = [];

//   for (const field of schema) {
//     const fullName = basePath ? `${basePath}.${field.name}` : field.name;
//     if (field.type === "repeater") {
//       const items = formData[field.name];
//       if (Array.isArray(items)) {
//         items.forEach((item, index) => {
//           const prefix = basePath
//             ? `${basePath}.${field.name}[${index}]`
//             : `${field.name}[${index}]`;
//           const nested = expandSchema(field.fields || [], item, prefix);
//           result.push(...nested);
//         });
//       }
//     } else {
//       result.push({ ...field, name: fullName });
//     }
//   }

//   return result;
// }
