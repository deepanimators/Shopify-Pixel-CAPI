import { describe, expect, it } from "vitest";

import { InMemoryAuthRepository } from "../src/modules/auth/repository.js";
import { UserAuthService } from "../src/modules/auth/service.js";

describe("user auth service", () => {
  it("makes the first registered user a platform admin", async () => {
    const service = new UserAuthService(new InMemoryAuthRepository());

    const result = await service.register({
      displayName: "Deepak",
      email: "deepak@example.com",
      password: "supersecret1"
    });

    expect(result.context.user.globalRole).toBe("platform_admin");
    expect(result.session.sessionToken).toBeTruthy();
  });

  it("authenticates a returning user and can assign tenant ownership", async () => {
    const repository = new InMemoryAuthRepository();
    const service = new UserAuthService(repository);

    const registration = await service.register({
      displayName: "Owner",
      email: "owner@example.com",
      password: "supersecret1"
    });

    await service.assignTenantRole(registration.context.user.userId, "tenant-one", "tenant_owner");
    const login = await service.login("owner@example.com", "supersecret1");
    const context = await service.getAuthContext(login.session.sessionToken);

    expect(context?.accessibleTenantIds).toEqual(["tenant-one"]);
    expect(service.canEditTenant(context!, "tenant-one")).toBe(true);
  });
});
