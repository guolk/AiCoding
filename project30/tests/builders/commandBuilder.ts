import { AccountId, TransactionId, Money, Version } from '../../src/domain/types';
import {
  AccountCommand,
  AccountCommandType,
  CreateAccountCommand,
  DepositMoneyCommand,
  WithdrawMoneyCommand,
  TransferMoneyCommand,
  CloseAccountCommand,
  createCreateAccountCommand,
  createDepositMoneyCommand,
  createWithdrawMoneyCommand,
  createTransferMoneyCommand,
  createCloseAccountCommand,
} from '../../src/domain/commands';

export class CommandBuilder {
  private aggregateId: AccountId;
  private expectedVersion?: Version;
  private metadata?: Record<string, unknown>;

  constructor(aggregateId: AccountId = `acc_${Date.now()}`) {
    this.aggregateId = aggregateId;
  }

  static aCommand(aggregateId?: AccountId): CommandBuilder {
    return new CommandBuilder(aggregateId);
  }

  withExpectedVersion(version: Version): this {
    this.expectedVersion = version;
    return this;
  }

  withMetadata(metadata: Record<string, unknown>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  createAccount(
    ownerName: string,
    initialBalance: Money = 0,
    currency: string = 'CNY'
  ): CreateAccountCommand {
    return createCreateAccountCommand(
      this.aggregateId,
      ownerName,
      initialBalance,
      currency,
      this.expectedVersion,
      this.metadata
    );
  }

  depositMoney(
    transactionId: TransactionId,
    amount: Money,
    description?: string
  ): DepositMoneyCommand {
    return createDepositMoneyCommand(
      this.aggregateId,
      transactionId,
      amount,
      description,
      this.expectedVersion,
      this.metadata
    );
  }

  withdrawMoney(
    transactionId: TransactionId,
    amount: Money,
    description?: string
  ): WithdrawMoneyCommand {
    return createWithdrawMoneyCommand(
      this.aggregateId,
      transactionId,
      amount,
      description,
      this.expectedVersion,
      this.metadata
    );
  }

  transferMoney(
    transactionId: TransactionId,
    targetAccountId: AccountId,
    amount: Money,
    description?: string
  ): TransferMoneyCommand {
    return createTransferMoneyCommand(
      this.aggregateId,
      transactionId,
      targetAccountId,
      amount,
      description,
      this.expectedVersion,
      this.metadata
    );
  }

  closeAccount(reason: string): CloseAccountCommand {
    return createCloseAccountCommand(
      this.aggregateId,
      reason,
      this.expectedVersion,
      this.metadata
    );
  }
}

export function createValidCreateAccountCommand(
  aggregateId?: AccountId
): CreateAccountCommand {
  return CommandBuilder.aCommand(aggregateId).createAccount('John Doe', 1000, 'CNY');
}

export function createValidDepositCommand(
  aggregateId: AccountId,
  amount: Money = 500
): DepositMoneyCommand {
  return CommandBuilder.aCommand(aggregateId).depositMoney(
    `txn_${Date.now()}`,
    amount,
    'Deposit from ATM'
  );
}

export function createValidWithdrawCommand(
  aggregateId: AccountId,
  amount: Money = 200
): WithdrawMoneyCommand {
  return CommandBuilder.aCommand(aggregateId).withdrawMoney(
    `txn_${Date.now()}`,
    amount,
    'Withdrawal from ATM'
  );
}

export function createInvalidDepositCommand(
  aggregateId: AccountId
): DepositMoneyCommand {
  return CommandBuilder.aCommand(aggregateId).depositMoney('', -100);
}

export function createInvalidWithdrawCommand(
  aggregateId: AccountId
): WithdrawMoneyCommand {
  return CommandBuilder.aCommand(aggregateId).withdrawMoney('', 0);
}
