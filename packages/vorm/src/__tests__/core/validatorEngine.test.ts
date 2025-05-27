import { describe, expect, it, vi } from "vitest";
import { validateFieldAsync } from "../../core/validatorEngine";
import type { VormFieldSchema } from "../../types/schemaTypes";

describe("validateFieldAsync", () => {
  const base: VormFieldSchema = {
    name: "email",
    type: "text",
    label: "E-Mail",
  };

  it("returns null and clears error if no validation provided", async () => {
    const errors: Record<string, string | null> = { email: "old error" };

    const result = await validateFieldAsync(base, { email: "abc" }, errors);
    expect(result).toBeNull();
    expect(errors.email).toBeNull();
  });

  it("validates a built-in rule (required)", async () => {
    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: "required" }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(schema, { email: "" }, errors);

    expect(result).toContain("required");
    expect(errors.email).toBe(result);
  });

  it("passes when built-in rule passes", async () => {
    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: "required" }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(schema, { email: "ok" }, errors);

    expect(result).toBeNull();
    expect(errors.email).toBeNull();
  });

  it("validates a custom sync rule", async () => {
    const custom = (val: any) => (val === "abc" ? null : "Must be abc");

    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: custom }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(schema, { email: "wrong" }, errors);

    expect(result).toBe("Must be abc");
    expect(errors.email).toBe("Must be abc");
  });

  it("validates a custom async rule", async () => {
    const custom = async (val: any) => (val === "async" ? null : "Async fail");

    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: custom }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(schema, { email: "bad" }, errors);

    expect(result).toBe("Async fail");
  });

  it("formats message with rule.message override", async () => {
    const custom = () => ({ message: "Raw {1}", params: ["X"] });

    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: custom, message: "Override {1}" }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(schema, { email: "bad" }, errors);

    expect(result).toBe("Override X");
  });

  it("sets same error on affected fields", async () => {
    const schema: VormFieldSchema = {
      ...base,
      validation: [
        {
          rule: () => "Grouped error",
          affects: ["a", "b"],
        },
      ],
    };

    const errors: Record<string, string | null> = {};
    await validateFieldAsync(schema, { email: "x" }, errors);

    expect(errors.email).toBe("Grouped error");
    expect(errors.a).toBe("Grouped error");
    expect(errors.b).toBe("Grouped error");
  });

  it("handles invalid rule gracefully", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: 123 as any }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(
      schema,
      { email: "irrelevant" },
      errors
    );

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("handles exception inside rule", async () => {
    const errorRule = () => {
      throw new Error("Boom");
    };

    const schema: VormFieldSchema = {
      ...base,
      validation: [{ rule: errorRule }],
    };

    const errors: Record<string, string | null> = {};
    const result = await validateFieldAsync(schema, { email: "x" }, errors);

    expect(result).toBe("Validation failed");
    expect(errors.email).toBe("Validation failed");
  });
});
