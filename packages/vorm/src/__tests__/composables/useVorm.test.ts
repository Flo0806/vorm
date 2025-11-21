import { describe, it, expect, vi, beforeEach } from "vitest";
import { useVorm } from "../../composables/useVorm";
import type { VormSchema } from "../../types/schemaTypes";

const basicSchema: VormSchema = [
  {
    name: "email",
    label: "E-Mail",
    type: "text",
    validation: [{ rule: "required" }],
  },
  {
    name: "age",
    label: "Alter",
    type: "number",
    validation: [{ rule: "required" }],
  },
];

describe("useVorm", () => {
  let vorm: ReturnType<typeof useVorm>;

  beforeEach(() => {
    vorm = useVorm(basicSchema);
  });

  it("initializes all fields correctly", () => {
    expect(vorm.formData.email).toBe("");
    expect(vorm.errors.email).toBeNull();
    expect(vorm.touched.email).toBe(false);
    expect(vorm.dirty.email).toBe(false);
  });

  it("validates required fields", async () => {
    const isValid = await vorm.validate();
    expect(isValid).toBe(false);
    expect(vorm.errors.email).toBeTruthy();
  });

  it("validates individual field by name", async () => {
    vorm.formData.email = "hello@example.com";
    await vorm.validateFieldByName("email");
    expect(vorm.errors.email).toBeNull();
  });

  it("tracks touched and dirty correctly", async () => {
    vorm.formData.email = "foo";
    vorm.dirty.email = true;
    vorm.touched.email = true;
    expect(vorm.dirty.email).toBe(true);
    expect(vorm.touched.email).toBe(true);
  });

  it("resets the form", async () => {
    vorm.formData.email = "test@example.com";
    vorm.dirty.email = true;
    vorm.touched.email = true;

    // Trigger validation
    await vorm.validate();
    expect(vorm.errors.email).toBeNull(); // Should be valid

    vorm.resetForm();

    // After reset, form should be back to initial state
    expect(vorm.formData.email).toBe("");
    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for watchEffect
    expect(vorm.errors.email).toBeNull();
    expect(vorm.dirty.email).toBe(false);
    expect(vorm.touched.email).toBe(false);
  });

  describe("isValid computed property", () => {
    it("should be false initially (no fields validated yet)", () => {
      expect(vorm.isValid.value).toBe(false);
    });

    it("should be false when only one field is validated (not all)", async () => {
      vorm.formData.email = "test@example.com";
      await vorm.validateFieldByName("email");

      // Only email is validated, age is not yet validated
      expect(vorm.validatedFields.email).toBe(true);
      expect(vorm.validatedFields.age).toBe(false);
      expect(vorm.isValid.value).toBe(false);
    });

    it("should be true when all fields are validated and have no errors", async () => {
      vorm.formData.email = "test@example.com";
      vorm.formData.age = 25;

      const isValid = await vorm.validate();

      expect(isValid).toBe(true);
      expect(vorm.validatedFields.email).toBe(true);
      expect(vorm.validatedFields.age).toBe(true);
      expect(vorm.isValid.value).toBe(true);
    });

    it("should be false when all fields are validated but at least one has an error", async () => {
      vorm.formData.email = ""; // Empty, should trigger required error
      vorm.formData.age = 25;

      const isValid = await vorm.validate();

      expect(isValid).toBe(false);
      expect(vorm.validatedFields.email).toBe(true);
      expect(vorm.validatedFields.age).toBe(true);
      expect(vorm.errors.email).toBeTruthy();
      expect(vorm.isValid.value).toBe(false);
    });

    it("should remain false after validating individual fields until all are validated", async () => {
      // Validate first field
      vorm.formData.email = "test@example.com";
      await vorm.validateFieldByName("email");
      expect(vorm.isValid.value).toBe(false);

      // Validate second field
      vorm.formData.age = 30;
      await vorm.validateFieldByName("age");

      // Now all fields are validated
      expect(vorm.isValid.value).toBe(true);
    });
  });
});
