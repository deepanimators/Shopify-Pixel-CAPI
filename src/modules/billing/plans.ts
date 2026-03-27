import type { BillingPlan } from "./types.js";

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 79,
    yearlyPrice: 790,
    bestFor: "Single-market brands validating server-side tracking",
    features: [
      "1 Shopify store",
      "Up to 2 domains",
      "Meta CAPI delivery",
      "Basic diagnostics"
    ]
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    bestFor: "Scaling stores across multiple Shopify Markets",
    features: [
      "Multi-domain identity stitching",
      "Up to 10 markets",
      "Advanced attribution diagnostics",
      "Priority onboarding"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    bestFor: "High-volume multi-brand or multi-region teams",
    features: [
      "Unlimited markets",
      "SLA-backed support",
      "Custom destinations",
      "Dedicated solution architecture"
    ]
  }
];
