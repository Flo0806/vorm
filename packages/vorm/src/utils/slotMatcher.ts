export function getAncestryNames(fieldName: string): string[] {
  const clean = fieldName.replace(/\[\d+\]/g, "");
  const parts = clean.split(".");
  const list: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const slice = parts.slice(i).join(".");
    list.push(slice);
  }

  return list;
}

export function normalizeFieldName(name: string): string {
  return name.replace(/\[\d+\]/g, "");
}

export function slotFieldMatchesPattern(
  fieldName: string,
  pattern: string,
  allowInheritance = false
): boolean {
  const normalize = (s: string) =>
    s
      .replace(/\[\d+\]/g, "") // remove indices
      .replace(/\s/g, "")
      .trim();

  const fn = normalize(fieldName);
  const pn = normalize(pattern);

  if (fn === pn) return true;

  if (allowInheritance) {
    const ancestry = getAncestryNames(fn); // e.g. ['contacts.business.email', 'business.email', 'email']
    return ancestry.includes(pn);
  }

  return false;
}
