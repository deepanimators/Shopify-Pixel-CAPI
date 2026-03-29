import { describe, expect, it } from "vitest";

import { toCanonicalEventName } from "../src/modules/events/catalog.js";
import { EVENT_SCENARIOS, scenarioSummary } from "../src/modules/events/scenarios.js";

describe("event scenario registry", () => {
  it("contains broad ecommerce coverage", () => {
    expect(EVENT_SCENARIOS.length).toBeGreaterThan(100);
    expect(scenarioSummary().total).toBe(EVENT_SCENARIOS.length);
  });

  it("maps common GA4 and dataLayer names into canonical events", () => {
    expect(toCanonicalEventName("view_item")).toBe("product_view");
    expect(toCanonicalEventName("view_item_list")).toBe("view_item_list");
    expect(toCanonicalEventName("select_promotion")).toBe("select_promotion");
    expect(toCanonicalEventName("refund")).toBe("refund");
    expect(toCanonicalEventName("remove-from-cart")).toBe("remove_from_cart");
    expect(toCanonicalEventName("newsletter_signup")).toBe("subscribe_newsletter");
    expect(toCanonicalEventName("td_ssc_id_success")).toBe("identify_customer");
  });
});
