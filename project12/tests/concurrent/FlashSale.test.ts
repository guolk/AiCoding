import { 
  OrderService, 
  InventoryService, 
  PricingService, 
  PaymentService 
} from '../../src/services';
import { Product } from '../../src/models';
import { 
  CheckoutRequest, 
  OrderStatus, 
  PaymentMethod,
  CheckoutErrorCode
} from '../../src/types';

describe('FlashSale - 并发抢购测试（超卖验证）', () => {
  let inventoryService: InventoryService;
  let pricingService: PricingService;
  let paymentService: PaymentService;
  let orderService: OrderService;
  
  let limitedProduct: Product;

  beforeEach(() => {
    inventoryService = new InventoryService();
    pricingService = new PricingService();
    paymentService = new PaymentService();
    
    orderService = new OrderService({
      inventoryService,
      pricingService,
      paymentService
    });

    limitedProduct = new Product(
      'limited-prod-1',
      '限量版商品',
      9999,
      1,
      'SKU-LIMITED',
      'Electronics'
    );

    inventoryService.addProduct(limitedProduct);
  });

  afterEach(() => {
    if (inventoryService) {
      inventoryService.cleanup();
    }
  });

  const createCheckoutRequest = (
    userId: string
  ): CheckoutRequest => ({
    userId,
    items: [
      { productId: 'limited-prod-1', quantity: 1 }
    ],
    couponCodes: [],
    shippingAddress: {
      name: `用户${userId}`,
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      address: '南山区科技园路1号',
      zipCode: '518000'
    }
  });

  describe('单用户抢购测试', () => {
    test('库存为1时，一个用户应该能成功购买', async () => {
      const initialStock = inventoryService.getStock('limited-prod-1');
      expect(initialStock).toBe(1);

      const checkoutRequest = createCheckoutRequest('user-single');
      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: 'Test User',
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
      
      const remainingStock = inventoryService.getStock('limited-prod-1');
      expect(remainingStock).toBe(0);
    });

    test('库存为0时，用户应该无法购买', async () => {
      await inventoryService.reserveStock('limited-prod-1', 1);
      expect(inventoryService.getStock('limited-prod-1')).toBe(0);

      const checkoutRequest = createCheckoutRequest('user-oos');
      const cardDetails = {
        cardNumber: '4242424242424242',
        cardHolder: 'Test User',
        expiryDate: '12/28',
        cvv: '123'
      };

      const result = await orderService.processCheckout(
        checkoutRequest,
        PaymentMethod.CREDIT_CARD,
        cardDetails
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(CheckoutErrorCode.INSUFFICIENT_STOCK);
    });
  });

  describe('并发抢购测试 - 100个用户抢购1件商品', () => {
    test('100个用户同时抢购，应该只有1个成功，不会出现超卖', async () => {
      const USER_COUNT = 100;
      const initialStock = inventoryService.getStock('limited-prod-1');
      
      expect(initialStock).toBe(1);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-${i}`;
        const checkoutRequest = createCheckoutRequest(userId);
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `User ${i}`,
          expiryDate: '12/28',
          cvv: '123'
        };

        checkoutPromises.push(
          orderService.processCheckout(
            checkoutRequest,
            PaymentMethod.CREDIT_CARD,
            cardDetails
          )
        );
      }

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);

      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);

      expect(successfulOrders.length).toBe(1);
      expect(failedOrders.length).toBe(USER_COUNT - 1);

      const remainingStock = inventoryService.getStock('limited-prod-1');
      expect(remainingStock).toBe(0);

      const allOrders = orderService.getAllOrders();
      const paidOrders = allOrders.filter(o => o.status === OrderStatus.PAID);
      expect(paidOrders.length).toBe(1);

      const successfulOrder = successfulOrders[0];
      expect(successfulOrder.order).toBeDefined();
      expect(successfulOrder.order?.status).toBe(OrderStatus.PAID);
      expect(successfulOrder.payment?.success).toBe(true);

      const insufficientStockErrors = failedOrders.filter(
        r => r.error?.code === CheckoutErrorCode.INSUFFICIENT_STOCK
      );
      expect(insufficientStockErrors.length).toBeGreaterThanOrEqual(USER_COUNT - 1);
    }, 30000);

    test('并发抢购时，库存不应该出现负数', async () => {
      const USER_COUNT = 50;
      const initialStock = inventoryService.getStock('limited-prod-1');
      
      expect(initialStock).toBe(1);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-concurrent-${i}`;
        const checkoutRequest = createCheckoutRequest(userId);
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Concurrent User ${i}`,
          expiryDate: '12/28',
          cvv: '123'
        };

        checkoutPromises.push(
          orderService.processCheckout(
            checkoutRequest,
            PaymentMethod.CREDIT_CARD,
            cardDetails
          )
        );
      }

      await Promise.all(checkoutPromises);

      const finalStock = inventoryService.getStock('limited-prod-1');
      
      expect(finalStock).toBeGreaterThanOrEqual(0);
      expect(finalStock).toBeLessThan(initialStock);
      
      const totalSold = initialStock - finalStock;
      expect(totalSold).toBe(1);
    }, 30000);
  });

  describe('多库存商品并发测试', () => {
    test('库存为10的商品，15个用户抢购，应该10个成功，5个失败', async () => {
      const multiStockProduct = new Product(
        'multi-prod-1',
        '多库存商品',
        1000,
        10,
        'SKU-MULTI',
        'Electronics'
      );
      inventoryService.addProduct(multiStockProduct);

      const USER_COUNT = 15;
      const initialStock = inventoryService.getStock('multi-prod-1');
      
      expect(initialStock).toBe(10);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-multi-${i}`;
        const checkoutRequest: CheckoutRequest = {
          userId,
          items: [
            { productId: 'multi-prod-1', quantity: 1 }
          ],
          couponCodes: [],
          shippingAddress: {
            name: `多库存用户${i}`,
            phone: '13800138000',
            province: '广东省',
            city: '深圳市',
            address: '南山区科技园路1号',
            zipCode: '518000'
          }
        };

        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Multi User ${i}`,
          expiryDate: '12/28',
          cvv: '123'
        };

        checkoutPromises.push(
          orderService.processCheckout(
            checkoutRequest,
            PaymentMethod.CREDIT_CARD,
            cardDetails
          )
        );
      }

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);

      console.log(`多库存商品测试:`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);

      expect(successfulOrders.length).toBe(10);
      expect(failedOrders.length).toBe(5);

      const finalStock = inventoryService.getStock('multi-prod-1');
      expect(finalStock).toBe(0);

      const allOrders = orderService.getAllOrders();
      const paidOrders = allOrders.filter(o => o.status === OrderStatus.PAID);
      expect(paidOrders.length).toBe(10);
    }, 30000);

    test('每个用户购买多件商品的并发测试', async () => {
      const bulkProduct = new Product(
        'bulk-prod-1',
        '批量商品',
        100,
        100,
        'SKU-BULK',
        'Electronics'
      );
      inventoryService.addProduct(bulkProduct);

      const USER_COUNT = 20;
      const ITEMS_PER_USER = 5;
      const expectedSuccessfulUsers = Math.floor(100 / ITEMS_PER_USER);

      const initialStock = inventoryService.getStock('bulk-prod-1');
      expect(initialStock).toBe(100);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-bulk-${i}`;
        const checkoutRequest: CheckoutRequest = {
          userId,
          items: [
            { productId: 'bulk-prod-1', quantity: ITEMS_PER_USER }
          ],
          couponCodes: [],
          shippingAddress: {
            name: `批量用户${i}`,
            phone: '13800138000',
            province: '广东省',
            city: '深圳市',
            address: '南山区科技园路1号',
            zipCode: '518000'
          }
        };

        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Bulk User ${i}`,
          expiryDate: '12/28',
          cvv: '123'
        };

        checkoutPromises.push(
          orderService.processCheckout(
            checkoutRequest,
            PaymentMethod.CREDIT_CARD,
            cardDetails
          )
        );
      }

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      
      console.log(`批量购买测试:`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`每个用户购买数量: ${ITEMS_PER_USER}`);
      console.log(`成功订单数: ${successfulOrders.length}`);

      const finalStock = inventoryService.getStock('bulk-prod-1');
      
      expect(finalStock).toBeGreaterThanOrEqual(0);
      expect(successfulOrders.length).toBe(expectedSuccessfulUsers);
      
      const totalSold = successfulOrders.length * ITEMS_PER_USER;
      expect(totalSold).toBeLessThanOrEqual(initialStock);
    }, 30000);
  });

  describe('并发情况下的数据一致性验证', () => {
    test('成功订单的支付状态应该一致', async () => {
      const USER_COUNT = 20;

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-consist-${i}`;
        const checkoutRequest = createCheckoutRequest(userId);
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Consist User ${i}`,
          expiryDate: '12/28',
          cvv: '123'
        };

        checkoutPromises.push(
          orderService.processCheckout(
            checkoutRequest,
            PaymentMethod.CREDIT_CARD,
            cardDetails
          )
        );
      }

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      
      for (const orderResult of successfulOrders) {
        expect(orderResult.order?.status).toBe(OrderStatus.PAID);
        expect(orderResult.payment?.success).toBe(true);
        expect(orderResult.order?.paymentId).toBeDefined();
        expect(orderResult.payment?.transactionId).toBe(orderResult.order?.paymentId);
      }

      const paidOrders = orderService.getAllOrders().filter(o => o.status === OrderStatus.PAID);
      expect(paidOrders.length).toBe(successfulOrders.length);
    }, 30000);

    test('库存预留状态应该正确更新', async () => {
      const USER_COUNT = 10;

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-reserve-${i}`;
        const checkoutRequest = createCheckoutRequest(userId);
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Reserve User ${i}`,
          expiryDate: '12/28',
          cvv: '123'
        };

        checkoutPromises.push(
          orderService.processCheckout(
            checkoutRequest,
            PaymentMethod.CREDIT_CARD,
            cardDetails
          )
        );
      }

      await Promise.all(checkoutPromises);

      const allReservations = inventoryService.getReservations();
      
      const pendingReservations = allReservations.filter(
        r => r.status === 'pending'
      );
      
      const confirmedReservations = allReservations.filter(
        r => r.status === 'confirmed'
      );

      expect(pendingReservations.length).toBe(0);
      expect(confirmedReservations.length).toBeLessThanOrEqual(1);
    }, 30000);
  });
});
