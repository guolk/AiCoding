import { Coupon } from '../models';
import { Product } from '../models';
import { 
  PricingResult, 
  DiscountRule, 
  DiscountType, 
  AppliedCoupon,
  CouponType,
  CartItem,
  OrderItem
} from '../types';

export class PricingService {
  private coupons: Map<string, Coupon> = new Map();
  private discountRules: DiscountRule[] = [];

  constructor(coupons: Coupon[] = [], discountRules: DiscountRule[] = []) {
    coupons.forEach(c => this.coupons.set(c.code, c));
    this.discountRules = [...discountRules];
  }

  addCoupon(coupon: Coupon): void {
    this.coupons.set(coupon.code, coupon);
  }

  getCoupon(code: string): Coupon | undefined {
    return this.coupons.get(code.toUpperCase());
  }

  addDiscountRule(rule: DiscountRule): void {
    this.discountRules.push(rule);
  }

  calculateOrderItems(
    cartItems: CartItem[],
    products: Product[]
  ): OrderItem[] {
    const productMap = new Map(products.map(p => [p.id, p]));
    
    return cartItems.map(item => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      
      const unitPrice = product.price;
      const subtotal = unitPrice * item.quantity;
      
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal
      };
    });
  }

  calculateOriginalTotal(orderItems: OrderItem[]): number {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  calculatePricing(
    orderItems: OrderItem[],
    couponCodes: string[] = [],
    categories: string[] = []
  ): PricingResult {
    const originalTotal = this.calculateOriginalTotal(orderItems);
    let couponDiscount = 0;
    let promoDiscount = 0;
    const appliedCoupons: AppliedCoupon[] = [];
    const appliedPromos: DiscountRule[] = [];

    const validCoupons = this.validateAndSortCoupons(couponCodes, originalTotal, categories);

    for (const coupon of validCoupons) {
      const discount = coupon.calculateDiscount(originalTotal - couponDiscount - promoDiscount);
      
      if (discount > 0 || coupon.type === CouponType.FREE_SHIPPING) {
        if (discount > 0) {
          couponDiscount += discount;
        }
        appliedCoupons.push({
          couponId: coupon.id,
          code: coupon.code,
          type: coupon.type,
          discountAmount: discount
        });

        if (!coupon.isStackable) {
          break;
        }
      }
    }

    promoDiscount = this.calculatePromoDiscount(originalTotal, appliedPromos);

    const finalTotal = Math.max(0, originalTotal - couponDiscount - promoDiscount);

    return {
      originalTotal,
      couponDiscount,
      promoDiscount,
      finalTotal,
      appliedCoupons,
      appliedPromos
    };
  }

  private validateAndSortCoupons(
    couponCodes: string[],
    orderValue: number,
    categories: string[]
  ): Coupon[] {
    const uniqueCodes = [...new Set(couponCodes.map(c => c.toUpperCase()))];
    const validCoupons: Coupon[] = [];

    for (const code of uniqueCodes) {
      const coupon = this.coupons.get(code);
      if (coupon && coupon.canApply(orderValue, categories)) {
        validCoupons.push(coupon);
      }
    }

    validCoupons.sort((a, b) => {
      if (!a.isStackable && b.isStackable) return -1;
      if (a.isStackable && !b.isStackable) return 1;
      
      const discountA = a.calculateDiscount(orderValue);
      const discountB = b.calculateDiscount(orderValue);
      
      return discountB - discountA;
    });

    return validCoupons;
  }

  private calculatePromoDiscount(
    orderValue: number,
    appliedPromos: DiscountRule[]
  ): number {
    if (orderValue <= 0) return 0;

    const activeRules = this.discountRules.filter(rule => {
      const now = new Date();
      if (rule.validFrom && now < rule.validFrom) return false;
      if (rule.validUntil && now > rule.validUntil) return false;
      return true;
    });

    let maxDiscount = 0;
    let bestRule: DiscountRule | null = null;

    for (const rule of activeRules) {
      if (orderValue >= rule.threshold) {
        let discount: number;
        
        if (rule.type === DiscountType.AMOUNT_OFF) {
          discount = rule.discount;
        } else {
          discount = orderValue * (rule.discount / 100);
        }

        if (discount > maxDiscount) {
          maxDiscount = discount;
          bestRule = rule;
        }
      }
    }

    if (bestRule) {
      appliedPromos.push(bestRule);
    }

    return maxDiscount;
  }

  validateCoupon(code: string, orderValue: number, categories: string[] = []): {
    valid: boolean;
    coupon?: Coupon;
    reason?: string;
  } {
    const coupon = this.coupons.get(code.toUpperCase());

    if (!coupon) {
      return { valid: false, reason: 'Coupon not found' };
    }

    if (!coupon.isValid()) {
      return { valid: false, coupon, reason: 'Coupon is expired or usage limit reached' };
    }

    if (!coupon.canApply(orderValue, categories)) {
      if (orderValue < coupon.minOrderValue) {
        return { 
          valid: false, 
          coupon, 
          reason: `Minimum order value of ${coupon.minOrderValue} not met` 
        };
      }
      return { valid: false, coupon, reason: 'Coupon not applicable to selected categories' };
    }

    return { valid: true, coupon };
  }

  getBestCouponForOrder(
    orderValue: number,
    categories: string[] = []
  ): Coupon | null {
    let bestCoupon: Coupon | null = null;
    let bestDiscount = 0;

    for (const coupon of this.coupons.values()) {
      if (coupon.canApply(orderValue, categories)) {
        const discount = coupon.calculateDiscount(orderValue);
        if (discount > bestDiscount) {
          bestDiscount = discount;
          bestCoupon = coupon;
        }
      }
    }

    return bestCoupon;
  }

  calculateStackedDiscount(
    orderValue: number,
    coupons: Coupon[]
  ): number {
    let totalDiscount = 0;
    let remainingValue = orderValue;

    for (const coupon of coupons) {
      if (!coupon.isStackable && totalDiscount > 0) {
        continue;
      }

      if (coupon.canApply(remainingValue)) {
        const discount = coupon.calculateDiscount(remainingValue);
        totalDiscount += discount;
        remainingValue -= discount;

        if (!coupon.isStackable) {
          break;
        }
      }
    }

    return Math.min(totalDiscount, orderValue);
  }
}
