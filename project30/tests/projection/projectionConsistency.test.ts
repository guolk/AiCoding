import { AccountAggregate } from '../../src/domain/account';
import {
  InMemoryAccountBalanceProjection,
  AccountBalanceView,
} from '../../src/projections/accountBalanceProjection';
import {
  InMemoryTransactionHistoryProjection,
  TransactionView,
} from '../../src/projections/transactionHistoryProjection';
import { EventBuilder, CommandBuilder } from '../builders';
import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountCommandHandler } from '../../src/application/commandHandler';
import { AccountEventType, AccountDomainEvent } from '../../src/domain/events';

describe('Projection Consistency Tests', () => {
  const accountId = 'acc_001';

  describe('AccountBalanceProjection Consistency', () => {
    let projection: InMemoryAccountBalanceProjection;

    beforeEach(() => {
      projection = new InMemoryAccountBalanceProjection();
    });

    it('should match aggregate state after applying same events', () => {
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

      const aggregateState = AccountAggregate.fromEvents(accountId, events).state;

      events.forEach(e => projection.applyEvent(e));

      const view = projection.getBalance(accountId);

      expect(view).not.toBeNull();
      expect(view?.balance).toBe(aggregateState.balance);
      expect(view?.ownerName).toBe(aggregateState.ownerName);
      expect(view?.isOverdrawn).toBe(aggregateState.isOverdrawn);
      expect(view?.isClosed).toBe(aggregateState.isClosed);
    });

    it('should correctly reflect overdraft state', () => {
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
      ];

      const aggregateState = AccountAggregate.fromEvents(accountId, events).state;

      events.forEach(e => projection.applyEvent(e));

      const view = projection.getBalance(accountId);

      expect(view?.isOverdrawn).toBe(true);
      expect(view?.balance).toBe(-500);
      expect(view?.isOverdrawn).toBe(aggregateState.isOverdrawn);
    });

    it('should correctly reflect overdraft resolution', () => {
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
          .overdraftStarted('txn_001', 500, -500)
          .withVersion(4)
          .build(),
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_002', 600, 100)
          .withVersion(5)
          .build(),
        EventBuilder.anEvent(accountId)
          .overdraftResolved('txn_002')
          .withVersion(7)
          .build(),
      ];

      const aggregateState = AccountAggregate.fromEvents(accountId, events).state;

      events.forEach(e => projection.applyEvent(e));

      const view = projection.getBalance(accountId);

      expect(view?.isOverdrawn).toBe(false);
      expect(view?.balance).toBe(100);
      expect(view?.isOverdrawn).toBe(aggregateState.isOverdrawn);
    });

    it('should correctly reflect closed account', () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .accountClosed('User requested closure')
          .withVersion(2)
          .build(),
      ];

      const aggregateState = AccountAggregate.fromEvents(accountId, events).state;

      events.forEach(e => projection.applyEvent(e));

      const view = projection.getBalance(accountId);

      expect(view?.isClosed).toBe(true);
      expect(view?.isClosed).toBe(aggregateState.isClosed);
    });

    it('should ignore events for non-existent accounts', () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .moneyDeposited('txn_001', 500, 1500)
          .withVersion(2)
          .build(),
      ];

      events.forEach(e => projection.applyEvent(e));

      const view = projection.getBalance(accountId);
      expect(view).toBeNull();
    });

    it('getAllBalances should return all accounts', () => {
      const accountId1 = 'acc_001';
      const accountId2 = 'acc_002';

      const events1: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId1)
          .accountCreated('Account One', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];

      const events2: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId2)
          .accountCreated('Account Two', 2000, 'USD')
          .withVersion(1)
          .build(),
      ];

      events1.forEach(e => projection.applyEvent(e));
      events2.forEach(e => projection.applyEvent(e));

      const allBalances = projection.getAllBalances();

      expect(allBalances).toHaveLength(2);
      expect(allBalances.map(v => v.accountId)).toEqual(
        expect.arrayContaining([accountId1, accountId2])
      );
    });

    it('reset should clear all data', () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
      ];

      events.forEach(e => projection.applyEvent(e));

      expect(projection.getBalance(accountId)).not.toBeNull();
      expect(projection.getAllBalances()).toHaveLength(1);

      projection.reset();

      expect(projection.getBalance(accountId)).toBeNull();
      expect(projection.getAllBalances()).toHaveLength(0);
    });
  });

  describe('TransactionHistoryProjection Consistency', () => {
    let projection: InMemoryTransactionHistoryProjection;

    beforeEach(() => {
      projection = new InMemoryTransactionHistoryProjection();
    });

    it('should record transactions correctly', () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .accountCreated('John Doe', 1000, 'CNY')
          .withVersion(1)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
          .withVersion(3)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'withdrawal', 200, 1500, 1300)
          .withVersion(5)
          .build(),
      ];

      events.forEach(e => projection.applyEvent(e));

      const txn1 = projection.getTransaction('txn_001');
      const txn2 = projection.getTransaction('txn_002');

      expect(txn1).not.toBeNull();
      expect(txn1?.type).toBe('deposit');
      expect(txn1?.amount).toBe(500);

      expect(txn2).not.toBeNull();
      expect(txn2?.type).toBe('withdrawal');
      expect(txn2?.amount).toBe(200);
    });

    it('getTransactionsForAccount should return transactions in order', () => {
      const events: AccountDomainEvent[] = [
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

      const transactions = projection.getTransactionsForAccount(accountId);

      expect(transactions).toHaveLength(3);
      expect(transactions[0].transactionId).toBe('txn_001');
      expect(transactions[1].transactionId).toBe('txn_002');
      expect(transactions[2].transactionId).toBe('txn_003');
    });

    it('should support pagination with limit and offset', () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
          .withVersion(3)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'deposit', 200, 100, 300)
          .withVersion(5)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_003', 'deposit', 300, 300, 600)
          .withVersion(7)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_004', 'deposit', 400, 600, 1000)
          .withVersion(9)
          .build(),
      ];

      events.forEach(e => projection.applyEvent(e));

      const page1 = projection.getTransactionsForAccount(accountId, { limit: 2, offset: 0 });
      const page2 = projection.getTransactionsForAccount(accountId, { limit: 2, offset: 2 });

      expect(page1).toHaveLength(2);
      expect(page1[0].transactionId).toBe('txn_001');
      expect(page1[1].transactionId).toBe('txn_002');

      expect(page2).toHaveLength(2);
      expect(page2[0].transactionId).toBe('txn_003');
      expect(page2[1].transactionId).toBe('txn_004');
    });

    it('getTransactionCount should return correct count', () => {
      expect(projection.getTransactionCount(accountId)).toBe(0);

      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
          .withVersion(3)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'deposit', 200, 100, 300)
          .withVersion(5)
          .build(),
      ];

      events.forEach(e => projection.applyEvent(e));

      expect(projection.getTransactionCount(accountId)).toBe(2);
    });

    it('should ignore duplicate transactions', () => {
      const event = EventBuilder.anEvent(accountId)
        .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
        .withVersion(3)
        .build();

      projection.applyEvent(event);
      projection.applyEvent(event);
      projection.applyEvent(event);

      expect(projection.getTransactionCount(accountId)).toBe(1);
      const transactions = projection.getTransactionsForAccount(accountId);
      expect(transactions).toHaveLength(1);
    });

    it('getTransaction should return null for non-existent transaction', () => {
      const transaction = projection.getTransaction('non_existent');
      expect(transaction).toBeNull();
    });

    it('getTransactionsForAccount should return empty array for non-existent account', () => {
      const transactions = projection.getTransactionsForAccount('non_existent');
      expect(transactions).toHaveLength(0);
    });

    it('reset should clear all transaction data', () => {
      const events: AccountDomainEvent[] = [
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_001', 'deposit', 100, 0, 100)
          .withVersion(3)
          .build(),
      ];

      projection.applyEvent(events[0]);

      expect(projection.getTransaction('txn_001')).not.toBeNull();
      expect(projection.getTransactionCount(accountId)).toBe(1);

      projection.reset();

      expect(projection.getTransaction('txn_001')).toBeNull();
      expect(projection.getTransactionCount(accountId)).toBe(0);
      expect(projection.getTransactionsForAccount(accountId)).toHaveLength(0);
    });
  });

  describe('Cross-Projection Consistency', () => {
    let balanceProjection: InMemoryAccountBalanceProjection;
    let historyProjection: InMemoryTransactionHistoryProjection;

    beforeEach(() => {
      balanceProjection = new InMemoryAccountBalanceProjection();
      historyProjection = new InMemoryTransactionHistoryProjection();
    });

    it('both projections should process same event stream independently', () => {
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

      events.forEach(e => {
        balanceProjection.applyEvent(e);
        historyProjection.applyEvent(e);
      });

      const balanceView = balanceProjection.getBalance(accountId);
      const transactions = historyProjection.getTransactionsForAccount(accountId);

      expect(balanceView?.balance).toBe(250);
      expect(transactions).toHaveLength(3);

      const calculatedBalance = transactions.reduce(
        (acc, txn) => (txn.type === 'deposit' ? acc + txn.amount : acc - txn.amount),
        0
      );

      expect(calculatedBalance).toBe(balanceView?.balance);
    });

    it('aggregate transaction count should match projection count', () => {
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
          .moneyWithdrawn('txn_002', 50, 50)
          .withVersion(4)
          .build(),
        EventBuilder.anEvent(accountId)
          .transactionRecorded('txn_002', 'withdrawal', 50, 100, 50)
          .withVersion(5)
          .build(),
      ];

      const aggregateState = AccountAggregate.fromEvents(accountId, events).state;

      events.forEach(e => historyProjection.applyEvent(e));

      expect(historyProjection.getTransactionCount(accountId)).toBe(
        aggregateState.transactionCount
      );
    });
  });

  describe('Full System Projection Consistency', () => {
    it('projections should remain consistent after command processing', async () => {
      const eventStore = new InMemoryEventStore();
      const snapshotStore = new InMemorySnapshotStore();
      const snapshotService = new SnapshotService(snapshotStore, 100);
      const commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);

      const balanceProjection = new InMemoryAccountBalanceProjection();
      const historyProjection = new InMemoryTransactionHistoryProjection();

      commandHandler.subscribe(AccountEventType.ACCOUNT_CREATED, async (event) => {
        balanceProjection.applyEvent(event);
        historyProjection.applyEvent(event);
      });

      commandHandler.subscribe(AccountEventType.MONEY_DEPOSITED, async (event) => {
        balanceProjection.applyEvent(event);
        historyProjection.applyEvent(event);
      });

      commandHandler.subscribe(AccountEventType.MONEY_WITHDRAWN, async (event) => {
        balanceProjection.applyEvent(event);
        historyProjection.applyEvent(event);
      });

      commandHandler.subscribe(AccountEventType.TRANSACTION_RECORDED, async (event) => {
        balanceProjection.applyEvent(event);
        historyProjection.applyEvent(event);
      });

      commandHandler.subscribe(AccountEventType.OVERDRAFT_STARTED, async (event) => {
        balanceProjection.applyEvent(event);
      });

      commandHandler.subscribe(AccountEventType.OVERDRAFT_RESOLVED, async (event) => {
        balanceProjection.applyEvent(event);
      });

      commandHandler.subscribe(AccountEventType.ACCOUNT_CLOSED, async (event) => {
        balanceProjection.applyEvent(event);
      });

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 500, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_002', 100)
      );

      const allEvents = await eventStore.readEvents(accountId);
      const aggregateState = AccountAggregate.fromEvents(accountId, allEvents).state;

      const balanceView = balanceProjection.getBalance(accountId);
      const transactionCount = historyProjection.getTransactionCount(accountId);

      expect(balanceView?.balance).toBe(aggregateState.balance);
      expect(balanceView?.isOverdrawn).toBe(aggregateState.isOverdrawn);
      expect(balanceView?.isClosed).toBe(aggregateState.isClosed);
      expect(transactionCount).toBe(aggregateState.transactionCount);
    });
  });

  describe('Projection Event Order Independence', () => {
    it('TransactionRecorded and MoneyDeposited order should not affect final state', () => {
      const projection1 = new InMemoryTransactionHistoryProjection();
      const projection2 = new InMemoryTransactionHistoryProjection();

      const recordEvent = EventBuilder.anEvent(accountId)
        .transactionRecorded('txn_001', 'deposit', 500, 1000, 1500)
        .withVersion(3)
        .build();

      const depositEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_001', 500, 1500)
        .withVersion(2)
        .build();

      projection1.applyEvent(recordEvent);
      projection1.applyEvent(depositEvent);

      projection2.applyEvent(depositEvent);
      projection2.applyEvent(recordEvent);

      const txn1 = projection1.getTransaction('txn_001');
      const txn2 = projection2.getTransaction('txn_001');

      expect(txn1?.balanceAfter).toBe(txn2?.balanceAfter);
      expect(txn1?.transactionId).toBe(txn2?.transactionId);
    });
  });
});
