import { describe, it, expect, vi, beforeEach } from "vitest";
import { useVorm } from "../../composables/useVorm";
import type { VormSchema } from "../../types/schemaTypes";

const basicSchema: VormSchema = [
  {
    name: "email",
    label: "E-Mail",
    type: "text",
    validation: [{ rule: "required" }],
  },
  {
    name: "age",
    label: "Alter",
    type: "number",
    validation: [{ rule: "required" }],
  },
];

describe("useVorm", () => {
  let vorm: ReturnType<typeof useVorm>;

  beforeEach(() => {
    vorm = useVorm(basicSchema);
  });

  it("initializes all fields correctly", () => {
    expect(vorm.formData.email).toBe("");
    expect(vorm.errors.email).toBeNull();
    expect(vorm.touched.email).toBe(false);
    expect(vorm.dirty.email).toBe(false);
  });

  it("validates required fields", async () => {
    const isValid = await vorm.validate();
    expect(isValid).toBe(false);
    expect(vorm.errors.email).toBeTruthy();
  });

  it("validates individual field by name", async () => {
    vorm.formData.email = "hello@example.com";
    await vorm.validateFieldByName("email");
    expect(vorm.errors.email).toBeNull();
  });

  it("tracks touched and dirty correctly", async () => {
    vorm.formData.email = "foo";
    vorm.dirty.email = true;
    vorm.touched.email = true;
    expect(vorm.dirty.email).toBe(true);
    expect(vorm.touched.email).toBe(true);
  });

  it("resets the form", async () => {
    vorm.formData.email = "test@example.com";
    vorm.dirty.email = true;
    vorm.touched.email = true;

    // Trigger validation
    await vorm.validate();
    expect(vorm.errors.email).toBeNull(); // Should be valid

    vorm.resetForm();

    // After reset, form should be back to initial state
    expect(vorm.formData.email).toBe("");
    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for watchEffect
    expect(vorm.errors.email).toBeNull();
    expect(vorm.dirty.email).toBe(false);
    expect(vorm.touched.email).toBe(false);
  });

  describe("isValid computed property", () => {
    it("should be false initially (no fields validated yet)", () => {
      expect(vorm.isValid.value).toBe(false);
    });

    it("should be false when only one field is validated (not all)", async () => {
      vorm.formData.email = "test@example.com";
      await vorm.validateFieldByName("email");

      // Only email is validated, age is not yet validated
      expect(vorm.validatedFields.email).toBe(true);
      expect(vorm.validatedFields.age).toBe(false);
      expect(vorm.isValid.value).toBe(false);
    });

    it("should be true when all fields are validated and have no errors", async () => {
      vorm.formData.email = "test@example.com";
      vorm.formData.age = 25;

      const isValid = await vorm.validate();

      expect(isValid).toBe(true);
      expect(vorm.validatedFields.email).toBe(true);
      expect(vorm.validatedFields.age).toBe(true);
      expect(vorm.isValid.value).toBe(true);
    });

    it("should be false when all fields are validated but at least one has an error", async () => {
      vorm.formData.email = ""; // Empty, should trigger required error
      vorm.formData.age = 25;

      const isValid = await vorm.validate();

      expect(isValid).toBe(false);
      expect(vorm.validatedFields.email).toBe(true);
      expect(vorm.validatedFields.age).toBe(true);
      expect(vorm.errors.email).toBeTruthy();
      expect(vorm.isValid.value).toBe(false);
    });

    it("should remain false after validating individual fields until all are validated", async () => {
      // Validate first field
      vorm.formData.email = "test@example.com";
      await vorm.validateFieldByName("email");
      expect(vorm.isValid.value).toBe(false);

      // Validate second field
      vorm.formData.age = 30;
      await vorm.validateFieldByName("age");

      // Now all fields are validated
      expect(vorm.isValid.value).toBe(true);
    });
  });

  describe("repeater validation", () => {
    it("should validate fields inside repeaters by path", async () => {
      const repeaterSchema: VormSchema = [
        {
          name: "projects",
          type: "repeater",
          label: "Projects",
          fields: [
            {
              name: "name",
              type: "text",
              label: "Project Name",
              validation: [{ rule: "required", message: "Name is required" }],
            },
            {
              name: "url",
              type: "text",
              label: "URL",
              validation: [
                {
                  rule: (value: string) => {
                    if (!value || value.startsWith("http")) return null;
                    return "URL must start with http";
                  },
                },
              ],
            },
          ],
        },
      ];

      const repeaterVorm = useVorm(repeaterSchema);

      // Add a project item
      repeaterVorm.addRepeaterItem("projects", { name: "", url: "invalid-url" });

      // Validate the nested field by path (e.g., "projects[0].name")
      await repeaterVorm.validateFieldByName("projects[0].name");
      expect(repeaterVorm.errors["projects[0].name"]).toBe("Name is required");

      // Validate URL field
      await repeaterVorm.validateFieldByName("projects[0].url");
      expect(repeaterVorm.errors["projects[0].url"]).toBe("URL must start with http");

      // Fix the values and re-validate
      repeaterVorm.formData.projects[0].name = "My Project";
      repeaterVorm.formData.projects[0].url = "https://example.com";

      await repeaterVorm.validateFieldByName("projects[0].name");
      await repeaterVorm.validateFieldByName("projects[0].url");

      expect(repeaterVorm.errors["projects[0].name"]).toBeNull();
      expect(repeaterVorm.errors["projects[0].url"]).toBeNull();
    });

    it("should validate async validators in repeater fields", async () => {
      const asyncSchema: VormSchema = [
        {
          name: "items",
          type: "repeater",
          label: "Items",
          fields: [
            {
              name: "code",
              type: "text",
              label: "Code",
              validation: [
                {
                  rule: async (value: string) => {
                    await new Promise((r) => setTimeout(r, 10));
                    if (value === "VALID") return null;
                    return "Invalid code";
                  },
                },
              ],
            },
          ],
        },
      ];

      const asyncVorm = useVorm(asyncSchema);
      asyncVorm.addRepeaterItem("items", { code: "WRONG" });

      await asyncVorm.validateFieldByName("items[0].code");
      expect(asyncVorm.errors["items[0].code"]).toBe("Invalid code");

      asyncVorm.formData.items[0].code = "VALID";
      await asyncVorm.validateFieldByName("items[0].code");
      expect(asyncVorm.errors["items[0].code"]).toBeNull();
    });

    it("should validate nested repeaters", async () => {
      const nestedSchema: VormSchema = [
        {
          name: "teams",
          type: "repeater",
          label: "Teams",
          fields: [
            {
              name: "teamName",
              type: "text",
              label: "Team Name",
              validation: [{ rule: "required", message: "Team name required" }],
            },
            {
              name: "members",
              type: "repeater",
              label: "Members",
              fields: [
                {
                  name: "memberName",
                  type: "text",
                  label: "Member Name",
                  validation: [{ rule: "required", message: "Member name required" }],
                },
              ],
            },
          ],
        },
      ];

      const nestedVorm = useVorm(nestedSchema);

      // Add a team with a member
      nestedVorm.addRepeaterItem("teams", {
        teamName: "",
        members: [{ memberName: "" }],
      });

      // Validate nested repeater field: teams[0].members[0].memberName
      await nestedVorm.validateFieldByName("teams[0].members[0].memberName");
      expect(nestedVorm.errors["teams[0].members[0].memberName"]).toBe("Member name required");

      // Fix and re-validate
      nestedVorm.formData.teams[0].members[0].memberName = "John";
      await nestedVorm.validateFieldByName("teams[0].members[0].memberName");
      expect(nestedVorm.errors["teams[0].members[0].memberName"]).toBeNull();
    });
  });

  describe("conditional field validation (showIf)", () => {
    it("should skip validation for hidden fields (simple object match)", async () => {
      const schema: VormSchema = [
        {
          name: "role",
          type: "select",
          label: "Role",
          validation: [{ rule: "required" }],
        },
        {
          name: "companyName",
          type: "text",
          label: "Company Name",
          showIf: { role: "business" },
          validation: [{ rule: "required", message: "Company name required" }],
        },
      ];

      const vorm = useVorm(schema);
      vorm.formData.role = "personal"; // companyName should be hidden

      const isValid = await vorm.validate();

      // Should be valid because companyName is hidden and not validated
      expect(isValid).toBe(true);
      expect(vorm.errors.companyName).toBeNull();
    });

    it("should validate visible fields (simple object match)", async () => {
      const schema: VormSchema = [
        {
          name: "role",
          type: "select",
          label: "Role",
          validation: [{ rule: "required" }],
        },
        {
          name: "companyName",
          type: "text",
          label: "Company Name",
          showIf: { role: "business" },
          validation: [{ rule: "required", message: "Company name required" }],
        },
      ];

      const vorm = useVorm(schema);
      vorm.formData.role = "business"; // companyName should be visible

      const isValid = await vorm.validate();

      // Should be invalid because companyName is visible but empty
      expect(isValid).toBe(false);
      expect(vorm.errors.companyName).toBe("Company name required");
    });

    it("should skip validation for hidden fields (function condition)", async () => {
      const schema: VormSchema = [
        {
          name: "hasDiscount",
          type: "checkbox",
          label: "Has Discount",
        },
        {
          name: "discountCode",
          type: "text",
          label: "Discount Code",
          showIf: (formData) => formData.hasDiscount === true,
          validation: [{ rule: "required", message: "Discount code required" }],
        },
      ];

      const vorm = useVorm(schema);
      vorm.formData.hasDiscount = false; // discountCode should be hidden

      const isValid = await vorm.validate();

      expect(isValid).toBe(true);
      expect(vorm.errors.discountCode).toBeNull();
    });

    it("should validate visible fields (function condition)", async () => {
      const schema: VormSchema = [
        {
          name: "hasDiscount",
          type: "checkbox",
          label: "Has Discount",
        },
        {
          name: "discountCode",
          type: "text",
          label: "Discount Code",
          showIf: (formData) => formData.hasDiscount === true,
          validation: [{ rule: "required", message: "Discount code required" }],
        },
      ];

      const vorm = useVorm(schema);
      vorm.formData.hasDiscount = true; // discountCode should be visible

      const isValid = await vorm.validate();

      expect(isValid).toBe(false);
      expect(vorm.errors.discountCode).toBe("Discount code required");
    });

    it("should clear errors when a field becomes hidden", async () => {
      const schema: VormSchema = [
        {
          name: "role",
          type: "select",
          label: "Role",
          validation: [{ rule: "required" }],
        },
        {
          name: "companyName",
          type: "text",
          label: "Company Name",
          showIf: { role: "business" },
          validation: [{ rule: "required", message: "Company name required" }],
        },
      ];

      const vorm = useVorm(schema);

      // First, show the field and validate (should have error)
      vorm.formData.role = "business";
      await vorm.validate();
      expect(vorm.errors.companyName).toBe("Company name required");

      // Now hide the field by changing role
      vorm.formData.role = "personal";

      // Wait for the watcher to clear errors
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Error should be cleared
      expect(vorm.errors.companyName).toBeNull();
    });

    it("should not block form submission with hidden field errors", async () => {
      const schema: VormSchema = [
        {
          name: "userType",
          type: "select",
          label: "User Type",
          validation: [{ rule: "required" }],
        },
        {
          name: "githubUsername",
          type: "text",
          label: "GitHub Username",
          showIf: { userType: "contributor" },
          validation: [{ rule: "required", message: "GitHub username required" }],
        },
        {
          name: "inviteCode",
          type: "text",
          label: "Invite Code",
          showIf: { userType: "member" },
          validation: [{ rule: "required", message: "Invite code required" }],
        },
      ];

      const vorm = useVorm(schema);

      // Select contributor - only githubUsername should be validated
      vorm.formData.userType = "contributor";
      vorm.formData.githubUsername = "octocat";

      const isValid = await vorm.validate();

      // Should be valid - inviteCode is hidden and should not block
      expect(isValid).toBe(true);
      expect(vorm.errors.githubUsername).toBeNull();
      expect(vorm.errors.inviteCode).toBeNull();
    });

    it("should re-validate when switching between conditions", async () => {
      const schema: VormSchema = [
        {
          name: "userType",
          type: "select",
          label: "User Type",
          validation: [{ rule: "required" }],
        },
        {
          name: "githubUsername",
          type: "text",
          label: "GitHub Username",
          showIf: { userType: "contributor" },
          validation: [{ rule: "required", message: "GitHub username required" }],
        },
        {
          name: "inviteCode",
          type: "text",
          label: "Invite Code",
          showIf: { userType: "member" },
          validation: [{ rule: "required", message: "Invite code required" }],
        },
      ];

      const vorm = useVorm(schema);

      // Start as contributor with valid data
      vorm.formData.userType = "contributor";
      vorm.formData.githubUsername = "octocat";

      let isValid = await vorm.validate();
      expect(isValid).toBe(true);

      // Switch to member - now inviteCode is required
      vorm.formData.userType = "member";

      // Wait for watcher
      await new Promise((resolve) => setTimeout(resolve, 0));

      isValid = await vorm.validate();
      expect(isValid).toBe(false);
      expect(vorm.errors.inviteCode).toBe("Invite code required");
      // githubUsername error should be cleared (it's now hidden)
      expect(vorm.errors.githubUsername).toBeNull();
    });

    it("isValid should only consider visible fields", async () => {
      const schema: VormSchema = [
        {
          name: "name",
          type: "text",
          label: "Name",
          validation: [{ rule: "required" }],
        },
        {
          name: "hiddenField",
          type: "text",
          label: "Hidden",
          showIf: { name: "show-hidden" }, // Only visible if name is "show-hidden"
          validation: [{ rule: "required", message: "Hidden field required" }],
        },
      ];

      const vorm = useVorm(schema);
      vorm.formData.name = "John"; // hiddenField is hidden

      await vorm.validate();

      // Form should be valid - only "name" is visible and it has a value
      expect(vorm.isValid.value).toBe(true);
    });

    it("validateFieldByName should skip hidden fields", async () => {
      const schema: VormSchema = [
        {
          name: "showExtra",
          type: "checkbox",
          label: "Show Extra",
        },
        {
          name: "extraField",
          type: "text",
          label: "Extra",
          showIf: (formData) => formData.showExtra === true,
          validation: [{ rule: "required", message: "Extra required" }],
        },
      ];

      const vorm = useVorm(schema);
      vorm.formData.showExtra = false; // extraField is hidden

      await vorm.validateFieldByName("extraField");

      // Should not have an error because field is hidden
      expect(vorm.errors.extraField).toBeNull();
      expect(vorm.validatedFields.extraField).toBe(true);
    });
  });
});
