import { describe, it, expect } from "vitest";
import {
  extractVariablesFromText,
  renderTemplateWithVariables,
  generateVariableKeyFromLabel,
  SYSTEM_VARIABLES,
} from "../lib/sms/custom-variables";

describe("CustomVariables (SMS Template Tokenizer & Engine)", () => {
  describe("extractVariablesFromText", () => {
    it("should extract all unique variable names from template text", () => {
      const template = "Hello {{firstName}} {{lastName}}, your order {{orderId}} is ready. Contact {{firstName}}!";
      const vars = extractVariablesFromText(template);

      expect(vars).toEqual(["firstName", "lastName", "orderId"]);
    });

    it("should handle whitespace within variable brackets", () => {
      const template = "Alert for {{  phone  }} on {{ date }}.";
      const vars = extractVariablesFromText(template);

      expect(vars).toEqual(["phone", "date"]);
    });

    it("should return an empty array if no tags are present", () => {
      expect(extractVariablesFromText("Standard message without variables.")).toEqual([]);
    });
  });

  describe("renderTemplateWithVariables", () => {
    it("should substitute variables with explicit provided values", () => {
      const template = "Dear {{firstName}}, your code is {{otp}}.";
      const values = { firstName: "Brenda", otp: "948210" };

      const rendered = renderTemplateWithVariables(template, values);

      expect(rendered).toBe("Dear Brenda, your code is 948210.");
    });

    it("should fall back to system variable sample/fallback values when not provided in dict", () => {
      const template = "Hello {{firstName}}, welcome to Range Bulk SMS.";
      // Not providing firstName in values
      const rendered = renderTemplateWithVariables(template, {});

      // Should pick Sarah (sampleValue for firstName)
      expect(rendered).toBe("Hello Sarah, welcome to Range Bulk SMS.");
    });

    it("should preserve unknown variable tags if no replacement exists", () => {
      const template = "Your status is {{unknown_tag}}.";
      const rendered = renderTemplateWithVariables(template, {});

      expect(rendered).toBe("Your status is {{unknown_tag}}.");
    });
  });

  describe("generateVariableKeyFromLabel", () => {
    it("should convert human-readable labels into valid camelCase keys", () => {
      expect(generateVariableKeyFromLabel("Purchase Order ID")).toBe("purchaseOrderId");
      expect(generateVariableKeyFromLabel("Delivery Date & Time")).toBe("deliveryDateTime");
      expect(generateVariableKeyFromLabel("Account #")).toBe("account");
    });

    it("should prepend 'var' if label starts with a numeric digit", () => {
      expect(generateVariableKeyFromLabel("2026 Promo Code")).toBe("var2026PromoCode");
    });

    it("should enforce a 30-character length limit", () => {
      const longLabel = "Very Long Custom Customer Field That Exceeds The Thirty Char Limit";
      const key = generateVariableKeyFromLabel(longLabel);

      expect(key.length).toBeLessThanOrEqual(30);
    });

    it("should return an empty string for invalid or empty inputs", () => {
      expect(generateVariableKeyFromLabel("")).toBe("");
      expect(generateVariableKeyFromLabel("   ")).toBe("");
      expect(generateVariableKeyFromLabel("!@#$%^&*()")).toBe("");
    });
  });

  describe("System Variables Integrity", () => {
    it("should include standard built-in system variables", () => {
      const keys = SYSTEM_VARIABLES.map((v) => v.key);
      expect(keys).toContain("firstName");
      expect(keys).toContain("lastName");
      expect(keys).toContain("phone");
      expect(keys).toContain("email");
    });
  });
});
