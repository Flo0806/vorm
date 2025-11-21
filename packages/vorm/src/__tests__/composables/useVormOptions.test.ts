import { describe, it, expect, beforeEach } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useVorm } from "../../composables/useVorm";
import type { VormSchema, Option } from "../../types/schemaTypes";

describe("useVorm options", () => {
  describe("getFieldOptions", () => {
    it("returns empty array for field without options", () => {
      const schema: VormSchema = [
        { name: "username", type: "text", label: "Username" },
      ];
      const vorm = useVorm(schema);

      const options = vorm.getFieldOptions("username");
      expect(options.value).toEqual([]);
    });

    it("returns static options from schema", () => {
      const schema: VormSchema = [
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
      const vorm = useVorm(schema);

      const options = vorm.getFieldOptions("country");
      expect(options.value).toHaveLength(2);
      expect(options.value[0]).toEqual({ label: "Germany", value: "DE" });
    });

    it("returns string options from schema", () => {
      const schema: VormSchema = [
        {
          name: "city",
          type: "select",
          label: "City",
          options: ["Berlin", "Munich", "Hamburg"],
        },
      ];
      const vorm = useVorm(schema);

      const options = vorm.getFieldOptions("city");
      expect(options.value).toEqual(["Berlin", "Munich", "Hamburg"]);
    });

    it("returns options with custom data (icon, metadata)", () => {
      const schema: VormSchema = [
        {
          name: "language",
          type: "select",
          label: "Language",
          options: [
            { label: "English", value: "en", icon: "🇬🇧", metadata: { code: "en-US" } },
            { label: "German", value: "de", icon: "🇩🇪", metadata: { code: "de-DE" } },
          ],
        },
      ];
      const vorm = useVorm(schema);

      const options = vorm.getFieldOptions("language");
      expect(options.value[0]).toMatchObject({
        label: "English",
        value: "en",
        icon: "🇬🇧",
        metadata: { code: "en-US" },
      });
    });

    it("returns reactive options from Ref", async () => {
      const optionsRef = ref<Option[]>([
        { label: "Option A", value: "a" },
      ]);

      const schema: VormSchema = [
        {
          name: "dynamic",
          type: "select",
          label: "Dynamic",
          options: optionsRef,
        },
      ];
      const vorm = useVorm(schema);

      expect(vorm.getFieldOptions("dynamic").value).toHaveLength(1);

      // Update ref
      optionsRef.value = [
        { label: "Option A", value: "a" },
        { label: "Option B", value: "b" },
      ];
      await nextTick();

      expect(vorm.getFieldOptions("dynamic").value).toHaveLength(2);
    });

    it("returns reactive options from computed", async () => {
      const showAll = ref(false);
      const computedOptions = computed(() => {
        const base = [{ label: "Basic", value: "basic" }];
        if (showAll.value) {
          return [...base, { label: "Advanced", value: "advanced" }];
        }
        return base;
      });

      const schema: VormSchema = [
        {
          name: "level",
          type: "select",
          label: "Level",
          options: computedOptions,
        },
      ];
      const vorm = useVorm(schema);

      expect(vorm.getFieldOptions("level").value).toHaveLength(1);

      showAll.value = true;
      await nextTick();

      expect(vorm.getFieldOptions("level").value).toHaveLength(2);
    });

    it("returns reactive options from function", async () => {
      const showAdvanced = ref(false);

      const schema: VormSchema = [
        {
          name: "city",
          type: "select",
          label: "City",
          options: () => {
            const base = ["Berlin", "Munich"];
            return showAdvanced.value ? [...base, "Frankfurt", "Cologne"] : base;
          },
        },
      ];
      const vorm = useVorm(schema);

      expect(vorm.getFieldOptions("city").value).toHaveLength(2);

      showAdvanced.value = true;
      await nextTick();

      expect(vorm.getFieldOptions("city").value).toHaveLength(4);
    });

    it("falls back to fieldOptionsMap when schema has no options", () => {
      const schema: VormSchema = [
        { name: "dynamic", type: "select", label: "Dynamic" },
      ];
      const vorm = useVorm(schema);

      // Set options via fieldOptionsMap
      vorm.setFormData({}, {
        fieldOptions: {
          dynamic: [
            { label: "Opt 1", value: "1" },
            { label: "Opt 2", value: "2" },
          ],
        },
      });

      const options = vorm.getFieldOptions("dynamic");
      expect(options.value).toHaveLength(2);
    });

    it("prefers schema options over fieldOptionsMap", () => {
      const schema: VormSchema = [
        {
          name: "country",
          type: "select",
          label: "Country",
          options: [{ label: "From Schema", value: "schema" }],
        },
      ];
      const vorm = useVorm(schema);

      // Try to override via fieldOptionsMap
      vorm.setFormData({}, {
        fieldOptions: {
          country: [{ label: "From OptionsMap", value: "map" }],
        },
      });

      const options = vorm.getFieldOptions("country");
      expect(options.value[0].label).toBe("From Schema");
    });
  });

  describe("bindField", () => {
    it("returns modelValue from formData", () => {
      const schema: VormSchema = [
        { name: "username", type: "text", label: "Username" },
      ];
      const vorm = useVorm(schema);
      vorm.formData.username = "test";

      const bindings = vorm.bindField("username");
      expect(bindings.value.modelValue).toBe("test");
    });

    it("returns options/items from schema", () => {
      const schema: VormSchema = [
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
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("country");
      expect(bindings.value.items).toHaveLength(2);
      expect(bindings.value.options).toHaveLength(2);
    });

    it("returns error and errorMessages", async () => {
      const schema: VormSchema = [
        {
          name: "email",
          type: "text",
          label: "Email",
          validation: [{ rule: "required" }],
        },
      ];
      const vorm = useVorm(schema);

      // No error initially
      let bindings = vorm.bindField("email");
      expect(bindings.value.error).toBeUndefined();
      expect(bindings.value.errorMessages).toEqual([]);

      // Trigger validation error
      await vorm.validate();

      bindings = vorm.bindField("email");
      expect(bindings.value.error).toBeTruthy();
      expect(bindings.value.errorMessages).toHaveLength(1);
    });

    it("onUpdate:modelValue updates formData and validates", async () => {
      const schema: VormSchema = [
        {
          name: "email",
          type: "text",
          label: "Email",
          validation: [{ rule: "required" }],
        },
      ];
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("email");

      // Call the update handler
      bindings.value["onUpdate:modelValue"]("test@example.com");

      // Wait for validation
      await nextTick();

      expect(vorm.formData.email).toBe("test@example.com");
      expect(vorm.touched.email).toBe(true);
      expect(vorm.dirty.email).toBe(true);
    });

    it("is reactive to formData changes", async () => {
      const schema: VormSchema = [
        { name: "name", type: "text", label: "Name" },
      ];
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("name");
      expect(bindings.value.modelValue).toBe("");

      vorm.formData.name = "John";
      await nextTick();

      expect(bindings.value.modelValue).toBe("John");
    });

    it("is reactive to options changes", async () => {
      const optionsRef = ref<Option[]>([{ label: "A", value: "a" }]);

      const schema: VormSchema = [
        {
          name: "select",
          type: "select",
          label: "Select",
          options: optionsRef,
        },
      ];
      const vorm = useVorm(schema);

      const bindings = vorm.bindField("select");
      expect(bindings.value.items).toHaveLength(1);

      optionsRef.value = [
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ];
      await nextTick();

      expect(bindings.value.items).toHaveLength(2);
    });
  });

  describe("backward compatibility", () => {
    it("fieldOptionsMap still works with setFormData", () => {
      const schema: VormSchema = [
        { name: "field", type: "select", label: "Field" },
      ];
      const vorm = useVorm(schema);

      vorm.setFormData({ field: "value" }, {
        fieldOptions: {
          field: [{ label: "Option", value: "value" }],
        },
      });

      expect(vorm.fieldOptionsMap.field).toHaveLength(1);
      expect(vorm.getFieldOptions("field").value).toHaveLength(1);
    });

    it("fieldOptionsMap still works with updateField", () => {
      const schema: VormSchema = [
        { name: "field", type: "select", label: "Field" },
      ];
      const vorm = useVorm(schema);

      vorm.updateField("field", "value", {
        fieldOptions: [{ label: "Option", value: "value" }],
      });

      expect(vorm.fieldOptionsMap.field).toHaveLength(1);
    });

    it("Option type still accepts simple objects without custom data", () => {
      const schema: VormSchema = [
        {
          name: "simple",
          type: "select",
          label: "Simple",
          options: [
            { label: "A", value: "a" },
            { label: "B", value: "b", disabled: true },
          ],
        },
      ];
      const vorm = useVorm(schema);

      const options = vorm.getFieldOptions("simple");
      expect(options.value[0]).toEqual({ label: "A", value: "a" });
      expect(options.value[1]).toEqual({ label: "B", value: "b", disabled: true });
    });
  });
});
