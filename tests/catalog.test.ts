import { describe, expect, it } from "vitest";

import { canonicalCategory, resolveScenario, toCanonicalEventName } from "../src/modules/events/catalog.js";

describe("event catalog", () => {
  it("resolves tenant custom mappings before default aliases", () => {
    const scenario = resolveScenario("custom:merchant_event", {
      enabledScenarioIds: ["purchase"],
      customEventMappings: [
        {
          sourceName: "breeze_purchase",
          scenarioId: "purchase",
          enabled: true
        }
      ]
    }, "breeze_purchase");

    expect(scenario?.id).toBe("purchase");
    expect(scenario?.canonicalEvent).toBe("purchase");
  });

  it("ignores disabled custom mappings", () => {
    const scenario = resolveScenario("custom:merchant_event", {
      enabledScenarioIds: ["purchase"],
      customEventMappings: [
        {
          sourceName: "breeze_purchase",
          scenarioId: "purchase",
          enabled: false
        }
      ]
    }, "breeze_purchase");

    expect(scenario).toBeNull();
    expect(toCanonicalEventName("custom:merchant_event")).toBe("custom_event");
  });

  it("classifies canonical categories correctly", () => {
    expect(canonicalCategory("purchase")).toBe("conversion");
    expect(canonicalCategory("add_shipping_info")).toBe("checkout");
    expect(canonicalCategory("identify_customer")).toBe("identity");
    expect(canonicalCategory("consent_update")).toBe("consent");
    expect(canonicalCategory("custom_event")).toBe("custom");
  });
});
