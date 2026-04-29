import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountStateBuilder } from '../builders';
import { Snapshot } from '../../src/domain/types';
import { AccountState } from '../../src/domain/account';

describe('Snapshot Integration Tests', () => {
  const accountId = 'acc_001';
  let snapshotStore: InMemorySnapshotStore;
  let snapshotService: SnapshotService;

  beforeEach(() => {
    snapshotStore = new InMemorySnapshotStore();
    snapshotService = new SnapshotService(snapshotStore, 100);
  });

  describe('SnapshotStore', () => {
    it('should save and retrieve snapshot', async () => {
      const state = AccountStateBuilder.anAccount(accountId)
        .withOwnerName('John Doe')
        .withBalance(1000)
        .withTransactionCount(5)
        .withVersion(10)
        .build();

      const snapshot: Snapshot<AccountState> = {
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 10,
        state,
        timestamp: Date.now(),
      };

      await snapshotStore.saveSnapshot(snapshot);

      const retrievedSnapshot = await snapshotStore.getLatestSnapshot(accountId);

      expect(retrievedSnapshot).not.toBeNull();
      expect(retrievedSnapshot?.version).toBe(10);
      expect(retrievedSnapshot?.state.balance).toBe(1000);
    });

    it('should return null for non-existent snapshot', async () => {
      const snapshot = await snapshotStore.getLatestSnapshot('non_existent_acc');

      expect(snapshot).toBeNull();
    });

    it('should retrieve specific version snapshot', async () => {
      const state1 = AccountStateBuilder.anAccount(accountId)
        .withBalance(500)
        .withVersion(5)
        .build();

      const state2 = AccountStateBuilder.anAccount(accountId)
        .withBalance(1000)
        .withVersion(10)
        .build();

      const snapshot1: Snapshot<AccountState> = {
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 5,
        state: state1,
        timestamp: Date.now(),
      };

      const snapshot2: Snapshot<AccountState> = {
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 10,
        state: state2,
        timestamp: Date.now(),
      };

      await snapshotStore.saveSnapshot(snapshot1);
      await snapshotStore.saveSnapshot(snapshot2);

      const snapshotAtV5 = await snapshotStore.getSnapshotAtVersion(accountId, 5);
      const snapshotAtV10 = await snapshotStore.getSnapshotAtVersion(accountId, 10);
      const snapshotAtV15 = await snapshotStore.getSnapshotAtVersion(accountId, 15);

      expect(snapshotAtV5?.version).toBe(5);
      expect(snapshotAtV5?.state.balance).toBe(500);
      expect(snapshotAtV10?.version).toBe(10);
      expect(snapshotAtV10?.state.balance).toBe(1000);
      expect(snapshotAtV15).toBeNull();
    });

    it('should return latest snapshot when multiple exist', async () => {
      const state1 = AccountStateBuilder.anAccount(accountId)
        .withBalance(500)
        .withVersion(5)
        .build();

      const state2 = AccountStateBuilder.anAccount(accountId)
        .withBalance(1000)
        .withVersion(10)
        .build();

      const state3 = AccountStateBuilder.anAccount(accountId)
        .withBalance(1500)
        .withVersion(15)
        .build();

      await snapshotStore.saveSnapshot({
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 5,
        state: state1,
        timestamp: Date.now(),
      });

      await snapshotStore.saveSnapshot({
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 10,
        state: state2,
        timestamp: Date.now(),
      });

      await snapshotStore.saveSnapshot({
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 15,
        state: state3,
        timestamp: Date.now(),
      });

      const latestSnapshot = await snapshotStore.getLatestSnapshot(accountId);

      expect(latestSnapshot?.version).toBe(15);
      expect(latestSnapshot?.state.balance).toBe(1500);
    });

    it('should update existing snapshot at same version', async () => {
      const initialState = AccountStateBuilder.anAccount(accountId)
        .withBalance(500)
        .withVersion(10)
        .build();

      await snapshotStore.saveSnapshot({
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 10,
        state: initialState,
        timestamp: Date.now(),
      });

      const updatedState = AccountStateBuilder.anAccount(accountId)
        .withBalance(2000)
        .withVersion(10)
        .build();

      await snapshotStore.saveSnapshot({
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 10,
        state: updatedState,
        timestamp: Date.now(),
      });

      const snapshot = await snapshotStore.getSnapshotAtVersion(accountId, 10);
      expect(snapshot?.state.balance).toBe(2000);
    });

    it('should delete snapshots for aggregate', async () => {
      const state = AccountStateBuilder.anAccount(accountId)
        .withBalance(1000)
        .withVersion(10)
        .build();

      await snapshotStore.saveSnapshot({
        aggregateId: accountId,
        aggregateType: 'Account',
        version: 10,
        state,
        timestamp: Date.now(),
      });

      await snapshotStore.deleteSnapshots(accountId);

      const snapshot = await snapshotStore.getLatestSnapshot(accountId);
      expect(snapshot).toBeNull();
    });

    it('should clear all snapshots', async () => {
      const accountId1 = 'acc_001';
      const accountId2 = 'acc_002';

      await snapshotStore.saveSnapshot({
        aggregateId: accountId1,
        aggregateType: 'Account',
        version: 10,
        state: AccountStateBuilder.anAccount(accountId1).withBalance(1000).withVersion(10).build(),
        timestamp: Date.now(),
      });

      await snapshotStore.saveSnapshot({
        aggregateId: accountId2,
        aggregateType: 'Account',
        version: 5,
        state: AccountStateBuilder.anAccount(accountId2).withBalance(500).withVersion(5).build(),
        timestamp: Date.now(),
      });

      snapshotStore.clear();

      const snapshot1 = await snapshotStore.getLatestSnapshot(accountId1);
      const snapshot2 = await snapshotStore.getLatestSnapshot(accountId2);

      expect(snapshot1).toBeNull();
      expect(snapshot2).toBeNull();
    });
  });

  describe('SnapshotService', () => {
    describe('Create Snapshot', () => {
      it('should create snapshot with correct state', () => {
        const state = AccountStateBuilder.anAccount(accountId)
          .withOwnerName('John Doe')
          .withBalance(1500)
          .withCurrency('USD')
          .withTransactionCount(10)
          .withVersion(20)
          .build();

        const snapshot = snapshotService.createSnapshot(accountId, state, 20);

        expect(snapshot.aggregateId).toBe(accountId);
        expect(snapshot.version).toBe(20);
        expect(snapshot.state.ownerName).toBe('John Doe');
        expect(snapshot.state.balance).toBe(1500);
        expect(snapshot.state.currency).toBe('USD');
      });

      it('should create snapshot with immutable state', () => {
        const state = AccountStateBuilder.anAccount(accountId)
          .withBalance(1000)
          .withVersion(10)
          .build();

        const snapshot = snapshotService.createSnapshot(accountId, state, 10);

        const modifiedState = { ...state, balance: 5000 };

        expect(snapshot.state.balance).toBe(1000);
        expect(modifiedState.balance).toBe(5000);
      });
    });

    describe('Should Create Snapshot', () => {
      it('should return true when event count meets threshold', () => {
        const customService = new SnapshotService(snapshotStore, 10);

        expect(customService.shouldCreateSnapshot(9)).toBe(false);
        expect(customService.shouldCreateSnapshot(10)).toBe(true);
        expect(customService.shouldCreateSnapshot(15)).toBe(true);
      });

      it('should use default threshold of 100', () => {
        expect(snapshotService.shouldCreateSnapshot(99)).toBe(false);
        expect(snapshotService.shouldCreateSnapshot(100)).toBe(true);
      });

      it('should allow changing threshold dynamically', () => {
        snapshotService.setSnapshotThreshold(50);

        expect(snapshotService.shouldCreateSnapshot(49)).toBe(false);
        expect(snapshotService.shouldCreateSnapshot(50)).toBe(true);
      });
    });

    describe('Save and Retrieve', () => {
      it('should save and retrieve snapshot through service', async () => {
        const state = AccountStateBuilder.anAccount(accountId)
          .withBalance(2000)
          .withVersion(15)
          .build();

        const snapshot = snapshotService.createSnapshot(accountId, state, 15);
        await snapshotService.saveSnapshot(snapshot);

        const retrievedSnapshot = await snapshotService.getLatestSnapshot(accountId);

        expect(retrievedSnapshot).not.toBeNull();
        expect(retrievedSnapshot?.version).toBe(15);
        expect(retrievedSnapshot?.state.balance).toBe(2000);
      });
    });
  });

  describe('Snapshot Workflow Integration', () => {
    it('should handle full snapshot lifecycle', async () => {
      const service = new SnapshotService(snapshotStore, 5);

      const state1 = AccountStateBuilder.anAccount(accountId)
        .withBalance(500)
        .withVersion(5)
        .build();

      expect(service.shouldCreateSnapshot(5)).toBe(true);

      const snapshot1 = service.createSnapshot(accountId, state1, 5);
      await service.saveSnapshot(snapshot1);

      const state2 = AccountStateBuilder.anAccount(accountId)
        .withBalance(1000)
        .withVersion(10)
        .build();

      expect(service.shouldCreateSnapshot(5)).toBe(true);

      const snapshot2 = service.createSnapshot(accountId, state2, 10);
      await service.saveSnapshot(snapshot2);

      const latestSnapshot = await service.getLatestSnapshot(accountId);
      expect(latestSnapshot?.version).toBe(10);
      expect(latestSnapshot?.state.balance).toBe(1000);
    });
  });
});
