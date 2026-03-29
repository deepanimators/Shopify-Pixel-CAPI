import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { createAuthUser, type AuthRepository } from "./repository.js";
import type { AuthContext, AuthSession, AuthUser, TenantMembership, TenantRole } from "./types.js";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE_NAME = "adtrace_session";

export class UserAuthService {
  constructor(private readonly repository: AuthRepository) {}

  async register(input: {
    email: string;
    displayName: string;
    password: string;
  }) {
    const existing = await this.repository.findUserByEmail(input.email);
    if (existing) {
      throw new Error("An account with that email already exists");
    }

    const isFirstUser = (await this.repository.countUsers()) === 0;
    const passwordHash = await hashPassword(input.password);
    const user = createAuthUser({
      email: input.email,
      displayName: input.displayName,
      globalRole: isFirstUser ? "platform_admin" : "member",
      passwordHash
    });

    await this.repository.createUser(user);

    return this.createSessionForUser(user);
  }

  async login(email: string, password: string) {
    const user = await this.repository.findUserByEmail(email);
    if (!user || user.status !== "active") {
      throw new Error("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    return this.createSessionForUser(user);
  }

  async getAuthContext(sessionToken?: string | null): Promise<AuthContext | null> {
    if (!sessionToken) {
      return null;
    }

    const session = await this.repository.findSession(sessionToken);
    if (!session) {
      return null;
    }

    const user = await this.repository.findUserById(session.userId);
    if (!user || user.status !== "active") {
      return null;
    }

    const memberships = await this.repository.listMembershipsForUser(user.userId);

    return {
      user: sanitizeUser(user),
      memberships,
      accessibleTenantIds: memberships.map((membership) => membership.tenantId),
      canManageAllTenants: user.globalRole === "platform_admin"
    };
  }

  async logout(sessionToken?: string | null) {
    if (!sessionToken) {
      return;
    }

    await this.repository.deleteSession(sessionToken);
  }

  async assignTenantRole(userId: string, tenantId: string, role: TenantRole) {
    const now = new Date().toISOString();
    const membership: TenantMembership = {
      userId,
      tenantId,
      role,
      createdAt: now,
      updatedAt: now
    };

    await this.repository.upsertMembership(membership);
  }

  canViewTenant(context: AuthContext, tenantId: string) {
    return context.canManageAllTenants || context.accessibleTenantIds.includes(tenantId);
  }

  canEditTenant(context: AuthContext, tenantId: string) {
    if (context.canManageAllTenants) {
      return true;
    }

    const membership = context.memberships.find((entry) => entry.tenantId === tenantId);
    return membership?.role === "tenant_owner" || membership?.role === "tenant_admin";
  }

  private async createSessionForUser(user: AuthUser) {
    const now = new Date();
    const session: AuthSession = {
      sessionToken: randomBytes(32).toString("hex"),
      userId: user.userId,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdAt: now.toISOString()
    };

    await this.repository.saveSession(session);

    return {
      session,
      context: {
        user: sanitizeUser(user),
        memberships: await this.repository.listMembershipsForUser(user.userId),
        accessibleTenantIds: [],
        canManageAllTenants: user.globalRole === "platform_admin"
      }
    };
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    derivedKey.length === expectedBuffer.length &&
    timingSafeEqual(derivedKey, expectedBuffer)
  );
}

function sanitizeUser(user: AuthUser): Omit<AuthUser, "passwordHash"> {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    globalRole: user.globalRole,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
