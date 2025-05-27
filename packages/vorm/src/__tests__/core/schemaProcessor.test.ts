import { describe, expect, it } from "vitest";
import { isFieldVisible, getFieldOptions } from "../../core/schemaProcessor";

describe("isFieldVisible", () => {
  it("returns true by default", () => {
    const field = { name: "email" };
    expect(isFieldVisible(field as any, {})).toBe(true);
  });

  it("respects visibility function returning true/false", () => {
    const visibleField = { name: "foo", visibility: () => true };
    const hiddenField = { name: "bar", visibility: () => false };

    expect(isFieldVisible(visibleField as any, {})).toBe(true);
    expect(isFieldVisible(hiddenField as any, {})).toBe(false);
  });

  it("reacts to formData in visibility", () => {
    const field = {
      name: "companyName",
      visibility: (formData: any) => formData.isCompany === true,
    };
    expect(isFieldVisible(field as any, { isCompany: true })).toBe(true);
    expect(isFieldVisible(field as any, { isCompany: false })).toBe(false);
  });
});

describe("getFieldOptions", () => {
  it("returns empty array by default", () => {
    const field = { name: "role" };
    expect(getFieldOptions(field as any, {})).toEqual([]);
  });

  it("returns static options", () => {
    const field = {
      name: "role",
      options: [{ label: "Admin", value: 1 }],
    };
    expect(getFieldOptions(field as any, {})).toEqual([
      { label: "Admin", value: 1 },
    ]);
  });

  it("returns options from function", () => {
    const field = {
      name: "country",
      options: (formData: any) =>
        formData.region === "EU"
          ? [{ label: "Germany", value: "de" }]
          : [{ label: "USA", value: "us" }],
    };

    expect(getFieldOptions(field as any, { region: "EU" })).toEqual([
      { label: "Germany", value: "de" },
    ]);
    expect(getFieldOptions(field as any, { region: "NA" })).toEqual([
      { label: "USA", value: "us" },
    ]);
  });
});
