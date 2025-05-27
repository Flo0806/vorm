import { describe, expect, it } from "vitest";
import type { VormSchema } from "../../types/schemaTypes";
import { expandSchema } from "../../utils/expandSchema";

describe("expandSchema", () => {
  it("returns flat schema if no repeater present", () => {
    const schema: VormSchema = [
      { name: "email", label: "E-Mail", type: "text" },
      { name: "age", label: "Age", type: "number" },
    ];

    const formData = { email: "a", age: 1 };

    const result = expandSchema(schema, formData);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("email");
    expect(result[1].name).toBe("age");
  });

  it("flattens single repeater with nested fields", () => {
    const schema: VormSchema = [
      {
        name: "contacts",
        type: "repeater",
        label: "Kontakte",
        fields: [
          { name: "email", label: "Email", type: "text" },
          { name: "phone", label: "Telefon", type: "text" },
        ],
      },
    ];

    const formData = {
      contacts: [
        { email: "a", phone: "1" },
        { email: "b", phone: "2" },
      ],
    };

    const result = expandSchema(schema, formData);

    expect(result).toHaveLength(4);
    expect(result.map((f) => f.name)).toEqual([
      "contacts[0].email",
      "contacts[0].phone",
      "contacts[1].email",
      "contacts[1].phone",
    ]);
  });

  it("supports nested repeaters", () => {
    const schema: VormSchema = [
      {
        name: "contacts",
        type: "repeater",
        fields: [
          {
            name: "emails",
            type: "repeater",
            fields: [{ name: "address", type: "text" }],
          },
        ],
      },
    ];

    const formData = {
      contacts: [
        {
          emails: [{ address: "a" }, { address: "b" }],
        },
      ],
    };

    const result = expandSchema(schema, formData);
    expect(result.map((f) => f.name)).toEqual([
      "contacts[0].emails[0].address",
      "contacts[0].emails[1].address",
    ]);
  });

  it("defensively skips invalid repeater content", () => {
    const schema: VormSchema = [
      {
        name: "items",
        type: "repeater",
        fields: [{ name: "label", type: "text" }],
      },
    ];

    const formData = {
      items: "not-an-array", // ⛔ invalid, aber nur theoretisch
    };

    const result = expandSchema(schema, formData);
    console.log("Formdata", formData, result);
    expect(result).toHaveLength(0); // ✅ korrektes Verhalten
  });
});
