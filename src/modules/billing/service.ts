import { BILLING_PLANS } from "./plans.js";

export class BillingService {
  listPlans() {
    return BILLING_PLANS;
  }

  getPlan(planId: string) {
    return BILLING_PLANS.find((plan) => plan.id === planId) ?? null;
  }

  recommendPlan(domainCount: number, marketCount: number) {
    if (domainCount > 5 || marketCount > 10) {
      return this.getPlan("enterprise");
    }

    if (domainCount > 2 || marketCount > 2) {
      return this.getPlan("growth");
    }

    return this.getPlan("starter");
  }
}
