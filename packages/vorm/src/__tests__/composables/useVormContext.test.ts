import { describe, it, expect } from "vitest";
import { defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import type { VormContext } from "../../composables/useVorm";
import { useVormContext } from "../../composables/useVormContext";
import { VormContextKey } from "../../core/vormContext";

const mockContext: VormContext = {
  schema: [],
  formData: {},
  errors: {},
  validatedFields: {},
  touched: {},
  dirty: {},
  initial: {},
  validate: async () => true,
  validateFieldByName: async () => {},
  getValidationMode: () => "onSubmit",
  resetForm: () => {},
  touchAll: () => {},
  getErrors: () => ({}),
  getTouched: () => ({}),
  getDirty: () => ({}),
};

describe("useVormContext", () => {
  it("returns provided context", () => {
    const customKey = Symbol("TestFormKey");
    const Comp = defineComponent({
      setup() {
        provide(VormContextKey, mockContext);
        const ctx = useVormContext();
        expect(ctx).toBe(mockContext);
        return () => h("div");
      },
    });

    mount(Comp, {
      global: {
        provide: {
          [VormContextKey]: mockContext,
        },
      },
    });
  });

  it("throws error if no context is provided", () => {
    const Comp = defineComponent({
      setup() {
        expect(() => useVormContext()).toThrowError(
          "[Vorm] No FormContext found"
        );
        return () => h("div");
      },
    });

    mount(Comp);
  });
});
