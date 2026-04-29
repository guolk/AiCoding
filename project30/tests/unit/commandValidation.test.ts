import {
  CreateAccountCommandValidator,
  DepositMoneyCommandValidator,
  WithdrawMoneyCommandValidator,
  CloseAccountCommandValidator,
} from '../../src/domain/account';
import { AccountCommandType } from '../../src/domain/commands';
import { CommandBuilder, createValidCreateAccountCommand } from '../builders';

describe('Command Validation Tests', () => {
  const accountId = 'acc_001';

  describe('CreateAccountCommandValidator', () => {
    it('should validate successfully for valid command', () => {
      const command = createValidCreateAccountCommand(accountId);

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should fail when ownerName is empty', () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('', 1000, 'CNY');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('ownerName');
      expect(errors[0].code).toBe('EMPTY_OWNER_NAME');
    });

    it('should fail when ownerName is whitespace only', () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('   ', 1000, 'CNY');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('ownerName');
    });

    it('should fail when ownerName exceeds 100 characters', () => {
      const longName = 'A'.repeat(101);
      const command = CommandBuilder.aCommand(accountId).createAccount(longName, 1000, 'CNY');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('ownerName');
      expect(errors[0].code).toBe('OWNER_NAME_TOO_LONG');
    });

    it('should accept ownerName with exactly 100 characters', () => {
      const longName = 'A'.repeat(100);
      const command = CommandBuilder.aCommand(accountId).createAccount(longName, 1000, 'CNY');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should fail when initialBalance is negative', () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('John Doe', -100, 'CNY');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('initialBalance');
      expect(errors[0].code).toBe('NEGATIVE_INITIAL_BALANCE');
    });

    it('should accept zero initial balance', () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('John Doe', 0, 'CNY');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should fail when currency is empty', () => {
      const command = CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, '');

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('currency');
      expect(errors[0].code).toBe('INVALID_CURRENCY');
    });

    it('should fail when currency is not 3 characters', () => {
      const command1 = CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CN');
      const command2 = CommandBuilder.aCommand(accountId).createAccount('John Doe', 1000, 'CNYZ');

      const errors1 = CreateAccountCommandValidator.validate(command1);
      const errors2 = CreateAccountCommandValidator.validate(command2);

      expect(errors1).toHaveLength(1);
      expect(errors2).toHaveLength(1);
    });

    it('should return multiple errors for multiple validation failures', () => {
      const command = {
        commandType: AccountCommandType.CREATE_ACCOUNT as const,
        aggregateId: accountId,
        ownerName: '',
        initialBalance: -100,
        currency: 'US',
      };

      const errors = CreateAccountCommandValidator.validate(command);

      expect(errors.length).toBeGreaterThan(1);
      expect(errors.map(e => e.field)).toContain('ownerName');
      expect(errors.map(e => e.field)).toContain('initialBalance');
      expect(errors.map(e => e.field)).toContain('currency');
    });
  });

  describe('DepositMoneyCommandValidator', () => {
    it('should validate successfully for valid deposit command', () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500, 'Deposit');

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should fail when transactionId is empty', () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('', 500, 'Deposit');

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('transactionId');
      expect(errors[0].code).toBe('EMPTY_TRANSACTION_ID');
    });

    it('should fail when transactionId is whitespace only', () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('   ', 500, 'Deposit');

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('transactionId');
    });

    it('should fail when amount is zero', () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', 0, 'Deposit');

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('amount');
      expect(errors[0].code).toBe('NON_POSITIVE_AMOUNT');
    });

    it('should fail when amount is negative', () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', -100, 'Deposit');

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('amount');
    });

    it('should fail when amount is not finite', () => {
      const command1 = {
        commandType: AccountCommandType.DEPOSIT_MONEY as const,
        aggregateId: accountId,
        transactionId: 'txn_001',
        amount: Infinity,
      };
      const command2 = {
        commandType: AccountCommandType.DEPOSIT_MONEY as const,
        aggregateId: accountId,
        transactionId: 'txn_001',
        amount: NaN,
      };

      const errors1 = DepositMoneyCommandValidator.validate(command1);
      const errors2 = DepositMoneyCommandValidator.validate(command2);

      expect(errors1).toHaveLength(1);
      expect(errors1[0].code).toBe('INVALID_AMOUNT');
      expect(errors2).toHaveLength(1);
    });

    it('should accept description as undefined', () => {
      const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', 500);

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should return multiple errors for multiple validation failures', () => {
      const command = {
        commandType: AccountCommandType.DEPOSIT_MONEY as const,
        aggregateId: accountId,
        transactionId: '',
        amount: -100,
      };

      const errors = DepositMoneyCommandValidator.validate(command);

      expect(errors.length).toBeGreaterThan(1);
      expect(errors.map(e => e.field)).toContain('transactionId');
      expect(errors.map(e => e.field)).toContain('amount');
    });
  });

  describe('WithdrawMoneyCommandValidator', () => {
    it('should validate successfully for valid withdrawal command', () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 200, 'Withdrawal');

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should fail when transactionId is empty', () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('', 200, 'Withdrawal');

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('transactionId');
    });

    it('should fail when amount is zero', () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 0, 'Withdrawal');

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('amount');
      expect(errors[0].code).toBe('NON_POSITIVE_AMOUNT');
    });

    it('should fail when amount is negative', () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', -50, 'Withdrawal');

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('amount');
    });

    it('should fail when amount is not finite', () => {
      const command = {
        commandType: AccountCommandType.WITHDRAW_MONEY as const,
        aggregateId: accountId,
        transactionId: 'txn_001',
        amount: Infinity,
      };

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].code).toBe('INVALID_AMOUNT');
    });

    it('should accept description as undefined', () => {
      const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 200);

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should return multiple errors for multiple validation failures', () => {
      const command = {
        commandType: AccountCommandType.WITHDRAW_MONEY as const,
        aggregateId: accountId,
        transactionId: '',
        amount: -100,
      };

      const errors = WithdrawMoneyCommandValidator.validate(command);

      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('CloseAccountCommandValidator', () => {
    it('should validate successfully for valid close command', () => {
      const command = CommandBuilder.aCommand(accountId).closeAccount('User requested closure');

      const errors = CloseAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(0);
    });

    it('should fail when reason is empty', () => {
      const command = CommandBuilder.aCommand(accountId).closeAccount('');

      const errors = CloseAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('reason');
      expect(errors[0].code).toBe('EMPTY_CLOSE_REASON');
    });

    it('should fail when reason is whitespace only', () => {
      const command = CommandBuilder.aCommand(accountId).closeAccount('   ');

      const errors = CloseAccountCommandValidator.validate(command);

      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('reason');
    });
  });

  describe('Boundary Value Tests', () => {
    describe('Deposit Amount Boundaries', () => {
      it('should accept very small positive amount', () => {
        const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', 0.01);

        const errors = DepositMoneyCommandValidator.validate(command);

        expect(errors).toHaveLength(0);
      });

      it('should accept very large positive amount', () => {
        const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', Number.MAX_SAFE_INTEGER);

        const errors = DepositMoneyCommandValidator.validate(command);

        expect(errors).toHaveLength(0);
      });

      it('should fail for amount just below zero', () => {
        const command = CommandBuilder.aCommand(accountId).depositMoney('txn_001', -0.01);

        const errors = DepositMoneyCommandValidator.validate(command);

        expect(errors).toHaveLength(1);
        expect(errors[0].field).toBe('amount');
      });
    });

    describe('Withdrawal Amount Boundaries', () => {
      it('should accept very small positive amount', () => {
        const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 0.01);

        const errors = WithdrawMoneyCommandValidator.validate(command);

        expect(errors).toHaveLength(0);
      });

      it('should fail for zero amount', () => {
        const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', 0);

        const errors = WithdrawMoneyCommandValidator.validate(command);

        expect(errors).toHaveLength(1);
        expect(errors[0].field).toBe('amount');
      });

      it('should fail for negative amount', () => {
        const command = CommandBuilder.aCommand(accountId).withdrawMoney('txn_001', -100);

        const errors = WithdrawMoneyCommandValidator.validate(command);

        expect(errors).toHaveLength(1);
      });
    });

    describe('Owner Name Boundaries', () => {
      it('should accept single character name', () => {
        const command = CommandBuilder.aCommand(accountId).createAccount('A', 1000, 'CNY');

        const errors = CreateAccountCommandValidator.validate(command);

        expect(errors).toHaveLength(0);
      });

      it('should accept 100 character name', () => {
        const name = 'A'.repeat(100);
        const command = CommandBuilder.aCommand(accountId).createAccount(name, 1000, 'CNY');

        const errors = CreateAccountCommandValidator.validate(command);

        expect(errors).toHaveLength(0);
      });

      it('should reject 101 character name', () => {
        const name = 'A'.repeat(101);
        const command = CommandBuilder.aCommand(accountId).createAccount(name, 1000, 'CNY');

        const errors = CreateAccountCommandValidator.validate(command);

        expect(errors).toHaveLength(1);
      });
    });
  });

  describe('Combined Validation Scenarios', () => {
    it('should return all errors when multiple fields are invalid', () => {
      const createCommand = {
        commandType: AccountCommandType.CREATE_ACCOUNT as const,
        aggregateId: accountId,
        ownerName: '',
        initialBalance: -100,
        currency: 'US',
      };

      const errors = CreateAccountCommandValidator.validate(createCommand);

      expect(errors).toHaveLength(3);
      expect(errors.map(e => e.field)).toEqual(
        expect.arrayContaining(['ownerName', 'initialBalance', 'currency'])
      );
    });

    it('should return detailed error messages for each validation failure', () => {
      const depositCommand = {
        commandType: AccountCommandType.DEPOSIT_MONEY as const,
        aggregateId: accountId,
        transactionId: '',
        amount: -500,
      };

      const errors = DepositMoneyCommandValidator.validate(depositCommand);

      errors.forEach(error => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('code');
        expect(typeof error.field).toBe('string');
        expect(typeof error.message).toBe('string');
        expect(typeof error.code).toBe('string');
      });
    });
  });
});
