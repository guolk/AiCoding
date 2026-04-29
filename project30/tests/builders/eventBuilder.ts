import { AccountId, TransactionId, Money, Version, Timestamp, EventId } from '../../src/domain/types';
import {
  AccountDomainEvent,
  AccountEventType,
  AccountCreatedPayload,
  MoneyDepositedPayload,
  MoneyWithdrawnPayload,
  TransactionRecordedPayload,
  OverdraftStartedPayload,
  OverdraftResolvedPayload,
  AccountClosedPayload,
} from '../../src/domain/events';

export class EventBuilder {
  private eventId?: EventId;
  private aggregateId: AccountId;
  private eventType: AccountEventType;
  private version: Version = 1;
  private timestamp: Timestamp = Date.now();
  private payload?: Record<string, unknown>;
  private metadata?: Record<string, unknown>;

  constructor(aggregateId: AccountId = `acc_${Date.now()}`) {
    this.aggregateId = aggregateId;
    this.eventType = AccountEventType.ACCOUNT_CREATED;
  }

  static anEvent(aggregateId?: AccountId): EventBuilder {
    return new EventBuilder(aggregateId);
  }

  accountCreated(ownerName: string, initialBalance: Money = 0, currency: string = 'CNY'): this {
    this.eventType = AccountEventType.ACCOUNT_CREATED;
    this.payload = {
      accountId: this.aggregateId,
      ownerName,
      initialBalance,
      currency,
      openedAt: this.timestamp,
    } as AccountCreatedPayload;
    return this;
  }

  moneyDeposited(
    transactionId: TransactionId,
    amount: Money,
    balanceAfter: Money,
    description?: string
  ): this {
    this.eventType = AccountEventType.MONEY_DEPOSITED;
    this.payload = {
      accountId: this.aggregateId,
      transactionId,
      amount,
      balanceAfter,
      description,
      depositedAt: this.timestamp,
    } as MoneyDepositedPayload;
    return this;
  }

  moneyWithdrawn(
    transactionId: TransactionId,
    amount: Money,
    balanceAfter: Money,
    description?: string
  ): this {
    this.eventType = AccountEventType.MONEY_WITHDRAWN;
    this.payload = {
      accountId: this.aggregateId,
      transactionId,
      amount,
      balanceAfter,
      description,
      withdrawnAt: this.timestamp,
    } as MoneyWithdrawnPayload;
    return this;
  }

  transactionRecorded(
    transactionId: TransactionId,
    transactionType: 'deposit' | 'withdrawal' | 'transfer',
    amount: Money,
    balanceBefore: Money,
    balanceAfter: Money,
    counterparty?: AccountId,
    description?: string
  ): this {
    this.eventType = AccountEventType.TRANSACTION_RECORDED;
    this.payload = {
      accountId: this.aggregateId,
      transactionId,
      transactionType,
      amount,
      balanceBefore,
      balanceAfter,
      counterparty,
      description,
      recordedAt: this.timestamp,
    } as TransactionRecordedPayload;
    return this;
  }

  overdraftStarted(
    transactionId: TransactionId,
    overdraftAmount: Money,
    balance: Money
  ): this {
    this.eventType = AccountEventType.OVERDRAFT_STARTED;
    this.payload = {
      accountId: this.aggregateId,
      transactionId,
      overdraftAmount,
      balance,
      startedAt: this.timestamp,
    } as OverdraftStartedPayload;
    return this;
  }

  overdraftResolved(transactionId: TransactionId): this {
    this.eventType = AccountEventType.OVERDRAFT_RESOLVED;
    this.payload = {
      accountId: this.aggregateId,
      transactionId,
      resolvedAt: this.timestamp,
    } as OverdraftResolvedPayload;
    return this;
  }

  accountClosed(reason: string): this {
    this.eventType = AccountEventType.ACCOUNT_CLOSED;
    this.payload = {
      accountId: this.aggregateId,
      reason,
      closedAt: this.timestamp,
    } as AccountClosedPayload;
    return this;
  }

  withVersion(version: Version): this {
    this.version = version;
    return this;
  }

  withTimestamp(timestamp: Timestamp): this {
    this.timestamp = timestamp;
    return this;
  }

  withEventId(eventId: EventId): this {
    this.eventId = eventId;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  build(): AccountDomainEvent {
    if (!this.payload) {
      throw new Error('Event payload must be set before building');
    }

    return {
      eventId: this.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      aggregateId: this.aggregateId,
      aggregateType: 'Account',
      eventType: this.eventType,
      version: this.version,
      timestamp: this.timestamp,
      payload: this.payload,
      metadata: this.metadata,
    };
  }

  buildAsSequence(startVersion: number, count: number): AccountDomainEvent[] {
    const events: AccountDomainEvent[] = [];
    for (let i = 0; i < count; i++) {
      const originalVersion = this.version;
      this.version = startVersion + i;
      events.push(this.build());
      this.version = originalVersion;
    }
    return events;
  }
}

export function createAccountCreatedEvent(
  aggregateId: AccountId,
  version: Version,
  ownerName: string,
  initialBalance: Money = 0,
  currency: string = 'CNY'
): AccountDomainEvent {
  return EventBuilder.anEvent(aggregateId)
    .accountCreated(ownerName, initialBalance, currency)
    .withVersion(version)
    .build();
}

export function createMoneyDepositedEvent(
  aggregateId: AccountId,
  version: Version,
  transactionId: TransactionId,
  amount: Money,
  balanceAfter: Money,
  description?: string
): AccountDomainEvent {
  return EventBuilder.anEvent(aggregateId)
    .moneyDeposited(transactionId, amount, balanceAfter, description)
    .withVersion(version)
    .build();
}

export function createMoneyWithdrawnEvent(
  aggregateId: AccountId,
  version: Version,
  transactionId: TransactionId,
  amount: Money,
  balanceAfter: Money,
  description?: string
): AccountDomainEvent {
  return EventBuilder.anEvent(aggregateId)
    .moneyWithdrawn(transactionId, amount, balanceAfter, description)
    .withVersion(version)
    .build();
}
