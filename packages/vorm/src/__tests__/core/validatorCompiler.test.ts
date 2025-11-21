import { describe, expect, it, vi } from "vitest";
import { compileField } from "../../core/validatorCompiler";
import type { ErrorData } from "../../types/i18nTypes";

describe("compileField", () => {
  it("compiles a required built-in rule", async () => {
    const schema = {
      name: "email",
      validation: [{ rule: "required" }],
    };

    const validators = compileField(schema as any);
    const result = await validators[0]("", {}) as ErrorData;
    expect(result).not.toBeNull();
    expect(result.messageRef).toContain("required");
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
    const errorResult = await validators[0]("xyz", {}) as ErrorData;
    expect(errorResult).not.toBeNull();
    expect(errorResult.messageRef).toBe("Must be abc");
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
    const result = await validators[0]("fail", {}) as ErrorData;
    expect(result).not.toBeNull();
    expect(result.messageRef).toBe("Field {1} must be ok");
    expect(result.params).toEqual(["Status"]);
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
    const result = await validators[0]("bad", {}) as ErrorData;
    expect(result).not.toBeNull();
    expect(result.messageRef).toBe("Custom {1} override");
    expect(result.params).toEqual(["X"]);
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
