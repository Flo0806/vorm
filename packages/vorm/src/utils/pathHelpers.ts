export function getValueByPath(obj: any, path: string): any {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((o, key) => (o ? o[key] : undefined), obj);
}

export function setValueByPath(obj: any, path: string, value: any): void {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  const last = parts.pop()!;

  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const next = parts[i + 1];

    const isNextArrayIndex = /^\d+$/.test(next ?? "");
    const isCurrentArrayIndex = /^\d+$/.test(key);

    if (isCurrentArrayIndex) {
      const index = parseInt(key, 10);
      if (!Array.isArray(current)) current = [];
      while (current.length <= index) current.push(undefined);
      if (current[index] === undefined || current[index] === null) {
        current[index] = isNextArrayIndex ? [] : {};
      }
      current = current[index];
    } else {
      if (!(key in current)) {
        current[key] = isNextArrayIndex ? [] : {};
      }
      current = current[key];
    }
  }

  if (/^\d+$/.test(last)) {
    const index = parseInt(last, 10);
    if (!Array.isArray(current)) current = [];
    while (current.length <= index) current.push(undefined);
    current[index] = value;
  } else {
    current[last] = value;
  }
}

export function extractRepeaterIndex(path: string): number | undefined {
  const match = path.match(/\[(\d+)\]/);
  return match ? Number(match[1]) : undefined;
}

/**
 * Returns an object of all repeater indexes in the path.
 * Example: "contacts[0].business[1].email" → { contacts: 0, 'contacts[0].business': 1 }
 */
export function extractRepeaterIndexes(
  fieldName: string
): Record<string, number> {
  const result: Record<string, number> = {};
  const parts = fieldName.split(".");

  let path = "";

  for (const part of parts) {
    const match = part.match(/^([a-zA-Z0-9_]+)\[(\d+)\]$/);
    if (match) {
      const key = match[1];
      const index = parseInt(match[2], 10);
      path = path ? `${path}.${key}` : key;
      result[path] = index;
    } else {
      path = path ? `${path}.${part}` : part;
    }
  }
  return result;
}

/**
 * Resolve a relative path from a base path (for showIf dependsOn)
 * Supports ".." to go up one level
 * Example: resolveRelativePath("projects[0].url", "../name") => "projects[0].name"
 */
export function resolveRelativePath(basePath: string, relative: string): string {
  const baseParts = basePath.split(/(?=\[)|\./).filter(Boolean);
  baseParts.pop();
  const relativeParts = relative.split("/").filter(Boolean);

  const stack: string[] = [];
  for (const part of relativeParts) {
    if (part === "..") {
      const last = baseParts.pop();
      if (last?.startsWith("[") && baseParts.length) {
        baseParts.pop();
      }
    } else if (part !== ".") {
      stack.push(part);
    }
  }

  const combined = [...baseParts, ...stack];
  return combined.join(".").replace(/\.\[/g, "[");
}
