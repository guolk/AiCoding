import { DomainEvent, AccountId, TransactionId, Money, EventId, Version, Timestamp } from './types';

export enum AccountEventType {
  ACCOUNT_CREATED = 'AccountCreated',
  MONEY_DEPOSITED = 'MoneyDeposited',
  MONEY_WITHDRAWN = 'MoneyWithdrawn',
  TRANSACTION_RECORDED = 'TransactionRecorded',
  OVERDRAFT_STARTED = 'OverdraftStarted',
  OVERDRAFT_RESOLVED = 'OverdraftResolved',
  ACCOUNT_CLOSED = 'AccountClosed',
}

export interface AccountCreatedPayload {
  readonly accountId: AccountId;
  readonly ownerName: string;
  readonly initialBalance: Money;
  readonly currency: string;
  readonly openedAt: Timestamp;
}

export interface MoneyDepositedPayload {
  readonly accountId: AccountId;
  readonly transactionId: TransactionId;
  readonly amount: Money;
  readonly balanceAfter: Money;
  readonly description?: string;
  readonly depositedAt: Timestamp;
}

export interface MoneyWithdrawnPayload {
  readonly accountId: AccountId;
  readonly transactionId: TransactionId;
  readonly amount: Money;
  readonly balanceAfter: Money;
  readonly description?: string;
  readonly withdrawnAt: Timestamp;
}

export interface TransactionRecordedPayload {
  readonly accountId: AccountId;
  readonly transactionId: TransactionId;
  readonly transactionType: 'deposit' | 'withdrawal' | 'transfer';
  readonly amount: Money;
  readonly balanceBefore: Money;
  readonly balanceAfter: Money;
  readonly counterparty?: AccountId;
  readonly description?: string;
  readonly recordedAt: Timestamp;
}

export interface OverdraftStartedPayload {
  readonly accountId: AccountId;
  readonly transactionId: TransactionId;
  readonly overdraftAmount: Money;
  readonly balance: Money;
  readonly startedAt: Timestamp;
}

export interface OverdraftResolvedPayload {
  readonly accountId: AccountId;
  readonly transactionId: TransactionId;
  readonly resolvedAt: Timestamp;
}

export interface AccountClosedPayload {
  readonly accountId: AccountId;
  readonly reason: string;
  readonly closedAt: Timestamp;
}

export type AccountEventPayload =
  | AccountCreatedPayload
  | MoneyDepositedPayload
  | MoneyWithdrawnPayload
  | TransactionRecordedPayload
  | OverdraftStartedPayload
  | OverdraftResolvedPayload
  | AccountClosedPayload;

export interface AccountDomainEvent extends DomainEvent {
  readonly aggregateType: 'Account';
  readonly eventType: AccountEventType;
  readonly payload: AccountEventPayload;
}

export function createAccountCreatedEvent(
  aggregateId: AccountId,
  version: Version,
  payload: AccountCreatedPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.ACCOUNT_CREATED,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

export function createMoneyDepositedEvent(
  aggregateId: AccountId,
  version: Version,
  payload: MoneyDepositedPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.MONEY_DEPOSITED,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

export function createMoneyWithdrawnEvent(
  aggregateId: AccountId,
  version: Version,
  payload: MoneyWithdrawnPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.MONEY_WITHDRAWN,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

export function createTransactionRecordedEvent(
  aggregateId: AccountId,
  version: Version,
  payload: TransactionRecordedPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.TRANSACTION_RECORDED,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

export function createOverdraftStartedEvent(
  aggregateId: AccountId,
  version: Version,
  payload: OverdraftStartedPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.OVERDRAFT_STARTED,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

export function createOverdraftResolvedEvent(
  aggregateId: AccountId,
  version: Version,
  payload: OverdraftResolvedPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.OVERDRAFT_RESOLVED,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

export function createAccountClosedEvent(
  aggregateId: AccountId,
  version: Version,
  payload: AccountClosedPayload,
  metadata?: Record<string, unknown>
): AccountDomainEvent {
  return {
    eventId: generateEventId(),
    aggregateId,
    aggregateType: 'Account',
    eventType: AccountEventType.ACCOUNT_CLOSED,
    version,
    timestamp: Date.now(),
    payload,
    metadata,
  };
}

function generateEventId(): EventId {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
