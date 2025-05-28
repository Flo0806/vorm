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
