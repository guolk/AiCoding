import { AccountAggregate, AccountState, createInitialState } from '../../src/domain/account';
import { EventBuilder, createAccountCreatedEvent, createMoneyDepositedEvent, createMoneyWithdrawnEvent } from '../builders';
import { AccountEventType } from '../../src/domain/events';

describe('AccountAggregate - Apply Function Tests', () => {
  const accountId = 'acc_001';
  const now = Date.now();

  describe('AccountCreated Event', () => {
    it('should correctly initialize account state from AccountCreated event', () => {
      const ownerName = 'John Doe';
      const initialBalance = 1000;
      const currency = 'CNY';

      const event = EventBuilder.anEvent(accountId)
        .accountCreated(ownerName, initialBalance, currency)
        .withVersion(1)
        .withTimestamp(now)
        .build();

      const aggregate = AccountAggregate.fromEvents(accountId, [event]);

      expect(aggregate.state.accountId).toBe(accountId);
      expect(aggregate.state.ownerName).toBe(ownerName);
      expect(aggregate.state.balance).toBe(initialBalance);
      expect(aggregate.state.currency).toBe(currency);
      expect(aggregate.state.isOverdrawn).toBe(false);
      expect(aggregate.state.isClosed).toBe(false);
      expect(aggregate.state.version).toBe(1);
      expect(aggregate.state.transactionCount).toBe(0);
    });

    it('should handle AccountCreated event with zero initial balance', () => {
      const event = EventBuilder.anEvent(accountId)
        .accountCreated('Jane Doe', 0, 'USD')
        .withVersion(1)
        .build();

      const aggregate = AccountAggregate.fromEvents(accountId, [event]);

      expect(aggregate.state.balance).toBe(0);
      expect(aggregate.state.isOverdrawn).toBe(false);
    });

    it('should handle AccountCreated event with positive initial balance', () => {
      const event = EventBuilder.anEvent(accountId)
        .accountCreated('Rich Person', 1000000, 'EUR')
        .withVersion(1)
        .build();

      const aggregate = AccountAggregate.fromEvents(accountId, [event]);

      expect(aggregate.state.balance).toBe(1000000);
      expect(aggregate.state.currency).toBe('EUR');
    });
  });

  describe('MoneyDeposited Event', () => {
    it('should correctly apply MoneyDeposited event to increase balance', () => {
      const createdEvent = EventBuilder.anEvent(accountId)
        .accountCreated('John Doe', 1000, 'CNY')
        .withVersion(1)
        .build();

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500, 'Deposit from ATM')
        .withVersion(2)
        .build();

      const aggregate = AccountAggregate.fromEvents(accountId, [createdEvent, depositEvent]);

      expect(aggregate.state.balance).toBe(1500);
      expect(aggregate.state.transactionCount).toBe(1);
      expect(aggregate.state.version).toBe(2);
    });

    it('should apply multiple MoneyDeposited events in sequence', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 0, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_001', 100, 100).withVersion(2).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_002', 200, 300).withVersion(4).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_003', 300, 600).withVersion(6).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(600);
      expect(aggregate.state.transactionCount).toBe(3);
    });

    it('should resolve overdraft when deposit brings balance non-negative', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 500, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_001', 1000, -500).withVersion(2).build(),
        EventBuilder.anEvent(accountId).overdraftStarted('txn_001', 500, -500).withVersion(4).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_002', 600, 100).withVersion(5).build(),
        EventBuilder.anEvent(accountId).overdraftResolved('txn_002').withVersion(7).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(100);
      expect(aggregate.state.isOverdrawn).toBe(false);
    });
  });

  describe('MoneyWithdrawn Event', () => {
    it('should correctly apply MoneyWithdrawn event to decrease balance', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_001', 300, 700, 'Withdrawal').withVersion(2).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(700);
      expect(aggregate.state.transactionCount).toBe(1);
      expect(aggregate.state.version).toBe(2);
    });

    it('should handle multiple withdrawals', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_001', 200, 800).withVersion(2).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_002', 300, 500).withVersion(4).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_003', 100, 400).withVersion(6).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(400);
      expect(aggregate.state.transactionCount).toBe(3);
    });

    it('should mark as overdrawn when withdrawal results in negative balance', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 500, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_001', 1000, -500).withVersion(2).build(),
        EventBuilder.anEvent(accountId).overdraftStarted('txn_001', 500, -500).withVersion(4).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(-500);
      expect(aggregate.state.isOverdrawn).toBe(true);
    });
  });

  describe('TransactionRecorded Event', () => {
    it('should increment version but not affect balance directly', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_001', 500, 1500).withVersion(2).build(),
        EventBuilder.anEvent(accountId).transactionRecorded('txn_001', 'deposit', 500, 1000, 1500).withVersion(3).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(1500);
      expect(aggregate.state.version).toBe(3);
    });
  });

  describe('OverdraftStarted Event', () => {
    it('should mark account as overdrawn', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 100, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_001', 500, -400).withVersion(2).build(),
        EventBuilder.anEvent(accountId).overdraftStarted('txn_001', 400, -400).withVersion(4).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.isOverdrawn).toBe(true);
    });
  });

  describe('OverdraftResolved Event', () => {
    it('should mark account as not overdrawn', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 100, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_001', 500, -400).withVersion(2).build(),
        EventBuilder.anEvent(accountId).overdraftStarted('txn_001', 400, -400).withVersion(4).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_002', 500, 100).withVersion(5).build(),
        EventBuilder.anEvent(accountId).overdraftResolved('txn_002').withVersion(7).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.isOverdrawn).toBe(false);
    });
  });

  describe('AccountClosed Event', () => {
    it('should mark account as closed', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).accountClosed('User requested closure').withVersion(2).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.isClosed).toBe(true);
    });

    it('should preserve balance when account is closed', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).accountClosed('User requested closure').withVersion(2).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(1000);
    });
  });

  describe('Event Version Validation', () => {
    it('should throw error when applying events out of order', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_001', 500, 1500).withVersion(3).build(),
      ];

      expect(() => {
        AccountAggregate.fromEvents(accountId, events);
      }).toThrow('Event out of order');
    });

    it('should successfully apply events in correct version order', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('John Doe', 1000, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_001', 500, 1500).withVersion(2).build(),
        EventBuilder.anEvent(accountId).transactionRecorded('txn_001', 'deposit', 500, 1000, 1500).withVersion(3).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_002', 200, 1300).withVersion(4).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.version).toBe(4);
      expect(aggregate.state.balance).toBe(1300);
    });
  });

  describe('Full Event Sequence Tests', () => {
    it('should correctly apply complete account lifecycle events', () => {
      const events = [
        EventBuilder.anEvent(accountId).accountCreated('Jane Smith', 0, 'CNY').withVersion(1).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_001', 1000, 1000).withVersion(2).build(),
        EventBuilder.anEvent(accountId).transactionRecorded('txn_001', 'deposit', 1000, 0, 1000).withVersion(3).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_002', 300, 700).withVersion(4).build(),
        EventBuilder.anEvent(accountId).transactionRecorded('txn_002', 'withdrawal', 300, 1000, 700).withVersion(5).build(),
        EventBuilder.anEvent(accountId).moneyWithdrawn('txn_003', 800, -100).withVersion(6).build(),
        EventBuilder.anEvent(accountId).transactionRecorded('txn_003', 'withdrawal', 800, 700, -100).withVersion(7).build(),
        EventBuilder.anEvent(accountId).overdraftStarted('txn_003', 100, -100).withVersion(8).build(),
        EventBuilder.anEvent(accountId).moneyDeposited('txn_004', 500, 400).withVersion(9).build(),
        EventBuilder.anEvent(accountId).transactionRecorded('txn_004', 'deposit', 500, -100, 400).withVersion(10).build(),
        EventBuilder.anEvent(accountId).overdraftResolved('txn_004').withVersion(11).build(),
      ];

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      expect(aggregate.state.balance).toBe(400);
      expect(aggregate.state.isOverdrawn).toBe(false);
      expect(aggregate.state.isClosed).toBe(false);
      expect(aggregate.state.transactionCount).toBe(4);
      expect(aggregate.state.version).toBe(11);
    });
  });
});
