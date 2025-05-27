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

// export function slotFieldMatchesPattern(
//   fieldName: string,
//   pattern: string,
//   allowInheritance = false
// ): boolean {
//   const normalize = (s: string) =>
//     s
//       .replace(/\[\d+\]/g, "") // contacts[0] → contacts
//       .replace(/\s/g, "")
//       .trim();

//   const fn = normalize(fieldName); // e.g. contacts.email
//   const pn = normalize(pattern); // e.g. contacts:email

//   if (fn === pn) return true;
//   console.log(allowInheritance, fn, pn);
//   if (allowInheritance && pn.includes(".")) {
//     const [group, sub] = pn.split("."); // contacts:email → ["contacts", "email"]
//     return fn === `${group}.${sub}`;
//   }

//   return false;
// }
