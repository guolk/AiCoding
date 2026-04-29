import {
  InMemoryAccountBalanceProjection,
  AccountBalanceView,
} from '../../src/projections/accountBalanceProjection';
import {
  InMemoryTransactionHistoryProjection,
  TransactionView,
} from '../../src/projections/transactionHistoryProjection';
import { EventBuilder } from '../builders';
import { AccountDomainEvent } from '../../src/domain/events';
import { AccountAggregate, AccountState } from '../../src/domain/account';

describe('Projection Tests', () => {
  const accountId = 'acc_001';

  describe('AccountBalanceProjection Tests', () => {
    let projection: InMemoryAccountBalanceProjection;

    beforeEach(() => {
      projection = new InMemoryAccountBalanceProjection();
    });

    describe('AccountCreated Event', () => {
      it('should create balance view from AccountCreated event', () => {
        const event = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build();

        projection.applyEvent(event);

        const view = projection.getBalance(accountId);
        expect(view).not.toBeNull();
        expect(view?.accountId).toBe(accountId);
        expect(view?.ownerName).toBe('John Doe');
        expect(view?.balance).toBe(1000);
        expect(view?.currency).toBe('CNY');
        expect(view?.isOverdrawn).toBe(false);
        expect(view?.isClosed).toBe(false);
        expect(view?.lastUpdated).toBe(event.timestamp);
      });

      it('should handle AccountCreated with zero initial balance', () => {
        const event = EventBuilder.anEvent(accountId)
          .accountCreated('Jane Smith', 0, 'USD')
          .withVersion(1)
          .build();

        projection.applyEvent(event);

        const view = projection.getBalance(accountId);
        expect(view?.balance).toBe(0);
        expect(view?.isOverdrawn).toBe(false);
      });
    });

    describe('MoneyDeposited Event', () => {
      it('should update balance after MoneyDeposited event', () => {
        const createdEvent = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build();

        const depositEvent = EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500, 'Deposit from ATM')
          .withVersion(2)
          .build();

        projection.applyEvent(createdEvent);
        projection.applyEvent(depositEvent);

        const view = projection.getBalance(accountId);
        expect(view?.balance).toBe(1500);
        expect(view?.lastUpdated).toBe(depositEvent.timestamp);
      });

      it('should ignore MoneyDeposited for non-existent account', () => {
        const depositEvent = EventBuilder.anEvent('non_existent')
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build();

        projection.applyEvent(depositEvent);

        const view = projection.getBalance('non_existent');
        expect(view).toBeNull();
      });
    });

    describe('MoneyWithdrawn Event', () => {
      it('should update balance after MoneyWithdrawn event', () => {
        const createdEvent = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build();

        const withdrawEvent = EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_001', 300, 700, 'Withdrawal')
          .withVersion(2)
          .build();

        projection.applyEvent(createdEvent);
        projection.applyEvent(withdrawEvent);

        const view = projection.getBalance(accountId);
        expect(view?.balance).toBe(700);
      });

      it('should ignore MoneyWithdrawn for non-existent account', () => {
        const withdrawEvent = EventBuilder.anEvent('non_existent')
          .moneyWithdrawn('txn_001', 100, 900)
          .withVersion(2)
          .build();

        projection.applyEvent(withdrawEvent);

        expect(projection.getBalance('non_existent')).toBeNull();
      });
    });

    describe('Overdraft Events', () => {
      it('should mark as overdrawn on OverdraftStarted event', () => {
        const createdEvent = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 500, 'CNY')
          .withVersion(1)
          .build();

        const withdrawEvent = EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_001', 1000, -500)
          .withVersion(2)
          .build();

        const overdraftEvent = EventBuilder.anEvent(accountId)
          .overdraftStarted('txn_001', 500, -500)
          .withVersion(4)
          .build();

        projection.applyEvent(createdEvent);
        projection.applyEvent(withdrawEvent);
        projection.applyEvent(overdraftEvent);

        const view = projection.getBalance(accountId);
        expect(view?.isOverdrawn).toBe(true);
        expect(view?.balance).toBe(-500);
      });

      it('should mark as not overdrawn on OverdraftResolved event', () => {
        const createdEvent = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 500, 'CNY')
          .withVersion(1)
          .build();

        const overdraftEvent = EventBuilder.anEvent(accountId)
          .overdraftStarted('txn_001', 500, -500)
          .withVersion(4)
          .build();

        const resolveEvent = EventBuilder.anEvent(accountId)
          .overdraftResolved('txn_002')
          .withVersion(7)
          .build();

        projection.applyEvent(createdEvent);
        projection.applyEvent(overdraftEvent);
        projection.applyEvent(resolveEvent);

        const view = projection.getBalance(accountId);
        expect(view?.isOverdrawn).toBe(false);
      });

      it('should ignore OverdraftStarted for non-existent account', () => {
        const event = EventBuilder.anEvent('non_existent')
          .overdraftStarted('txn_001', 100, -100)
          .withVersion(4)
          .build();

        projection.applyEvent(event);

        expect(projection.getBalance('non_existent')).toBeNull();
      });
    });

    describe('AccountClosed Event', () => {
      it('should mark account as closed', () => {
        const createdEvent = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build();

        const closeEvent = EventBuilder.anEvent(accountId)
          .accountClosed('User requested closure')
          .withVersion(2)
          .build();

        projection.applyEvent(createdEvent);
        projection.applyEvent(closeEvent);

        const view = projection.getBalance(accountId);
        expect(view?.isClosed).toBe(true);
        expect(view?.balance).toBe(1000);
      });

      it('should ignore AccountClosed for non-existent account', () => {
        const event = EventBuilder.anEvent('non_existent')
          .accountClosed('Closed')
          .withVersion(2)
          .build();

        projection.applyEvent(event);

        expect(projection.getBalance('non_existent')).toBeNull();
      });
    });

    describe('getAllBalances', () => {
      it('should return all account balances', () => {
        const accountId1 = 'acc_001';
        const accountId2 = 'acc_002';

        const event1 = EventBuilder.anEvent(accountId1)
          .accountCreated('Account One', 1000, 'CNY')
          .withVersion(1)
          .build();

        const event2 = EventBuilder.anEvent(accountId2)
          .accountCreated('Account Two', 500, 'USD')
          .withVersion(1)
          .build();

        projection.applyEvent(event1);
        projection.applyEvent(event2);

        const allBalances = projection.getAllBalances();
        expect(allBalances).toHaveLength(2);
        expect(allBalances.map(v => v.accountId)).toEqual(
          expect.arrayContaining([accountId1, accountId2])
        );
      });

      it('should return empty array when no accounts', () => {
        const allBalances = projection.getAllBalances();
        expect(allBalances).toHaveLength(0);
      });
    });

    describe('reset', () => {
      it('should clear all projections', () => {
        const event = EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build();

        projection.applyEvent(event);
        expect(projection.getBalance(accountId)).not.toBeNull();

        projection.reset();

        expect(projection.getBalance(accountId)).toBeNull();
        expect(projection.getAllBalances()).toHaveLength(0);
      });
    });
  });

  describe('TransactionHistoryProjection Tests', () => {
    let projection: InMemoryTransactionHistoryProjection;

    beforeEach(() => {
      projection = new InMemoryTransactionHistoryProjection();
    });

    describe('TransactionRecorded Event', () => {
      it('should create transaction view from TransactionRecorded event', () => {
        const event = EventBuilder.anEvent(accountId)
          .transactionRecorded(
            'txn_001',
            'deposit',
            500,
            1000,
            1500,
            undefined,
            'Deposit from ATM'
          )
          .withVersion(3)
          .build();

        projection.applyEvent(event);

        const transaction = projection.getTransaction('txn_001');
        expect(transaction).not.toBeNull();
        expect(transaction?.transactionId).toBe('txn_001');
        expect(transaction?.accountId).toBe(accountId);
        expect(transaction?.type).toBe('deposit');
        expect(transaction?.amount).toBe(500);
        expect(transaction?.balanceBefore).toBe(1000);
        expect(transaction?.balanceAfter).toBe(1500);
        expect(transaction?.description).toBe('Deposit from ATM');
        expect(transaction?.eventVersion).toBe(3);
      });

      it('should ignore duplicate TransactionRecorded event', () => {
        const event = EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build();

        projection.applyEvent(event);
        projection.applyEvent(event);

        const count = projection.getTransactionCount(accountId);
        expect(count).toBe(1);
      });

      it('should handle withdrawal transaction type', () => {
        const event = EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'withdrawal', 200, 1000, 800)
          .withVersion(3)
          .build();

        projection.applyEvent(event);

        const transaction = projection.getTransaction('txn_001');
        expect(transaction?.type).toBe('withdrawal');
        expect(transaction?.balanceAfter).toBe(800);
      });

      it('should handle transfer transaction type with counterparty', () => {
        const targetAccountId = 'acc_002';
        const event = EventBuilder.anEvent(accountId)
          .transactionRecorded(
            'txn_001',
            'transfer',
            300,
            1000,
            700,
            targetAccountId,
            'Transfer to another account'
          )
          .withVersion(3)
          .build();

        projection.applyEvent(event);

        const transaction = projection.getTransaction('txn_001');
        expect(transaction?.type).toBe('transfer');
        expect(transaction?.counterparty).toBe(targetAccountId);
        expect(transaction?.description).toBe('Transfer to another account');
      });
    });

    describe('getTransactionsForAccount', () => {
      beforeEach(() => {
        const events = [
          EventBuilder.anEvent(accountId)
            .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
            .withVersion(3)
            .build(),
          EventBuilder.anEvent(accountId)
            .transactionRecorded('txn_002', 'withdrawal', 50, 100, 50)
            .withVersion(5)
            .build(),
          EventBuilder.anEvent(accountId)
            .transactionRecorded('txn_003', 'deposit', 200, 50, 250)
            .withVersion(7)
            .build(),
        ];

        events.forEach(e => projection.applyEvent(e));
      });

      it('should return all transactions for account', () => {
        const transactions = projection.getTransactionsForAccount(accountId);
        expect(transactions).toHaveLength(3);
      });

      it('should return transactions with limit', () => {
        const transactions = projection.getTransactionsForAccount(accountId, { limit: 2 });
        expect(transactions).toHaveLength(2);
        expect(transactions[0].transactionId).toBe('txn_001');
        expect(transactions[1].transactionId).toBe('txn_002');
      });

      it('should return transactions with offset', () => {
        const transactions = projection.getTransactionsForAccount(accountId, { offset: 1 });
        expect(transactions).toHaveLength(2);
        expect(transactions[0].transactionId).toBe('txn_002');
        expect(transactions[1].transactionId).toBe('txn_003');
      });

      it('should return transactions with limit and offset', () => {
        const transactions = projection.getTransactionsForAccount(accountId, { limit: 1, offset: 1 });
        expect(transactions).toHaveLength(1);
        expect(transactions[0].transactionId).toBe('txn_002');
      });

      it('should return empty array for non-existent account', () => {
        const transactions = projection.getTransactionsForAccount('non_existent');
        expect(transactions).toHaveLength(0);
      });
    });

    describe('getTransactionCount', () => {
      it('should return zero for account with no transactions', () => {
        const count = projection.getTransactionCount(accountId);
        expect(count).toBe(0);
      });

      it('should return correct count after adding transactions', () => {
        const events = [
          EventBuilder.anEvent(accountId)
            .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
            .withVersion(3)
            .build(),
          EventBuilder.anEvent(accountId)
            .transactionRecorded('txn_002', 'withdrawal', 50, 100, 50)
            .withVersion(5)
            .build(),
        ];

        events.forEach(e => projection.applyEvent(e));

        const count = projection.getTransactionCount(accountId);
        expect(count).toBe(2);
      });
    });

    describe('MoneyDeposited and MoneyWithdrawn Updates', () => {
      it('should update balanceAfter when MoneyDeposited is processed after TransactionRecorded', () => {
        const recordEvent = EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build();

        const depositEvent = EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1600)
          .withVersion(2)
          .build();

        projection.applyEvent(recordEvent);
        let transaction = projection.getTransaction('txn_001');
        expect(transaction?.balanceAfter).toBe(1500);

        projection.applyEvent(depositEvent);
        transaction = projection.getTransaction('txn_001');
        expect(transaction?.balanceAfter).toBe(1600);
      });

      it('should update balanceAfter when MoneyWithdrawn is processed after TransactionRecorded', () => {
        const recordEvent = EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'withdrawal', 300, 1000, 700)
          .withVersion(3)
          .build();

        const withdrawEvent = EventBuilder.anEvent(accountId)
          .moneyWithdrawn('txn_001', 300, 650)
          .withVersion(2)
          .build();

        projection.applyEvent(recordEvent);
        let transaction = projection.getTransaction('txn_001');
        expect(transaction?.balanceAfter).toBe(700);

        projection.applyEvent(withdrawEvent);
        transaction = projection.getTransaction('txn_001');
        expect(transaction?.balanceAfter).toBe(650);
      });

      it('should ignore MoneyDeposited when transaction does not exist', () => {
        const depositEvent = EventBuilder.anEvent(accountId)
          .moneyDeposited('non_existent_txn', 500, 1500)
          .withVersion(2)
          .build();

        projection.applyEvent(depositEvent);

        expect(projection.getTransaction('non_existent_txn')).toBeNull();
      });
    });

    describe('reset', () => {
      it('should clear all transaction data', () => {
        const event = EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build();

        projection.applyEvent(event);
        expect(projection.getTransaction('txn_001')).not.toBeNull();
        expect(projection.getTransactionCount(accountId)).toBe(1);

        projection.reset();

        expect(projection.getTransaction('txn_001')).toBeNull();
        expect(projection.getTransactionCount(accountId)).toBe(0);
        expect(projection.getTransactionsForAccount(accountId)).toHaveLength(0);
      });
    });
  });

  describe('Projection Consistency Tests', () => {
    it('projection state should match aggregate state after applying same events', () => {
      const balanceProjection = new InMemoryAccountBalanceProjection();
      const historyProjection = new InMemoryTransactionHistoryProjection();

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

      events.forEach(e => {
        balanceProjection.applyEvent(e);
        historyProjection.applyEvent(e);
      });

      const aggregate = AccountAggregate.fromEvents(accountId, events);

      const balanceView = balanceProjection.getBalance(accountId);
      expect(balanceView?.balance).toBe(aggregate.state.balance);
      expect(balanceView?.ownerName).toBe(aggregate.state.ownerName);
      expect(balanceView?.isOverdrawn).toBe(aggregate.state.isOverdrawn);
      expect(balanceView?.isClosed).toBe(aggregate.state.isClosed);

      const transactionCount = historyProjection.getTransactionCount(accountId);
      expect(transactionCount).toBe(aggregate.state.transactionCount);
    });

    it('both projections should handle same event stream independently', () => {
      const balanceProjection1 = new InMemoryAccountBalanceProjection();
      const balanceProjection2 = new InMemoryAccountBalanceProjection();

      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];

      events.forEach(e => {
        balanceProjection1.applyEvent(e);
        balanceProjection2.applyEvent(e);
      });

      const view1 = balanceProjection1.getBalance(accountId);
      const view2 = balanceProjection2.getBalance(accountId);

      expect(view1?.balance).toBe(view2?.balance);
      expect(view1?.ownerName).toBe(view2?.ownerName);
    });
  });

  describe('Event Order Independence Tests', () => {
    it('projection should handle events in different order for transaction update', () => {
      const projection1 = new InMemoryTransactionHistoryProjection();
      const projection2 = new InMemoryTransactionHistoryProjection();

      const transactionEvent = EventBuilder.anEvent(accountId)
        .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
        .withVersion(3)
        .build();

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      projection1.applyEvent(transactionEvent);
      projection1.applyEvent(depositEvent);

      projection2.applyEvent(depositEvent);
      projection2.applyEvent(transactionEvent);

      const txn1 = projection1.getTransaction('txn_001');
      const txn2 = projection2.getTransaction('txn_001');

      expect(txn1?.transactionId).toBe(txn2?.transactionId);
      expect(txn1?.balanceAfter).toBe(txn2?.balanceAfter);
    });
  });
});
