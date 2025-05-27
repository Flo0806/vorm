import { describe, expect, it, vi } from "vitest";
import { compileField } from "../../core/validatorCompiler";

describe("compileField", () => {
  it("compiles a required built-in rule", async () => {
    const schema = {
      name: "email",
      validation: [{ rule: "required" }],
    };

    const validators = compileField(schema as any);
    const result = await validators[0]("", {});
    expect(result).toContain("required");
  });

  it("returns null for valid value with built-in rule", async () => {
    const schema = {
      name: "email",
      validation: [{ rule: "required" }],
    };

    const validators = compileField(schema as any);
    const result = await validators[0]("test", {});
    expect(result).toBeNull();
  });

  it("compiles a custom sync validator function", async () => {
    const customRule = (val: any) => (val === "abc" ? null : "Must be abc");
    const schema = {
      name: "code",
      validation: [{ rule: customRule }],
    };

    const validators = compileField(schema as any);
    expect(await validators[0]("xyz", {})).toBe("Must be abc");
    expect(await validators[0]("abc", {})).toBeNull();
  });

  it("formats custom error object", async () => {
    const customRule = (val: any) =>
      val === "ok"
        ? null
        : {
            message: "Field {1} must be ok",
            params: ["Status"],
          };

    const schema = {
      name: "status",
      validation: [{ rule: customRule }],
    };

    const validators = compileField(schema as any);
    expect(await validators[0]("fail", {})).toBe("Field Status must be ok");
  });

  it("formats using rule.message override", async () => {
    const customRule = (val: any) => ({
      message: "Wrong value",
      params: ["X"],
    });

    const schema = {
      name: "status",
      validation: [{ rule: customRule, message: "Custom {1} override" }],
    };

    const validators = compileField(schema as any);
    expect(await validators[0]("bad", {})).toBe("Custom X override");
  });

  it("warns on invalid rule", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const schema = {
      name: "foo",
      validation: [{ rule: 123 }], // invalid rule
    };

    const validators = compileField(schema as any);
    const result = await validators[0]("whatever", {});

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
