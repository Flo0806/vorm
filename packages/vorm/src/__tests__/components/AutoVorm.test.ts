// tests/unit/AutoVorm.spec.ts
import { mount } from "@vue/test-utils";
import AutoVorm from "../../components/AutoVorm.vue";

import { describe, expect, it } from "vitest";
import { VormContextKey } from "../../core/vormContext";
import { defineComponent, h, computed } from "vue";

const schema = [
  { name: "email", type: "text", label: "E-Mail" },
  { name: "age", type: "text", label: "Alter" },
];

function createMockVormContext() {
  const context: any = {
    schema,
    formData: {
      email: "",
      age: "",
    },
    errors: {
      email: null,
      age: null,
    },
    validatedFields: {
      email: false,
      age: false,
    },
    touched: {
      email: false,
      age: false,
    },
    dirty: {
      email: false,
      age: false,
    },
    initial: {
      email: "",
      age: "",
    },
    getValidationMode: () => "onSubmit",
    validateFieldByName: () => {},
    resetForm: () => {},
    touchAll: () => {},
    getErrors: () => ({}),
    getTouched: () => ({}),
    getDirty: () => ({}),
    validate: () => {},
    fieldOptionsMap: {},
    getFieldOptions: (fieldName: string) => computed(() => []),
    bindField: (fieldName: string) => computed(() => ({
      modelValue: context.formData[fieldName],
      'onUpdate:modelValue': () => {},
      items: [],
      options: [],
      error: context.errors[fieldName] || undefined,
      errorMessages: context.errors[fieldName] ? [context.errors[fieldName]] : [],
    })),
  };

  return context;
}

function mountWithVorm(options: any = {}) {
  return mount(AutoVorm, {
    global: {
      provide: {
        [VormContextKey]: createMockVormContext(),
      },
    },
    ...options,
  });
}

describe("AutoVorm", () => {
  it("renders all fields from schema", () => {
    const wrapper = mountWithVorm();
    expect(wrapper.find("input[name='email']").exists()).toBe(true);
    expect(wrapper.find("input[name='age']").exists()).toBe(true);
  });

  it("respects 'only' prop", () => {
    const wrapper = mountWithVorm({ props: { only: ["email"] } });
    expect(wrapper.find("input[name='email']").exists()).toBe(true);
    expect(wrapper.find("input[name='age']").exists()).toBe(false);
  });

  it("renders wrapper, before and after slots", () => {
    const wrapper = mountWithVorm({
      slots: {
        "before-email": "<div class='before-slot'>Before!</div>",
        "after-email": "<div class='after-slot'>After!</div>",
        "wrapper:email": defineComponent({
          render() {
            return h(
              "div",
              { class: "custom-wrapper" },
              this.$slots.default?.()
            );
          },
        }),
      },
    });

    expect(wrapper.find(".before-slot").exists()).toBe(true);
    expect(wrapper.find(".after-slot").exists()).toBe(true);
    expect(wrapper.find(".custom-wrapper").exists()).toBe(true);
  });

  it("emits input and blur events", async () => {
    const wrapper = mountWithVorm();
    const input = wrapper.find("input[name='email']");

    await input.setValue("test@example.com");
    expect(wrapper.emitted("input")).toBeTruthy();

    await input.trigger("blur");
    expect(wrapper.emitted("blur")).toBeTruthy();
  });

  it("emits submit when 'as' is form and listener is present", async () => {
    const wrapper = mountWithVorm({ props: { as: "form" } });
    await wrapper.trigger("submit");
    expect(wrapper.emitted("submit")).toBeTruthy();
  });

  it("displays validation error message if present", () => {
    const context = createMockVormContext();
    context.errors.email = "E-Mail ist erforderlich";
    context.validatedFields.email = true;

    const wrapper = mount(AutoVorm, {
      global: {
        provide: { [VormContextKey]: context },
      },
    });

    expect(wrapper.text()).toContain("E-Mail ist erforderlich");
  });

  describe("slot bindings", () => {
    it("wrapper slot receives modelValue, items, options from bindField", () => {
      const schemaWithOptions = [
        {
          name: "country",
          type: "select",
          label: "Country",
          options: [
            { label: "Germany", value: "DE" },
            { label: "USA", value: "US" },
          ],
        },
      ];

      const context: any = {
        schema: schemaWithOptions,
        formData: { country: "DE" },
        errors: { country: null },
        validatedFields: { country: false },
        touched: { country: false },
        dirty: { country: false },
        initial: { country: "" },
        getValidationMode: () => "onSubmit",
        validateFieldByName: () => {},
        resetForm: () => {},
        touchAll: () => {},
        getErrors: () => ({}),
        getTouched: () => ({}),
        getDirty: () => ({}),
        validate: () => {},
        fieldOptionsMap: {},
        getFieldOptions: () => computed(() => [
          { label: "Germany", value: "DE" },
          { label: "USA", value: "US" },
        ]),
        bindField: () => computed(() => ({
          modelValue: "DE",
          'onUpdate:modelValue': () => {},
          items: [
            { label: "Germany", value: "DE" },
            { label: "USA", value: "US" },
          ],
          options: [
            { label: "Germany", value: "DE" },
            { label: "USA", value: "US" },
          ],
          error: undefined,
          errorMessages: [],
        })),
      };

      let receivedProps: any = null;

      const wrapper = mount(AutoVorm, {
        global: {
          provide: { [VormContextKey]: context },
        },
        slots: {
          "wrapper:country": (props: any) => {
            receivedProps = props;
            return h("div", { class: "custom-select" }, "Custom");
          },
        },
      });

      expect(wrapper.find(".custom-select").exists()).toBe(true);
      expect(receivedProps).not.toBeNull();
      expect(receivedProps.modelValue).toBe("DE");
      expect(receivedProps.items).toHaveLength(2);
      expect(receivedProps.options).toHaveLength(2);
      expect(receivedProps.error).toBeUndefined();
      expect(receivedProps.errorMessages).toEqual([]);
    });

    it("wrapper slot receives error and errorMessages when field has error", () => {
      const schemaWithValidation = [
        {
          name: "email",
          type: "text",
          label: "Email",
        },
      ];

      const context: any = {
        schema: schemaWithValidation,
        formData: { email: "" },
        errors: { email: "Email is required" },
        validatedFields: { email: true },
        touched: { email: true },
        dirty: { email: false },
        initial: { email: "" },
        getValidationMode: () => "onSubmit",
        validateFieldByName: () => {},
        resetForm: () => {},
        touchAll: () => {},
        getErrors: () => ({}),
        getTouched: () => ({}),
        getDirty: () => ({}),
        validate: () => {},
        fieldOptionsMap: {},
        getFieldOptions: () => computed(() => []),
        bindField: () => computed(() => ({
          modelValue: "",
          'onUpdate:modelValue': () => {},
          items: [],
          options: [],
          error: "Email is required",
          errorMessages: ["Email is required"],
        })),
      };

      let receivedProps: any = null;

      mount(AutoVorm, {
        global: {
          provide: { [VormContextKey]: context },
        },
        slots: {
          "wrapper:email": (props: any) => {
            receivedProps = props;
            return h("div", "Custom");
          },
        },
      });

      expect(receivedProps).not.toBeNull();
      expect(receivedProps.error).toBe("Email is required");
      expect(receivedProps.errorMessages).toEqual(["Email is required"]);
    });

    it("wrapper slot receives onUpdate:modelValue handler", () => {
      let updateCalled = false;
      let updateValue: any = null;

      const context: any = {
        schema: [{ name: "test", type: "text", label: "Test" }],
        formData: { test: "" },
        errors: { test: null },
        validatedFields: { test: false },
        touched: { test: false },
        dirty: { test: false },
        initial: { test: "" },
        getValidationMode: () => "onSubmit",
        validateFieldByName: () => {},
        resetForm: () => {},
        touchAll: () => {},
        getErrors: () => ({}),
        getTouched: () => ({}),
        getDirty: () => ({}),
        validate: () => {},
        fieldOptionsMap: {},
        getFieldOptions: () => computed(() => []),
        bindField: () => computed(() => ({
          modelValue: "",
          'onUpdate:modelValue': (value: any) => {
            updateCalled = true;
            updateValue = value;
          },
          items: [],
          options: [],
          error: undefined,
          errorMessages: [],
        })),
      };

      let receivedProps: any = null;

      mount(AutoVorm, {
        global: {
          provide: { [VormContextKey]: context },
        },
        slots: {
          "wrapper:test": (props: any) => {
            receivedProps = props;
            return h("div", "Custom");
          },
        },
      });

      expect(receivedProps).not.toBeNull();
      expect(typeof receivedProps["onUpdate:modelValue"]).toBe("function");

      // Call the handler
      receivedProps["onUpdate:modelValue"]("new value");
      expect(updateCalled).toBe(true);
      expect(updateValue).toBe("new value");
    });
  });
});
