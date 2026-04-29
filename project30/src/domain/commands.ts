import { Command, AccountId, TransactionId, Money, Version } from './types';

export enum AccountCommandType {
  CREATE_ACCOUNT = 'CreateAccount',
  DEPOSIT_MONEY = 'DepositMoney',
  WITHDRAW_MONEY = 'WithdrawMoney',
  TRANSFER_MONEY = 'TransferMoney',
  CLOSE_ACCOUNT = 'CloseAccount',
}

export interface CreateAccountCommand extends Command {
  readonly commandType: AccountCommandType.CREATE_ACCOUNT;
  readonly ownerName: string;
  readonly initialBalance: Money;
  readonly currency: string;
}

export interface DepositMoneyCommand extends Command {
  readonly commandType: AccountCommandType.DEPOSIT_MONEY;
  readonly transactionId: TransactionId;
  readonly amount: Money;
  readonly description?: string;
}

export interface WithdrawMoneyCommand extends Command {
  readonly commandType: AccountCommandType.WITHDRAW_MONEY;
  readonly transactionId: TransactionId;
  readonly amount: Money;
  readonly description?: string;
}

export interface TransferMoneyCommand extends Command {
  readonly commandType: AccountCommandType.TRANSFER_MONEY;
  readonly transactionId: TransactionId;
  readonly targetAccountId: AccountId;
  readonly amount: Money;
  readonly description?: string;
}

export interface CloseAccountCommand extends Command {
  readonly commandType: AccountCommandType.CLOSE_ACCOUNT;
  readonly reason: string;
}

export type AccountCommand =
  | CreateAccountCommand
  | DepositMoneyCommand
  | WithdrawMoneyCommand
  | TransferMoneyCommand
  | CloseAccountCommand;

export function createCreateAccountCommand(
  aggregateId: AccountId,
  ownerName: string,
  initialBalance: Money = 0,
  currency: string = 'CNY',
  expectedVersion?: Version,
  metadata?: Record<string, unknown>
): CreateAccountCommand {
  return {
    commandType: AccountCommandType.CREATE_ACCOUNT,
    aggregateId,
    ownerName,
    initialBalance,
    currency,
    expectedVersion,
    metadata,
  };
}

export function createDepositMoneyCommand(
  aggregateId: AccountId,
  transactionId: TransactionId,
  amount: Money,
  description?: string,
  expectedVersion?: Version,
  metadata?: Record<string, unknown>
): DepositMoneyCommand {
  return {
    commandType: AccountCommandType.DEPOSIT_MONEY,
    aggregateId,
    transactionId,
    amount,
    description,
    expectedVersion,
    metadata,
  };
}

export function createWithdrawMoneyCommand(
  aggregateId: AccountId,
  transactionId: TransactionId,
  amount: Money,
  description?: string,
  expectedVersion?: Version,
  metadata?: Record<string, unknown>
): WithdrawMoneyCommand {
  return {
    commandType: AccountCommandType.WITHDRAW_MONEY,
    aggregateId,
    transactionId,
    amount,
    description,
    expectedVersion,
    metadata,
  };
}

export function createTransferMoneyCommand(
  aggregateId: AccountId,
  transactionId: TransactionId,
  targetAccountId: AccountId,
  amount: Money,
  description?: string,
  expectedVersion?: Version,
  metadata?: Record<string, unknown>
): TransferMoneyCommand {
  return {
    commandType: AccountCommandType.TRANSFER_MONEY,
    aggregateId,
    transactionId,
    targetAccountId,
    amount,
    description,
    expectedVersion,
    metadata,
  };
}

export function createCloseAccountCommand(
  aggregateId: AccountId,
  reason: string,
  expectedVersion?: Version,
  metadata?: Record<string, unknown>
): CloseAccountCommand {
  return {
    commandType: AccountCommandType.CLOSE_ACCOUNT,
    aggregateId,
    reason,
    expectedVersion,
    metadata,
  };
}
