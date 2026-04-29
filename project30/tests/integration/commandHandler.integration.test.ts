import { InMemoryEventStore } from '../../src/infrastructure/eventStore';
import { InMemorySnapshotStore, SnapshotService } from '../../src/infrastructure/snapshotStore';
import { AccountCommandHandler } from '../../src/application/commandHandler';
import { CommandBuilder, EventBuilder } from '../builders';
import {
  CommandValidationException,
  AggregateNotFoundException,
  OptimisticConcurrencyException,
} from '../../src/domain/types';
import { AccountEventType, AccountDomainEvent } from '../../src/domain/events';

describe('AccountCommandHandler - Full Flow Tests', () => {
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

  describe('CreateAccount Command', () => {
    it('should create new account and persist events', async () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY');

      const state = await commandHandler.handle(command);

      expect(state.accountId).toBe(accountId);
      expect(state.ownerName).toBe('John Doe');
      expect(state.balance).toBe(1000);
      expect(state.version).toBe(1);

      const events = await eventStore.readEvents(accountId);
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(AccountEventType.ACCOUNT_CREATED);

      const exists = await eventStore.aggregateExists(accountId);
      expect(exists).toBe(true);
    });

    it('should create account with zero initial balance', async () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('Jane Smith', 0, 'USD');

      const state = await commandHandler.handle(command);

      expect(state.balance).toBe(0);
      expect(state.isOverdrawn).toBe(false);
    });

    it('should throw CommandValidationException when command is invalid', async () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('', 1000, 'CNY');

      await expect(commandHandler.handle(command)).rejects.toThrow(CommandValidationException);
    });

    it('should throw error when account already exists', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('First', 1000, 'CNY')
      );

      await expect(
        commandHandler.handle(
          CommandBuilder.aCommand(accountId).createAccount('Second', 500, 'USD')
        )
      ).rejects.toThrow(`Account ${accountId} already exists`);
    });

    it('should persist events with correct version', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );

      const events = await eventStore.readEvents(accountId);
      expect(events[0].version).toBe(1);

      const version = await eventStore.getCurrentVersion(accountId);
      expect(version).toBe(1);
    });
  });

  describe('DepositMoney Command', () => {
    beforeEach(async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );
    });

    it('should deposit money and update balance', async () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500, 'ATM Deposit');

      const state = await commandHandler.handle(command);

      expect(state.balance).toBe(1500);
      expect(state.transactionCount).toBe(1);
    });

    it('should generate multiple events for deposit', async () => {
      const initialVersion = await eventStore.getCurrentVersion(accountId);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500)
      );

      const events = await eventStore.readEvents(accountId, initialVersion + 1);

      const eventTypes = events.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.MONEY_DEPOSITED);
      expect(eventTypes).toContain(AccountEventType.TRANSACTION_RECORDED);
    });

    it('should throw CommandValidationException for invalid deposit', async () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('', -100);

      await expect(commandHandler.handle(command)).rejects.toThrow(CommandValidationException);
    });

    it('should throw AggregateNotFoundException for non-existent account', async () => {
      const command = CommandBuilder.aCommand('non_existent').depositMoney('txn_001', 500);

      await expect(commandHandler.handle(command)).rejects.toThrow(AggregateNotFoundException);
    });

    it('should increment version after deposit', async () => {
      const versionBefore = await eventStore.getCurrentVersion(accountId);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500)
      );

      const versionAfter = await eventStore.getCurrentVersion(accountId);
      expect(versionAfter).toBeGreaterThan(versionBefore);
    });

    it('should handle multiple deposits', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_003', 300)
      );

      const state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_004', 400)
      );

      expect(state.balance).toBe(1000 + 100 + 200 + 300 + 400);
      expect(state.transactionCount).toBe(4);
    });
  });

  describe('WithdrawMoney Command', () => {
    beforeEach(async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );
    });

    it('should withdraw money and update balance', async () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 300);

      const state = await commandHandler.handle(command);

      expect(state.balance).toBe(700);
      expect(state.transactionCount).toBe(1);
    });

    it('should allow withdrawal resulting in negative balance', async () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 1500);

      const state = await commandHandler.handle(command);

      expect(state.balance).toBe(-500);
      expect(state.isOverdrawn).toBe(true);
    });

    it('should generate OverdraftStarted event when overdraft occurs', async () => {
      const initialVersion = await eventStore.getCurrentVersion(accountId);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 1500)
      );

      const events = await eventStore.readEvents(accountId, initialVersion + 1);
      const eventTypes = events.map(e => e.eventType);

      expect(eventTypes).toContain(AccountEventType.OVERDRAFT_STARTED);
    });

    it('should throw CommandValidationException for invalid withdrawal', async () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('', 0);

      await expect(commandHandler.handle(command)).rejects.toThrow(CommandValidationException);
    });

    it('should throw AggregateNotFoundException for non-existent account', async () => {
      const command = CommandBuilder.aCommand('non_existent').withdrawMoney('txn_001', 100);

      await expect(commandHandler.handle(command)).rejects.toThrow(AggregateNotFoundException);
    });

    it('should handle multiple withdrawals', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 100)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_002', 200)
      );

      const state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_003', 300)
      );

      expect(state.balance).toBe(1000 - 100 - 200 - 300);
      expect(state.transactionCount).toBe(3);
    });
  });

  describe('CloseAccount Command', () => {
    beforeEach(async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );
    });

    it('should close account successfully', async () => {
      const command = CommandBuilder.aCommand(accountId).closeAccount('User requested');

      const state = await commandHandler.handle(command);

      expect(state.isClosed).toBe(true);
      expect(state.closedAt).toBeDefined();
    });

    it('should generate AccountClosed event', async () => {
      const initialVersion = await eventStore.getCurrentVersion(accountId);

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).closeAccount('User requested')
      );

      const events = await eventStore.readEvents(accountId, initialVersion + 1);

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(AccountEventType.ACCOUNT_CLOSED);
    });

    it('should throw CommandValidationException when reason is empty', async () => {
      const command = CommandBuilder.aCommand(accountId).closeAccount('');

      await expect(commandHandler.handle(command)).rejects.toThrow(CommandValidationException);
    });

    it('should throw AggregateNotFoundException for non-existent account', async () => {
      const command = CommandBuilder.aCommand('non_existent').closeAccount('Closing');

      await expect(commandHandler.handle(command)).rejects.toThrow(AggregateNotFoundException);
    });
  });

  describe('Event Subscription and Notification', () => {
    it('should notify subscribed handlers when events are persisted', async () => {
      const receivedEvents: AccountDomainEvent[] = [];

      commandHandler.subscribe(AccountEventType.ACCOUNT_CREATED, async (event) => {
        receivedEvents.push(event);
      });

      commandHandler.subscribe(AccountEventType.MONEY_DEPOSITED, async (event) => {
        receivedEvents.push(event);
      });

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500)
      );

      const eventTypes = receivedEvents.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.ACCOUNT_CREATED);
      expect(eventTypes).toContain(AccountEventType.MONEY_DEPOSITED);
    });

    it('should allow multiple handlers for same event type', async () => {
      let handler1Called = false;
      let handler2Called = false;

      commandHandler.subscribe(AccountEventType.ACCOUNT_CREATED, async () => {
        handler1Called = true;
      });

      commandHandler.subscribe(AccountEventType.ACCOUNT_CREATED, async () => {
        handler2Called = true;
      });

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );

      expect(handler1Called).toBe(true);
      expect(handler2Called).toBe(true);
    });
  });

  describe('Snapshot Auto-Creation', () => {
    beforeEach(() => {
      snapshotService = new SnapshotService(snapshotStore, 2);
      commandHandler = new AccountCommandHandler(eventStore, snapshotStore, snapshotService);
    });

    it('should create snapshot when threshold is reached', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      const snapshotBefore = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshotBefore).toBeNull();

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      const snapshotAfter = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshotAfter).not.toBeNull();
    });

    it('should use snapshot when loading aggregate', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 100)
      );

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_002', 200)
      );

      const snapshot = await snapshotService.getLatestSnapshot(accountId);
      expect(snapshot).not.toBeNull();
      expect(snapshot?.state.balance).toBe(300);

      const state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_003', 300)
      );

      expect(state.balance).toBe(600);
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry when OptimisticConcurrencyException occurs without expectedVersion', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );

      const initialVersion = await eventStore.getCurrentVersion(accountId);

      const competingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_competing', 100, 1100)
        .withVersion(initialVersion + 1)
        .build();

      await eventStore.appendEvents(accountId, [competingEvent], initialVersion);

      const state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 200)
      );

      expect(state.balance).toBe(1000 + 100 + 200);
    });

    it('should not retry when expectedVersion is specified', async () => {
      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNY')
      );

      const initialVersion = await eventStore.getCurrentVersion(accountId);

      const competingEvent = EventBuilder.anEvent(accountId)
        .moneyDeposited('txn_competing', 100, 1100)
        .withVersion(initialVersion + 1)
        .build();

      await eventStore.appendEvents(accountId, [competingEvent], initialVersion);

      await expect(
        commandHandler.handle(
          CommandBuilder.aCommand(accountId)
            .withExpectedVersion(initialVersion)
            .depositMoney('txn_001', 200)
        )
      ).rejects.toThrow(OptimisticConcurrencyException);
    });
  });

  describe('Full Account Lifecycle', () => {
    it('should handle complete account lifecycle', async () => {
      let state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY')
      );
      expect(state.balance).toBe(0);
      expect(state.isClosed).toBe(false);

      state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_001', 1000)
      );
      expect(state.balance).toBe(1000);

      state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).withdrawMoney('txn_002', 300)
      );
      expect(state.balance).toBe(700);

      state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_003', 500)
      );
      expect(state.balance).toBe(1200);

      state = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).closeAccount('User requested closure')
      );
      expect(state.isClosed).toBe(true);
      expect(state.balance).toBe(1200);

      const events = await eventStore.readEvents(accountId);
      expect(events.length).toBeGreaterThan(1);

      const eventTypes = events.map(e => e.eventType);
      expect(eventTypes).toContain(AccountEventType.ACCOUNT_CREATED);
      expect(eventTypes).toContain(AccountEventType.MONEY_DEPOSITED);
      expect(eventTypes).toContain(AccountEventType.MONEY_WITHDRAWN);
      expect(eventTypes).toContain(AccountEventType.ACCOUNT_CLOSED);
    });

    it('should maintain consistency across multiple operations', async () => {
      let totalDeposits = 0;
      let totalWithdrawals = 0;

      await commandHandler.handle(
        CommandBuilder.aCommand(accountId).createAccount('John Doe', 100, 'CNY')
      );

      const deposits = [200, 300, 400];
      const withdrawals = [50, 150];

      for (const amount of deposits) {
        await commandHandler.handle(
          CommandBuilder.aCommand(accountId).depositMoney(`txn_dep_${amount}`, amount)
        );
        totalDeposits += amount;
      }

      for (const amount of withdrawals) {
        await commandHandler.handle(
          CommandBuilder.aCommand(accountId).withdrawMoney(`txn_wd_${amount}`, amount)
        );
        totalWithdrawals += amount;
      }

      const finalState = await commandHandler.handle(
        CommandBuilder.aCommand(accountId).depositMoney('txn_final', 1)
      );

      const expectedBalance = 100 + totalDeposits + 1 - totalWithdrawals;
      expect(finalState.balance).toBe(expectedBalance);
      expect(finalState.transactionCount).toBe(deposits.length + withdrawals.length + 1);
    });
  });

  describe('Unknown Command Type', () => {
    it('should throw error for unknown command type', async () => {
      const unknownCommand = {
        commandType: 'UNKNOWN_COMMAND' as any,
        aggregateId: accountId,
      };

      await expect(commandHandler.handle(unknownCommand)).rejects.toThrow(
        'Unknown command type'
      );
    });
  });
});
