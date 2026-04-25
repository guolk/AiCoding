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

describe('HighConcurrency - 高并发抢购测试（1000+用户）', () => {
  let inventoryService: InventoryService;
  let pricingService: PricingService;
  let paymentService: PaymentService;
  let orderService: OrderService;

  beforeEach(() => {
    inventoryService = new InventoryService();
    pricingService = new PricingService();
    paymentService = new PaymentService();
    
    orderService = new OrderService({
      inventoryService,
      pricingService,
      paymentService
    });
  });

  afterEach(() => {
    if (inventoryService) {
      inventoryService.cleanup();
    }
  });

  const createCheckoutRequest = (
    userId: string,
    productId: string = 'limited-prod-1'
  ): CheckoutRequest => ({
    userId,
    items: [
      { productId, quantity: 1 }
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

  describe('极限并发测试 - 1000个用户抢购1件商品', () => {
    test('1000个用户同时抢购1件商品，应该只有1个成功，不会出现超卖', async () => {
      const USER_COUNT = 1000;
      
      const limitedProduct = new Product(
        'limited-prod-1',
        '限量版商品',
        9999,
        1,
        'SKU-LIMITED',
        'Electronics'
      );
      inventoryService.addProduct(limitedProduct);

      const initialStock = inventoryService.getStock('limited-prod-1');
      expect(initialStock).toBe(1);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-${i}`;
        const checkoutRequest = createCheckoutRequest(userId, 'limited-prod-1');
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `High User ${i}`,
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

      console.log(`\n=== 极限并发测试 ===`);
      console.log(`并发用户数: ${USER_COUNT}`);
      console.log(`商品库存: ${initialStock}`);
      console.log(`开始执行...`);

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);
      const insufficientStockErrors = failedOrders.filter(
        r => r.error?.code === CheckoutErrorCode.INSUFFICIENT_STOCK
      );

      console.log(`\n=== 测试结果 ===`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);
      console.log(`库存不足失败数: ${insufficientStockErrors.length}`);

      const finalStock = inventoryService.getStock('limited-prod-1');
      console.log(`最终库存: ${finalStock}`);

      expect(successfulOrders.length).toBe(1);
      expect(failedOrders.length).toBe(USER_COUNT - 1);
      expect(finalStock).toBe(0);
      expect(finalStock).toBeGreaterThanOrEqual(0);

      const paidOrders = orderService.getAllOrders().filter(o => o.status === OrderStatus.PAID);
      expect(paidOrders.length).toBe(1);

      const successfulOrder = successfulOrders[0];
      expect(successfulOrder.order).toBeDefined();
      expect(successfulOrder.order?.status).toBe(OrderStatus.PAID);
      expect(successfulOrder.payment?.success).toBe(true);
    }, 120000);

    test('2000个用户同时抢购1件商品，严格验证无超卖', async () => {
      const USER_COUNT = 2000;
      
      const limitedProduct = new Product(
        'limited-prod-2',
        '超级限量版商品',
        19999,
        1,
        'SKU-SUPER-LIMITED',
        'Electronics'
      );
      inventoryService.addProduct(limitedProduct);

      const initialStock = inventoryService.getStock('limited-prod-2');
      expect(initialStock).toBe(1);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-${i}`;
        const checkoutRequest = createCheckoutRequest(userId, 'limited-prod-2');
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Ultra User ${i}`,
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

      console.log(`\n=== 超极限并发测试 ===`);
      console.log(`并发用户数: ${USER_COUNT}`);
      console.log(`商品库存: ${initialStock}`);

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);

      console.log(`\n=== 测试结果 ===`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);

      const finalStock = inventoryService.getStock('limited-prod-2');
      console.log(`最终库存: ${finalStock}`);
      console.log(`总销售数量: ${initialStock - finalStock}`);

      expect(successfulOrders.length).toBe(1);
      expect(finalStock).toBe(0);
      expect(finalStock).toBeGreaterThanOrEqual(0);

      const totalSold = initialStock - finalStock;
      expect(totalSold).toBe(1);
      expect(totalSold).toBeLessThanOrEqual(initialStock);
    }, 180000);
  });

  describe('多库存高并发测试', () => {
    test('500个用户抢购100件商品，应该100个成功，400个失败', async () => {
      const USER_COUNT = 500;
      const INITIAL_STOCK = 100;
      
      const multiStockProduct = new Product(
        'multi-prod-1',
        '多库存商品',
        1000,
        INITIAL_STOCK,
        'SKU-MULTI',
        'Electronics'
      );
      inventoryService.addProduct(multiStockProduct);

      const initialStock = inventoryService.getStock('multi-prod-1');
      expect(initialStock).toBe(INITIAL_STOCK);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-${i}`;
        const checkoutRequest = createCheckoutRequest(userId, 'multi-prod-1');
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

      console.log(`\n=== 多库存高并发测试 ===`);
      console.log(`并发用户数: ${USER_COUNT}`);
      console.log(`商品库存: ${initialStock}`);

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);

      console.log(`\n=== 测试结果 ===`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);

      const finalStock = inventoryService.getStock('multi-prod-1');
      const totalSold = initialStock - finalStock;

      console.log(`最终库存: ${finalStock}`);
      console.log(`总销售数量: ${totalSold}`);

      expect(successfulOrders.length).toBe(INITIAL_STOCK);
      expect(failedOrders.length).toBe(USER_COUNT - INITIAL_STOCK);
      expect(finalStock).toBe(0);
      expect(finalStock).toBeGreaterThanOrEqual(0);
      expect(totalSold).toBe(INITIAL_STOCK);

      const paidOrders = orderService.getAllOrders().filter(o => o.status === OrderStatus.PAID);
      expect(paidOrders.length).toBe(INITIAL_STOCK);
    }, 120000);

    test('1000个用户抢购500件商品，精确验证销售数量', async () => {
      const USER_COUNT = 1000;
      const INITIAL_STOCK = 500;
      
      const bigStockProduct = new Product(
        'big-prod-1',
        '大库存商品',
        500,
        INITIAL_STOCK,
        'SKU-BIG',
        'Electronics'
      );
      inventoryService.addProduct(bigStockProduct);

      const initialStock = inventoryService.getStock('big-prod-1');
      expect(initialStock).toBe(INITIAL_STOCK);

      const checkoutPromises: Promise<any>[] = [];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-${i}`;
        const checkoutRequest = createCheckoutRequest(userId, 'big-prod-1');
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Big User ${i}`,
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

      console.log(`\n=== 大规模并发测试 ===`);
      console.log(`并发用户数: ${USER_COUNT}`);
      console.log(`商品库存: ${initialStock}`);

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);

      console.log(`\n=== 测试结果 ===`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);

      const finalStock = inventoryService.getStock('big-prod-1');
      const totalSold = initialStock - finalStock;

      console.log(`最终库存: ${finalStock}`);
      console.log(`总销售数量: ${totalSold}`);

      expect(successfulOrders.length).toBe(INITIAL_STOCK);
      expect(finalStock).toBe(0);
      expect(totalSold).toBe(INITIAL_STOCK);
      expect(totalSold).toBeLessThanOrEqual(INITIAL_STOCK);
    }, 180000);
  });

  describe('多商品高并发测试', () => {
    test('300个用户同时抢购3种不同商品，每种100件', async () => {
      const USER_COUNT = 300;
      const STOCK_PER_PRODUCT = 100;

      const products = [
        new Product('product-a', '商品A', 100, STOCK_PER_PRODUCT, 'SKU-A', 'Electronics'),
        new Product('product-b', '商品B', 200, STOCK_PER_PRODUCT, 'SKU-B', 'Books'),
        new Product('product-c', '商品C', 300, STOCK_PER_PRODUCT, 'SKU-C', 'Clothing')
      ];

      products.forEach(p => inventoryService.addProduct(p));

      const checkoutPromises: Promise<any>[] = [];
      const productIds = ['product-a', 'product-b', 'product-c'];

      for (let i = 0; i < USER_COUNT; i++) {
        const userId = `user-${i}`;
        const productId = productIds[i % 3];
        const checkoutRequest = createCheckoutRequest(userId, productId);
        const cardDetails = {
          cardNumber: '4242424242424242',
          cardHolder: `Multi Product User ${i}`,
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

      console.log(`\n=== 多商品高并发测试 ===`);
      console.log(`并发用户数: ${USER_COUNT}`);
      console.log(`商品数量: 3种，每种${STOCK_PER_PRODUCT}件`);

      const results = await Promise.all(checkoutPromises);

      const successfulOrders = results.filter(r => r.success === true);
      const failedOrders = results.filter(r => r.success === false);

      console.log(`\n=== 测试结果 ===`);
      console.log(`总用户数: ${USER_COUNT}`);
      console.log(`成功订单数: ${successfulOrders.length}`);
      console.log(`失败订单数: ${failedOrders.length}`);

      const finalStocks = {
        a: inventoryService.getStock('product-a'),
        b: inventoryService.getStock('product-b'),
        c: inventoryService.getStock('product-c')
      };

      console.log(`商品A最终库存: ${finalStocks.a}`);
      console.log(`商品B最终库存: ${finalStocks.b}`);
      console.log(`商品C最终库存: ${finalStocks.c}`);

      const totalSold = (STOCK_PER_PRODUCT - finalStocks.a) + 
                        (STOCK_PER_PRODUCT - finalStocks.b) + 
                        (STOCK_PER_PRODUCT - finalStocks.c);

      console.log(`总销售数量: ${totalSold}`);

      expect(successfulOrders.length).toBeLessThanOrEqual(STOCK_PER_PRODUCT * 3);
      expect(finalStocks.a).toBeGreaterThanOrEqual(0);
      expect(finalStocks.b).toBeGreaterThanOrEqual(0);
      expect(finalStocks.c).toBeGreaterThanOrEqual(0);
      expect(totalSold).toBeLessThanOrEqual(STOCK_PER_PRODUCT * 3);
    }, 120000);
  });

  describe('压力测试 - 极端场景', () => {
    test('连续多轮抢购测试', async () => {
      const TOTAL_ROUNDS = 10;
      const USERS_PER_ROUND = 200;
      const STOCK_PER_ROUND = 50;

      console.log(`\n=== 连续多轮抢购测试 ===`);
      console.log(`总轮数: ${TOTAL_ROUNDS}`);
      console.log(`每轮用户数: ${USERS_PER_ROUND}`);
      console.log(`每轮库存: ${STOCK_PER_ROUND}`);

      let totalSuccessfulOrders = 0;
      let totalFailedOrders = 0;

      for (let round = 0; round < TOTAL_ROUNDS; round++) {
        const roundInventoryService = new InventoryService();
        const roundPricingService = new PricingService();
        const roundPaymentService = new PaymentService();
        const roundOrderService = new OrderService({
          inventoryService: roundInventoryService,
          pricingService: roundPricingService,
          paymentService: roundPaymentService
        });

        const roundProduct = new Product(
          `round-${round}-prod`,
          `第${round}轮商品`,
          1000,
          STOCK_PER_ROUND,
          `SKU-ROUND-${round}`,
          'Electronics'
        );
        roundInventoryService.addProduct(roundProduct);

        const checkoutPromises: Promise<any>[] = [];

        for (let i = 0; i < USERS_PER_ROUND; i++) {
          const userId = `round-${round}-user-${i}`;
          const checkoutRequest: CheckoutRequest = {
            userId,
            items: [
              { productId: `round-${round}-prod`, quantity: 1 }
            ],
            couponCodes: [],
            shippingAddress: {
              name: `轮次${round}用户${i}`,
              phone: '13800138000',
              province: '广东省',
              city: '深圳市',
              address: '南山区科技园路1号',
              zipCode: '518000'
            }
          };

          const cardDetails = {
            cardNumber: '4242424242424242',
            cardHolder: `Round ${round} User ${i}`,
            expiryDate: '12/28',
            cvv: '123'
          };

          checkoutPromises.push(
            roundOrderService.processCheckout(
              checkoutRequest,
              PaymentMethod.CREDIT_CARD,
              cardDetails
            )
          );
        }

        const results = await Promise.all(checkoutPromises);
        const successful = results.filter(r => r.success === true).length;
        const failed = results.filter(r => r.success === false).length;

        const finalStock = roundInventoryService.getStock(`round-${round}-prod`);

        totalSuccessfulOrders += successful;
        totalFailedOrders += failed;

        console.log(`\n第${round}轮结果:`);
        console.log(`  成功: ${successful}, 失败: ${failed}`);
        console.log(`  最终库存: ${finalStock}`);

        expect(successful).toBe(STOCK_PER_ROUND);
        expect(finalStock).toBe(0);
        expect(finalStock).toBeGreaterThanOrEqual(0);

        roundInventoryService.cleanup();
      }

      console.log(`\n=== 多轮测试汇总 ===`);
      console.log(`总成功订单数: ${totalSuccessfulOrders}`);
      console.log(`总失败订单数: ${totalFailedOrders}`);

      expect(totalSuccessfulOrders).toBe(TOTAL_ROUNDS * STOCK_PER_ROUND);
    }, 300000);
  });
});
