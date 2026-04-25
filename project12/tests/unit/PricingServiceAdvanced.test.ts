import { PricingService } from '../../src/services';
import { Coupon, Product } from '../../src/models';
import { 
  CouponType, 
  DiscountRule, 
  DiscountType,
  OrderItem
} from '../../src/types';

describe('PricingService - 高级场景测试', () => {
  let pricingService: PricingService;

  beforeEach(() => {
    pricingService = new PricingService();
  });

  const createOrderItems = (total: number, category?: string): OrderItem[] => [
    { productId: '1', productName: 'Product', quantity: 1, unitPrice: total, subtotal: total }
  ];

  describe('优惠券最大折扣限制', () => {
    test('百分比优惠券应该受最大折扣限制', () => {
      const couponWithMaxDiscount = new Coupon(
        'coupon-max-1',
        'MAX50',
        CouponType.PERCENTAGE,
        50,
        0,
        { maxDiscount: 100 }
      );
      pricingService.addCoupon(couponWithMaxDiscount);

      const orderItems = createOrderItems(300);
      const result = pricingService.calculatePricing(orderItems, ['MAX50']);

      const expectedDiscount = Math.min(300 * 0.5, 100);
      expect(result.couponDiscount).toBe(expectedDiscount);
      expect(result.finalTotal).toBe(300 - expectedDiscount);
    });

    test('最大折扣限制为0时应该不产生折扣', () => {
      const couponWithZeroMax = new Coupon(
        'coupon-zero-1',
        'ZEROMAX',
        CouponType.PERCENTAGE,
        50,
        0,
        { maxDiscount: 0 }
      );
      pricingService.addCoupon(couponWithZeroMax);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['ZEROMAX']);

      expect(result.couponDiscount).toBe(0);
      expect(result.finalTotal).toBe(100);
    });

    test('订单金额小于最大折扣时应该按实际折扣计算', () => {
      const couponWithMaxDiscount = new Coupon(
        'coupon-max-2',
        'BIGMAX',
        CouponType.PERCENTAGE,
        10,
        0,
        { maxDiscount: 1000 }
      );
      pricingService.addCoupon(couponWithMaxDiscount);

      const orderItems = createOrderItems(500);
      const result = pricingService.calculatePricing(orderItems, ['BIGMAX']);

      expect(result.couponDiscount).toBe(50);
      expect(result.finalTotal).toBe(450);
    });
  });

  describe('分类限制的优惠券', () => {
    test('优惠券应该只适用于指定分类', () => {
      const categoryCoupon = new Coupon(
        'coupon-cat-1',
        'ELEC20',
        CouponType.FIXED,
        20,
        0,
        { applicableCategories: ['Electronics'] }
      );
      pricingService.addCoupon(categoryCoupon);

      const electronicsOrder = createOrderItems(100, 'Electronics');
      const electronicsResult = pricingService.calculatePricing(
        electronicsOrder, 
        ['ELEC20'], 
        ['Electronics']
      );
      expect(electronicsResult.couponDiscount).toBe(20);
      expect(electronicsResult.appliedCoupons).toHaveLength(1);

      const booksOrder = createOrderItems(100, 'Books');
      const booksResult = pricingService.calculatePricing(
        booksOrder, 
        ['ELEC20'], 
        ['Books']
      );
      expect(booksResult.couponDiscount).toBe(0);
      expect(booksResult.appliedCoupons).toHaveLength(0);
    });

    test('优惠券适用于多个分类中的任意一个', () => {
      const multiCategoryCoupon = new Coupon(
        'coupon-cat-2',
        'MULTI15',
        CouponType.FIXED,
        15,
        0,
        { applicableCategories: ['Electronics', 'Books'] }
      );
      pricingService.addCoupon(multiCategoryCoupon);

      const result1 = pricingService.calculatePricing(
        createOrderItems(100),
        ['MULTI15'],
        ['Electronics']
      );
      expect(result1.couponDiscount).toBe(15);

      const result2 = pricingService.calculatePricing(
        createOrderItems(100),
        ['MULTI15'],
        ['Books']
      );
      expect(result2.couponDiscount).toBe(15);

      const result3 = pricingService.calculatePricing(
        createOrderItems(100),
        ['MULTI15'],
        ['Clothing']
      );
      expect(result3.couponDiscount).toBe(0);
    });

    test('多个分类的商品混合时应该正确应用', () => {
      const electronicsCoupon = new Coupon(
        'coupon-cat-3',
        'ELEC10',
        CouponType.PERCENTAGE,
        10,
        0,
        { applicableCategories: ['Electronics'] }
      );
      pricingService.addCoupon(electronicsCoupon);

      const mixedCategories = ['Electronics', 'Books'];
      const result = pricingService.calculatePricing(
        createOrderItems(200),
        ['ELEC10'],
        mixedCategories
      );

      expect(result.couponDiscount).toBe(20);
      expect(result.appliedCoupons).toHaveLength(1);
    });
  });

  describe('优惠券使用次数限制', () => {
    test('已达到使用次数限制的优惠券不应该被应用', () => {
      const limitedCoupon = new Coupon(
        'coupon-limit-1',
        'LIMITED5',
        CouponType.FIXED,
        5,
        0,
        { usageLimit: 0, usedCount: 0 }
      );
      pricingService.addCoupon(limitedCoupon);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['LIMITED5']);

      expect(result.couponDiscount).toBe(0);
      expect(result.appliedCoupons).toHaveLength(0);
    });

    test('已使用部分次数的优惠券仍然可以使用', () => {
      const partiallyUsedCoupon = new Coupon(
        'coupon-limit-2',
        'PARTIAL10',
        CouponType.FIXED,
        10,
        0,
        { usageLimit: 5, usedCount: 2 }
      );
      pricingService.addCoupon(partiallyUsedCoupon);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['PARTIAL10']);

      expect(result.couponDiscount).toBe(10);
      expect(result.appliedCoupons).toHaveLength(1);
    });

    test('无使用次数限制的优惠券应该始终可用', () => {
      const unlimitedCoupon = new Coupon(
        'coupon-limit-3',
        'UNLIMITED',
        CouponType.FIXED,
        5,
        0,
        { usedCount: 1000 }
      );
      pricingService.addCoupon(unlimitedCoupon);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['UNLIMITED']);

      expect(result.couponDiscount).toBe(5);
    });
  });

  describe('复杂优惠券叠加场景', () => {
    test('多个可叠加优惠券应该按正确顺序计算', () => {
      const stackable10 = new Coupon(
        'stack-1',
        'STACK10',
        CouponType.PERCENTAGE,
        10,
        0,
        { isStackable: true }
      );
      const stackable5 = new Coupon(
        'stack-2',
        'STACK5',
        CouponType.PERCENTAGE,
        5,
        0,
        { isStackable: true }
      );
      pricingService.addCoupon(stackable10);
      pricingService.addCoupon(stackable5);

      const orderItems = createOrderItems(200);
      const result = pricingService.calculatePricing(orderItems, ['STACK10', 'STACK5']);

      expect(result.appliedCoupons).toHaveLength(2);
      
      const totalDiscount = result.appliedCoupons.reduce((sum, c) => sum + c.discountAmount, 0);
      expect(totalDiscount).toBe(result.couponDiscount);
    });

    test('可叠加优惠券与不可叠加优惠券混合时应该优先应用不可叠加', () => {
      const nonStackable20 = new Coupon(
        'nonstack-1',
        'BIG20',
        CouponType.FIXED,
        20,
        0,
        { isStackable: false }
      );
      const stackable10 = new Coupon(
        'stack-3',
        'SMALL10',
        CouponType.FIXED,
        10,
        0,
        { isStackable: true }
      );
      pricingService.addCoupon(nonStackable20);
      pricingService.addCoupon(stackable10);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['SMALL10', 'BIG20']);

      expect(result.appliedCoupons).toHaveLength(1);
      expect(result.appliedCoupons[0].code).toBe('BIG20');
    });

    test('多个不可叠加优惠券应该选择最优惠的', () => {
      const nonStackable30 = new Coupon(
        'nonstack-2',
        'BEST30',
        CouponType.FIXED,
        30,
        0,
        { isStackable: false }
      );
      const nonStackable20 = new Coupon(
        'nonstack-3',
        'GOOD20',
        CouponType.FIXED,
        20,
        0,
        { isStackable: false }
      );
      pricingService.addCoupon(nonStackable30);
      pricingService.addCoupon(nonStackable20);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['GOOD20', 'BEST30']);

      expect(result.appliedCoupons).toHaveLength(1);
      expect(result.appliedCoupons[0].code).toBe('BEST30');
      expect(result.couponDiscount).toBe(30);
    });
  });

  describe('满减规则复杂场景', () => {
    test('满减规则应该基于原始金额计算', () => {
      const discountRules: DiscountRule[] = [
        {
          id: 'rule-1',
          type: DiscountType.AMOUNT_OFF,
          threshold: 100,
          discount: 10,
          description: '满100减10'
        }
      ];
      discountRules.forEach(rule => pricingService.addDiscountRule(rule));

      const coupon = new Coupon('coupon-1', 'DISCOUNT20', CouponType.FIXED, 20, 0);
      pricingService.addCoupon(coupon);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['DISCOUNT20']);

      expect(result.promoDiscount).toBe(10);
    });

    test('满减规则与优惠券同时应用时应该正确计算', () => {
      const discountRules: DiscountRule[] = [
        {
          id: 'rule-1',
          type: DiscountType.AMOUNT_OFF,
          threshold: 200,
          discount: 20,
          description: '满200减20'
        }
      ];
      discountRules.forEach(rule => pricingService.addDiscountRule(rule));

      const coupon = new Coupon('coupon-1', 'SAVE10', CouponType.PERCENTAGE, 10, 0);
      pricingService.addCoupon(coupon);

      const orderItems = createOrderItems(200);
      const result = pricingService.calculatePricing(orderItems, ['SAVE10']);

      expect(result.originalTotal).toBe(200);
      expect(result.couponDiscount).toBe(20);
      expect(result.promoDiscount).toBe(20);
      expect(result.finalTotal).toBe(160);
    });

    test('多个满减规则应该选择最优惠的', () => {
      const discountRules: DiscountRule[] = [
        {
          id: 'rule-1',
          type: DiscountType.AMOUNT_OFF,
          threshold: 100,
          discount: 10,
          description: '满100减10'
        },
        {
          id: 'rule-2',
          type: DiscountType.AMOUNT_OFF,
          threshold: 200,
          discount: 30,
          description: '满200减30'
        },
        {
          id: 'rule-3',
          type: DiscountType.PERCENTAGE_OFF,
          threshold: 300,
          discount: 20,
          description: '满300享8折'
        }
      ];
      discountRules.forEach(rule => pricingService.addDiscountRule(rule));

      const orderItems150 = createOrderItems(150);
      const result1 = pricingService.calculatePricing(orderItems150, []);
      expect(result1.promoDiscount).toBe(10);

      const orderItems250 = createOrderItems(250);
      const result2 = pricingService.calculatePricing(orderItems250, []);
      expect(result2.promoDiscount).toBe(30);

      const orderItems300 = createOrderItems(300);
      const result3 = pricingService.calculatePricing(orderItems300, []);
      expect(result3.promoDiscount).toBe(60);
    });
  });

  describe('边界情况测试', () => {
    test('订单金额为0时不应该应用任何折扣', () => {
      const coupon = new Coupon('coupon-1', 'FREE', CouponType.FIXED, 10, 0);
      pricingService.addCoupon(coupon);

      const discountRules: DiscountRule[] = [
        {
          id: 'rule-1',
          type: DiscountType.AMOUNT_OFF,
          threshold: 0,
          discount: 5,
          description: '随便减'
        }
      ];
      discountRules.forEach(rule => pricingService.addDiscountRule(rule));

      const orderItems: OrderItem[] = [
        { productId: '1', productName: 'Free', quantity: 1, unitPrice: 0, subtotal: 0 }
      ];
      const result = pricingService.calculatePricing(orderItems, ['FREE']);

      expect(result.originalTotal).toBe(0);
      expect(result.couponDiscount).toBe(0);
      expect(result.promoDiscount).toBe(0);
      expect(result.finalTotal).toBe(0);
    });

    test('折扣后金额不能为负数', () => {
      const bigCoupon = new Coupon('coupon-big', 'BIG500', CouponType.FIXED, 500, 0);
      pricingService.addCoupon(bigCoupon);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['BIG500']);

      expect(result.finalTotal).toBe(0);
    });

    test('多个优惠券叠加后折扣不能超过订单金额', () => {
      const stackableCoupon1 = new Coupon(
        's1',
        'STACK50',
        CouponType.PERCENTAGE,
        50,
        0,
        { isStackable: true }
      );
      const stackableCoupon2 = new Coupon(
        's2',
        'STACK60',
        CouponType.PERCENTAGE,
        60,
        0,
        { isStackable: true }
      );
      pricingService.addCoupon(stackableCoupon1);
      pricingService.addCoupon(stackableCoupon2);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['STACK50', 'STACK60']);

      expect(result.finalTotal).toBeGreaterThanOrEqual(0);
    });
  });

  describe('空值和异常处理', () => {
    test('空优惠券列表应该返回正确计算', () => {
      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, []);

      expect(result.originalTotal).toBe(100);
      expect(result.couponDiscount).toBe(0);
      expect(result.promoDiscount).toBe(0);
      expect(result.finalTotal).toBe(100);
    });

    test('空商品列表应该返回0', () => {
      const orderItems: OrderItem[] = [];
      const result = pricingService.calculatePricing(orderItems, []);

      expect(result.originalTotal).toBe(0);
      expect(result.finalTotal).toBe(0);
    });

    test('重复的优惠券应该只应用一次', () => {
      const coupon = new Coupon('coupon-1', 'SAVE10', CouponType.FIXED, 10, 0);
      pricingService.addCoupon(coupon);

      const orderItems = createOrderItems(100);
      const result = pricingService.calculatePricing(orderItems, ['SAVE10', 'SAVE10', 'SAVE10']);

      expect(result.appliedCoupons).toHaveLength(1);
      expect(result.couponDiscount).toBe(10);
    });

    test('大小写不敏感的优惠券码', () => {
      const coupon = new Coupon('coupon-1', 'SAVE10', CouponType.FIXED, 10, 0);
      pricingService.addCoupon(coupon);

      const orderItems = createOrderItems(100);
      
      const result1 = pricingService.calculatePricing(orderItems, ['save10']);
      const result2 = pricingService.calculatePricing(orderItems, ['Save10']);
      const result3 = pricingService.calculatePricing(orderItems, ['SAVE10']);

      expect(result1.couponDiscount).toBe(10);
      expect(result2.couponDiscount).toBe(10);
      expect(result3.couponDiscount).toBe(10);
    });
  });
});
