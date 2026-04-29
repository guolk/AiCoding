import {
  AccountId,
  Version,
  OptimisticConcurrencyException,
  EventOutOfOrderException,
} from '../domain/types';
import { AccountDomainEvent } from '../domain/events';

export interface EventStore {
  appendEvents(
    aggregateId: AccountId,
    events: AccountDomainEvent[],
    expectedVersion: Version
  ): Promise<void>;

  readEvents(
    aggregateId: AccountId,
    fromVersion?: Version,
    toVersion?: Version
  ): Promise<AccountDomainEvent[]>;

  getCurrentVersion(aggregateId: AccountId): Promise<Version>;

  aggregateExists(aggregateId: AccountId): Promise<boolean>;
}

export class InMemoryEventStore implements EventStore {
  private streams: Map<AccountId, AccountDomainEvent[]> = new Map();
  private versions: Map<AccountId, Version> = new Map();

  async appendEvents(
    aggregateId: AccountId,
    events: AccountDomainEvent[],
    expectedVersion: Version
  ): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const currentVersion = this.versions.get(aggregateId) ?? 0;

    if (expectedVersion !== currentVersion) {
      throw new OptimisticConcurrencyException(
        aggregateId,
        expectedVersion,
        currentVersion
      );
    }

    const sortedEvents = [...events].sort((a, b) => a.version - b.version);

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const expectedEventVersion = currentVersion + i + 1;

      if (event.version !== expectedEventVersion) {
        throw new EventOutOfOrderException(
          aggregateId,
          event.version,
          expectedEventVersion - 1
        );
      }
    }

    const existingEvents = this.streams.get(aggregateId) ?? [];
    this.streams.set(aggregateId, [...existingEvents, ...sortedEvents]);

    const newVersion = currentVersion + events.length;
    this.versions.set(aggregateId, newVersion);
  }

  async readEvents(
    aggregateId: AccountId,
    fromVersion?: Version,
    toVersion?: Version
  ): Promise<AccountDomainEvent[]> {
    const events = this.streams.get(aggregateId) ?? [];

    let filteredEvents = events;

    if (fromVersion !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.version >= fromVersion);
    }

    if (toVersion !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.version <= toVersion);
    }

    return [...filteredEvents];
  }

  async getCurrentVersion(aggregateId: AccountId): Promise<Version> {
    return this.versions.get(aggregateId) ?? 0;
  }

  async aggregateExists(aggregateId: AccountId): Promise<boolean> {
    return this.streams.has(aggregateId) && (this.streams.get(aggregateId)?.length ?? 0) > 0;
  }

  clear(): void {
    this.streams.clear();
    this.versions.clear();
  }
}
