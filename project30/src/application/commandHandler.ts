import {
  AccountId,
  Version,
  OptimisticConcurrencyException,
  AggregateNotFoundException,
  CommandValidationException,
} from '../domain/types';
import { AccountDomainEvent } from '../domain/events';
import {
  AccountCommand,
  AccountCommandType,
  CreateAccountCommand,
  DepositMoneyCommand,
  WithdrawMoneyCommand,
  CloseAccountCommand,
} from '../domain/commands';
import {
  AccountAggregate,
  AccountState,
  CreateAccountCommandValidator,
  DepositMoneyCommandValidator,
  WithdrawMoneyCommandValidator,
  CloseAccountCommandValidator,
} from '../domain/account';
import { EventStore } from '../infrastructure/eventStore';
import { SnapshotStore, SnapshotService } from '../infrastructure/snapshotStore';

export interface CommandHandler {
  handle(command: AccountCommand): Promise<AccountState>;
}

export type EventHandler = (event: AccountDomainEvent) => Promise<void>;

export class AccountCommandHandler implements CommandHandler {
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor(
    private readonly eventStore: EventStore,
    private readonly snapshotStore: SnapshotStore,
    private readonly snapshotService: SnapshotService
  ) {}

  subscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType) ?? [];
    handlers.push(handler);
    this.eventHandlers.set(eventType, handlers);
  }

  async handle(command: AccountCommand): Promise<AccountState> {
    switch (command.commandType) {
      case AccountCommandType.CREATE_ACCOUNT:
        return this.handleCreateAccount(command as CreateAccountCommand);
      case AccountCommandType.DEPOSIT_MONEY:
        return this.handleDepositMoney(command as DepositMoneyCommand);
      case AccountCommandType.WITHDRAW_MONEY:
        return this.handleWithdrawMoney(command as WithdrawMoneyCommand);
      case AccountCommandType.CLOSE_ACCOUNT:
        return this.handleCloseAccount(command as CloseAccountCommand);
      default:
        throw new Error(`Unknown command type: ${(command as AccountCommand).commandType}`);
    }
  }

  private async handleCreateAccount(command: CreateAccountCommand): Promise<AccountState> {
    const validationErrors = CreateAccountCommandValidator.validate(command);
    if (validationErrors.length > 0) {
      throw new CommandValidationException(validationErrors);
    }

    const exists = await this.eventStore.aggregateExists(command.aggregateId);
    if (exists) {
      throw new Error(`Account ${command.aggregateId} already exists`);
    }

    const aggregate = AccountAggregate.create(
      command.aggregateId,
      command.ownerName,
      command.initialBalance,
      command.currency
    );

    await this.eventStore.appendEvents(
      command.aggregateId,
      aggregate.uncommittedEvents,
      aggregate.baseVersion
    );

    await this.notifyEventHandlers(aggregate.uncommittedEvents);

    aggregate.markCommitted();
    return aggregate.state;
  }

  private async handleDepositMoney(command: DepositMoneyCommand): Promise<AccountState> {
    const validationErrors = DepositMoneyCommandValidator.validate(command);
    if (validationErrors.length > 0) {
      throw new CommandValidationException(validationErrors);
    }

    return this.withRetry(async () => {
      const aggregate = await this.loadAggregate(command.aggregateId);

      aggregate.deposit(command.transactionId, command.amount, command.description);

      await this.eventStore.appendEvents(
        command.aggregateId,
        aggregate.uncommittedEvents,
        aggregate.baseVersion
      );

      await this.notifyEventHandlers(aggregate.uncommittedEvents);
      await this.checkAndCreateSnapshot(aggregate);

      aggregate.markCommitted();
      return aggregate.state;
    }, command.expectedVersion);
  }

  private async handleWithdrawMoney(command: WithdrawMoneyCommand): Promise<AccountState> {
    const validationErrors = WithdrawMoneyCommandValidator.validate(command);
    if (validationErrors.length > 0) {
      throw new CommandValidationException(validationErrors);
    }

    return this.withRetry(async () => {
      const aggregate = await this.loadAggregate(command.aggregateId);

      aggregate.withdraw(command.transactionId, command.amount, command.description);

      await this.eventStore.appendEvents(
        command.aggregateId,
        aggregate.uncommittedEvents,
        aggregate.baseVersion
      );

      await this.notifyEventHandlers(aggregate.uncommittedEvents);
      await this.checkAndCreateSnapshot(aggregate);

      aggregate.markCommitted();
      return aggregate.state;
    }, command.expectedVersion);
  }

  private async handleCloseAccount(command: CloseAccountCommand): Promise<AccountState> {
    const validationErrors = CloseAccountCommandValidator.validate(command);
    if (validationErrors.length > 0) {
      throw new CommandValidationException(validationErrors);
    }

    return this.withRetry(async () => {
      const aggregate = await this.loadAggregate(command.aggregateId);

      aggregate.close(command.reason);

      await this.eventStore.appendEvents(
        command.aggregateId,
        aggregate.uncommittedEvents,
        aggregate.baseVersion
      );

      await this.notifyEventHandlers(aggregate.uncommittedEvents);

      aggregate.markCommitted();
      return aggregate.state;
    }, command.expectedVersion);
  }

  private async loadAggregate(aggregateId: AccountId): Promise<AccountAggregate> {
    const latestSnapshot = await this.snapshotService.getLatestSnapshot(aggregateId);

    if (latestSnapshot) {
      const eventsSinceSnapshot = await this.eventStore.readEvents(
        aggregateId,
        latestSnapshot.version + 1
      );

      const aggregate = AccountAggregate.fromSnapshot(latestSnapshot.state);

      for (const event of eventsSinceSnapshot) {
        aggregate.apply(event);
      }

      return aggregate;
    }

    const allEvents = await this.eventStore.readEvents(aggregateId);

    if (allEvents.length === 0) {
      throw new AggregateNotFoundException(aggregateId);
    }

    return AccountAggregate.fromEvents(aggregateId, allEvents);
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    expectedVersion?: Version,
    maxRetries: number = 3
  ): Promise<T> {
    let retries = 0;

    while (retries <= maxRetries) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof OptimisticConcurrencyException) {
          if (expectedVersion !== undefined) {
            throw error;
          }

          retries++;
          if (retries > maxRetries) {
            throw error;
          }

          await this.delay(100 * retries);
        } else {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }

  private async checkAndCreateSnapshot(aggregate: AccountAggregate): Promise<void> {
    const latestSnapshot = await this.snapshotService.getLatestSnapshot(aggregate.state.accountId);
    const lastSnapshotVersion = latestSnapshot?.version ?? 0;
    const eventsSinceLastSnapshot = aggregate.state.version - lastSnapshotVersion;

    if (this.snapshotService.shouldCreateSnapshot(eventsSinceLastSnapshot)) {
      const snapshot = this.snapshotService.createSnapshot(
        aggregate.state.accountId,
        aggregate.state,
        aggregate.state.version
      );
      await this.snapshotService.saveSnapshot(snapshot);
    }
  }

  private async notifyEventHandlers(events: readonly AccountDomainEvent[]): Promise<void> {
    for (const event of events) {
      const handlers = this.eventHandlers.get(event.eventType) ?? [];
      for (const handler of handlers) {
        await handler(event);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
