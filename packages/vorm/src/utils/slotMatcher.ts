export function slotFieldMatchesPattern(
  fieldName: string,
  pattern: string,
  allowInheritance = true
): boolean {
  const normalize = (s: string) =>
    s
      .replace(/\[\d+\]/g, "") // contacts[0] → contacts
      .replace(/\s/g, "")
      .trim();

  const fn = normalize(fieldName); // e.g. contacts.email
  const pn = normalize(pattern); // e.g. contacts:email

  if (fn === pn) return true;

  if (allowInheritance && pn.includes(":")) {
    const [group, sub] = pn.split(":"); // contacts:email → ["contacts", "email"]
    return fn === `${group}.${sub}`;
  }

  return false;
}
