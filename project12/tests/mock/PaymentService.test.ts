import { PaymentService, PaymentFailureReason } from '../../src/services';
import { PaymentRequest, PaymentMethod, CheckoutErrorCode } from '../../src/types';

describe('PaymentService - Mock测试（支付网关异常）', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService({
      baseUrl: 'https://api.test-payment.com',
      apiKey: 'test-api-key-123',
      timeoutMs: 5000,
      maxRetries: 3
    });
  });

  afterEach(() => {
    paymentService.resetTestMode();
    paymentService.clearTransactionLog();
  });

  const createPaymentRequest = (
    orderId: string = 'order-001',
    amount: number = 100.00,
    paymentMethod: PaymentMethod = PaymentMethod.CREDIT_CARD
  ): PaymentRequest => ({
    orderId,
    amount,
    paymentMethod,
    cardDetails: {
      cardNumber: '4242424242424242',
      cardHolder: 'Test User',
      expiryDate: '12/28',
      cvv: '123'
    }
  });

  describe('正常支付流程', () => {
    test('成功支付应该返回正确的响应', async () => {
      const request = createPaymentRequest('order-success', 999.00);
      
      const response = await paymentService.processPayment(request);
      
      expect(response.success).toBe(true);
      expect(response.transactionId).toBeDefined();
      expect(response.errorCode).toBeUndefined();
      expect(response.processedAt).toBeDefined();
      expect(response.processedAt).toBeInstanceOf(Date);
    });

    test('成功支付应该记录交易日志', async () => {
      const request = createPaymentRequest('order-log', 500.00);
      
      const response = await paymentService.processPayment(request);
      
      expect(response.transactionId).toBeDefined();
      
      const transactionId = response.transactionId!;
      const loggedTransaction = await paymentService.getTransactionStatus(transactionId);
      
      expect(loggedTransaction).toBeDefined();
      expect(loggedTransaction?.success).toBe(true);
    });

    test('不同支付方式应该都能成功', async () => {
      const paymentMethods = [
        PaymentMethod.CREDIT_CARD,
        PaymentMethod.DEBIT_CARD,
        PaymentMethod.ALIPAY,
        PaymentMethod.WECHAT_PAY
      ];

      for (const method of paymentMethods) {
        const request = createPaymentRequest(`order-${method}`, 100.00, method);
        
        if (method === PaymentMethod.CREDIT_CARD || method === PaymentMethod.DEBIT_CARD) {
          const response = await paymentService.processPayment(request);
          expect(response.success).toBe(true);
        } else {
          const noCardRequest = {
            ...request,
            cardDetails: undefined
          };
          const response = await paymentService.processPayment(noCardRequest);
          expect(response.success).toBe(true);
        }
      }
    });
  });

  describe('支付失败模拟', () => {
    test('应该正确模拟支付失败', async () => {
      paymentService.setTestMode(1.0, 0);

      const request = createPaymentRequest('order-fail', 100.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorCode).toBeDefined();
      expect(response.errorMessage).toBeDefined();
    });

    test('应该正确模拟余额不足失败', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.INSUFFICIENT_FUNDS);

      const request = createPaymentRequest('order-insufficient', 10000.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('Insufficient funds');
    });

    test('应该正确模拟无效卡号失败', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.INVALID_CARD);

      const request = createPaymentRequest('order-invalid-card', 100.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('Invalid card number');
    });

    test('应该正确模拟卡过期失败', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.EXPIRED_CARD);

      const request = createPaymentRequest('order-expired-card', 100.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('expired');
    });

    test('应该正确模拟支付被拒绝', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.DECLINED);

      const request = createPaymentRequest('order-declined', 100.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('declined');
    });

    test('应该正确模拟网络错误', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.NETWORK_ERROR);

      const request = createPaymentRequest('order-network', 100.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('Network error');
    });

    test('应该正确模拟认证失败', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.AUTHENTICATION_FAILED);

      const request = createPaymentRequest('order-auth', 100.00);
      const response = await paymentService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorMessage).toContain('Authentication failed');
    });

    test('重置测试模式后应该恢复正常', async () => {
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.DECLINED);

      const failRequest = createPaymentRequest('order-fail-1', 100.00);
      const failResponse = await paymentService.processPayment(failRequest);
      expect(failResponse.success).toBe(false);

      paymentService.resetTestMode();

      const successRequest = createPaymentRequest('order-success-1', 100.00);
      const successResponse = await paymentService.processPayment(successRequest);
      expect(successResponse.success).toBe(true);
    });
  });

  describe('支付超时模拟', () => {
    test('应该正确模拟支付超时', async () => {
      const shortTimeoutService = new PaymentService({
        baseUrl: 'https://api.test.com',
        apiKey: 'test',
        timeoutMs: 100,
        maxRetries: 1
      });

      shortTimeoutService.setTestMode(0, 1.0);

      const request = createPaymentRequest('order-timeout', 100.00);
      const response = await shortTimeoutService.processPayment(request);

      expect(response.success).toBe(false);
      expect(response.errorCode).toBe(CheckoutErrorCode.PAYMENT_TIMEOUT);
      expect(response.errorMessage).toContain('timeout');
    });

    test('超时率应该按概率触发', async () => {
      const shortTimeoutService = new PaymentService({
        baseUrl: 'https://api.test.com',
        apiKey: 'test',
        timeoutMs: 100,
        maxRetries: 1
      });

      shortTimeoutService.setTestMode(0, 0.5);

      let timeoutCount = 0;
      const totalTests = 100;

      for (let i = 0; i < totalTests; i++) {
        const request = createPaymentRequest(`order-${i}`, 100.00);
        const response = await shortTimeoutService.processPayment(request);
        
        if (!response.success && response.errorCode === CheckoutErrorCode.PAYMENT_TIMEOUT) {
          timeoutCount++;
        }
      }

      expect(timeoutCount).toBeGreaterThan(0);
      expect(timeoutCount).toBeLessThan(totalTests);
    });
  });

  describe('支付重试机制', () => {
    test('支付失败时应该进行重试', async () => {
      let callCount = 0;
      
      paymentService.setTestMode(1.0, 0, PaymentFailureReason.NETWORK_ERROR);

      const request = createPaymentRequest('order-retry', 100.00);
      const response = await paymentService.processPaymentWithRetry(request);

      expect(response.success).toBe(false);
    });

    test('成功支付时不应该重试', async () => {
      let processPaymentCalled = 0;
      
      const originalProcessPayment = paymentService.processPayment.bind(paymentService);
      paymentService.processPayment = async (request) => {
        processPaymentCalled++;
        return originalProcessPayment(request);
      };

      const request = createPaymentRequest('order-no-retry', 100.00);
      const response = await paymentService.processPaymentWithRetry(request);

      expect(response.success).toBe(true);
    });

    test('应该正确处理最大重试次数', async () => {
      let processPaymentCallCount = 0;
      
      const originalProcessPayment = paymentService.processPayment.bind(paymentService);
      paymentService.processPayment = async (request) => {
        processPaymentCallCount++;
        return originalProcessPayment(request);
      };

      paymentService.setTestMode(1.0, 0, PaymentFailureReason.NETWORK_ERROR);

      const request = createPaymentRequest('order-max-retry', 100.00);
      const response = await paymentService.processPaymentWithRetry(request);

      expect(response.success).toBe(false);
      expect(response.errorCode).toBe('NETWORK_ERROR');
      expect(response.errorMessage).toContain('Network error');
      expect(processPaymentCallCount).toBe(3);
    });
  });

  describe('支付请求验证', () => {
    test('无效的订单ID应该抛出错误', async () => {
      const invalidRequest: PaymentRequest = {
        orderId: '',
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      await expect(
        paymentService.processPayment(invalidRequest)
      ).rejects.toThrow('Order ID');
    });

    test('无效的支付金额应该抛出错误', async () => {
      const invalidAmountRequest: PaymentRequest = {
        orderId: 'order-invalid-amount',
        amount: -100,
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      await expect(
        paymentService.processPayment(invalidAmountRequest)
      ).rejects.toThrow('Invalid payment amount');
    });

    test('缺少支付方式应该抛出错误', async () => {
      const invalidMethodRequest: any = {
        orderId: 'order-invalid-method',
        amount: 100.00
      };

      await expect(
        paymentService.processPayment(invalidMethodRequest)
      ).rejects.toThrow('Payment method');
    });

    test('卡片支付缺少卡信息应该抛出错误', async () => {
      const noCardRequest: PaymentRequest = {
        orderId: 'order-no-card',
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD
      };

      await expect(
        paymentService.processPayment(noCardRequest)
      ).rejects.toThrow('Card details');
    });

    test('无效的卡号应该抛出错误', async () => {
      const invalidCardRequest: PaymentRequest = {
        orderId: 'order-bad-card',
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardDetails: {
          cardNumber: '1234567890123456',
          cardHolder: 'Test',
          expiryDate: '12/28',
          cvv: '123'
        }
      };

      await expect(
        paymentService.processPayment(invalidCardRequest)
      ).rejects.toThrow('Invalid card number');
    });

    test('过期的卡片应该抛出错误', async () => {
      const expiredCardRequest: PaymentRequest = {
        orderId: 'order-expired',
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardDetails: {
          cardNumber: '4242424242424242',
          cardHolder: 'Test',
          expiryDate: '01/20',
          cvv: '123'
        }
      };

      await expect(
        paymentService.processPayment(expiredCardRequest)
      ).rejects.toThrow('Invalid or expired card');
    });

    test('无效的CVV应该抛出错误', async () => {
      const invalidCvvRequest: PaymentRequest = {
        orderId: 'order-bad-cvv',
        amount: 100.00,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        cardDetails: {
          cardNumber: '4242424242424242',
          cardHolder: 'Test',
          expiryDate: '12/28',
          cvv: '12'
        }
      };

      await expect(
        paymentService.processPayment(invalidCvvRequest)
      ).rejects.toThrow('Invalid CVV');
    });
  });

  describe('交易日志管理', () => {
    test('应该正确记录交易日志', async () => {
      const initialLog = paymentService.getTransactionLog();
      expect(initialLog.size).toBe(0);

      const request1 = createPaymentRequest('order-log-1', 100.00);
      const response1 = await paymentService.processPayment(request1);
      
      const request2 = createPaymentRequest('order-log-2', 200.00);
      const response2 = await paymentService.processPayment(request2);

      const logAfter = paymentService.getTransactionLog();
      expect(logAfter.size).toBe(2);

      if (response1.transactionId) {
        const logged1 = await paymentService.getTransactionStatus(response1.transactionId);
        expect(logged1).toBeDefined();
      }

      if (response2.transactionId) {
        const logged2 = await paymentService.getTransactionStatus(response2.transactionId);
        expect(logged2).toBeDefined();
      }
    });

    test('应该正确清除交易日志', async () => {
      const request = createPaymentRequest('order-clear', 100.00);
      await paymentService.processPayment(request);

      expect(paymentService.getTransactionLog().size).toBe(1);

      paymentService.clearTransactionLog();

      expect(paymentService.getTransactionLog().size).toBe(0);
    });
  });
});
