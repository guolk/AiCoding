import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountCommandHandler } from '../../src/application/commandHandler';
import { CommandBuilder, EventBuilder } from '../builders';
import { OptimisticConcurrencyException } from '../../src/domain/types';
import { AccountDomainEvent } from '../../src/domain/events';

describe('Optimistic Concurrency Control Tests', () => {
  const accountId = 'acc_001';
  let eventStore: InMemoryEventStore;
  let snapshotStore: InMemorySnapshotStore;
  let snapshotService: SnapshotService;
  let commandHandler: AccountCommandHandler;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
    snapshotStore = new InMemorySnapshotStore();
    snapshotService = new SnapshotService(snapshotStore, 100);
    commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);
  });

  describe('EventStore Level - Version Conflict Detection', () => {
    it('should throw OptimisticConcurrencyException when versions mismatch', async () => {
      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await eventStore.appendEvents(accountId, [createEvent], 0);

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      await expect(eventStore.appendEvents(accountId, [depositEvent], 0)).rejects.toThrow(
        OptimisticConcurrencyException
      );
    });

    it('should include correct version information in exception', async () => {
      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await eventStore.appendEvents(accountId, [createEvent], 0);

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      try {
        await eventStore.appendEvents(accountId, [depositEvent], 0);
        fail('Should have thrown OptimisticConcurrencyException');
      } catch (error) {
        expect(error).toBeInstanceOf(OptimisticConcurrencyException);
        const concurrencyError = error as OptimisticConcurrencyException;
        expect(concurrencyError.aggregateId).toBe(accountId);
        expect(concurrencyError.expectedVersion).toBe(0);
        expect(concurrencyError.actualVersion).toBe(1);
        expect(concurrencyError.name).toBe('OptimisticConcurrencyException');
        expect(concurrencyError.message).toContain(accountId);
      }
    });

    it('should succeed when expected version matches', async () => {
      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await eventStore.appendEvents(accountId, [createEvent], 0);

      const currentVersion = await eventStore.getCurrentVersion(accountId);
      expect(currentVersion).toBe(1);

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      await expect(eventStore.appendEvents(accountId, [depositEvent], 1)).resolves.not.toThrow();

      const newVersion = await eventStore.getCurrentVersion(accountId);
      expect(newVersion).toBe(2);
    });
  });

  describe('Command Handler Level - Retry Logic', () => {
    beforeEach(async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );
    });

    it('should throw exception when expectedVersion is specified and conflict occurs', async () => {
      const currentVersion = await eventStore.getCurrentVersion(accountId);

      const competingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_competing', 100, 1100)
        .withVersion(currentVersion + 1)
        .build();
      await eventStore.appendEvents(accountId, [competingEvent], currentVersion);

      const commandWithExpectedVersion = CommandBuilder.aCommand(accountId)
        .withExpectedVersion(currentVersion)
        .depositMoney('txn_001', 500);

      await expect(commandHandler.handle(commandWithExpectedVersion)).rejects.toThrow(
        OptimisticConcurrencyException
      );
    });

    it('should succeed without expectedVersion when there is no conflict', async () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500);

      await expect(commandHandler.handle(command)).resolves.not.toThrow();

      const version = await eventStore.getCurrentVersion(accountId);
      expect(version).toBeGreaterThan(1);
    });

    it('should succeed when expectedVersion matches', async () => {
      const currentVersion = await eventStore.getCurrentVersion(accountId);

      const command = CommandBuilder.aCommand(accountId)
        .withExpectedVersion(currentVersion)
        .depositMoney('txn_001', 500);

      await expect(commandHandler.handle(command)).resolves.not.toThrow();
    });
  });

  describe('Simulated Concurrent Writes', () => {
    beforeEach(async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );
    });

    it('should handle concurrent writes correctly with one succeeding', async () => {
      const initialVersion = await eventStore.getCurrentVersion(accountId);

      const events1: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 100, 100)
          .withVersion(initialVersion + 1)
          .build(),
      ];

      const events2: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_002', 200, 200)
          .withVersion(initialVersion + 1)
          .build(),
      ];

      await eventStore.appendEvents(accountId, events1, initialVersion);

      await expect(eventStore.appendEvents(accountId, events2, initialVersion)).rejects.toThrow(
        OptimisticConcurrencyException
      );

      const finalEvents = await eventStore.readEvents(accountId);
      const hasTxn001 = finalEvents.some(
        e => 'transactionId' in e.payload && (e.payload as { transactionId: string }).transactionId === 'txn_001'
      );
      const hasTxn002 = finalEvents.some(
        e => 'transactionId' in e.payload && (e.payload as { transactionId: string }).transactionId === 'txn_002'
      );

      expect(hasTxn001).toBe(true);
      expect(hasTxn002).toBe(false);
    });

    it('should allow sequential writes after detecting conflict', async () => {
      const initialVersion = await eventStore.getCurrentVersion(accountId);

      const events1: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 100, 100)
          .withVersion(initialVersion + 1)
          .build(),
      ];

      await eventStore.appendEvents(accountId, events1, initialVersion);

      const newVersion = await eventStore.getCurrentVersion(accountId);
      expect(newVersion).toBe(initialVersion + 1);

      const events2: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_002', 200, 300)
          .withVersion(newVersion + 1)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, events2, newVersion)).resolves.not.toThrow();

      const finalVersion = await eventStore.getCurrentVersion(accountId);
      expect(finalVersion).toBe(newVersion + 1);
    });
  });

  describe('Race Condition Scenarios', () => {
    beforeEach(async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );
    });

    it('should detect version conflict in read-modify-write pattern', async () => {
      const readVersion = await eventStore.getCurrentVersion(accountId);

      const competingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_competing', 100, 1100)
        .withVersion(readVersion + 1)
        .build();
      await eventStore.appendEvents(accountId, [competingEvent], readVersion);

      const writeEvents: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_my_withdrawal', 200, 800)
          .withVersion(readVersion + 1)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, writeEvents, readVersion)).rejects.toThrow(
        OptimisticConcurrencyException
      );
    });

    it('should allow retry after re-reading current state', async () => {
      const readVersion1 = await eventStore.getCurrentVersion(accountId);

      const competingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_competing', 100, 1100)
        .withVersion(readVersion1 + 1)
        .build();
      await eventStore.appendEvents(accountId, [competingEvent], readVersion1);

      const readVersion2 = await eventStore.getCurrentVersion(accountId);
      expect(readVersion2).toBeGreaterThan(readVersion1);

      const retryEvents: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_my_withdrawal', 200, 900)
          .withVersion(readVersion2 + 1)
          .build(),
      ];

      await expect(eventStore.appendEvents(accountId, retryEvents, readVersion2)).resolves.not.toThrow();
    });
  });

  describe('Multiple Aggregates Concurrency', () => {
    it('should handle different aggregates independently', async () => {
      const accountId1 = 'acc_001';
      const accountId2 = 'acc_002';

      const handler1 = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);
      const handler2 = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await handler1.handle(
        CommandBuilder.aCommand(accountId1).createAccount('Account One', 1000, 'CNY')
      );

      await handler2.handle(
        CommandBuilder.aCommand(accountId2).createAccount('Account Two', 2000, 'USD')
      );

      const version1 = await eventStore.getCurrentVersion(accountId1);
      const version2 = await eventStore.getCurrentVersion(accountId2);

      expect(version1).toBeGreaterThan(0);
      expect(version2).toBeGreaterThan(0);

      await handler1.handle(
        CommandBuilder.aCommand(accountId1).depositMoney('txn_001_acc1', 500)
      );

      await handler2.handle(
        CommandBuilder.aCommand(accountId2).depositMoney('txn_001_acc2', 300)
      );

      const newVersion1 = await eventStore.getCurrentVersion(accountId1);
      const newVersion2 = await eventStore.getCurrentVersion(accountId2);

      expect(newVersion1).toBeGreaterThan(version1);
      expect(newVersion2).toBeGreaterThan(version2);
    });
  });

  describe('Exception Properties Validation', () => {
    it('should have correct exception hierarchy', async () => {
      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await eventStore.appendEvents(accountId, [createEvent], 0);

      const conflictingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      try {
        await eventStore.appendEvents(accountId, [conflictingEvent], 0);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(OptimisticConcurrencyException);
        expect((error as OptimisticConcurrencyException).name).toBe('OptimisticConcurrencyException');
      }
    });

    it('should have all required properties in exception', async () => {
      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await eventStore.appendEvents(accountId, [createEvent], 0);

      const conflictingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      try {
        await eventStore.appendEvents(accountId, [conflictingEvent], 0);
        fail('Should have thrown');
      } catch (error) {
        const exc = error as OptimisticConcurrencyException;

        expect(exc.aggregateId).toBeDefined();
        expect(exc.expectedVersion).toBeDefined();
        expect(exc.actualVersion).toBeDefined();
        expect(exc.message).toBeDefined();
        expect(exc.name).toBeDefined();

        expect(typeof exc.aggregateId).toBe('string');
        expect(typeof exc.expectedVersion).toBe('number');
        expect(typeof exc.actualVersion).toBe('number');
        expect(typeof exc.message).toBe('string');
      }
    });
  });
});
