import { AccountId, Money, Timestamp } from '../domain/types';
import { AccountDomainEvent, AccountEventType } from '../domain/events';
import {
  AccountCreatedPayload,
  MoneyDepositedPayload,
  MoneyWithdrawnPayload,
  OverdraftStartedPayload,
  OverdraftResolvedPayload,
  AccountClosedPayload,
} from '../domain/events';

export interface AccountBalanceView {
  readonly accountId: AccountId;
  readonly ownerName: string;
  readonly balance: Money;
  readonly currency: string;
  readonly isOverdrawn: boolean;
  readonly isClosed: boolean;
  readonly lastUpdated: Timestamp;
}

export interface AccountBalanceProjection {
  getBalance(accountId: AccountId): AccountBalanceView | null;
  getAllBalances(): AccountBalanceView[];
  applyEvent(event: AccountDomainEvent): void;
  reset(): void;
}

export class InMemoryAccountBalanceProjection implements AccountBalanceProjection {
  private views: Map<AccountId, AccountBalanceView> = new Map();

  getBalance(accountId: AccountId): AccountBalanceView | null {
    return this.views.get(accountId) ?? null;
  }

  getAllBalances(): AccountBalanceView[] {
    return Array.from(this.views.values());
  }

  applyEvent(event: AccountDomainEvent): void {
    switch (event.eventType) {
      case AccountEventType.ACCOUNT_CREATED:
        this.applyAccountCreated(event);
        break;
      case AccountEventType.MONEY_DEPOSITED:
        this.applyMoneyDeposited(event);
        break;
      case AccountEventType.MONEY_WITHDRAWN:
        this.applyMoneyWithdrawn(event);
        break;
      case AccountEventType.OVERDRAFT_STARTED:
        this.applyOverdraftStarted(event);
        break;
      case AccountEventType.OVERDRAFT_RESOLVED:
        this.applyOverdraftResolved(event);
        break;
      case AccountEventType.ACCOUNT_CLOSED:
        this.applyAccountClosed(event);
        break;
    }
  }

  private applyAccountCreated(event: AccountDomainEvent): void {
    const payload = event.payload as AccountCreatedPayload;
    const view: AccountBalanceView = {
      accountId: payload.accountId,
      ownerName: payload.ownerName,
      balance: payload.initialBalance,
      currency: payload.currency,
      isOverdrawn: payload.initialBalance < 0,
      isClosed: false,
      lastUpdated: event.timestamp,
    };
    this.views.set(payload.accountId, view);
  }

  private applyMoneyDeposited(event: AccountDomainEvent): void {
    const payload = event.payload as MoneyDepositedPayload;
    const existingView = this.views.get(payload.accountId);
    if (existingView) {
      this.views.set(payload.accountId, {
        ...existingView,
        balance: payload.balanceAfter,
        lastUpdated: event.timestamp,
      });
    }
  }

  private applyMoneyWithdrawn(event: AccountDomainEvent): void {
    const payload = event.payload as MoneyWithdrawnPayload;
    const existingView = this.views.get(payload.accountId);
    if (existingView) {
      this.views.set(payload.accountId, {
        ...existingView,
        balance: payload.balanceAfter,
        lastUpdated: event.timestamp,
      });
    }
  }

  private applyOverdraftStarted(event: AccountDomainEvent): void {
    const payload = event.payload as OverdraftStartedPayload;
    const existingView = this.views.get(payload.accountId);
    if (existingView) {
      this.views.set(payload.accountId, {
        ...existingView,
        isOverdrawn: true,
        lastUpdated: event.timestamp,
      });
    }
  }

  private applyOverdraftResolved(event: AccountDomainEvent): void {
    const payload = event.payload as OverdraftResolvedPayload;
    const existingView = this.views.get(payload.accountId);
    if (existingView) {
      this.views.set(payload.accountId, {
        ...existingView,
        isOverdrawn: false,
        lastUpdated: event.timestamp,
      });
    }
  }

  private applyAccountClosed(event: AccountDomainEvent): void {
    const payload = event.payload as AccountClosedPayload;
    const existingView = this.views.get(payload.accountId);
    if (existingView) {
      this.views.set(payload.accountId, {
        ...existingView,
        isClosed: true,
        lastUpdated: event.timestamp,
      });
    }
  }

  reset(): void {
    this.views.clear();
  }
}
