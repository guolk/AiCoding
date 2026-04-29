import { AccountId, Version, Snapshot, Timestamp } from '../domain/types';
import { AccountState } from '../domain/account';

export interface SnapshotStore {
  saveSnapshot(snapshot: Snapshot<AccountState>): Promise<void>;
  getLatestSnapshot(aggregateId: AccountId): Promise<Snapshot<AccountState> | null>;
  getSnapshotAtVersion(
    aggregateId: AccountId,
    version: Version
  ): Promise<Snapshot<AccountState> | null>;
  deleteSnapshots(aggregateId: AccountId): Promise<void>;
}

export class InMemorySnapshotStore implements SnapshotStore {
  private snapshots: Map<AccountId, Snapshot<AccountState>[]> = new Map();

  async saveSnapshot(snapshot: Snapshot<AccountState>): Promise<void> {
    const existingSnapshots = this.snapshots.get(snapshot.aggregateId) ?? [];

    const index = existingSnapshots.findIndex(s => s.version === snapshot.version);
    if (index >= 0) {
      existingSnapshots[index] = snapshot;
    } else {
      existingSnapshots.push(snapshot);
      existingSnapshots.sort((a, b) => a.version - b.version);
    }

    this.snapshots.set(snapshot.aggregateId, existingSnapshots);
  }

  async getLatestSnapshot(aggregateId: AccountId): Promise<Snapshot<AccountState> | null> {
    const snapshots = this.snapshots.get(aggregateId);
    if (!snapshots || snapshots.length === 0) {
      return null;
    }

    return snapshots[snapshots.length - 1];
  }

  async getSnapshotAtVersion(
    aggregateId: AccountId,
    version: Version
  ): Promise<Snapshot<AccountState> | null> {
    const snapshots = this.snapshots.get(aggregateId);
    if (!snapshots) {
      return null;
    }

    return snapshots.find(s => s.version === version) ?? null;
  }

  async deleteSnapshots(aggregateId: AccountId): Promise<void> {
    this.snapshots.delete(aggregateId);
  }

  clear(): void {
    this.snapshots.clear();
  }
}

export class SnapshotService {
  private snapshotThreshold: number;

  constructor(
    private readonly snapshotStore: SnapshotStore,
    snapshotThreshold: number = 100
  ) {
    this.snapshotThreshold = snapshotThreshold;
  }

  shouldCreateSnapshot(eventCountSinceLastSnapshot: number): boolean {
    return eventCountSinceLastSnapshot >= this.snapshotThreshold;
  }

  createSnapshot(
    aggregateId: AccountId,
    state: AccountState,
    version: Version
  ): Snapshot<AccountState> {
    return {
      aggregateId,
      aggregateType: 'Account',
      version,
      state: { ...state },
      timestamp: Date.now(),
    };
  }

  async saveSnapshot(snapshot: Snapshot<AccountState>): Promise<void> {
    await this.snapshotStore.saveSnapshot(snapshot);
  }

  async getLatestSnapshot(aggregateId: AccountId): Promise<Snapshot<AccountState> | null> {
    return await this.snapshotStore.getLatestSnapshot(aggregateId);
  }

  setSnapshotThreshold(threshold: number): void {
    this.snapshotThreshold = threshold;
  }
}
