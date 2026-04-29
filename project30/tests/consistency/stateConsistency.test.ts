import { AccountAggregate, AccountState } from '../../src/domain/account';
import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountCommandHandler } from '../../src/application/commandHandler';
import { EventBuilder, CommandBuilder } from '../builders';
import { AccountDomainEvent } from '../../src/domain/events';
import { Snapshot } from '../../src/domain/types';

describe('State Consistency Tests', () => {
  const accountId = 'acc_001';
  let eventStore: InMemoryEventStore;
  let snapshotStore: InMemorySnapshotStore;
  let snapshotService: SnapshotService;
  let commandHandler: AccountCommandHandler;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
    snapshotStore = new InMemorySnapshotStore();
    snapshotService = new SnapshotService(snapshotStore, 5);
    commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);
  });

  function assertStatesEqual(state1: AccountState, state2: AccountState): void {
    expect(state1.accountId).toBe(state2.accountId);
    expect(state1.ownerName).toBe(state2.ownerName);
    expect(state1.balance).toBe(state2.balance);
    expect(state1.currency).toBe(state2.currency);
    expect(state1.isOverdrawn).toBe(state2.isOverdrawn);
    expect(state1.isClosed).toBe(state2.isClosed);
    expect(state1.transactionCount).toBe(state2.transactionCount);
    expect(state1.version).toBe(state2.version);
  }

  describe('Basic Event Replay Consistency', () => {
    it('should produce same state when replaying events vs creating aggregate directly', async () => {
      const events: AccountDomainEvent[] = [
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

      const aggregateFromEvents = AccountAggregate.fromEvents(accountId, events);

      await eventStore.appendEvents(accountId, events, 0);
      const storedEvents = await eventStore.readEvents(accountId);
      const aggregateFromStore = AccountAggregate.fromEvents(accountId, storedEvents);

      assertStatesEqual(aggregateFromEvents.state, aggregateFromStore.state);
    });

    it('should produce correct initial state when replaying only AccountCreated event', async () => {
      const event = EventBuilder.anEvent(accountId)
        .accountCreated('Jane Smith', 5000, 'USD')
        .withVersion(1)
        .build();

      const aggregate = AccountAggregate.fromEvents(accountId, [event]);

      expect(aggregate.state.accountId).toBe(accountId);
      expect(aggregate.state.ownerName).toBe('Jane Smith');
      expect(aggregate.state.balance).toBe(5000);
      expect(aggregate.state.currency).toBe('USD');
      expect(aggregate.state.isOverdrawn).toBe(false);
      expect(aggregate.state.isClosed).toBe(false);
      expect(aggregate.state.version).toBe(1);
    });
  });

  describe('Snapshot vs Event Replay Consistency', () => {
    it('snapshot state should match state from replaying all events', async () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 0, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 100, 100)
          .withVersion(2)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
          .withVersion(3)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_002', 200, 300)
          .withVersion(4)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'deposit', 200, 100, 300)
          .withVersion(5)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_003', 50, 250)
          .withVersion(6)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_003', 'withdrawal', 50, 300, 250)
          .withVersion(7)
          .build(),
      ];

      const stateFromEvents = AccountAggregate.fromEvents(accountId, events).state;

      const snapshot: Snapshot<AccountState> = {
        aggregateId: accountId,
        aggregateType: 'Account',
        version: stateFromEvents.version,
        state: { ...stateFromEvents },
        timestamp: Date.now(),
      };

      const stateFromSnapshot = AccountAggregate.fromSnapshot(snapshot.state).state;

      assertStatesEqual(stateFromEvents, stateFromSnapshot);
    });

    it('loading from snapshot + remaining events should match loading from all events', async () => {
      const allEvents: AccountDomainEvent[] = [
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
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_003', 800, 2100)
          .withVersion(6)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_003', 'deposit', 800, 1300, 2100)
          .withVersion(7)
          .build(),
      ];

      const stateFromAllEvents = AccountAggregate.fromEvents(accountId, allEvents).state;

      const snapshotVersion = 3;
      const eventsUpToSnapshot = allEvents.filter(e => e.version <= snapshotVersion);
      const eventsAfterSnapshot = allEvents.filter(e => e.version > snapshotVersion);

      const stateAtSnapshot = AccountAggregate.fromEvents(accountId, eventsUpToSnapshot).state;

      const aggregate = AccountAggregate.fromSnapshot(stateAtSnapshot);
      for (const event of eventsAfterSnapshot) {
        aggregate.apply(event);
      }

      assertStatesEqual(stateFromAllEvents, aggregate.state);
    });
  });

  describe('Idempotency Tests', () => {
    it('replaying same events multiple times should produce same state', async () => {
      const events: AccountDomainEvent[] = [
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

      const firstReplay = AccountAggregate.fromEvents(accountId, events);
      const secondReplay = AccountAggregate.fromEvents(accountId, events);
      const thirdReplay = AccountAggregate.fromEvents(accountId, events);

      assertStatesEqual(firstReplay.state, secondReplay.state);
      assertStatesEqual(secondReplay.state, thirdReplay.state);
    });

    it('same events in same order should produce deterministic state', () => {
      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('Test User', 100, 'CNY')
        .withVersion(1)
        .build();

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 50, 150)
        .withVersion(2)
        .build();

      const withdrawalEvent = EventBuilder.anEvent(accountId)
        .moneyWithdrawn('txn_002', 30, 120)
        .withVersion(4)
        .build();

      const events1 = [createEvent, depositEvent, withdrawalEvent];
      const events2 = [createEvent, depositEvent, withdrawalEvent];

      const aggregate1 = AccountAggregate.fromEvents(accountId, events1);
      const aggregate2 = AccountAggregate.fromEvents(accountId, events2);

      assertStatesEqual(aggregate1.state, aggregate2.state);
    });
  });

  describe('Complex Scenario Consistency', () => {
    it('should maintain consistency after overdraft and resolution', async () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 500, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_001', 1000, -500)
          .withVersion(2)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'withdrawal', 1000, 500, -500)
          .withVersion(3)
          .build(),
        EventBuilder.anEvent(accountId)
          .overdraftStarted('txn_001', 500, -500)
          .withVersion(4)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_002', 600, 100)
          .withVersion(5)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'deposit', 600, -500, 100)
          .withVersion(6)
          .build(),
        EventBuilder.anEvent(accountId)
          .overdraftResolved('txn_002')
          .withVersion(7)
          .build(),
      ];

      const aggregateFromEvents = AccountAggregate.fromEvents(accountId, events);

      expect(aggregateFromEvents.state.balance).toBe(100);
      expect(aggregateFromEvents.state.isOverdrawn).toBe(false);
      expect(aggregateFromEvents.state.transactionCount).toBe(2);
      expect(aggregateFromEvents.state.version).toBe(7);

      const snapshot: Snapshot<AccountState> = {
        aggregateId: accountId,
        aggregateType: 'Account',
        version: aggregateFromEvents.state.version,
        state: { ...aggregateFromEvents.state },
        timestamp: Date.now(),
      };

      const aggregateFromSnapshot = AccountAggregate.fromSnapshot(snapshot.state);

      assertStatesEqual(aggregateFromEvents.state, aggregateFromSnapshot.state);
    });

    it('should maintain consistency after account closure', async () => {
      const events: AccountDomainEvent[] = [
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
          .accountClosed('User requested closure')
          .withVersion(4)
          .build(),
      ];

      const aggregateFromEvents = AccountAggregate.fromEvents(accountId, events);

      expect(aggregateFromEvents.state.balance).toBe(1500);
      expect(aggregateFromEvents.state.isClosed).toBe(true);
      expect(aggregateFromEvents.state.version).toBe(4);

      const snapshot: Snapshot<AccountState> = {
        aggregateId: accountId,
        aggregateType: 'Account',
        version: aggregateFromEvents.state.version,
        state: { ...aggregateFromEvents.state },
        timestamp: Date.now(),
      };

      const aggregateFromSnapshot = AccountAggregate.fromSnapshot(snapshot.state);

      assertStatesEqual(aggregateFromEvents.state, aggregateFromSnapshot.state);
    });
  });

  describe('Event Order Sensitivity', () => {
    it('different event order should produce different states', () => {
      const accountId = 'acc_compare';

      const createEvent = EventBuilder.anEvent(accountId)
        .accountCreated('Test User', 0, 'CNY')
        .withVersion(1)
        .build();

      const deposit1 = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 100, 100)
        .withVersion(2)
        .build();

      const withdraw1 = EventBuilder.anEvent(accountId)
        .moneyWithdrawn('txn_002', 50, 50)
        .withVersion(4)
        .build();

      const aggregate1 = AccountAggregate.fromEvents(accountId, [
        createEvent,
        deposit1,
        withdraw1,
      ]);

      const createEvent2 = EventBuilder.anEvent(accountId)
        .accountCreated('Test User', 0, 'CNY')
        .withVersion(1)
        .build();

      const deposit2 = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_002', 100, 50)
        .withVersion(4)
        .build();

      const withdraw2 = EventBuilder.anEvent(accountId)
        .moneyWithdrawn('txn_001', 50, -50)
        .withVersion(2)
        .build();

      const aggregate2 = AccountAggregate.fromEvents(accountId, [
        createEvent2,
        withdraw2,
        deposit2,
      ]);

      expect(aggregate1.state.balance).not.toBe(aggregate2.state.balance);
    });
  });
});
