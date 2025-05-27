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
  { name: "age", label: "Alter", type: "number" },
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

  it("resets the form", () => {
    vorm.formData.email = "changed";
    vorm.errors.email = "Some error";
    vorm.dirty.email = true;
    vorm.touched.email = true;
    vorm.resetForm();

    expect(vorm.formData.email).toBe("");
    expect(vorm.errors.email).toBeNull();
    expect(vorm.dirty.email).toBe(false);
    expect(vorm.touched.email).toBe(false);
  });
});
