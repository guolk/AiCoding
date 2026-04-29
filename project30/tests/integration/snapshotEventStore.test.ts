import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountCommandHandler } from '../../src/application/commandHandler';
import { AccountAggregate, AccountState } from '../../src/domain/account';
import { CommandBuilder, EventBuilder } from '../builders';
import { AccountEventType } from '../../src/domain/events';

describe('Snapshot and Event Store Integration Tests', () => {
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

  describe('Snapshot Creation Triggers', () => {
    it('should create snapshot when event count reaches threshold', async () => {
      snapshotService.setSnapshotThreshold(3);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      let snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).toBeNull();

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).toBeNull();

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();
      expect(snapshot?.state.balance).toBe(300);
    });

    it('should not create snapshot before threshold', async () => {
      snapshotService.setSnapshotThreshold(10);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      for (let i = 1; i <= 4; i++) {
        await commandHandler.handle(
          CommandBuilder.aCommand(accountId).depositMoney(`txn_${i}`, 100)
        );
      }

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).toBeNull();
    });
  });

  describe('Loading from Snapshot', () => {
    it('should load aggregate from snapshot when available', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      for (let i = 1; i <= 3; i++) {
        await commandHandler.handle(
          CommandBuilder.aCommand(accountId).depositMoney(`txn_${i}`, 100)
        );
      }

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();
      expect(snapshot?.version).toBeGreaterThan(1);

      const state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_004', 200)
      );

      expect(state.balance).toBe(500);
    });

    it('should apply events after snapshot version', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      for (let i = 1; i <= 3; i++) {
        await commandHandler.handle(
          CommandBuilder.aCommand(accountId).depositMoney(`txn_${i}`, 100)
        );
      }

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_004', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_005', 100)
      );

      const finalState = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_006', 300)
      );

      const allEvents = await eventStore.readEvents(accountId);
      const aggregateFromEvents = AccountAggregate.fromEvents(accountId, allEvents);

      expect(finalState.balance).toBe(aggregateFromEvents.state.balance);
      expect(finalState.version).toBe(aggregateFromEvents.state.version);
    });
  });

  describe('Multiple Snapshots', () => {
    it('should create multiple snapshots at different versions', async () => {
      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      let snapshot1 = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot1).not.toBeNull();
      const version1 = snapshot1!.version;

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_003', 300)
      );

      const snapshot2 = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot2).not.toBeNull();
      expect(snapshot2!.version).toBeGreaterThan(version1);
    });

    it('should retrieve snapshot by specific version', async () => {
      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      const firstSnapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(firstSnapshot).not.toBeNull();

      const firstVersion = firstSnapshot!.version;
      const firstBalance = firstSnapshot!.state.balance;

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_003', 300)
      );

      const snapshotAtFirstVersion = await snapshotStore.getSnapshotAtVersion(
        accountId,
        firstVersion
      );

      expect(snapshotAtFirstVersion).not.toBeNull();
      expect(snapshotAtFirstVersion?.version).toBe(firstVersion);
      expect(snapshotAtFirstVersion?.state.balance).toBe(firstBalance);
    });
  });

  describe('Snapshot and Event Consistency', () => {
    it('snapshot state should match event replay state', async () => {
      snapshotService.setSnapshotThreshold(3);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 100, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_002', 50)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_003', 300)
      );

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();

      const allEvents = await eventStore.readEvents(accountId);
      const stateFromEvents = AccountAggregate.fromEvents(accountId, allEvents).state;

      expect(snapshot!.state.balance).toBe(stateFromEvents.balance);
      expect(snapshot!.state.version).toBe(stateFromEvents.version);
      expect(snapshot!.state.transactionCount).toBe(stateFromEvents.transactionCount);
    });

    it('loading from snapshot + events should equal loading from all events', async () => {
      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_003', 50)
      );

      const allEvents = await eventStore.readEvents(accountId);
      const stateFromAllEvents = AccountAggregate.fromEvents(accountId, allEvents).state;

      const eventsAfterSnapshot = await eventStore.readEvents(
        accountId,
        snapshot!.version + 1
      );

      const aggregateFromSnapshot = AccountAggregate.fromSnapshot(snapshot!.state);
      for (const event of eventsAfterSnapshot) {
        aggregateFromSnapshot.apply(event);
      }

      expect(aggregateFromSnapshot.state.balance).toBe(stateFromAllEvents.balance);
      expect(aggregateFromSnapshot.state.version).toBe(stateFromAllEvents.version);
      expect(aggregateFromSnapshot.state.transactionCount).toBe(
        stateFromAllEvents.transactionCount
      );
    });
  });

  describe('Snapshot Deletion and Cleanup', () => {
    it('should delete all snapshots for an account', async () => {
      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      let snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();

      await snapshotStore.deleteSnapshots(accountId);

      snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).toBeNull();
    });

    it('should clear all snapshots from store', async () => {
      const accountId1 = 'acc_001';
      const accountId2 = 'acc_002';

      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId1).createAccount('Account One', 0, 'CNY')
      );
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId1).depositMoney('txn_001', 100)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId2).createAccount('Account Two', 0, 'USD')
      );
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId2).depositMoney('txn_001', 200)
      );

      expect(await snapshotService.getLatestSnapshot(accountId1)).not.toBeNull();
      expect(await snapshotService.getLatestSnapshot(accountId2)).not.toBeNull();

      snapshotStore.clear();

      expect(await snapshotService.getLatestSnapshot(accountId1)).toBeNull();
      expect(await snapshotService.getLatestSnapshot(accountId2)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle account with no snapshots', async () => {
      snapshotService.setSnapshotThreshold(100);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      for (let i = 1; i <= 5; i++) {
        await commandHandler.handle(
          CommandBuilder.aCommand(accountId).depositMoney(`txn_${i}`, 100)
        );
      }

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).toBeNull();

      const finalState = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_final', 1)
      );

      expect(finalState.balance).toBe(501);
    });

    it('should handle snapshot with no subsequent events', async () => {
      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();

      const allEvents = await eventStore.readEvents(accountId);
      const stateFromEvents = AccountAggregate.fromEvents(accountId, allEvents).state;

      const stateFromSnapshot = AccountAggregate.fromSnapshot(snapshot!.state).state;

      expect(stateFromSnapshot.balance).toBe(stateFromEvents.balance);
      expect(stateFromSnapshot.version).toBe(stateFromEvents.version);
    });

    it('should create snapshot with correct state after overdraft', async () => {
      snapshotService.setSnapshotThreshold(2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 500, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 1000)
      );

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();
      expect(snapshot!.state.balance).toBe(-500);
      expect(snapshot!.state.isOverdrawn).toBe(true);

      const allEvents = await eventStore.readEvents(accountId);
      const stateFromEvents = AccountAggregate.fromEvents(accountId, allEvents).state;

      expect(snapshot!.state.balance).toBe(stateFromEvents.balance);
      expect(snapshot!.state.isOverdrawn).toBe(stateFromEvents.isOverdrawn);
    });

    it('should handle snapshot creation after overdraft resolution', async () => {
      snapshotService.setSnapshotThreshold(3);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 500, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 1000)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 600)
      );

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();
      expect(snapshot!.state.balance).toBe(100);
      expect(snapshot!.state.isOverdrawn).toBe(false);
    });
  });

  describe('Complete Integration Flow', () => {
    it('should handle complete flow with multiple snapshots', async () => {
      snapshotService.setSnapshotThreshold(3);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      const operations = [
        { type: 'deposit', amount: 100 },
        { type: 'deposit', amount: 200 },
        { type: 'withdraw', amount: 50 },
        { type: 'deposit', amount: 300 },
        { type: 'withdraw', amount: 100 },
        { type: 'deposit', amount: 150 },
      ];

      let txnCount = 0;
      for (const op of operations) {
        txnCount++;
        if (op.type === 'deposit') {
          await commandHandler.handle(
            CommandBuilder.aCommand(accountId).depositMoney(`txn_${txnCount}`, op.amount)
          );
        } else {
          await commandHandler.handle(
            CommandBuilder.aCommand(accountId).withdrawMoney(`txn_${txnCount}`, op.amount)
          );
        }
      }

      const finalState = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).closeAccount('End of test')
      );

      const expectedBalance =
        0 + 100 + 200 - 50 + 300 - 100 + 150;

      expect(finalState.balance).toBe(expectedBalance);
      expect(finalState.isClosed).toBe(true);

      const allEvents = await eventStore.readEvents(accountId);
      const stateFromEvents = AccountAggregate.fromEvents(accountId, allEvents).state;

      expect(finalState.balance).toBe(stateFromEvents.balance);
      expect(finalState.version).toBe(stateFromEvents.version);
    });
  });
});
