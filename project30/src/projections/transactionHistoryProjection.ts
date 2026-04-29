import { AccountId, TransactionId, Money, Timestamp } from '../domain/types';
import { AccountDomainEvent, AccountEventType } from '../domain/events';
import {
  TransactionRecordedPayload,
  MoneyDepositedPayload,
  MoneyWithdrawnPayload,
} from '../domain/events';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

export interface TransactionView {
  readonly transactionId: TransactionId;
  readonly accountId: AccountId;
  readonly type: TransactionType;
  readonly amount: Money;
  readonly balanceBefore: Money;
  readonly balanceAfter: Money;
  readonly description?: string;
  readonly counterparty?: AccountId;
  readonly timestamp: Timestamp;
  readonly eventVersion: number;
}

export interface TransactionHistoryProjection {
  getTransaction(transactionId: TransactionId): TransactionView | null;
  getTransactionsForAccount(
    accountId: AccountId,
    options?: { limit?: number; offset?: number }
  ): TransactionView[];
  getTransactionCount(accountId: AccountId): number;
  applyEvent(event: AccountDomainEvent): void;
  reset(): void;
}

export class InMemoryTransactionHistoryProjection implements TransactionHistoryProjection {
  private transactions: Map<TransactionId, TransactionView> = new Map();
  private accountTransactionIds: Map<AccountId, TransactionId[]> = new Map();

  getTransaction(transactionId: TransactionId): TransactionView | null {
    return this.transactions.get(transactionId) ?? null;
  }

  getTransactionsForAccount(
    accountId: AccountId,
    options?: { limit?: number; offset?: number }
  ): TransactionView[] {
    const transactionIds = this.accountTransactionIds.get(accountId) ?? [];
    let result = transactionIds.map(id => this.transactions.get(id)!).filter(Boolean);

    if (options?.offset) {
      result = result.slice(options.offset);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  getTransactionCount(accountId: AccountId): number {
    return this.accountTransactionIds.get(accountId)?.length ?? 0;
  }

  applyEvent(event: AccountDomainEvent): void {
    switch (event.eventType) {
      case AccountEventType.TRANSACTION_RECORDED:
        this.applyTransactionRecorded(event);
        break;
      case AccountEventType.MONEY_DEPOSITED:
        this.applyMoneyDeposited(event);
        break;
      case AccountEventType.MONEY_WITHDRAWN:
        this.applyMoneyWithdrawn(event);
        break;
    }
  }

  private applyTransactionRecorded(event: AccountDomainEvent): void {
    const payload = event.payload as TransactionRecordedPayload;

    const existingView = this.transactions.get(payload.transactionId);
    if (existingView) {
      return;
    }

    const view: TransactionView = {
      transactionId: payload.transactionId,
      accountId: payload.accountId,
      type: payload.transactionType,
      amount: payload.amount,
      balanceBefore: payload.balanceBefore,
      balanceAfter: payload.balanceAfter,
      description: payload.description,
      counterparty: payload.counterparty,
      timestamp: event.timestamp,
      eventVersion: event.version,
    };

    this.transactions.set(payload.transactionId, view);

    const transactionIds = this.accountTransactionIds.get(payload.accountId) ?? [];
    transactionIds.push(payload.transactionId);
    this.accountTransactionIds.set(payload.accountId, transactionIds);
  }

  private applyMoneyDeposited(event: AccountDomainEvent): void {
    const payload = event.payload as MoneyDepositedPayload;
    const existingView = this.transactions.get(payload.transactionId);

    if (!existingView) {
      return;
    }

    this.transactions.set(payload.transactionId, {
      ...existingView,
      balanceAfter: payload.balanceAfter,
    });
  }

  private applyMoneyWithdrawn(event: AccountDomainEvent): void {
    const payload = event.payload as MoneyWithdrawnPayload;
    const existingView = this.transactions.get(payload.transactionId);

    if (!existingView) {
      return;
    }

    this.transactions.set(payload.transactionId, {
      ...existingView,
      balanceAfter: payload.balanceAfter,
    });
  }

  reset(): void {
    this.transactions.clear();
    this.accountTransactionIds.clear();
  }
}
