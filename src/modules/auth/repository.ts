import { randomUUID } from "node:crypto";

import type { AuthSession, AuthUser, TenantMembership } from "./types.js";

export interface AuthRepository {
  countUsers(): Promise<number>;
  createUser(user: AuthUser): Promise<AuthUser>;
  findUserByEmail(email: string): Promise<AuthUser | null>;
  findUserById(userId: string): Promise<AuthUser | null>;
  saveSession(session: AuthSession): Promise<void>;
  findSession(sessionToken: string): Promise<AuthSession | null>;
  deleteSession(sessionToken: string): Promise<void>;
  listMembershipsForUser(userId: string): Promise<TenantMembership[]>;
  upsertMembership(membership: TenantMembership): Promise<void>;
}

export class InMemoryAuthRepository implements AuthRepository {
  private readonly users = new Map<string, AuthUser>();
  private readonly usersByEmail = new Map<string, string>();
  private readonly sessions = new Map<string, AuthSession>();
  private readonly memberships = new Map<string, TenantMembership>();

  async countUsers(): Promise<number> {
    return this.users.size;
  }

  async createUser(user: AuthUser): Promise<AuthUser> {
    this.users.set(user.userId, user);
    this.usersByEmail.set(user.email, user.userId);
    return user;
  }

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const userId = this.usersByEmail.get(email.toLowerCase());
    return userId ? this.users.get(userId) ?? null : null;
  }

  async findUserById(userId: string): Promise<AuthUser | null> {
    return this.users.get(userId) ?? null;
  }

  async saveSession(session: AuthSession): Promise<void> {
    this.sessions.set(session.sessionToken, session);
  }

  async findSession(sessionToken: string): Promise<AuthSession | null> {
    const session = this.sessions.get(sessionToken);
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.sessions.delete(sessionToken);
      return null;
    }

    return session;
  }

  async deleteSession(sessionToken: string): Promise<void> {
    this.sessions.delete(sessionToken);
  }

  async listMembershipsForUser(userId: string): Promise<TenantMembership[]> {
    return [...this.memberships.values()].filter((membership) => membership.userId === userId);
  }

  async upsertMembership(membership: TenantMembership): Promise<void> {
    this.memberships.set(createMembershipKey(membership.userId, membership.tenantId), membership);
  }
}

export function createAuthUser(input: {
  email: string;
  displayName: string;
  globalRole: AuthUser["globalRole"];
  passwordHash: string;
}): AuthUser {
  const now = new Date().toISOString();

  return {
    userId: randomUUID(),
    email: input.email.toLowerCase(),
    displayName: input.displayName,
    globalRole: input.globalRole,
    status: "active",
    passwordHash: input.passwordHash,
    createdAt: now,
    updatedAt: now
  };
}

function createMembershipKey(userId: string, tenantId: string) {
  return `${userId}:${tenantId}`;
}
