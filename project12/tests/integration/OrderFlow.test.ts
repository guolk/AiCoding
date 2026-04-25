import { 
  OrderService, 
  InventoryService, 
  PricingService, 
  PaymentService 
} from '../../src/services';
import { Product, Coupon } from '../../src/models';
import { 
  CheckoutRequest, 
  OrderStatus, 
  PaymentMethod,
  CouponType,
  DiscountRule,
  DiscountType
} from '../../src/types';

describe('OrderFlow - 完整下单链路集成测试', () => {
  let inventoryService: InventoryService;
  let pricingService: PricingService;
  let paymentService: PaymentService;
  let orderService: OrderService;
  
  let product1: Product;
  let product2: Product;
  let coupon: Coupon;

  beforeEach(() => {
    inventoryService = new InventoryService();
    pricingService = new PricingService();
    paymentService = new PaymentService();
    
    orderService = new OrderService({
      inventoryService,
      pricingService,
      paymentService
    });

    product1 = new Product(
        'prod-1',
        'iPhone 15',
        6999,
        10,
        'SKU-IPHONE15',
        'Electronics'
      );

    product2 = new Product(
      'prod-2',
      'AirPods Pro',
      1999,
      20,
      'SKU-AIRPODS',
      'Electronics'
    );

    coupon = new Coupon(
      'coupon-1',
      'NEWUSER200',
      CouponType.FIXED,
      200,
      5000,
      { isStackable: false }
    );

    const discountRule: DiscountRule = {
      id: 'promo-1',
      type: DiscountType.AMOUNT_OFF,
      threshold: 8000,
      discount: 500,
      description: '满8000减500'
    };

    inventoryService.addProduct(product1);
    inventoryService.addProduct(product2);
    pricingService.addCoupon(coupon);
    pricingService.addDiscountRule(discountRule);
  });

  const createCheckoutRequest = (
    userId: string,
    items: { productId: string; quantity: number }[],
    couponCodes?: string[]
  ): CheckoutRequest => ({
    userId,
    items,
    couponCodes,
    shippingAddress: {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      address: '南山区科技园路1号',
      zipCode: '518000'
    }
  });

  describe('基础下单流程', () => {
    test('应该成功完成完整下单流程', async () => {
      const initialStock1 = inventoryService.getStock('prod-1');
      const checkoutRequest = createCheckoutRequest('user-123', [
        { productId: 'prod-1', quantity: 1 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '张三',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.payment).toBeDefined();
      expect(result.payment?.success).toBe(true);
      expect(result.order?.status).toBe(OrderStatus.PAID);

      const order = result.order!;
      expect(order.userId).toBe('user-123');
      expect(order.items).toHaveLength(1);
      expect(order.originalTotal).toBe(6999);
      expect(order.finalTotal).toBe(6999);
      expect(order.paymentId).toBeDefined();

      expect(inventoryService.getStock('prod-1')).toBe(initialStock1 - 1);
    });

    test('应该正确应用优惠券和满减', async () => {
      const checkoutRequest = createCheckoutRequest(
        'user-456',
        [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-2', quantity: 1 }
        ],
        ['NEWUSER200']
      );

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '李四',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(true);
      
      const order = result.order!;
      const originalTotal = 6999 + 1999;
      
      expect(order.originalTotal).toBe(originalTotal);
      expect(order.discountAmount).toBeGreaterThan(0);
      expect(order.appliedCoupons).toHaveLength(1);
    });

    test('应该正确处理多件商品下单', async () => {
      const initialStock1 = inventoryService.getStock('prod-1');
      const initialStock2 = inventoryService.getStock('prod-2');

      const checkoutRequest = createCheckoutRequest('user-789', [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 3 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '王五',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(true);
      
      const order = result.order!;
      expect(order.items).toHaveLength(2);
      expect(order.originalTotal).toBe(6999 * 2 + 1999 * 3);

      expect(inventoryService.getStock('prod-1')).toBe(initialStock1 - 2);
      expect(inventoryService.getStock('prod-2')).toBe(initialStock2 - 3);
    });
  });

  describe('订单状态流转', () => {
    test('订单应该按正确的状态流转', async () => {
      const checkoutRequest = createCheckoutRequest('user-abc', [
        { productId: 'prod-1', quantity: 1 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '测试用户',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(true);
      expect(result.order?.status).toBe(OrderStatus.PAID);

      const orderId = result.order!.id;
      const order = orderService.getOrder(orderId);
      
      expect(order).toBeDefined();
      expect(order?.status).toBe(OrderStatus.PAID);
    });
  });

  describe('下单失败回滚机制', () => {
    test('支付失败时应该回滚库存预留', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      
      paymentService.setTestMode(1, 0);

      const checkoutRequest = createCheckoutRequest('user-fail', [
        { productId: 'prod-1', quantity: 1 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '失败用户',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();

      expect(inventoryService.getStock('prod-1')).toBe(initialStock);

      paymentService.resetTestMode();
    });

    test('库存不足时应该拒绝下单', async () => {
      const checkoutRequest = createCheckoutRequest('user-oos', [
        { productId: 'prod-1', quantity: 100 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '库存不足用户',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('insufficient_stock');
    });

    test('无效优惠券应该被忽略但不影响下单', async () => {
      const checkoutRequest = createCheckoutRequest(
        'user-invalid-coupon',
        [
          { productId: 'prod-1', quantity: 1 }
        ],
        ['INVALID-COUPON', 'NEWUSER200']
      );

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '测试用户',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(true);
    });
  });

  describe('订单查询和管理', () => {
    test('应该能正确查询用户订单', async () => {
      const userId = 'user-query-test';

      const checkoutRequest1 = createCheckoutRequest(userId, [
        { productId: 'prod-1', quantity: 1 }
      ]);

      const checkoutRequest2 = createCheckoutRequest(userId, [
        { productId: 'prod-2', quantity: 2 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '查询用户',
        expiryDate: '12/28',
        cvv: '123'
      };

      await orderService.processCheckout(
        checkoutRequest1,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      await orderService.processCheckout(
        checkoutRequest2,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      const userOrders = orderService.getOrdersByUser(userId);
      
      expect(userOrders).toHaveLength(2);
      
      const allOrders = orderService.getAllOrders();
      expect(allOrders.length).toBeGreaterThanOrEqual(2);
    });

    test('应该能正确取消订单', async () => {
      const checkoutRequest = createCheckoutRequest('user-cancel', [
        { productId: 'prod-1', quantity: 1 }
      ]);

      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: '取消用户',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(true);

      const orderId = result.order!.id;
      
      const cancelResult = await orderService.cancelOrder(orderId, '用户主动取消');
      
      expect(cancelResult.success).toBe(true);
      
      const order = orderService.getOrder(orderId);
      expect(order?.status).toBe(OrderStatus.CANCELLED);
    });
  });
});
