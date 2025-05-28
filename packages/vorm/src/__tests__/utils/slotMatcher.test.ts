// src/__tests__/utils/slotMatcher.test.ts
import { describe, it, expect } from "vitest";
import {
  getAncestryNames,
  slotFieldMatchesPattern,
} from "../../utils/slotMatcher";

describe("slotMatcher", () => {
  describe("getAncestryNames", () => {
    it("returns ancestry chain without indices", () => {
      const result = getAncestryNames("contacts[0].email");
      expect(result).toEqual(["contacts.email", "email"]);
    });

    it("handles deeper nesting", () => {
      const result = getAncestryNames("contacts[0].phones[2].number");
      expect(result).toEqual([
        "contacts.phones.number",
        "phones.number",
        "number",
      ]);
    });
  });

  describe("slotFieldMatchesPattern", () => {
    it("matches direct path", () => {
      expect(
        slotFieldMatchesPattern(
          "contacts[0].phones[2].number",
          "contacts.phones.number"
        )
      ).toBe(true);
    });

    it("matches with inheritance", () => {
      expect(
        slotFieldMatchesPattern(
          "contacts[0].phones[2].number",
          "phones.number",
          true
        )
      ).toBe(true);

      expect(
        slotFieldMatchesPattern("contacts[0].phones[2].number", "number", true)
      ).toBe(true);
    });

    it("fails if not match", () => {
      expect(
        slotFieldMatchesPattern("contacts[0].phones[2].number", "email")
      ).toBe(false);
    });
  });
});
