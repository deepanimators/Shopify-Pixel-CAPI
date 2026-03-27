import type { NormalizedEvent } from "./types.js";

export interface EventRepository {
  findByDedupeKey(dedupeKey: string): Promise<NormalizedEvent | null>;
  save(event: NormalizedEvent): Promise<void>;
}

export class InMemoryEventRepository implements EventRepository {
  private readonly eventsByDedupeKey = new Map<string, NormalizedEvent>();

  async findByDedupeKey(dedupeKey: string): Promise<NormalizedEvent | null> {
    return this.eventsByDedupeKey.get(dedupeKey) ?? null;
  }

  async save(event: NormalizedEvent): Promise<void> {
    this.eventsByDedupeKey.set(event.dedupeKey, event);
  }
}
