import { DestinationService } from "./modules/destinations/service.js";
import { BillingService } from "./modules/billing/service.js";
import { InMemoryEventRepository } from "./modules/events/repository.js";
import { EventService } from "./modules/events/service.js";
import { IdentityResolver } from "./modules/identity/resolver.js";
import { InMemoryPlatformRepository } from "./modules/platform/repository.js";
import { PlatformService } from "./modules/platform/service.js";
import { createSeedPlatformData } from "./modules/platform/seed.js";
import { ShopifyAuthService } from "./modules/shopify/auth.js";
import { ShopifyWebhookService } from "./modules/shopify/webhooks.js";

export interface AppContainer {
  billingService: BillingService;
  destinationService: DestinationService;
  eventRepository: InMemoryEventRepository;
  eventService: EventService;
  platformRepository: InMemoryPlatformRepository;
  platformService: PlatformService;
  shopifyAuthService: ShopifyAuthService;
  shopifyWebhookService: ShopifyWebhookService;
}

export function createContainer(): AppContainer {
  const platformRepository = new InMemoryPlatformRepository(createSeedPlatformData());
  const eventRepository = new InMemoryEventRepository();
  const billingService = new BillingService();
  const destinationService = new DestinationService();
  const identityResolver = new IdentityResolver();
  const shopifyAuthService = new ShopifyAuthService(platformRepository);
  const eventService = new EventService(
    eventRepository,
    platformRepository,
    identityResolver,
    destinationService
  );
  const platformService = new PlatformService(
    platformRepository,
    eventRepository,
    billingService,
    shopifyAuthService
  );
  const shopifyWebhookService = new ShopifyWebhookService(platformRepository);

  return {
    billingService,
    destinationService,
    eventRepository,
    eventService,
    platformRepository,
    platformService,
    shopifyAuthService,
    shopifyWebhookService
  };
}
