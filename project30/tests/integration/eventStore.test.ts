import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { EventBuilder, createAccountCreatedEvent, createMoneyDepositedEvent } from '../builders';
import { AccountEventType } from '../../src/domain/events';
import { OptimisticConcurrencyException, EventOutOfOrderException } from '../../src/domain/types';

describe('EventStore Integration Tests', () => {
  const accountId = 'acc_001';
  let eventStore: InMemoryEventStore;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
  });

  describe('Append Events', () => {
    it('should append events to new stream', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];

      await eventStore.appendEvents(accountId, events, 0);

      const storedEvents = await eventStore.readEvents(accountId);
      expect(storedEvents).toHaveLength(1);
      expect(storedEvents[0].eventType).toBe(AccountEventType.ACCOUNT_CREATED);
    });

    it('should append multiple events in sequence', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events2, 1);

      const storedEvents = await eventStore.readEvents(accountId);
      expect(storedEvents).toHaveLength(3);
      expect(storedEvents.map(e => e.version)).toEqual([1, 2, 3]);
    });

    it('should throw OptimisticConcurrencyException when expected version mismatch', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events2, 0)).rejects.toThrow(
        OptimisticConcurrencyException
      );
    });

    it('should successfully append when expected version matches', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events2, 1)).resolves.not.toThrow();
    });

    it('should throw EventOutOfOrderException when event versions are not consecutive', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(3)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events, 0)).rejects.toThrow(
        EventOutOfOrderException
      );
    });

    it('should handle empty events array', async () => {
      await expect(eventStore.appendEvents(accountId, [], 0)).resolves.not.toThrow();

      const exists = await eventStore.aggregateExists(accountId);
      expect(exists).toBe(false);
    });
  });

  describe('Read Events', () => {
    beforeEach(async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_002', 200, 1300)
          .withVersion(4)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'withdrawal', 200, 1500, 1300)
          .withVersion(5)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events, 0);
    });

    it('should read all events when no version range specified', async () => {
      const events = await eventStore.readEvents(accountId);

      expect(events).toHaveLength(5);
      expect(events.map(e => e.version)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should read events from specific version', async () => {
      const events = await eventStore.readEvents(accountId, 3);

      expect(events).toHaveLength(3);
      expect(events.map(e => e.version)).toEqual([3, 4, 5]);
    });

    it('should read events up to specific version', async () => {
      const events = await eventStore.readEvents(accountId, undefined, 3);

      expect(events).toHaveLength(3);
      expect(events.map(e => e.version)).toEqual([1, 2, 3]);
    });

    it('should read events within version range', async () => {
      const events = await eventStore.readEvents(accountId, 2, 4);

      expect(events).toHaveLength(3);
      expect(events.map(e => e.version)).toEqual([2, 3, 4]);
    });

    it('should return empty array for non-existent aggregate', async () => {
      const events = await eventStore.readEvents('non_existent_acc');

      expect(events).toHaveLength(0);
    });

    it('should return events in correct order', async () => {
      const events = await eventStore.readEvents(accountId);

      for (let i = 1; i < events.length; i++) {
        expect(events[i].version).toBeGreaterThan(events[i - 1].version);
      }
    });
  });

  describe('Current Version', () => {
    it('should return 0 for non-existent aggregate', async () => {
      const version = await eventStore.getCurrentVersion('non_existent_acc');

      expect(version).toBe(0);
    });

    it('should return correct version after appending events', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const version1 = await eventStore.getCurrentVersion(accountId);
      expect(version1).toBe(1);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events2, 1);

      const version2 = await eventStore.getCurrentVersion(accountId);
      expect(version2).toBe(3);
    });
  });

  describe('Aggregate Exists', () => {
    it('should return false for non-existent aggregate', async () => {
      const exists = await eventStore.aggregateExists('non_existent_acc');

      expect(exists).toBe(false);
    });

    it('should return true for existing aggregate', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events, 0);

      const exists = await eventStore.aggregateExists(accountId);
      expect(exists).toBe(true);
    });
  });

  describe('Clear', () => {
    it('should clear all data', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events, 0);

      eventStore.clear();

      const exists = await eventStore.aggregateExists(accountId);
      const storedEvents = await eventStore.readEvents(accountId);
      const version = await eventStore.getCurrentVersion(accountId);

      expect(exists).toBe(false);
      expect(storedEvents).toHaveLength(0);
      expect(version).toBe(0);
    });
  });

  describe('Multiple Aggregates', () => {
    it('should handle multiple aggregates independently', async () => {
      const accountId1 = 'acc_001';
      const accountId2 = 'acc_002';

      const events1 = [
        EventBuilder.anEvent(accountId1)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId1, events1, 0);

      const events2 = [
        EventBuilder.anEvent(accountId2)
          .accountCreated('Jane Smith', 500, 'USD')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId2)
          .moneyDeposited('txn_001', 300, 800)
          .withVersion(2)
          .build(),
      ];
      await eventStore.appendEvents(accountId2, events2, 0);

      const eventsStored1 = await eventStore.readEvents(accountId1);
      const eventsStored2 = await eventStore.readEvents(accountId2);

      expect(eventsStored1).toHaveLength(1);
      expect(eventsStored2).toHaveLength(2);

      const version1 = await eventStore.getCurrentVersion(accountId1);
      const version2 = await eventStore.getCurrentVersion(accountId2);

      expect(version1).toBe(1);
      expect(version2).toBe(2);
    });
  });

  describe('Concurrency Control Integration', () => {
    it('should prevent concurrent writes with same expected version', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];

      const events3 = [
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_002', 200, 800)
          .withVersion(2)
          .build(),
      ];

      await eventStore.appendEvents(accountId, events2, 1);

      await expect(eventStore.appendEvents(accountId, events3, 1)).rejects.toThrow(
        OptimisticConcurrencyException
      );
    });

    it('should allow sequential writes with correct expected versions', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events2, 1);

      const events3 = [
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_002', 200, 1300)
          .withVersion(3)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events3, 2);

      const allEvents = await eventStore.readEvents(accountId);
      expect(allEvents).toHaveLength(3);
    });
  });
});
