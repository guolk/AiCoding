import { AccountId, Money, Version, Timestamp } from '../../src/domain/types';
import { AccountState, createInitialState } from '../../src/domain/account';

export class AccountStateBuilder {
  private state: AccountState;

  constructor(accountId: AccountId = `acc_${Date.now()}`) {
    this.state = {
      ...createInitialState(accountId),
      accountId,
    };
  }

  static anAccount(accountId?: AccountId): AccountStateBuilder {
    return new AccountStateBuilder(accountId);
  }

  withOwnerName(ownerName: string): this {
    this.state = { ...this.state, ownerName };
    return this;
  }

  withBalance(balance: Money): this {
    this.state = { ...this.state, balance };
    if (balance < 0) {
      this.state = { ...this.state, isOverdrawn: true };
    }
    return this;
  }

  withCurrency(currency: string): this {
    this.state = { ...this.state, currency };
    return this;
  }

  overdrawn(): this {
    this.state = { ...this.state, isOverdrawn: true };
    return this;
  }

  notOverdrawn(): this {
    this.state = { ...this.state, isOverdrawn: false };
    return this;
  }

  closed(reason?: string): this {
    this.state = {
      ...this.state,
      isClosed: true,
      closedAt: Date.now(),
    };
    return this;
  }

  withTransactionCount(count: number): this {
    this.state = { ...this.state, transactionCount: count };
    return this;
  }

  withVersion(version: Version): this {
    this.state = { ...this.state, version };
    return this;
  }

  withOpenedAt(timestamp: Timestamp): this {
    this.state = { ...this.state, openedAt: timestamp };
    return this;
  }

  build(): AccountState {
    return { ...this.state };
  }

  buildForDeposit(amount: Money): AccountState {
    const currentBalance = this.state.balance;
    return {
      ...this.state,
      balance: currentBalance + amount,
      transactionCount: this.state.transactionCount + 1,
      version: this.state.version + 2,
    };
  }

  buildForWithdrawal(amount: Money): AccountState {
    const currentBalance = this.state.balance;
    const newBalance = currentBalance - amount;
    return {
      ...this.state,
      balance: newBalance,
      isOverdrawn: newBalance < 0,
      transactionCount: this.state.transactionCount + 1,
      version: this.state.version + (newBalance < 0 ? 3 : 2),
    };
  }
}
