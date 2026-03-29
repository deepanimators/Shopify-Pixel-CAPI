import type { Pool } from "pg";

import type { AuthRepository } from "./repository.js";
import type { AuthSession, AuthUser, TenantMembership } from "./types.js";

export class PostgresAuthRepository implements AuthRepository {
  constructor(private readonly pool: Pool) {}

  async countUsers(): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `select count(*)::text as count from app_users`
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async createUser(user: AuthUser): Promise<AuthUser> {
    await this.pool.query(
      `insert into app_users (
        user_id,
        email,
        display_name,
        global_role,
        status,
        password_hash,
        created_at,
        updated_at
      ) values ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz)`,
      [
        user.userId,
        user.email,
        user.displayName,
        user.globalRole,
        user.status,
        user.passwordHash,
        user.createdAt,
        user.updatedAt
      ]
    );

    return user;
  }

  async findUserByEmail(email: string): Promise<AuthUser | null> {
    const result = await this.pool.query<{
      user_id: string;
      email: string;
      display_name: string;
      global_role: AuthUser["globalRole"];
      status: AuthUser["status"];
      password_hash: string;
      created_at: Date | string;
      updated_at: Date | string;
    }>(
      `select user_id, email, display_name, global_role, status, password_hash, created_at, updated_at
       from app_users
       where email = $1
       limit 1`,
      [email.toLowerCase()]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapUserRow(result.rows[0]);
  }

  async findUserById(userId: string): Promise<AuthUser | null> {
    const result = await this.pool.query<{
      user_id: string;
      email: string;
      display_name: string;
      global_role: AuthUser["globalRole"];
      status: AuthUser["status"];
      password_hash: string;
      created_at: Date | string;
      updated_at: Date | string;
    }>(
      `select user_id, email, display_name, global_role, status, password_hash, created_at, updated_at
       from app_users
       where user_id = $1
       limit 1`,
      [userId]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapUserRow(result.rows[0]);
  }

  async saveSession(session: AuthSession): Promise<void> {
    await this.pool.query(
      `insert into app_sessions (session_token, user_id, expires_at, created_at)
       values ($1, $2, $3::timestamptz, $4::timestamptz)
       on conflict (session_token) do update set
         user_id = excluded.user_id,
         expires_at = excluded.expires_at,
         created_at = excluded.created_at`,
      [session.sessionToken, session.userId, session.expiresAt, session.createdAt]
    );
  }

  async findSession(sessionToken: string): Promise<AuthSession | null> {
    const result = await this.pool.query<{
      session_token: string;
      user_id: string;
      expires_at: Date | string;
      created_at: Date | string;
    }>(
      `select session_token, user_id, expires_at, created_at
       from app_sessions
       where session_token = $1
       limit 1`,
      [sessionToken]
    );

    if (!result.rowCount) {
      return null;
    }

    const session = result.rows[0];
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      await this.deleteSession(sessionToken);
      return null;
    }

    return {
      sessionToken: session.session_token,
      userId: session.user_id,
      expiresAt: toIso(session.expires_at),
      createdAt: toIso(session.created_at)
    };
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await this.pool.query(`delete from app_sessions where session_token = $1`, [sessionToken]);
  }

  async listMembershipsForUser(userId: string): Promise<TenantMembership[]> {
    const result = await this.pool.query<{
      user_id: string;
      tenant_id: string;
      role: TenantMembership["role"];
      created_at: Date | string;
      updated_at: Date | string;
    }>(
      `select user_id, tenant_id, role, created_at, updated_at
       from tenant_memberships
       where user_id = $1
       order by tenant_id asc`,
      [userId]
    );

    return result.rows.map((row) => ({
      userId: row.user_id,
      tenantId: row.tenant_id,
      role: row.role,
      createdAt: toIso(row.created_at),
      updatedAt: toIso(row.updated_at)
    }));
  }

  async upsertMembership(membership: TenantMembership): Promise<void> {
    await this.pool.query(
      `insert into tenant_memberships (user_id, tenant_id, role, created_at, updated_at)
       values ($1, $2, $3, $4::timestamptz, $5::timestamptz)
       on conflict (user_id, tenant_id) do update set
         role = excluded.role,
         updated_at = excluded.updated_at`,
      [
        membership.userId,
        membership.tenantId,
        membership.role,
        membership.createdAt,
        membership.updatedAt
      ]
    );
  }
}

function mapUserRow(row: {
  user_id: string;
  email: string;
  display_name: string;
  global_role: AuthUser["globalRole"];
  status: AuthUser["status"];
  password_hash: string;
  created_at: Date | string;
  updated_at: Date | string;
}): AuthUser {
  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    globalRole: row.global_role,
    status: row.status,
    passwordHash: row.password_hash,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at)
  };
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
