import { AccountAggregate } from '../../src/domain/account';
import { AccountEventType } from '../../src/domain/events';
import { EventBuilder } from '../builders';

describe('AccountAggregate - Business Methods Tests', () => {
  const accountId = 'acc_001';

  describe('create() Method', () => {
    it('should create new account with initial state', () => {
      const ownerName = 'John Doe';
      const initialBalance = 1000;
      const currency = 'CNY';

      const aggregate = AccountAggregate.create(accountId, ownerName, initialBalance, currency);

      expect(aggregate.state.accountId).toBe(accountId);
      expect(aggregate.state.ownerName).toBe(ownerName);
      expect(aggregate.state.balance).toBe(initialBalance);
      expect(aggregate.state.currency).toBe(currency);
      expect(aggregate.state.isOverdrawn).toBe(false);
      expect(aggregate.state.isClosed).toBe(false);
      expect(aggregate.state.version).toBe(1);
    });

    it('should create AccountCreated event in uncommittedEvents', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');

      expect(aggregate.uncommittedEvents).toHaveLength(1);
      expect(aggregate.uncommittedEvents[0].eventType).toBe(AccountEventType.ACCOUNT_CREATED);
      expect(aggregate.uncommittedEvents[0].version).toBe(1);
    });

    it('should create account with zero initial balance', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 0, 'CNY');

      expect(aggregate.state.balance).toBe(0);
      expect(aggregate.state.isOverdrawn).toBe(false);
    });

    it('should throw error when ownerName is empty', () => {
      expect(() => {
        AccountAggregate.create(accountId, '', 1000, 'CNY');
      }).toThrow('Validation failed');
    });

    it('should throw error when initialBalance is negative', () => {
      expect(() => {
        AccountAggregate.create(accountId, 'John Doe', -100, 'CNY');
      }).toThrow('Validation failed');
    });

    it('should throw error when currency is invalid', () => {
      expect(() => {
        AccountAggregate.create(accountId, 'John Doe', 1000, '');
      }).toThrow('Validation failed');

      expect(() => {
        AccountAggregate.create(accountId, 'John Doe', 1000, 'US');
      }).toThrow('Validation failed');
    });

    it('should set baseVersion to 0 for new account', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');

      expect(aggregate.baseVersion).toBe(0);
      expect(aggregate.expectedVersion).toBe(1);
    });
  });

  describe('deposit() Method', () => {
    it('should increase balance when depositing money', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      const initialBalance = aggregate.state.balance;
      const depositAmount = 500;

      aggregate.deposit('txn_001', depositAmount, 'ATM Deposit');

      expect(aggregate.state.balance).toBe(initialBalance + depositAmount);
      expect(aggregate.state.transactionCount).toBe(1);
    });

    it('should generate MoneyDeposited and TransactionRecorded events', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 500, 'ATM Deposit');

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.MONEY_DEPOSITED);
      expect(eventTypes).toContain(AccountEventType.TRANSACTION_RECORDED);
      expect(aggregate.uncommittedEvents.length).toBeGreaterThanOrEqual(2);
    });

    it('should increment version correctly after deposit', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      const versionBefore = aggregate.state.version;
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 500);

      expect(aggregate.state.version).toBeGreaterThan(versionBefore);
    });

    it('should throw error when account is closed', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('txn_001', 500);
      }).toThrow('Cannot deposit to closed account');
    });

    it('should throw error when transactionId is empty', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('', 500);
      }).toThrow('Validation failed');
    });

    it('should throw error when amount is zero', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('txn_001', 0);
      }).toThrow('Validation failed');
    });

    it('should throw error when amount is negative', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.deposit('txn_001', -100);
      }).toThrow('Validation failed');
    });

    it('should generate OverdraftResolved event when deposit resolves overdraft', () => {
      const events = [
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
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);
      aggregate.markCommitted();

      expect(aggregate.state.isOverdrawn).toBe(true);
      expect(aggregate.state.balance).toBe(-500);

      aggregate.deposit('txn_002', 600);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.OVERDRAFT_RESOLVED);
      expect(aggregate.state.isOverdrawn).toBe(false);
      expect(aggregate.state.balance).toBe(100);
    });

    it('should not generate OverdraftResolved when already not overdrawn', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(aggregate.state.isOverdrawn).toBe(false);

      aggregate.deposit('txn_001', 500);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).not.toContain(AccountEventType.OVERDRAFT_RESOLVED);
    });

    it('should accept optional description parameter', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 500);

      expect(aggregate.state.balance).toBe(1500);
    });
  });

  describe('withdraw() Method', () => {
    it('should decrease balance when withdrawing money', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      const initialBalance = aggregate.state.balance;
      const withdrawAmount = 300;

      aggregate.withdraw('txn_001', withdrawAmount, 'ATM Withdrawal');

      expect(aggregate.state.balance).toBe(initialBalance - withdrawAmount);
      expect(aggregate.state.transactionCount).toBe(1);
    });

    it('should generate MoneyWithdrawn and TransactionRecorded events', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 300);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.MONEY_WITHDRAWN);
      expect(eventTypes).toContain(AccountEventType.TRANSACTION_RECORDED);
    });

    it('should allow withdrawal resulting in negative balance (overdraft)', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 500, 'CNY');
      aggregate.markCommitted();

      aggregate.withdraw('txn_001', 1000);

      expect(aggregate.state.balance).toBe(-500);
    });

    it('should generate OverdraftStarted event when withdrawal causes overdraft', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 500, 'CNY');
      aggregate.markCommitted();

      expect(aggregate.state.isOverdrawn).toBe(false);

      aggregate.withdraw('txn_001', 1000);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.OVERDRAFT_STARTED);
      expect(aggregate.state.isOverdrawn).toBe(true);
    });

    it('should not generate OverdraftStarted when already overdrawn', () => {
      const events = [
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
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);
      aggregate.markCommitted();

      expect(aggregate.state.isOverdrawn).toBe(true);

      aggregate.withdraw('txn_002', 100);

      const eventTypes = aggregate.uncommittedEvents.map(e => e.eventType);
      expect(eventTypes).not.toContain(AccountEventType.OVERDRAFT_STARTED);
    });

    it('should throw error when account is closed', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested');
      aggregate.markCommitted();

      expect(() => {
        aggregate.withdraw('txn_001', 100);
      }).toThrow('Cannot withdraw from closed account');
    });

    it('should throw error when transactionId is empty', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.withdraw('', 100);
      }).toThrow('Validation failed');
    });

    it('should throw error when amount is zero', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.withdraw('txn_001', 0);
      }).toThrow('Validation failed');
    });

    it('should throw error when amount is negative', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.withdraw('txn_001', -100);
      }).toThrow('Validation failed');
    });

    it('should increment version correctly after withdrawal', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      const versionBefore = aggregate.state.version;
      aggregate.withdraw('txn_001', 100);

      expect(aggregate.state.version).toBeGreaterThan(versionBefore);
    });
  });

  describe('close() Method', () => {
    it('should mark account as closed', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      expect(aggregate.state.isClosed).toBe(false);

      aggregate.close('User requested closure');

      expect(aggregate.state.isClosed).toBe(true);
      expect(aggregate.state.closedAt).toBeDefined();
    });

    it('should generate AccountClosed event', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested closure');

      expect(aggregate.uncommittedEvents).toHaveLength(1);
      expect(aggregate.uncommittedEvents[0].eventType).toBe(AccountEventType.ACCOUNT_CLOSED);
    });

    it('should preserve balance when closing account', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('User requested');

      expect(aggregate.state.balance).toBe(1000);
    });

    it('should throw error when account is already closed', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.close('First closure');
      aggregate.markCommitted();

      expect(() => {
        aggregate.close('Second closure');
      }).toThrow('Account is already closed');
    });

    it('should throw error when balance is negative', () => {
      const events = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 500, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_001', 1000, -500)
          .withVersion(2)
          .build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);
      aggregate.markCommitted();

      expect(aggregate.state.balance).toBe(-500);

      expect(() => {
        aggregate.close('Trying to close with negative balance');
      }).toThrow('Cannot close account with negative balance');
    });

    it('should allow closing account with zero balance', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 0, 'CNY');
      aggregate.markCommitted();

      expect(() => {
        aggregate.close('Closing empty account');
      }).not.toThrow();

      expect(aggregate.state.isClosed).toBe(true);
    });

    it('should increment version after close', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      const versionBefore = aggregate.state.version;
      aggregate.close('User requested');

      expect(aggregate.state.version).toBe(versionBefore + 1);
    });
  });

  describe('markCommitted() Method', () => {
    it('should clear uncommittedEvents after markCommitted', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');

      expect(aggregate.uncommittedEvents.length).toBeGreaterThan(0);

      aggregate.markCommitted();

      expect(aggregate.uncommittedEvents).toHaveLength(0);
    });

    it('should update baseVersion to current version', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');

      expect(aggregate.baseVersion).toBe(0);
      expect(aggregate.state.version).toBe(1);

      aggregate.markCommitted();

      expect(aggregate.baseVersion).toBe(1);
      expect(aggregate.expectedVersion).toBe(1);
    });

    it('should allow subsequent operations after markCommitted', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 500);
      aggregate.markCommitted();

      aggregate.withdraw('txn_002', 200);
      aggregate.markCommitted();

      expect(aggregate.state.balance).toBe(1300);
      expect(aggregate.state.transactionCount).toBe(2);
    });
  });

  describe('fromSnapshot() Method', () => {
    it('should create aggregate from snapshot state', () => {
      const snapshotState = {
        accountId,
        ownerName: 'John Doe',
        balance: 1500,
        currency: 'CNY',
        isOverdrawn: false,
        isClosed: false,
        openedAt: Date.now(),
        transactionCount: 3,
        version: 10,
      };

      const aggregate = AccountAggregate.fromSnapshot(snapshotState);

      expect(aggregate.state.accountId).toBe(accountId);
      expect(aggregate.state.ownerName).toBe('John Doe');
      expect(aggregate.state.balance).toBe(1500);
      expect(aggregate.state.version).toBe(10);
      expect(aggregate.baseVersion).toBe(10);
    });

    it('should have empty uncommittedEvents when created from snapshot', () => {
      const snapshotState = {
        accountId,
        ownerName: 'John Doe',
        balance: 1000,
        currency: 'CNY',
        isOverdrawn: false,
        isClosed: false,
        openedAt: Date.now(),
        transactionCount: 1,
        version: 5,
      };

      const aggregate = AccountAggregate.fromSnapshot(snapshotState);

      expect(aggregate.uncommittedEvents).toHaveLength(0);
    });
  });

  describe('Combined Business Flow Tests', () => {
    it('should handle complete account lifecycle', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 0, 'CNY');
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 1000);
      aggregate.markCommitted();

      aggregate.withdraw('txn_002', 300);
      aggregate.markCommitted();

      aggregate.deposit('txn_003', 200);
      aggregate.markCommitted();

      expect(aggregate.state.balance).toBe(900);
      expect(aggregate.state.transactionCount).toBe(3);
      expect(aggregate.state.isClosed).toBe(false);

      aggregate.close('User requested closure');

      expect(aggregate.state.isClosed).toBe(true);
    });

    it('should handle overdraft and resolution cycle', () => {
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
    });

    it('should maintain version sequence through multiple operations', () => {
      const aggregate = AccountAggregate.create(accountId, 'John Doe', 1000, 'CNY');
      expect(aggregate.state.version).toBe(1);
      aggregate.markCommitted();

      aggregate.deposit('txn_001', 500);
      const versionAfterDeposit = aggregate.state.version;
      aggregate.markCommitted();

      aggregate.withdraw('txn_002', 200);
      const versionAfterWithdraw = aggregate.state.version;
      aggregate.markCommitted();

      aggregate.close('Closing');
      const versionAfterClose = aggregate.state.version;

      expect(versionAfterDeposit).toBeGreaterThan(1);
      expect(versionAfterWithdraw).toBeGreaterThan(versionAfterDeposit);
      expect(versionAfterClose).toBeGreaterThan(versionAfterWithdraw);
    });
  });
});
