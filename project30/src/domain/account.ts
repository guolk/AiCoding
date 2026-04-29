import {
  AccountId,
  TransactionId,
  Money,
  Version,
  Timestamp,
  CommandValidationError,
} from './types';
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
  createAccountCreatedEvent,
  createMoneyDepositedEvent,
  createMoneyWithdrawnEvent,
  createTransactionRecordedEvent,
  createOverdraftStartedEvent,
  createOverdraftResolvedEvent,
  createAccountClosedEvent,
} from './events';
import {
  AccountCommand,
  AccountCommandType,
  CreateAccountCommand,
  DepositMoneyCommand,
  WithdrawMoneyCommand,
  TransferMoneyCommand,
  CloseAccountCommand,
} from './commands';

export interface AccountState {
  readonly accountId: AccountId;
  readonly ownerName: string;
  readonly balance: Money;
  readonly currency: string;
  readonly isOverdrawn: boolean;
  readonly isClosed: boolean;
  readonly openedAt: Timestamp;
  readonly closedAt?: Timestamp;
  readonly transactionCount: number;
  readonly version: Version;
}

export function createInitialState(accountId: AccountId): AccountState {
  return {
    accountId,
    ownerName: '',
    balance: 0,
    currency: 'CNY',
    isOverdrawn: false,
    isClosed: false,
    openedAt: Date.now(),
    transactionCount: 0,
    version: 0,
  };
}

export class AccountAggregate {
  private _state: AccountState;
  private _uncommittedEvents: AccountDomainEvent[] = [];
  private _baseVersion: Version;

  private constructor(state: AccountState, baseVersion: Version) {
    this._state = state;
    this._baseVersion = baseVersion;
  }

  static create(
    accountId: AccountId,
    ownerName: string,
    initialBalance: Money,
    currency: string = 'CNY'
  ): AccountAggregate {
    const aggregate = new AccountAggregate(createInitialState(accountId), 0);

    const validationErrors = CreateAccountCommandValidator.validate({
      commandType: AccountCommandType.CREATE_ACCOUNT,
      aggregateId: accountId,
      ownerName,
      initialBalance,
      currency,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    const now = Date.now();
    const event = createAccountCreatedEvent(accountId, 1, {
      accountId,
      ownerName,
      initialBalance,
      currency,
      openedAt: now,
    });

    aggregate.apply(event);
    aggregate._uncommittedEvents.push(event);

    return aggregate;
  }

  static fromSnapshot(snapshot: AccountState): AccountAggregate {
    return new AccountAggregate({ ...snapshot }, snapshot.version);
  }

  static fromEvents(accountId: AccountId, events: AccountDomainEvent[]): AccountAggregate {
    const aggregate = new AccountAggregate(createInitialState(accountId), 0);

    for (const event of events) {
      aggregate.apply(event);
    }

    return aggregate;
  }

  get state(): Readonly<AccountState> {
    return this._state;
  }

  get uncommittedEvents(): readonly AccountDomainEvent[] {
    return this._uncommittedEvents;
  }

  get baseVersion(): Version {
    return this._baseVersion;
  }

  get expectedVersion(): Version {
    return this._state.version;
  }

  markCommitted(): void {
    this._uncommittedEvents = [];
    this._baseVersion = this._state.version;
  }

  apply(event: AccountDomainEvent): void {
    const nextVersion = event.version;

    if (nextVersion !== this._state.version + 1 && this._state.version > 0) {
      throw new Error(
        `Event out of order: expected version ${this._state.version + 1}, got ${nextVersion}`
      );
    }

    const previousState = this._state;

    switch (event.eventType) {
      case AccountEventType.ACCOUNT_CREATED:
        this._state = this.applyAccountCreated(
          event.payload as AccountCreatedPayload,
          nextVersion
        );
        break;
      case AccountEventType.MONEY_DEPOSITED:
        this._state = this.applyMoneyDeposited(
          event.payload as MoneyDepositedPayload,
          nextVersion
        );
        break;
      case AccountEventType.MONEY_WITHDRAWN:
        this._state = this.applyMoneyWithdrawn(
          event.payload as MoneyWithdrawnPayload,
          nextVersion
        );
        break;
      case AccountEventType.TRANSACTION_RECORDED:
        this._state = this.applyTransactionRecorded(
          event.payload as TransactionRecordedPayload,
          nextVersion
        );
        break;
      case AccountEventType.OVERDRAFT_STARTED:
        this._state = this.applyOverdraftStarted(
          event.payload as OverdraftStartedPayload,
          nextVersion
        );
        break;
      case AccountEventType.OVERDRAFT_RESOLVED:
        this._state = this.applyOverdraftResolved(
          event.payload as OverdraftResolvedPayload,
          nextVersion
        );
        break;
      case AccountEventType.ACCOUNT_CLOSED:
        this._state = this.applyAccountClosed(
          event.payload as AccountClosedPayload,
          nextVersion
        );
        break;
    }

    if (previousState.balance < 0 && this._state.balance >= 0) {
      this._state = { ...this._state, isOverdrawn: false };
    }
  }

  deposit(transactionId: TransactionId, amount: Money, description?: string): void {
    const validationErrors = DepositMoneyCommandValidator.validate({
      commandType: AccountCommandType.DEPOSIT_MONEY,
      aggregateId: this._state.accountId,
      transactionId,
      amount,
      description,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    if (this._state.isClosed) {
      throw new Error('Cannot deposit to closed account');
    }

    const newBalance = this._state.balance + amount;
    const nextVersion = this._state.version + 1;
    const now = Date.now();

    const wasOverdrawn = this._state.isOverdrawn;

    const depositedEvent = createMoneyDepositedEvent(
      this._state.accountId,
      nextVersion,
      {
        accountId: this._state.accountId,
        transactionId,
        amount,
        balanceAfter: newBalance,
        description,
        depositedAt: now,
      }
    );
    this.apply(depositedEvent);
    this._uncommittedEvents.push(depositedEvent);

    const transactionEvent = createTransactionRecordedEvent(
      this._state.accountId,
      this._state.version + 1,
      {
        accountId: this._state.accountId,
        transactionId,
        transactionType: 'deposit',
        amount,
        balanceBefore: this._state.balance - amount,
        balanceAfter: newBalance,
        description,
        recordedAt: now,
      }
    );
    this.apply(transactionEvent);
    this._uncommittedEvents.push(transactionEvent);

    if (wasOverdrawn && newBalance >= 0) {
      const resolvedEvent = createOverdraftResolvedEvent(
        this._state.accountId,
        this._state.version + 1,
        {
          accountId: this._state.accountId,
          transactionId,
          resolvedAt: now,
        }
      );
      this.apply(resolvedEvent);
      this._uncommittedEvents.push(resolvedEvent);
    }
  }

  withdraw(transactionId: TransactionId, amount: Money, description?: string): void {
    const validationErrors = WithdrawMoneyCommandValidator.validate({
      commandType: AccountCommandType.WITHDRAW_MONEY,
      aggregateId: this._state.accountId,
      transactionId,
      amount,
      description,
    });

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    if (this._state.isClosed) {
      throw new Error('Cannot withdraw from closed account');
    }

    const newBalance = this._state.balance - amount;
    const nextVersion = this._state.version + 1;
    const now = Date.now();

    const wasNotOverdrawn = !this._state.isOverdrawn && this._state.balance >= 0;

    const withdrawnEvent = createMoneyWithdrawnEvent(
      this._state.accountId,
      nextVersion,
      {
        accountId: this._state.accountId,
        transactionId,
        amount,
        balanceAfter: newBalance,
        description,
        withdrawnAt: now,
      }
    );
    this.apply(withdrawnEvent);
    this._uncommittedEvents.push(withdrawnEvent);

    const transactionEvent = createTransactionRecordedEvent(
      this._state.accountId,
      this._state.version + 1,
      {
        accountId: this._state.accountId,
        transactionId,
        transactionType: 'withdrawal',
        amount,
        balanceBefore: this._state.balance + amount,
        balanceAfter: newBalance,
        description,
        recordedAt: now,
      }
    );
    this.apply(transactionEvent);
    this._uncommittedEvents.push(transactionEvent);

    if (wasNotOverdrawn && newBalance < 0) {
      const overdraftEvent = createOverdraftStartedEvent(
        this._state.accountId,
        this._state.version + 1,
        {
          accountId: this._state.accountId,
          transactionId,
          overdraftAmount: Math.abs(newBalance),
          balance: newBalance,
          startedAt: now,
        }
      );
      this.apply(overdraftEvent);
      this._uncommittedEvents.push(overdraftEvent);
    }
  }

  close(reason: string): void {
    if (this._state.isClosed) {
      throw new Error('Account is already closed');
    }

    if (this._state.balance < 0) {
      throw new Error('Cannot close account with negative balance');
    }

    const nextVersion = this._state.version + 1;
    const now = Date.now();

    const event = createAccountClosedEvent(this._state.accountId, nextVersion, {
      accountId: this._state.accountId,
      reason,
      closedAt: now,
    });

    this.apply(event);
    this._uncommittedEvents.push(event);
  }

  private applyAccountCreated(
    payload: AccountCreatedPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      accountId: payload.accountId,
      ownerName: payload.ownerName,
      balance: payload.initialBalance,
      currency: payload.currency,
      openedAt: payload.openedAt,
      version,
    };
  }

  private applyMoneyDeposited(
    payload: MoneyDepositedPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      balance: payload.balanceAfter,
      transactionCount: this._state.transactionCount + 1,
      version,
    };
  }

  private applyMoneyWithdrawn(
    payload: MoneyWithdrawnPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      balance: payload.balanceAfter,
      transactionCount: this._state.transactionCount + 1,
      version,
    };
  }

  private applyTransactionRecorded(
    payload: TransactionRecordedPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      version,
    };
  }

  private applyOverdraftStarted(
    payload: OverdraftStartedPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      isOverdrawn: true,
      version,
    };
  }

  private applyOverdraftResolved(
    payload: OverdraftResolvedPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      isOverdrawn: false,
      version,
    };
  }

  private applyAccountClosed(
    payload: AccountClosedPayload,
    version: Version
  ): AccountState {
    return {
      ...this._state,
      isClosed: true,
      closedAt: payload.closedAt,
      version,
    };
  }
}

export class CreateAccountCommandValidator {
  static validate(command: CreateAccountCommand): CommandValidationError[] {
    const errors: CommandValidationError[] = [];

    if (!command.ownerName || command.ownerName.trim().length === 0) {
      errors.push({
        field: 'ownerName',
        message: 'Owner name cannot be empty',
        code: 'EMPTY_OWNER_NAME',
      });
    } else if (command.ownerName.length > 100) {
      errors.push({
        field: 'ownerName',
        message: 'Owner name cannot exceed 100 characters',
        code: 'OWNER_NAME_TOO_LONG',
      });
    }

    if (command.initialBalance < 0) {
      errors.push({
        field: 'initialBalance',
        message: 'Initial balance cannot be negative',
        code: 'NEGATIVE_INITIAL_BALANCE',
      });
    }

    if (!command.currency || command.currency.length !== 3) {
      errors.push({
        field: 'currency',
        message: 'Currency must be a 3-letter code',
        code: 'INVALID_CURRENCY',
      });
    }

    return errors;
  }
}

export class DepositMoneyCommandValidator {
  static validate(command: DepositMoneyCommand): CommandValidationError[] {
    const errors: CommandValidationError[] = [];

    if (!command.transactionId || command.transactionId.trim().length === 0) {
      errors.push({
        field: 'transactionId',
        message: 'Transaction ID cannot be empty',
        code: 'EMPTY_TRANSACTION_ID',
      });
    }

    if (command.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Deposit amount must be positive',
        code: 'NON_POSITIVE_AMOUNT',
      });
    } else if (!Number.isFinite(command.amount)) {
      errors.push({
        field: 'amount',
        message: 'Deposit amount must be a finite number',
        code: 'INVALID_AMOUNT',
      });
    }

    return errors;
  }
}

export class WithdrawMoneyCommandValidator {
  static validate(command: WithdrawMoneyCommand): CommandValidationError[] {
    const errors: CommandValidationError[] = [];

    if (!command.transactionId || command.transactionId.trim().length === 0) {
      errors.push({
        field: 'transactionId',
        message: 'Transaction ID cannot be empty',
        code: 'EMPTY_TRANSACTION_ID',
      });
    }

    if (command.amount <= 0) {
      errors.push({
        field: 'amount',
        message: 'Withdrawal amount must be positive',
        code: 'NON_POSITIVE_AMOUNT',
      });
    } else if (!Number.isFinite(command.amount)) {
      errors.push({
        field: 'amount',
        message: 'Withdrawal amount must be a finite number',
        code: 'INVALID_AMOUNT',
      });
    }

    return errors;
  }
}

export class CloseAccountCommandValidator {
  static validate(command: CloseAccountCommand): CommandValidationError[] {
    const errors: CommandValidationError[] = [];

    if (!command.reason || command.reason.trim().length === 0) {
      errors.push({
        field: 'reason',
        message: 'Close reason cannot be empty',
        code: 'EMPTY_CLOSE_REASON',
      });
    }

    return errors;
  }
}
