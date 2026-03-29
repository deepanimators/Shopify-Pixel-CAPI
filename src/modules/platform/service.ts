import type { BillingPlan } from "../billing/types.js";
import { BillingService } from "../billing/service.js";
import type { EventRepository } from "../events/repository.js";
import type { DeliveryStatus, NormalizedEvent } from "../events/types.js";
import { EVENT_SCENARIOS, getScenarioById, scenarioSummary } from "../events/scenarios.js";
import type { PlatformRepository } from "./repository.js";
import type { Tenant } from "./types.js";
import type { ShopifyAuthService } from "../shopify/auth.js";

export class PlatformService {
  constructor(
    private readonly platformRepository: PlatformRepository,
    private readonly eventRepository: EventRepository,
    private readonly billingService: BillingService,
    private readonly authService: ShopifyAuthService
  ) {}

  async getOverview() {
    const [tenants, installations, recentEvents, recentWebhooks] = await Promise.all([
      this.platformRepository.listTenants(),
      this.platformRepository.listInstallations(),
      this.eventRepository.listRecent(8),
      this.platformRepository.listWebhooks(8)
    ]);

    const totalDomains = tenants.reduce(
      (sum, tenant) => sum + tenant.supportedDomains.length,
      0
    );
    const totalMarkets = tenants.reduce(
      (sum, tenant) => sum + tenant.supportedMarkets.length,
      0
    );

    return {
      summary: {
        tenants: tenants.length,
        installedShops: installations.filter((installation) => installation.status === "installed")
          .length,
        domains: totalDomains,
        markets: totalMarkets,
        trackedEvents: await this.eventRepository.count()
      },
      tenants: await Promise.all(tenants.map((tenant) => this.toTenantCard(tenant))),
      plans: this.billingService.listPlans(),
      diagnostics: await this.getEventDiagnostics(),
      recentEvents,
      recentWebhooks
    };
  }

  async listTenants() {
    const tenants = await this.platformRepository.listTenants();

    return Promise.all(tenants.map((tenant) => this.toTenantCard(tenant)));
  }

  async getTenantDetail(tenantId: string) {
    const tenant = await this.platformRepository.getTenant(tenantId);
    if (!tenant) {
      return null;
    }

    const plan = this.billingService.getPlan(tenant.planId);
    const eventCount = await this.eventRepository.countByTenant(tenantId);

    return {
      ...tenant,
      plan,
      eventCount,
      enabledScenarios: tenant.tracking.enabledScenarioIds
        .map((scenarioId) => getScenarioById(scenarioId))
        .filter(Boolean),
      recommendedPlan: this.billingService.recommendPlan(
        tenant.supportedDomains.length,
        tenant.supportedMarkets.length
      )
    };
  }

  async upsertMetaConnection(tenantId: string, payload: {
    pixelId: string;
    accessToken: string;
    enabled: boolean;
    testEventCode?: string;
  }) {
    return this.platformRepository.upsertMetaConnection(tenantId, {
      pixelId: payload.pixelId,
      accessToken: payload.accessToken,
      enabled: payload.enabled,
      testEventCode: payload.testEventCode,
      lastValidatedAt: new Date().toISOString()
    });
  }

  async updateTrackingConfig(
    tenantId: string,
    tracking: Tenant["tracking"]
  ) {
    return this.platformRepository.updateTrackingConfig(tenantId, tracking);
  }

  async updateDestinationConfigs(
    tenantId: string,
    destinationConfigs: Tenant["destinations"]
  ) {
    return this.platformRepository.updateDestinationConfigs(tenantId, destinationConfigs);
  }

  async listInstallations() {
    return this.platformRepository.listInstallations();
  }

  async getEventDiagnostics(tenantId?: string) {
    const events = (await this.eventRepository.listAll()).filter((event) =>
      tenantId ? event.tenantId === tenantId : true
    );

    const byCanonicalEvent = aggregate(events, (event) => event.canonicalEvent);
    const byShopifyEvent = aggregate(events, (event) => event.eventName);
    const warnings = aggregate(
      events.flatMap((event) => event.qualityWarnings),
      (warning) => warning
    );

    const averageQuality = events.length
      ? Math.round(
          events.reduce((sum, event) => sum + event.qualityScore, 0) / events.length
        )
      : 0;

    return {
      totalEvents: events.length,
      averageQuality,
      byCanonicalEvent,
      byShopifyEvent,
      warnings
    };
  }

  async getCommerceDashboard(tenantId: string) {
    const events = (await this.eventRepository.listAll()).filter((event) => event.tenantId === tenantId);
    const purchaseEvents = events.filter((event) => event.canonicalEvent === "purchase");
    const checkoutEvents = events.filter((event) => event.category === "checkout");
    const trackedOrders = new Set(
      events
        .map((event) => event.commerce?.orderId)
        .filter((orderId): orderId is string => Boolean(orderId))
    );

    const summary = {
      productViews: events.filter((event) => event.canonicalEvent === "product_view").length,
      addToCarts: events.filter((event) => event.canonicalEvent === "add_to_cart").length,
      checkoutStarts: events.filter((event) => event.canonicalEvent === "begin_checkout").length,
      purchases: purchaseEvents.length,
      trackedOrders: trackedOrders.size,
      revenue: roundCurrency(purchaseEvents.reduce((sum, event) => sum + eventValue(event), 0))
    };

    const destinationBreakdown = aggregateDeliveries(purchaseEvents);
    const topProducts = buildTopProducts(events).slice(0, 8);
    const recentPurchases = purchaseEvents.slice(0, 10).map((event) => ({
      eventId: event.eventId,
      orderId: event.commerce?.orderId ?? `event:${event.eventId}`,
      occurredAt: event.occurredAt,
      value: roundCurrency(eventValue(event)),
      currency: event.commerce?.currency ?? event.market.currencyCode,
      marketId: event.market.marketId ?? "unknown",
      domain: event.market.domain ?? event.shopDomain,
      itemsCount: event.lineItems?.length ?? 0,
      customerEmail: event.user.email ?? null,
      qualityScore: event.qualityScore,
      qualityWarnings: event.qualityWarnings,
      deliveries: event.deliveries
    }));
    const orderStatuses = buildOrderStatuses(events).slice(0, 10);

    return {
      summary: {
        ...summary,
        averageOrderValue: summary.purchases
          ? roundCurrency(summary.revenue / summary.purchases)
          : 0,
        checkoutCompletionRate: summary.checkoutStarts
          ? Math.round((summary.purchases / summary.checkoutStarts) * 100)
          : 0,
        averageQuality: events.length
          ? Math.round(events.reduce((sum, event) => sum + event.qualityScore, 0) / events.length)
          : 0,
        checkoutEvents: checkoutEvents.length
      },
      destinationBreakdown,
      topProducts,
      recentPurchases,
      orderStatuses
    };
  }

  createInstallLink(shop: string) {
    return this.authService.createInstallStart(shop);
  }

  getScenarioRegistry() {
    return {
      summary: scenarioSummary(),
      scenarios: EVENT_SCENARIOS
    };
  }

  private async toTenantCard(tenant: Tenant) {
    const plan = this.billingService.getPlan(tenant.planId) ?? this.billingService.listPlans()[0];
    const eventCount = await this.eventRepository.countByTenant(tenant.tenantId);

    return {
      tenantId: tenant.tenantId,
      displayName: tenant.displayName,
      shopDomain: tenant.shopDomain,
      status: tenant.status,
      domains: tenant.supportedDomains.length,
      markets: tenant.supportedMarkets.length,
      metaEnabled: tenant.destinations.meta?.enabled ?? false,
      destinationsEnabled: Object.values(tenant.destinations).filter((destination) => destination?.enabled)
        .length,
      enabledScenarioCount: tenant.tracking.enabledScenarioIds.length,
      eventCount,
      plan
    };
  }
}

function aggregate<T>(items: T[], getKey: (item: T) => string) {
  return Object.entries(
    items.reduce<Record<string, number>>((accumulator, item) => {
      const key = getKey(item);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);
}

function eventValue(event: NormalizedEvent) {
  if (typeof event.commerce?.value === "number") {
    return event.commerce.value;
  }

  return event.lineItems?.reduce((sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 1)), 0) ?? 0;
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function aggregateDeliveries(events: NormalizedEvent[]) {
  const totals: Record<string, Record<DeliveryStatus["status"], number>> = {};

  for (const event of events) {
    for (const [destination, result] of Object.entries(event.deliveries ?? {})) {
      totals[destination] ??= {
        delivered: 0,
        failed: 0,
        skipped: 0,
        preview: 0
      };
      totals[destination][result.status] += 1;
    }
  }

  return Object.entries(totals).map(([destination, counts]) => ({
    destination,
    ...counts
  }));
}

function buildTopProducts(events: NormalizedEvent[]) {
  const products = new Map<string, {
    productId: string;
    title: string;
    views: number;
    addToCarts: number;
    purchases: number;
    unitsSold: number;
    revenue: number;
    lastSeenAt?: string;
    deliveredPurchases: number;
    failedPurchases: number;
  }>();

  for (const event of events) {
    const lineItems = event.lineItems?.length ? event.lineItems : [undefined];

    for (const lineItem of lineItems) {
      const productId = lineItem?.productId ?? String(event.properties?.productId ?? "unknown-product");
      const title = lineItem?.title ?? String(event.properties?.title ?? event.properties?.productTitle ?? productId);
      const key = `${productId}:${title}`;
      const current = products.get(key) ?? {
        productId,
        title,
        views: 0,
        addToCarts: 0,
        purchases: 0,
        unitsSold: 0,
        revenue: 0,
        deliveredPurchases: 0,
        failedPurchases: 0
      };

      if (event.canonicalEvent === "product_view") {
        current.views += 1;
      }
      if (event.canonicalEvent === "add_to_cart") {
        current.addToCarts += 1;
      }
      if (event.canonicalEvent === "purchase") {
        current.purchases += 1;
        current.unitsSold += lineItem?.quantity ?? 1;
        current.revenue += (lineItem?.price ?? eventValue(event)) * (lineItem?.quantity ?? 1);
        if (Object.values(event.deliveries ?? {}).some((delivery) => delivery.status === "delivered")) {
          current.deliveredPurchases += 1;
        }
        if (Object.values(event.deliveries ?? {}).some((delivery) => delivery.status === "failed")) {
          current.failedPurchases += 1;
        }
      }

      current.lastSeenAt = current.lastSeenAt && current.lastSeenAt > event.occurredAt
        ? current.lastSeenAt
        : event.occurredAt;
      products.set(key, current);
    }
  }

  return [...products.values()]
    .map((product) => ({
      ...product,
      revenue: roundCurrency(product.revenue)
    }))
    .sort((left, right) => right.revenue - left.revenue || right.purchases - left.purchases || right.views - left.views);
}

function buildOrderStatuses(events: NormalizedEvent[]) {
  const orders = new Map<string, {
    orderId: string;
    latestAt: string;
    marketId: string;
    currency: string;
    value: number;
    status: string;
    timeline: string[];
    items: number;
    deliveries: Record<string, DeliveryStatus>;
    qualityScore: number;
  }>();

  for (const event of events) {
    const orderId = event.commerce?.orderId;
    if (!orderId) {
      continue;
    }

    const existing = orders.get(orderId) ?? {
      orderId,
      latestAt: event.occurredAt,
      marketId: event.market.marketId ?? "unknown",
      currency: event.commerce?.currency ?? event.market.currencyCode,
      value: 0,
      status: "tracked",
      timeline: [],
      items: 0,
      deliveries: {},
      qualityScore: event.qualityScore
    };

    existing.latestAt = existing.latestAt > event.occurredAt ? existing.latestAt : event.occurredAt;
    existing.marketId = event.market.marketId ?? existing.marketId;
    existing.currency = event.commerce?.currency ?? existing.currency;
    existing.value = Math.max(existing.value, eventValue(event));
    existing.items = Math.max(existing.items, event.lineItems?.length ?? 0);
    existing.qualityScore = Math.max(existing.qualityScore, event.qualityScore);
    existing.deliveries = Object.keys(event.deliveries ?? {}).length ? event.deliveries : existing.deliveries;

    if (!existing.timeline.includes(event.canonicalEvent)) {
      existing.timeline.push(event.canonicalEvent);
    }

    if (event.canonicalEvent === "refund") {
      existing.status = "refunded";
    } else if (event.canonicalEvent === "purchase") {
      existing.status = deriveTrackingStatus(event.deliveries);
    } else if (["begin_checkout", "add_shipping_info", "add_payment_info"].includes(event.canonicalEvent)) {
      existing.status = "checkout_in_progress";
    }

    orders.set(orderId, existing);
  }

  return [...orders.values()]
    .map((order) => ({
      ...order,
      value: roundCurrency(order.value)
    }))
    .sort((left, right) => right.latestAt.localeCompare(left.latestAt));
}

function deriveTrackingStatus(deliveries: Record<string, DeliveryStatus> = {}) {
  const statuses = Object.values(deliveries).map((delivery) => delivery.status);
  if (!statuses.length) {
    return "captured";
  }
  if (statuses.some((status) => status === "failed")) {
    return "attention_needed";
  }
  if (statuses.some((status) => status === "preview")) {
    return "preview_only";
  }
  if (statuses.some((status) => status === "skipped")) {
    return "partially_configured";
  }
  return "delivered";
}
