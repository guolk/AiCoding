import { 
  PaymentRequest, 
  PaymentResponse, 
  PaymentMethod,
  CheckoutErrorCode
} from '../types';

const { v4: uuidv4 } = require('uuid');

export enum PaymentFailureReason {
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  INVALID_CARD = 'invalid_card',
  EXPIRED_CARD = 'expired_card',
  DECLINED = 'declined',
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  AUTHENTICATION_FAILED = 'authentication_failed'
}

export interface PaymentGatewayConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
  maxRetries: number;
}

export class PaymentService {
  private config: PaymentGatewayConfig;
  private failureRate: number = 0;
  private timeoutRate: number = 0;
  private forcedFailureReason?: PaymentFailureReason;
  private transactionLog: Map<string, PaymentResponse> = new Map();

  constructor(config?: Partial<PaymentGatewayConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || 'https://api.payment-gateway.example.com',
      apiKey: config?.apiKey || 'test-api-key',
      timeoutMs: config?.timeoutMs || 30000,
      maxRetries: config?.maxRetries || 3
    };
  }

  setTestMode(failureRate: number = 0, timeoutRate: number = 0, forcedFailureReason?: PaymentFailureReason): void {
    this.failureRate = Math.max(0, Math.min(1, failureRate));
    this.timeoutRate = Math.max(0, Math.min(1, timeoutRate));
    this.forcedFailureReason = forcedFailureReason;
  }

  resetTestMode(): void {
    this.failureRate = 0;
    this.timeoutRate = 0;
    this.forcedFailureReason = undefined;
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    this.validatePaymentRequest(request);

    if (this.forcedFailureReason) {
      return this.createFailureResponse(request, this.forcedFailureReason);
    }

    if (this.timeoutRate > 0 && Math.random() < this.timeoutRate) {
      return this.handleTimeout(request);
    }

    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      return this.handleFailure(request);
    }

    return this.handleSuccess(request);
  }

  async processPaymentWithRetry(request: PaymentRequest): Promise<PaymentResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.processPayment(request);
        
        if (response.success) {
          return response;
        }
        
        if (response.errorCode === CheckoutErrorCode.PAYMENT_TIMEOUT ||
            response.errorCode === 'NETWORK_ERROR') {
          if (attempt < this.config.maxRetries) {
            await this.delay(1000 * attempt);
            continue;
          }
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.config.maxRetries) {
          await this.delay(1000 * attempt);
          continue;
        }
      }
    }

    return {
      success: false,
      errorCode: CheckoutErrorCode.PAYMENT_FAILED,
      errorMessage: lastError?.message || 'Payment failed after all retries',
      processedAt: new Date()
    };
  }

  async getTransactionStatus(transactionId: string): Promise<PaymentResponse | undefined> {
    return this.transactionLog.get(transactionId);
  }

  private validatePaymentRequest(request: PaymentRequest): void {
    if (!request.orderId) {
      throw new Error('Order ID is required');
    }
    
    if (!request.amount || request.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    if (!request.paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (request.paymentMethod === PaymentMethod.CREDIT_CARD || 
        request.paymentMethod === PaymentMethod.DEBIT_CARD) {
      if (!request.cardDetails) {
        throw new Error('Card details are required for card payments');
      }
      
      if (!this.validateCardNumber(request.cardDetails.cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      if (!this.validateExpiryDate(request.cardDetails.expiryDate)) {
        throw new Error('Invalid or expired card');
      }
      
      if (!this.validateCvv(request.cardDetails.cvv)) {
        throw new Error('Invalid CVV');
      }
    }
  }

  private validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }
    
    let sum = 0;
    let double = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (double) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      double = !double;
    }
    
    return sum % 10 === 0;
  }

  private validateExpiryDate(expiryDate: string): boolean {
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const year = parseInt(match[2]) + 2000;
    
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const expiry = new Date(year, month - 1);
    
    return expiry >= now;
  }

  private validateCvv(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  private handleSuccess(request: PaymentRequest): PaymentResponse {
    const transactionId = uuidv4();
    const response: PaymentResponse = {
      success: true,
      transactionId,
      processedAt: new Date()
    };
    
    this.transactionLog.set(transactionId, response);
    return response;
  }

  private handleFailure(request: PaymentRequest): PaymentResponse {
    const reasons = [
      PaymentFailureReason.INSUFFICIENT_FUNDS,
      PaymentFailureReason.INVALID_CARD,
      PaymentFailureReason.EXPIRED_CARD,
      PaymentFailureReason.DECLINED,
      PaymentFailureReason.NETWORK_ERROR,
      PaymentFailureReason.AUTHENTICATION_FAILED
    ];
    
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    return this.createFailureResponse(request, reason);
  }

  private handleTimeout(request: PaymentRequest): Promise<PaymentResponse> {
    if (this.timeoutRate > 0) {
      return Promise.resolve({
        success: false,
        errorCode: CheckoutErrorCode.PAYMENT_TIMEOUT,
        errorMessage: 'Payment gateway timeout',
        processedAt: new Date()
      });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          errorCode: CheckoutErrorCode.PAYMENT_TIMEOUT,
          errorMessage: 'Payment gateway timeout',
          processedAt: new Date()
        });
      }, this.config.timeoutMs + 1000);
    });
  }

  private createFailureResponse(
    request: PaymentRequest,
    reason: PaymentFailureReason
  ): PaymentResponse {
    const errorMessages: Record<PaymentFailureReason, string> = {
      [PaymentFailureReason.INSUFFICIENT_FUNDS]: 'Insufficient funds in account',
      [PaymentFailureReason.INVALID_CARD]: 'Invalid card number',
      [PaymentFailureReason.EXPIRED_CARD]: 'Card has expired',
      [PaymentFailureReason.DECLINED]: 'Payment declined by issuer',
      [PaymentFailureReason.NETWORK_ERROR]: 'Network error occurred',
      [PaymentFailureReason.TIMEOUT]: 'Payment gateway timeout',
      [PaymentFailureReason.AUTHENTICATION_FAILED]: 'Authentication failed'
    };

    return {
      success: false,
      errorCode: this.mapFailureToErrorCode(reason),
      errorMessage: errorMessages[reason],
      processedAt: new Date()
    };
  }

  private mapFailureToErrorCode(reason: PaymentFailureReason): string {
    switch (reason) {
      case PaymentFailureReason.TIMEOUT:
        return CheckoutErrorCode.PAYMENT_TIMEOUT;
      case PaymentFailureReason.NETWORK_ERROR:
        return 'NETWORK_ERROR';
      default:
        return CheckoutErrorCode.PAYMENT_FAILED;
    }
  }

  private delay(ms: number): Promise<void> {
    if (this.failureRate > 0 || this.timeoutRate > 0 || this.forcedFailureReason !== undefined) {
      return Promise.resolve();
    }
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTransactionLog(): Map<string, PaymentResponse> {
    return new Map(this.transactionLog);
  }

  clearTransactionLog(): void {
    this.transactionLog.clear();
  }
}
