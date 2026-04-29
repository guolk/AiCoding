import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { EventBuilder } from '../builders';
import { AccountEventType, AccountDomainEvent } from '../../src/domain/events';
import { EventOutOfOrderException } from '../../src/domain/types';

describe('Event Out of Order Handling Tests', () => {
  const accountId = 'acc_001';
  let eventStore: InMemoryEventStore;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
  });

  describe('Event Store Level - Out of Order Detection', () => {
    it('should reject events with non-consecutive versions in single append', async () => {
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

    it('should reject batch with events not starting from expected version + 1', async () => {
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
          .withVersion(3)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events2, 1)).rejects.toThrow(
        EventOutOfOrderException
      );
    });

    it('should accept events with correct consecutive versions', async () => {
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
      ];

      await expect(eventStore.appendEvents(accountId, events, 0)).resolves.not.toThrow();

      const storedEvents = await eventStore.readEvents(accountId);
      expect(storedEvents).toHaveLength(3);
    });

    it('should throw exception with correct version information', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(4)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events, 0)).rejects.toThrow(
        expect.objectContaining({
          name: 'EventOutOfOrderException',
          aggregateId: accountId,
          eventVersion: 4,
          currentVersion: 1,
        })
      );
    });
  });

  describe('Aggregate Level - Out of Order Detection', () => {
    it('should throw error when applying events out of order to aggregate', () => {
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

      const { AccountAggregate } = require('../../src/domain/account');

      expect(() => {
        AccountAggregate.fromEvents(accountId, events);
      }).toThrow('Event out of order');
    });

    it('should apply events in correct order without errors', () => {
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
      ];

      const { AccountAggregate } = require('../../src/domain/account');

      expect(() => {
        AccountAggregate.fromEvents(accountId, events);
      }).not.toThrow();
    });
  });

  describe('Simulation of Network Delay and Out-of-Order Events', () => {
    it('should handle scenario where events arrive in wrong order', async () => {
      const correctEvents: AccountDomainEvent[] = [
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
      ];

      const outOfOrderEvents = [correctEvents[0], correctEvents[2], correctEvents[1]];

      await expect(eventStore.appendEvents(accountId, outOfOrderEvents, 0)).rejects.toThrow(
        EventOutOfOrderException
      );

      const version = await eventStore.getCurrentVersion(accountId);
      expect(version).toBe(0);
    });

    it('should not persist any events when batch contains out-of-order events', async () => {
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

      await expect(eventStore.appendEvents(accountId, events, 0)).rejects.toThrow();

      const storedEvents = await eventStore.readEvents(accountId);
      expect(storedEvents).toHaveLength(0);

      const exists = await eventStore.aggregateExists(accountId);
      expect(exists).toBe(false);
    });
  });

  describe('Boundary Cases', () => {
    it('should handle version 1 correctly for new aggregate', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events, 0)).resolves.not.toThrow();

      const version = await eventStore.getCurrentVersion(accountId);
      expect(version).toBe(1);
    });

    it('should reject version 0 for first event', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(0)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events, 0)).rejects.toThrow(
        EventOutOfOrderException
      );
    });

    it('should reject version starting at 2 for new aggregate', async () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(2)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events, 0)).rejects.toThrow(
        EventOutOfOrderException
      );
    });

    it('should accept events starting exactly at expectedVersion + 1', async () => {
      const events1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, events1, 0);

      const currentVersion = await eventStore.getCurrentVersion(accountId);
      expect(currentVersion).toBe(1);

      const events2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(currentVersion + 1)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events2, currentVersion)).resolves.not.toThrow();

      const newVersion = await eventStore.getCurrentVersion(accountId);
      expect(newVersion).toBe(2);
    });
  });

  describe('Multiple Batch Out of Order', () => {
    it('should reject second batch with wrong starting version', async () => {
      const batch1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];
      await eventStore.appendEvents(accountId, batch1, 0);

      const batch2 = [
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_002', 200, 1300)
          .withVersion(4)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, batch2, 2)).rejects.toThrow(
        EventOutOfOrderException
      );
    });

    it('should accept consecutive batches', async () => {
      const batch1 = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];
      await eventStore.appendEvents(accountId, batch1, 0);

      const batch2 = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build(),
      ];
      await eventStore.appendEvents(accountId, batch2, 1);

      const batch3 = [
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_002', 200, 1300)
          .withVersion(4)
          .build(),
      ];
      await eventStore.appendEvents(accountId, batch3, 3);

      const allEvents = await eventStore.readEvents(accountId);
      expect(allEvents).toHaveLength(4);
      expect(allEvents.map(e => e.version)).toEqual([1, 2, 3, 4]);
    });
  });
});
