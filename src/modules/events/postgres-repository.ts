import type { Pool, PoolClient } from "pg";

import type { NormalizedEvent } from "./types.js";
import type { EventRepository } from "./repository.js";

export class PostgresEventRepository implements EventRepository {
  constructor(private readonly pool: Pool) {}

  async findByDedupeKey(dedupeKey: string): Promise<NormalizedEvent | null> {
    const result = await this.pool.query<{ payload: unknown }>(
      `select payload from normalized_events where dedupe_key = $1 limit 1`,
      [dedupeKey]
    );

    if (!result.rowCount) {
      return null;
    }

    return parseEventPayload(result.rows[0].payload);
  }

  async save(event: NormalizedEvent): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("begin");
      await upsertIdentityProfile(client, event);
      await client.query(
        `insert into normalized_events (
          event_id,
          tenant_id,
          shop_domain,
          event_name,
          event_source,
          occurred_at,
          dedupe_key,
          identity_key,
          market_country_code,
          market_currency_code,
          market_id,
          market_domain,
          payload,
          delivered_to_meta,
          delivery_statuses,
          scenario_id,
          scenario_enabled
        ) values (
          $1, $2, $3, $4, $5, $6::timestamptz, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15::jsonb, $16, $17
        )
        on conflict (dedupe_key) do nothing`,
        [
          event.eventId,
          event.tenantId,
          event.shopDomain,
          event.eventName,
          event.source,
          event.occurredAt,
          event.dedupeKey,
          event.identity.identityKey,
          event.market.countryCode,
          event.market.currencyCode,
          event.market.marketId ?? null,
          event.market.domain ?? null,
          JSON.stringify(event),
          event.deliveredToMeta,
          JSON.stringify(event.deliveries ?? {}),
          event.scenarioId ?? null,
          event.scenarioEnabled
        ]
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }

  async listRecent(limit: number): Promise<NormalizedEvent[]> {
    const result = await this.pool.query<{ payload: unknown }>(
      `select payload from normalized_events
       order by occurred_at desc
       limit $1`,
      [limit]
    );

    return result.rows.map((row) => parseEventPayload(row.payload));
  }

  async listAll(): Promise<NormalizedEvent[]> {
    const result = await this.pool.query<{ payload: unknown }>(
      `select payload from normalized_events order by occurred_at desc`
    );

    return result.rows.map((row) => parseEventPayload(row.payload));
  }

  async count(): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `select count(*)::text as count from normalized_events`
    );

    return Number(result.rows[0]?.count ?? 0);
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      `select count(*)::text as count from normalized_events where tenant_id = $1`,
      [tenantId]
    );

    return Number(result.rows[0]?.count ?? 0);
  }
}

function parseEventPayload(payload: unknown): NormalizedEvent {
  if (typeof payload === "string") {
    return JSON.parse(payload) as NormalizedEvent;
  }

  return payload as NormalizedEvent;
}

async function upsertIdentityProfile(client: PoolClient, event: NormalizedEvent) {
  await client.query(
    `insert into identity_profiles (
      identity_key,
      tenant_id,
      anonymous_id,
      customer_id,
      email,
      phone,
      external_id,
      first_seen_at,
      last_seen_at
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8::timestamptz, $9::timestamptz
    )
    on conflict (identity_key) do update set
      anonymous_id = coalesce(excluded.anonymous_id, identity_profiles.anonymous_id),
      customer_id = coalesce(excluded.customer_id, identity_profiles.customer_id),
      email = coalesce(excluded.email, identity_profiles.email),
      phone = coalesce(excluded.phone, identity_profiles.phone),
      external_id = coalesce(excluded.external_id, identity_profiles.external_id),
      last_seen_at = greatest(identity_profiles.last_seen_at, excluded.last_seen_at)`,
    [
      event.identity.identityKey,
      event.tenantId,
      event.user.anonymousId ?? null,
      event.user.customerId ?? null,
      event.user.email ?? null,
      event.user.phone ?? null,
      event.user.externalId ?? null,
      event.occurredAt,
      event.occurredAt
    ]
  );
}
