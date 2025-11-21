import { describe, it, expect } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useVorm } from "../../composables/useVorm";
import type { VormSchema } from "../../types/schemaTypes";

describe("useVorm reactive disabled", () => {
  describe("static disabled", () => {
    it("supports static boolean disabled: true", () => {
      const schema: VormSchema = [
        { name: "field", type: "text", label: "Field", disabled: true },
      ];
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("field");
      expect(bindings.value.disabled).toBe(true);
    });

    it("supports static boolean disabled: false", () => {
      const schema: VormSchema = [
        { name: "field", type: "text", label: "Field", disabled: false },
      ];
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("field");
      expect(bindings.value.disabled).toBe(false);
    });

    it("defaults to false when disabled is undefined", () => {
      const schema: VormSchema = [
        { name: "field", type: "text", label: "Field" },
      ];
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("field");
      expect(bindings.value.disabled).toBe(false);
    });
  });

  describe("reactive disabled with Ref", () => {
    it("supports Ref<boolean> for disabled", async () => {
      const isDisabled = ref(false);
      const schema: VormSchema = [
        { name: "field", type: "text", label: "Field", disabled: isDisabled },
      ];
      const vorm = useVorm(schema);

      expect(vorm.bindField("field").value.disabled).toBe(false);

      isDisabled.value = true;
      await nextTick();

      expect(vorm.bindField("field").value.disabled).toBe(true);
    });
  });

  describe("reactive disabled with Computed", () => {
    it("supports ComputedRef<boolean> for disabled", async () => {
      const isLocked = ref(false);
      const disabledComputed = computed(() => isLocked.value);

      const schema: VormSchema = [
        { name: "field", type: "text", label: "Field", disabled: disabledComputed },
      ];
      const vorm = useVorm(schema);

      expect(vorm.bindField("field").value.disabled).toBe(false);

      isLocked.value = true;
      await nextTick();

      expect(vorm.bindField("field").value.disabled).toBe(true);
    });
  });

  describe("reactive disabled with Function", () => {
    it("supports function returning boolean", () => {
      let shouldDisable = false;
      const schema: VormSchema = [
        {
          name: "field",
          type: "text",
          label: "Field",
          disabled: () => shouldDisable,
        },
      ];
      const vorm = useVorm(schema);

      expect(vorm.bindField("field").value.disabled).toBe(false);

      shouldDisable = true;
      // Re-evaluate by getting bindings again
      expect(vorm.bindField("field").value.disabled).toBe(true);
    });
  });

  describe("reactive disabled with FormContext", () => {
    it("disables field based on formData value", async () => {
      const schema: VormSchema = [
        { name: "agreeToTerms", type: "checkbox", label: "Agree to Terms" },
        {
          name: "submit",
          type: "text",
          label: "Submit",
          disabled: (ctx) => !ctx.formData.agreeToTerms,
        },
      ];
      const vorm = useVorm(schema);

      // Initially, agreeToTerms is falsy, so submit should be disabled
      expect(vorm.bindField("submit").value.disabled).toBe(true);

      // Check the terms
      vorm.formData.agreeToTerms = true;
      await nextTick();

      // Now submit should be enabled
      expect(vorm.bindField("submit").value.disabled).toBe(false);
    });

    it("disables field based on another field's length", async () => {
      const schema: VormSchema = [
        { name: "password", type: "password", label: "Password" },
        {
          name: "confirmPassword",
          type: "password",
          label: "Confirm Password",
          disabled: (ctx) => !ctx.formData.password || ctx.formData.password.length < 8,
        },
      ];
      const vorm = useVorm(schema);

      // No password entered
      expect(vorm.bindField("confirmPassword").value.disabled).toBe(true);

      // Short password
      vorm.formData.password = "short";
      await nextTick();
      expect(vorm.bindField("confirmPassword").value.disabled).toBe(true);

      // Valid password length
      vorm.formData.password = "longenough";
      await nextTick();
      expect(vorm.bindField("confirmPassword").value.disabled).toBe(false);
    });

    it("can access form validation state in disabled function", async () => {
      const schema: VormSchema = [
        {
          name: "email",
          type: "email",
          label: "Email",
          validation: [{ rule: "required" }],
        },
        {
          name: "submit",
          type: "text",
          label: "Submit",
          // Only enable when form is dirty
          disabled: (ctx) => !ctx.isDirty,
        },
      ];
      const vorm = useVorm(schema);

      // Initially not dirty
      expect(vorm.bindField("submit").value.disabled).toBe(true);

      // Make form dirty
      vorm.formData.email = "test@example.com";
      vorm.dirty.email = true;
      await nextTick();

      expect(vorm.bindField("submit").value.disabled).toBe(false);
    });
  });

  describe("backward compatibility", () => {
    it("existing schemas with boolean disabled still work", () => {
      const schema: VormSchema = [
        { name: "readonly", type: "text", label: "Readonly", disabled: true },
        { name: "editable", type: "text", label: "Editable", disabled: false },
        { name: "default", type: "text", label: "Default" },
      ];
      const vorm = useVorm(schema);

      expect(vorm.bindField("readonly").value.disabled).toBe(true);
      expect(vorm.bindField("editable").value.disabled).toBe(false);
      expect(vorm.bindField("default").value.disabled).toBe(false);
    });
  });
});
