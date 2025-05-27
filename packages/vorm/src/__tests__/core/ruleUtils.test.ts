import { describe, it, expect } from "vitest";
import {
  builtInRules,
  isBuiltInRule,
  isValidatorFn,
  formatMessage,
} from "../../core/ruleUtils";

describe("builtInRules", () => {
  const dummyForm = { any: "irrelevant" };

  it("validates required", () => {
    expect(builtInRules.required("test", dummyForm)).toBeNull();
    expect(builtInRules.required("", dummyForm)).toEqual({
      message: "This field is required.",
      params: ["Test"],
    });
    expect(builtInRules.required(null, dummyForm)).not.toBeNull();
  });

  it("validates email", () => {
    expect(builtInRules.email("test@example.com", dummyForm)).toBeNull();
    expect(builtInRules.email("invalid-email", dummyForm)).toBe(
      "Invalid email address."
    );
  });

  it("validates integer", () => {
    expect(builtInRules.integer("5", dummyForm)).toBeNull();
    expect(builtInRules.integer("5.5", dummyForm)).toBe("Must be an integer.");
    expect(builtInRules.integer("abc", dummyForm)).toBe("Must be an integer.");
  });

  it("validates url", () => {
    expect(builtInRules.url("http://example.com", dummyForm)).toBeNull();
    expect(builtInRules.url("ftp://example.com", dummyForm)).toBe(
      "URL must start with http or https."
    );
    expect(builtInRules.url("not a url", dummyForm)).toBe(
      "Must be a valid URL."
    );
  });

  it("validates alpha", () => {
    expect(builtInRules.alpha("abcXYZ", dummyForm)).toBeNull();
    expect(builtInRules.alpha("abc123", dummyForm)).toBe(
      "Only letters allowed."
    );
  });
});

describe("isBuiltInRule", () => {
  it("correctly identifies built-in rule names", () => {
    expect(isBuiltInRule("required")).toBe(true);
    expect(isBuiltInRule("foobar")).toBe(false);
  });
});

describe("isValidatorFn", () => {
  it("detects functions as validators", () => {
    expect(isValidatorFn(() => true)).toBe(true);
    expect(isValidatorFn("required")).toBe(false);
  });
});

describe("formatMessage", () => {
  it("replaces placeholders correctly", () => {
    expect(formatMessage("Field {1} must be at least {2}", ["Age", 18])).toBe(
      "Field Age must be at least 18"
    );
  });

  it("returns base if no params", () => {
    expect(formatMessage("Nothing to replace")).toBe("Nothing to replace");
  });
});
