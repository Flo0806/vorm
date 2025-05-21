export function getValueByPath(obj: any, path: string): any {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((o, key) => (o ? o[key] : undefined), obj);
}

export function setValueByPath(obj: any, path: string, value: any): void {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  const last = parts.pop();

  const target = parts.reduce((o, key) => {
    if (!o[key]) o[key] = /^\d+$/.test(key) ? [] : {};
    return o[key];
  }, obj);

  if (last) target[last] = value;
}
