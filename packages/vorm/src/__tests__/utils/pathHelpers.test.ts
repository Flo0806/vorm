import { describe, it, expect } from "vitest";
import { getValueByPath, setValueByPath } from "../../utils/pathHelpers";

describe("pathHelpers", () => {
  describe("getValueByPath", () => {
    it("returns value for simple object path", () => {
      const obj = { a: { b: { c: 42 } } };
      expect(getValueByPath(obj, "a.b.c")).toBe(42);
    });

    it("returns value for array path", () => {
      const obj = {
        contacts: [{ email: "a@example.com" }, { email: "b@example.com" }],
      };
      expect(getValueByPath(obj, "contacts[1].email")).toBe("b@example.com");
    });

    it("returns undefined for non-existent path", () => {
      const obj = { x: 1 };
      expect(getValueByPath(obj, "x.y.z")).toBeUndefined();
    });
  });

  describe("setValueByPath", () => {
    it("sets value at simple object path", () => {
      const obj: any = {};
      setValueByPath(obj, "foo.bar", 123);
      expect(obj).toEqual({ foo: { bar: 123 } });
    });

    it("sets value inside array", () => {
      const obj: any = {};
      setValueByPath(obj, "items[0].value", "abc");
      expect(obj).toEqual({ items: [{ value: "abc" }] });
    });

    it("sets deeply nested value in nested arrays", () => {
      const obj: any = {};
      setValueByPath(obj, "list[1].details[0].name", "Test");
      expect(obj).toEqual({
        list: [undefined, { details: [{ name: "Test" }] }],
      });
    });
  });
});
