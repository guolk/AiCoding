import { Order } from '../models';
import { Product } from '../models';
import { InventoryService } from './InventoryService';
import { PricingService } from './PricingService';
import { PaymentService } from './PaymentService';
import { 
  CheckoutRequest, 
  CheckoutResult, 
  CheckoutErrorCode,
  CheckoutError,
  OrderStatus,
  PaymentMethod,
  InventoryReservation
} from '../types';

export interface OrderServiceConfig {
  inventoryService: InventoryService;
  pricingService: PricingService;
  paymentService: PaymentService;
}

export class OrderService {
  private inventoryService: InventoryService;
  private pricingService: PricingService;
  private paymentService: PaymentService;
  private orders: Map<string, Order> = new Map();

  constructor(config: OrderServiceConfig) {
    this.inventoryService = config.inventoryService;
    this.pricingService = config.pricingService;
    this.paymentService = config.paymentService;
  }

  async processCheckout(
    request: CheckoutRequest,
    paymentMethod: PaymentMethod = PaymentMethod.CREDIT_CARD,
    cardDetails?: any
  ): Promise<CheckoutResult> {
    let reservations: InventoryReservation[] = [];
    let order: Order | null = null;

    try {
      const validationResult = await this.validateCheckoutRequest(request);
      if (!validationResult.valid) {
        return this.createErrorResult(validationResult.error!);
      }

      const products = validationResult.products!;
      
      const orderItems = this.pricingService.calculateOrderItems(request.items, products);
      
      const categories = products
        .filter(p => p.category)
        .map(p => p.category!)
        .filter((c, i, arr) => arr.indexOf(c) === i);

      const pricingResult = this.pricingService.calculatePricing(
        orderItems,
        request.couponCodes,
        categories
      );

      reservations = await this.inventoryService.reserveMultipleStocks(request.items);

      order = Order.create({
        userId: request.userId,
        items: orderItems,
        originalTotal: pricingResult.originalTotal,
        discountAmount: pricingResult.couponDiscount + pricingResult.promoDiscount,
        finalTotal: pricingResult.finalTotal,
        shippingAddress: request.shippingAddress,
        appliedCoupons: pricingResult.appliedCoupons.map(c => c.couponId)
      });

      this.orders.set(order.id, order);

      order.confirm();

      const paymentRequest = {
        orderId: order.id,
        amount: order.finalTotal,
        paymentMethod,
        cardDetails
      };

      const paymentResponse = await this.paymentService.processPaymentWithRetry(paymentRequest);

      if (!paymentResponse.success) {
        throw this.createCheckoutError(
          paymentResponse.errorMessage || 'Payment failed',
          paymentResponse.errorCode as CheckoutErrorCode || CheckoutErrorCode.PAYMENT_FAILED
        );
      }

      order.markAsPaid(paymentResponse.transactionId!);

      await this.inventoryService.confirmMultipleReservations(
        reservations.map(r => r.id),
        order.id
      );

      return {
        success: true,
        order: order.toJSON(),
        payment: paymentResponse
      };

    } catch (error) {
      if (reservations.length > 0) {
        await this.inventoryService.cancelMultipleReservations(
          reservations.map(r => r.id)
        );
      }

      if (order && order.status !== OrderStatus.PAID) {
        order.cancel();
      }

      const checkoutError = this.isCheckoutError(error)
        ? error 
        : this.createCheckoutError(
            (error as Error).message || 'Unknown error occurred',
            CheckoutErrorCode.VALIDATION_ERROR
          );

      return this.createErrorResult(checkoutError);
    }
  }

  private async validateCheckoutRequest(request: CheckoutRequest): Promise<{
    valid: boolean;
    products?: Product[];
    error?: CheckoutError;
  }> {
    if (!request.userId) {
      return {
        valid: false,
        error: this.createCheckoutError('User ID is required', CheckoutErrorCode.VALIDATION_ERROR)
      };
    }

    if (!request.items || request.items.length === 0) {
      return {
        valid: false,
        error: this.createCheckoutError('At least one item is required', CheckoutErrorCode.VALIDATION_ERROR)
      };
    }

    const products: Product[] = [];
    const invalidProductIds: string[] = [];

    for (const item of request.items) {
      if (item.quantity <= 0) {
        return {
          valid: false,
          error: this.createCheckoutError(
            `Invalid quantity for product ${item.productId}`,
            CheckoutErrorCode.VALIDATION_ERROR
          )
        };
      }

      const product = this.inventoryService.getProduct(item.productId);
      if (!product) {
        invalidProductIds.push(item.productId);
      } else {
        products.push(product);
      }
    }

    if (invalidProductIds.length > 0) {
      return {
        valid: false,
        error: this.createCheckoutError(
          `Products not found: ${invalidProductIds.join(', ')}`,
          CheckoutErrorCode.VALIDATION_ERROR,
          { invalidProductIds }
        )
      };
    }

    const stockCheck = await this.inventoryService.checkMultipleStocks(request.items);
    if (!stockCheck.sufficient) {
      return {
        valid: false,
        error: this.createCheckoutError(
          'Insufficient stock for some products',
          CheckoutErrorCode.INSUFFICIENT_STOCK,
          { insufficientProducts: stockCheck.insufficientProducts }
        )
      };
    }

    if (!request.shippingAddress) {
      return {
        valid: false,
        error: this.createCheckoutError('Shipping address is required', CheckoutErrorCode.VALIDATION_ERROR)
      };
    }

    const { name, phone, province, city, address } = request.shippingAddress;
    if (!name || !phone || !province || !city || !address) {
      return {
        valid: false,
        error: this.createCheckoutError('Incomplete shipping address', CheckoutErrorCode.VALIDATION_ERROR)
      };
    }

    return { valid: true, products };
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values());
  }

  getOrdersByUser(userId: string): Order[] {
    return this.getAllOrders().filter(o => o.userId === userId);
  }

  async cancelOrder(orderId: string, reason?: string): Promise<{
    success: boolean;
    error?: CheckoutError;
  }> {
    const order = this.orders.get(orderId);
    
    if (!order) {
      return {
        success: false,
        error: this.createCheckoutError(`Order ${orderId} not found`, CheckoutErrorCode.VALIDATION_ERROR)
      };
    }

    try {
      order.cancel(reason);

      const pendingReservations = this.inventoryService
        .getReservations()
        .filter(r => r.orderId === orderId && r.status === 'confirmed');

      if (pendingReservations.length > 0) {
        await this.inventoryService.cancelMultipleReservations(
          pendingReservations.map(r => r.id)
        );
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.createCheckoutError(
          (error as Error).message,
          CheckoutErrorCode.VALIDATION_ERROR
        )
      };
    }
  }

  private isCheckoutError(error: unknown): error is CheckoutError {
    return (
      error !== null &&
      error !== undefined &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
    );
  }

  private createCheckoutError(
    message: string,
    code: CheckoutErrorCode,
    details?: any
  ): CheckoutError {
    return { code, message, details };
  }

  private createErrorResult(error: CheckoutError): CheckoutResult {
    return {
      success: false,
      error
    };
  }
}
