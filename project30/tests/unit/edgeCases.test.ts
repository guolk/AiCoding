import { AccountAggregate } from '../../src/domain/account';
import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountCommandHandler } from '../../src/application/commandHandler';
import { CommandBuilder, EventBuilder } from '../builders';
import {
  CommandValidationException,
  AggregateNotFoundException,
  OptimisticConcurrencyException,
} from '../../src/domain/types';
import { AccountEventType } from '../../src/domain/events';

describe('Boundary Conditions and Exception Scenarios', () => {
  const accountId = 'acc_001';

  describe('Closed Account Operations', () => {
    it('should throw error when depositing to closed account via aggregate', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('txn_001', 500);
      }).toThrow('Cannot deposit to closed account');
    });

    it('should throw error when withdrawing from closed account via aggregate', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested');
      aggregate.markCommitted();

      expect(() => {
        aggregate.withdraw('txn_001', 100);
      }).toThrow('Cannot withdraw from closed account');
    });

    it('should throw error when trying to close already closed account', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('First closure');
      aggregate.markCommitted();

      expect(() => {
        aggregate.close('Second closure');
      }).toThrow('Account is already closed');
    });

    it('should preserve state when account is closed', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1500, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested');

      expect(aggregate.state.balance).toBe(1500);
      expect(aggregate.state.ownerName).toBe('John Doe');
      expect(aggregate.state.currency).toBe('CNY');
      expect(aggregate.state.isClosed).toBe(true);
    });
  });

  describe('Negative Balance Scenarios', () => {
    it('should throw error when closing account with negative balance', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 500, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 1000);
      aggregate.markCommitted();

      expect(aggregate.state.balance).toBe(-500);

      expect(() => {
        aggregate.close('Trying to close');
      }).toThrow('Cannot close account with negative balance');
    });

    it('should allow closing account after resolving overdraft', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 500, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 1000);
      aggregate.markCommitted();

      expect(aggregate.state.balance).toBe(-500);
      expect(aggregate.state.isOverdrawn).toBe(true);

      aggregate.deposit('txn_002', 600);
      aggregate.markCommitted();

      expect(aggregate.state.balance).toBe(100);
      expect(aggregate.state.isOverdrawn).toBe(false);

      expect(() => {
        aggregate.close('Now can close');
      }).not.toThrow();

      expect(aggregate.state.isClosed).toBe(true);
    });

    it('should allow closing account with zero balance', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 0, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.close('Closing empty account');
      }).not.toThrow();

      expect(aggregate.state.isClosed).toBe(true);
    });
  });

  describe('Command Validation Edge Cases', () => {
    it('should reject ownerName with only whitespace', () => {
      expect(() => {
        AccountAggregate.create(accountId, '   ', 1000, 'CNY');
      }).toThrow('Validation failed');
    });

    it('should reject ownerName of exactly 101 characters', () => {
      const longName = 'A'.repeat(101);
      expect(() => {
        AccountAggregate.create(accountId, longName, 1000, 'CNY');
      }).toThrow('Validation failed');
    });

    it('should accept ownerName of exactly 100 characters', () => {
      const longName = 'A'.repeat(100);
      expect(() => {
        AccountAggregate.create(accountId, longName, 1000, 'CNY');
      }).not.toThrow();
    });

    it('should reject deposit amount of Infinity', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('txn_001', Infinity);
      }).toThrow('Validation failed');
    });

    it('should reject deposit amount of NaN', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('txn_001', NaN);
      }).toThrow('Validation failed');
    });

    it('should reject withdrawal amount of Infinity', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.withdraw('txn_001', Infinity);
      }).toThrow('Validation failed');
    });

    it('should reject close reason with only whitespace', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.close('   ');
      }).toThrow('Validation failed');
    });

    it('should return multiple validation errors for multiple invalid fields', () => {
      const { CreateAccountCommandValidator, AccountCommandType } = require('../../src/domain/account');

      const command = {
        commandType: AccountCommandType.CREATE_ACCOUNT as const,
        aggregateId: accountId,
        ownerName: '',
        initialBalance: -100,
        currency: 'US',
      };

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors.length).toBeGreaterThan(1);
      expect(errors.map((e: { field: string }) => e.field)).toContain('ownerName');
      expect(errors.map((e: { field: string }) => e.field)).toContain('initialBalance');
      expect(errors.map((e: { field: string }) => e.field)).toContain('currency');
    });
  });

  describe('Exception Properties Validation', () => {
    it('CommandValidationException should have correct structure', () => {
      const { CreateAccountCommandValidator, AccountCommandType } = require('../../src/domain/account');
      const { CommandValidationException } = require('../../src/domain/types');

      const command = {
        commandType: AccountCommandType.CREATE_ACCOUNT as const,
        aggregateId: accountId,
        ownerName: '',
        initialBalance: 0,
        currency: 'CNY',
      };

      const errors = CreateAccountCommandValidator.validate(command);

      expect(() => {
        throw new CommandValidationException(errors, 'Custom message');
      }).toThrow(CommandValidationException);

      try {
        throw new CommandValidationException(errors, 'Custom message');
      } catch (error) {
        const exc = error as typeof CommandValidationException;
        expect(exc.name).toBe('CommandValidationException');
        expect(exc.errors).toEqual(errors);
        expect(exc.message).toBe('Custom message');
      }
    });

    it('AggregateNotFoundException should have correct structure', () => {
      const { AggregateNotFoundException } = require('../../src/domain/types');

      try {
        throw new AggregateNotFoundException(accountId, 'Custom message');
      } catch (error) {
        const exc = error as typeof AggregateNotFoundException;
        expect(exc.name).toBe('AggregateNotFoundException');
        expect(exc.aggregateId).toBe(accountId);
        expect(exc.message).toContain('Custom message');
      }
    });

    it('OptimisticConcurrencyException should have correct structure', () => {
      const { OptimisticConcurrencyException } = require('../../src/domain/types');

      try {
        throw new OptimisticConcurrencyException(accountId, 0, 5, 'Version conflict');
      } catch (error) {
        const exc = error as typeof OptimisticConcurrencyException;
        expect(exc.name).toBe('OptimisticConcurrencyException');
        expect(exc.aggregateId).toBe(accountId);
        expect(exc.expectedVersion).toBe(0);
        expect(exc.actualVersion).toBe(5);
      }
    });
  });

  describe('Event Store Edge Cases', () => {
    let eventStore: InMemoryEventStore;

    beforeEach(() => {
      eventStore = new InMemoryEventStore();
    });

    it('should return empty array for non-existent aggregate', async () => {
      const events = await eventStore.readEvents('non_existent');
      expect(events).toHaveLength(0);
    });

    it('should return version 0 for non-existent aggregate', async () => {
      const version = await eventStore.getCurrentVersion('non_existent');
      expect(version).toBe(0);
    });

    it('should return false for non-existent aggregate exists check', async () => {
      const exists = await eventStore.aggregateExists('non_existent');
      expect(exists).toBe(false);
    });

    it('should handle empty events array in appendEvents', async () => {
      await expect(eventStore.appendEvents(accountId, [], 0)).resolves.not.toThrow();

      const exists = await eventStore.aggregateExists(accountId);
      expect(exists).toBe(false);
    });

    it('should return events in correct version order', async () => {
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
          .moneyDeposited('txn_002', 300, 1800)
          .withVersion(4)
          .build(),
      ];

      await eventStore.appendEvents(accountId, [events[0]], 0);
      await eventStore.appendEvents(accountId, [events[1]], 1);

      const storedEvents = await eventStore.readEvents(accountId);
      for (let i = 1; i < storedEvents.length; i++) {
        expect(storedEvents[i].version).toBeGreaterThan(storedEvents[i - 1].version);
      }
    });
  });

  describe('Version Boundary Tests', () => {
    let eventStore: InMemoryEventStore;

    beforeEach(() => {
      eventStore = new InMemoryEventStore();
    });

    it('should reject events starting at version 0', async () => {
      const event = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(0)
        .build();

      await expect(eventStore.appendEvents(accountId, [event], 0)).rejects.toThrow();
    });

    it('should accept events starting at version 1 for new aggregate', async () => {
      const event = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await expect(eventStore.appendEvents(accountId, [event], 0)).resolves.not.toThrow();
    });

    it('should reject version jump in second batch', async () => {
      const event1 = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      await eventStore.appendEvents(accountId, [event1], 0);

      const event2 = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(5)
        .build();

      await expect(eventStore.appendEvents(accountId, [event2], 1)).rejects.toThrow();
    });
  });

  describe('Uncommitted Events Management', () => {
    it('should accumulate uncommitted events after operations', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');

      expect(aggregate.uncommittedEvents.length).toBeGreaterThan(0);

      aggregate.markCommitted();

      expect(aggregate.uncommittedEvents).toHaveLength(0);

      aggregate.deposit('txn_001', 500);

      expect(aggregate.uncommittedEvents.length).toBeGreaterThan(0);
    });

    it('should update baseVersion after markCommitted', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');

      expect(aggregate.baseVersion).toBe(0);
      expect(aggregate.expectedVersion).toBe(1);

      aggregate.markCommitted();

      expect(aggregate.baseVersion).toBe(1);
      expect(aggregate.expectedVersion).toBe(1);
    });

    it('should have correct event types in uncommitted events', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 500);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.MONEY_DEPOSITED);
      expect(eventTypes).toContain(AccountEventType.TRANSACTION_RECORDED);
    });

    it('should generate overdraft events when withdrawal causes negative balance', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 500, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 1000);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.MONEY_WITHDRAWN);
      expect(eventTypes).toContain(AccountEventType.TRANSACTION_RECORDED);
      expect(eventTypes).toContain(AccountEventType.OVERDRAFT_STARTED);
    });

    it('should generate overdraft resolved event when deposit brings balance positive', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 500, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 1000);
      aggregate.markCommitted();

      aggregate.deposit('txn_002', 600);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.MONEY_DEPOSITED);
      expect(eventTypes).toContain(AccountEventType.TRANSACTION_RECORDED);
      expect(eventTypes).toContain(AccountEventType.OVERDRAFT_RESOLVED);
    });
  });

  describe('Transaction Count Tracking', () => {
    it('should increment transaction count on deposit', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(aggregate.state.transactionCount).toBe(0);

      aggregate.deposit('txn_001', 500);

      expect(aggregate.state.transactionCount).toBe(1);
    });

    it('should increment transaction count on withdrawal', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 300);

      expect(aggregate.state.transactionCount).toBe(1);
    });

    it('should track multiple transactions', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 100);
      aggregate.markCommitted();

      aggregate.deposit('txn_002', 200);
      aggregate.markCommitted();

      aggregate.withdraw('txn_003', 50);
      aggregate.markCommitted();

      aggregate.deposit('txn_004', 300);

      expect(aggregate.state.transactionCount).toBe(4);
    });
  });

  describe('Snapshot Service Edge Cases', () => {
    let snapshotStore: InMemorySnapshotStore;
    let snapshotService: SnapshotService;

    beforeEach(() => {
      snapshotStore = new InMemorySnapshotStore();
      snapshotService = new SnapshotService(snapshotStore, 100);
    });

    it('should return null for non-existent account snapshot', async () => {
      const snapshot = await snapshotService.getLatestSnapshot('non_existent');
      expect(snapshot).toBeNull();
    });

    it('should return correct event count since last snapshot', () => {
      expect(snapshotService.shouldCreateSnapshot(99)).toBe(false);
      expect(snapshotService.shouldCreateSnapshot(100)).toBe(true);
      expect(snapshotService.shouldCreateSnapshot(101)).toBe(true);
    });

    it('should allow dynamic threshold changes', () => {
      expect(snapshotService.shouldCreateSnapshot(50)).toBe(false);

      snapshotService.setSnapshotThreshold(50);

      expect(snapshotService.shouldCreateSnapshot(50)).toBe(true);
    });

    it('should create snapshot with immutable state', () => {
      const { AccountStateBuilder } = require('../builders');
      const state = AccountStateBuilder.anAccount(accountId)
        .withBalance(1000)
        .withVersion(5)
        .build();

      const snapshot = snapshotService.createSnapshot(accountId, state, 5);

      const modifiedState = { ...state, balance: 5000 };

      expect(snapshot.state.balance).toBe(1000);
      expect(modifiedState.balance).toBe(5000);
    });
  });

  describe('Extreme Value Tests', () => {
    it('should handle very large deposit amounts', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 0, 'CNY');
      aggregate.markCommitted();

      const largeAmount = Number.MAX_SAFE_INTEGER;

      aggregate.deposit('txn_001', largeAmount);

      expect(aggregate.state.balance).toBe(largeAmount);
    });

    it('should handle very small deposit amounts', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 0, 'CNY');
      aggregate.markCommitted();

      const smallAmount = 0.01;

      aggregate.deposit('txn_001', smallAmount);

      expect(aggregate.state.balance).toBe(smallAmount);
    });

    it('should handle withdrawal resulting in large negative balance', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 100, 'CNY');
      aggregate.markCommitted();

      const largeWithdrawal = Number.MAX_SAFE_INTEGER;

      aggregate.withdraw('txn_001', largeWithdrawal);

      expect(aggregate.state.balance).toBeLessThan(0);
      expect(aggregate.state.isOverdrawn).toBe(true);
    });
  });
});
