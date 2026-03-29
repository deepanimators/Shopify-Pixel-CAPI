import { env } from "./config/env.js";
import { getDatabasePool } from "./lib/database.js";
import {
  AuthRepository,
  InMemoryAuthRepository
} from "./modules/auth/repository.js";
import { PostgresAuthRepository } from "./modules/auth/postgres-repository.js";
import { UserAuthService } from "./modules/auth/service.js";
import { DestinationService } from "./modules/destinations/service.js";
import { BillingService } from "./modules/billing/service.js";
import {
  EventRepository,
  InMemoryEventRepository
} from "./modules/events/repository.js";
import { PostgresEventRepository } from "./modules/events/postgres-repository.js";
import { EventService } from "./modules/events/service.js";
import { IdentityResolver } from "./modules/identity/resolver.js";
import {
  InMemoryPlatformRepository,
  PlatformRepository
} from "./modules/platform/repository.js";
import { PostgresPlatformRepository } from "./modules/platform/postgres-repository.js";
import { PlatformService } from "./modules/platform/service.js";
import { createEmptyPlatformData, createSeedPlatformData } from "./modules/platform/seed.js";
import { ShopifyAuthService } from "./modules/shopify/auth.js";
import { ShopifyWebhookService } from "./modules/shopify/webhooks.js";

export interface AppContainer {
  authRepository: AuthRepository;
  billingService: BillingService;
  destinationService: DestinationService;
  eventRepository: EventRepository;
  eventService: EventService;
  platformRepository: PlatformRepository;
  platformService: PlatformService;
  userAuthService: UserAuthService;
  shopifyAuthService: ShopifyAuthService;
  shopifyWebhookService: ShopifyWebhookService;
}

export function createContainer(): AppContainer {
  const { platformRepository, eventRepository, authRepository } = createRepositories();
  const billingService = new BillingService();
  const destinationService = new DestinationService();
  const identityResolver = new IdentityResolver();
  const userAuthService = new UserAuthService(authRepository);
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
    authRepository,
    billingService,
    destinationService,
    eventRepository,
    eventService,
    platformRepository,
    platformService,
    userAuthService,
    shopifyAuthService,
    shopifyWebhookService
  };
}

function createRepositories(): {
  authRepository: AuthRepository;
  platformRepository: PlatformRepository;
  eventRepository: EventRepository;
} {
  if (env.STORAGE_DRIVER === "postgres") {
    const pool = getDatabasePool();

    return {
      authRepository: new PostgresAuthRepository(pool),
      platformRepository: new PostgresPlatformRepository(pool),
      eventRepository: new PostgresEventRepository(pool)
    };
  }

  return {
    authRepository: new InMemoryAuthRepository(),
    platformRepository: new InMemoryPlatformRepository(
      env.NODE_ENV === "test" ? createSeedPlatformData() : createEmptyPlatformData()
    ),
    eventRepository: new InMemoryEventRepository()
  };
}
