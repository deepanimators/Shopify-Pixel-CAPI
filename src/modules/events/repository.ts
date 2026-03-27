import type { NormalizedEvent } from "./types.js";

export interface EventRepository {
  findByDedupeKey(dedupeKey: string): Promise<NormalizedEvent | null>;
  save(event: NormalizedEvent): Promise<void>;
  listRecent(limit: number): Promise<NormalizedEvent[]>;
  listAll(): Promise<NormalizedEvent[]>;
  count(): Promise<number>;
  countByTenant(tenantId: string): Promise<number>;
}

export class InMemoryEventRepository implements EventRepository {
  private readonly eventsByDedupeKey = new Map<string, NormalizedEvent>();
  private readonly orderedEvents: NormalizedEvent[] = [];

  async findByDedupeKey(dedupeKey: string): Promise<NormalizedEvent | null> {
    return this.eventsByDedupeKey.get(dedupeKey) ?? null;
  }

  async save(event: NormalizedEvent): Promise<void> {
    this.eventsByDedupeKey.set(event.dedupeKey, event);
    this.orderedEvents.unshift(event);
  }

  async listRecent(limit: number): Promise<NormalizedEvent[]> {
    return this.orderedEvents.slice(0, limit);
  }

  async listAll(): Promise<NormalizedEvent[]> {
    return [...this.orderedEvents];
  }

  async count(): Promise<number> {
    return this.orderedEvents.length;
  }

  async countByTenant(tenantId: string): Promise<number> {
    return this.orderedEvents.filter((event) => event.tenantId === tenantId).length;
  }
}
