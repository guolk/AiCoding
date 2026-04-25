import { PricingService } from '../../src/services';
import { Coupon, Product } from '../../src/models';
import { 
  CouponType, 
  DiscountRule, 
  DiscountType,
  OrderItem,
  CartItem
} from '../../src/types';

describe('PricingService - 优惠券叠加计算逻辑', () => {
  let pricingService: PricingService;
  let percentageCoupon: Coupon;
  let fixedCoupon: Coupon;
  let stackableCoupon1: Coupon;
  let stackableCoupon2: Coupon;
  let nonStackableCoupon: Coupon;
  let freeShippingCoupon: Coupon;

  beforeEach(() => {
    pricingService = new PricingService();
    
    percentageCoupon = new Coupon(
      'coupon-1',
      'SAVE10',
      CouponType.PERCENTAGE,
      10,
      0
    );

    fixedCoupon = new Coupon(
      'coupon-2',
      'FIXED20',
      CouponType.FIXED,
      20,
      100
    );

    stackableCoupon1 = new Coupon(
      'coupon-3',
      'STACK5',
      CouponType.PERCENTAGE,
      5,
      0,
      { isStackable: true }
    );

    stackableCoupon2 = new Coupon(
      'coupon-4',
      'STACK10',
      CouponType.PERCENTAGE,
      10,
      0,
      { isStackable: true }
    );

    nonStackableCoupon = new Coupon(
      'coupon-5',
      'BIGSAVE',
      CouponType.PERCENTAGE,
      15,
      0,
      { isStackable: false }
    );

    freeShippingCoupon = new Coupon(
      'coupon-6',
      'FREESHIP',
      CouponType.FREE_SHIPPING,
      0,
      50
    );

    pricingService.addCoupon(percentageCoupon);
    pricingService.addCoupon(fixedCoupon);
    pricingService.addCoupon(stackableCoupon1);
    pricingService.addCoupon(stackableCoupon2);
    pricingService.addCoupon(nonStackableCoupon);
    pricingService.addCoupon(freeShippingCoupon);
  });

  describe('优惠券基础计算', () => {
    const orderItems: OrderItem[] = [
      { productId: '1', productName: 'Product A', quantity: 2, unitPrice: 50, subtotal: 100 }
    ];

    test('应该正确计算百分比优惠券折扣', () => {
      const result = pricingService.calculatePricing(orderItems, ['SAVE10']);
      
      expect(result.originalTotal).toBe(100);
      expect(result.couponDiscount).toBe(10);
      expect(result.finalTotal).toBe(90);
      expect(result.appliedCoupons).toHaveLength(1);
      expect(result.appliedCoupons[0].code).toBe('SAVE10');
    });

    test('应该正确计算固定金额优惠券折扣', () => {
      const result = pricingService.calculatePricing(orderItems, ['FIXED20']);
      
      expect(result.couponDiscount).toBe(20);
      expect(result.finalTotal).toBe(80);
    });

    test('最低消费金额未达标时不应应用固定金额优惠券', () => {
      const cheapItems: OrderItem[] = [
        { productId: '1', productName: 'Cheap', quantity: 1, unitPrice: 50, subtotal: 50 }
      ];

      const result = pricingService.calculatePricing(cheapItems, ['FIXED20']);
      
      expect(result.couponDiscount).toBe(0);
      expect(result.appliedCoupons).toHaveLength(0);
      expect(result.finalTotal).toBe(50);
    });

    test('免邮费优惠券不应产生金额折扣', () => {
      const result = pricingService.calculatePricing(orderItems, ['FREESHIP']);
      
      expect(result.couponDiscount).toBe(0);
      expect(result.appliedCoupons).toHaveLength(1);
    });
  });

  describe('优惠券叠加规则', () => {
    const orderItems: OrderItem[] = [
      { productId: '1', productName: 'Product A', quantity: 1, unitPrice: 200, subtotal: 200 }
    ];

    test('多个可叠加优惠券应该按顺序应用', () => {
      const result = pricingService.calculatePricing(orderItems, ['STACK5', 'STACK10']);
      
      expect(result.appliedCoupons).toHaveLength(2);
      expect(result.couponDiscount).toBeGreaterThan(0);
      
      const totalDiscount = result.appliedCoupons.reduce((sum, c) => sum + c.discountAmount, 0);
      expect(totalDiscount).toBe(result.couponDiscount);
    });

    test('不可叠加优惠券应该阻止其他优惠券', () => {
      const result = pricingService.calculatePricing(
        orderItems, 
        ['BIGSAVE', 'STACK5', 'STACK10']
      );
      
      expect(result.appliedCoupons).toHaveLength(1);
      expect(result.appliedCoupons[0].code).toBe('BIGSAVE');
    });

    test('优惠券应该按最佳方式排序应用', () => {
      const result = pricingService.calculatePricing(
        orderItems,
        ['SAVE10', 'FIXED20']
      );
      
      expect(result.appliedCoupons).toHaveLength(1);
      
      const percentageDiscount = 200 * 0.1;
      const fixedDiscount = 20;
      
      if (fixedDiscount > percentageDiscount) {
        expect(result.appliedCoupons[0].code).toBe('FIXED20');
      } else {
        expect(result.appliedCoupons[0].code).toBe('SAVE10');
      }
    });
  });

  describe('过期和无效优惠券', () => {
    test('过期优惠券不应该被应用', () => {
      const expiredCoupon = new Coupon(
        'expired-1',
        'EXPIRED',
        CouponType.PERCENTAGE,
        50,
        0,
        {
          validFrom: new Date('2020-01-01'),
          validUntil: new Date('2020-12-31')
        }
      );
      pricingService.addCoupon(expiredCoupon);

      const orderItems: OrderItem[] = [
        { productId: '1', productName: 'Product', quantity: 1, unitPrice: 100, subtotal: 100 }
      ];

      const result = pricingService.calculatePricing(orderItems, ['EXPIRED']);
      
      expect(result.couponDiscount).toBe(0);
      expect(result.appliedCoupons).toHaveLength(0);
    });

    test('不存在的优惠券不应该被应用', () => {
      const orderItems: OrderItem[] = [
        { productId: '1', productName: 'Product', quantity: 1, unitPrice: 100, subtotal: 100 }
      ];

      const result = pricingService.calculatePricing(orderItems, ['NOTEXIST']);
      
      expect(result.couponDiscount).toBe(0);
      expect(result.appliedCoupons).toHaveLength(0);
    });
  });

  describe('验证优惠券功能', () => {
    test('应该正确验证有效优惠券', () => {
      const result = pricingService.validateCoupon('SAVE10', 100);
      
      expect(result.valid).toBe(true);
      expect(result.coupon).toBeDefined();
      expect(result.coupon?.code).toBe('SAVE10');
    });

    test('应该正确验证最低消费金额', () => {
      const result = pricingService.validateCoupon('FIXED20', 50);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Minimum order value');
    });

    test('应该返回最佳优惠券', () => {
      const bestCoupon = pricingService.getBestCouponForOrder(200);
      
      expect(bestCoupon).toBeDefined();
      
      const discount1 = percentageCoupon.calculateDiscount(200);
      const discount2 = fixedCoupon.calculateDiscount(200);
      const discount3 = nonStackableCoupon.calculateDiscount(200);
      const maxDiscount = Math.max(discount1, discount2, discount3);
      
      expect(bestCoupon?.calculateDiscount(200)).toBe(maxDiscount);
    });
  });
});

describe('PricingService - 满减规则', () => {
  let pricingService: PricingService;

  beforeEach(() => {
    pricingService = new PricingService();
    
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
        discount: 25,
        description: '满200减25'
      },
      {
        id: 'rule-3',
        type: DiscountType.PERCENTAGE_OFF,
        threshold: 300,
        discount: 15,
        description: '满300享85折'
      }
    ];

    discountRules.forEach(rule => pricingService.addDiscountRule(rule));
  });

  const createOrderItems = (total: number): OrderItem[] => [
    { productId: '1', productName: 'Product', quantity: 1, unitPrice: total, subtotal: total }
  ];

  test('满减规则阈值未达时不应用', () => {
    const orderItems = createOrderItems(50);
    const result = pricingService.calculatePricing(orderItems, []);
    
    expect(result.promoDiscount).toBe(0);
    expect(result.appliedPromos).toHaveLength(0);
  });

  test('满减规则应该正确应用固定金额减免', () => {
    const orderItems = createOrderItems(150);
    const result = pricingService.calculatePricing(orderItems, []);
    
    expect(result.promoDiscount).toBe(10);
    expect(result.appliedPromos).toHaveLength(1);
    expect(result.appliedPromos[0].id).toBe('rule-1');
  });

  test('满减规则应该选择最优惠的一档', () => {
    const orderItems = createOrderItems(250);
    const result = pricingService.calculatePricing(orderItems, []);
    
    expect(result.promoDiscount).toBe(25);
    expect(result.appliedPromos[0].id).toBe('rule-2');
  });

  test('满减规则应该正确应用百分比减免', () => {
    const orderItems = createOrderItems(400);
    const result = pricingService.calculatePricing(orderItems, []);
    
    expect(result.promoDiscount).toBe(60);
    expect(result.appliedPromos[0].id).toBe('rule-3');
  });

  test('优惠券和满减规则应该组合应用', () => {
    const coupon = new Coupon('coupon-1', 'EXTRA10', CouponType.PERCENTAGE, 10, 0);
    pricingService.addCoupon(coupon);

    const orderItems = createOrderItems(200);
    const result = pricingService.calculatePricing(orderItems, ['EXTRA10']);
    
    expect(result.couponDiscount).toBe(20);
    expect(result.promoDiscount).toBe(25);
    expect(result.finalTotal).toBe(155);
  });

  test('最终价格不应该为负数', () => {
    const bigCoupon = new Coupon('big-1', 'BIG100', CouponType.FIXED, 500, 0);
    pricingService.addCoupon(bigCoupon);

    const orderItems = createOrderItems(100);
    const result = pricingService.calculatePricing(orderItems, ['BIG100']);
    
    expect(result.finalTotal).toBe(0);
  });
});
