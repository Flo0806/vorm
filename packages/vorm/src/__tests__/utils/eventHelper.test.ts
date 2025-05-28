import { describe, it, expect, vi } from "vitest";
import { getValueFromEvent, updateFieldValue } from "../../utils/eventHelper";
import type { VormFieldSchema } from "../../types/schemaTypes";

describe("getValueFromEvent", () => {
  it("returns correct value for checkbox", () => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });

    expect(getValueFromEvent(event, "checkbox")).toBe(true);
  });

  it("returns valueAsNumber for number input", () => {
    const input = document.createElement("input");
    input.type = "number";
    input.valueAsNumber = 42;
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });

    expect(getValueFromEvent(event, "number")).toBe(42);
  });

  it("returns array for multi-select", () => {
    const select = document.createElement("select");
    select.multiple = true;

    const opt1 = new Option("One", "1");
    const opt2 = new Option("Two", "2");
    opt1.selected = true;
    opt2.selected = true;
    select.add(opt1);
    select.add(opt2);

    const event = new Event("change");
    Object.defineProperty(event, "target", { value: select });

    expect(getValueFromEvent(event, "select")).toEqual(["1", "2"]);
  });

  it("returns plain value for text input", () => {
    const input = document.createElement("input");
    input.value = "Hello";
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });

    expect(getValueFromEvent(event, "text")).toBe("Hello");
  });
});

describe("updateFieldValue", () => {
  it("updates vorm context and triggers validation", () => {
    const input = document.createElement("input");
    input.value = "Test";
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });

    const field: VormFieldSchema = {
      name: "foo",
      type: "text",
      label: "Foo",
      showError: true,
    };

    const vorm = {
      formData: { foo: "" },
      dirty: { foo: false },
      initial: { foo: "" },
    };

    const emitFieldEvent = vi.fn().mockReturnValue(true);
    const maybeValidate = vi.fn();

    updateFieldValue(event, field, vorm as any, emitFieldEvent, maybeValidate);

    expect(vorm.formData.foo).toBe("Test");
    expect(vorm.dirty.foo).toBe(true);
    expect(emitFieldEvent).toHaveBeenCalledWith("input", "foo", "Test", event);
    expect(maybeValidate).toHaveBeenCalledWith("onInput", "foo");
  });

  it("does nothing if emitFieldEvent returns false", () => {
    const input = document.createElement("input");
    input.value = "IgnoreMe";
    const event = new Event("input");
    Object.defineProperty(event, "target", { value: input });

    const field: VormFieldSchema = {
      name: "bar",
      type: "text",
      label: "Bar",
      showError: true,
    };

    const vorm = {
      formData: { bar: "" },
      dirty: { bar: false },
      initial: { bar: "" },
    };

    const emitFieldEvent = vi.fn().mockReturnValue(false);
    const maybeValidate = vi.fn();

    updateFieldValue(event, field, vorm as any, emitFieldEvent, maybeValidate);

    expect(vorm.formData.bar).toBe("");
    expect(maybeValidate).not.toHaveBeenCalled();
  });
});
