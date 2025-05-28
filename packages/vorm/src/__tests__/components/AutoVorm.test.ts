// tests/unit/AutoVorm.spec.ts
import { mount } from "@vue/test-utils";
import AutoVorm from "../../components/AutoVorm.vue";

import { describe, expect, it } from "vitest";
import { VormContextKey } from "../../core/vormContext";
import { defineComponent, h, type Slots } from "vue";

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
});
