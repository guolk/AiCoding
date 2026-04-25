import { Coupon as ICoupon, CouponType } from '../types';

export class Coupon implements ICoupon {
  public id: string;
  public code: string;
  public type: CouponType;
  public value: number;
  public minOrderValue: number;
  public maxDiscount?: number;
  public isStackable: boolean;
  public validFrom: Date;
  public validUntil: Date;
  public usageLimit?: number;
  public usedCount: number;
  public applicableCategories?: string[];

  constructor(
    id: string,
    code: string,
    type: CouponType,
    value: number,
    minOrderValue: number = 0,
    options: {
      maxDiscount?: number;
      isStackable?: boolean;
      validFrom?: Date;
      validUntil?: Date;
      usageLimit?: number;
      usedCount?: number;
      applicableCategories?: string[];
    } = {}
  ) {
    this.id = id;
    this.code = code.toUpperCase();
    this.type = type;
    this.value = value;
    this.minOrderValue = minOrderValue;
    this.maxDiscount = options.maxDiscount;
    this.isStackable = options.isStackable ?? false;
    this.validFrom = options.validFrom ?? new Date();
    this.validUntil = options.validUntil ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    this.usageLimit = options.usageLimit;
    this.usedCount = options.usedCount ?? 0;
    this.applicableCategories = options.applicableCategories;
  }

  static create(data: Partial<ICoupon> & { id: string; code: string; type: CouponType; value: number }): Coupon {
    return new Coupon(
      data.id,
      data.code,
      data.type,
      data.value,
      data.minOrderValue,
      {
        maxDiscount: data.maxDiscount,
        isStackable: data.isStackable,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        usageLimit: data.usageLimit,
        usedCount: data.usedCount,
        applicableCategories: data.applicableCategories
      }
    );
  }

  isValid(): boolean {
    const now = new Date();
    if (now < this.validFrom) return false;
    if (now > this.validUntil) return false;
    if (this.usageLimit !== undefined && this.usedCount >= this.usageLimit) return false;
    return true;
  }

  canApply(orderValue: number, categories?: string[]): boolean {
    if (!this.isValid()) return false;
    if (orderValue < this.minOrderValue) return false;
    
    if (this.applicableCategories && this.applicableCategories.length > 0 && categories) {
      const hasMatchingCategory = categories.some(cat => 
        this.applicableCategories!.includes(cat)
      );
      if (!hasMatchingCategory) return false;
    }
    
    return true;
  }

  calculateDiscount(orderValue: number): number {
    let discount: number;

    switch (this.type) {
      case CouponType.PERCENTAGE:
        discount = orderValue * (this.value / 100);
        if (this.maxDiscount !== undefined && discount > this.maxDiscount) {
          discount = this.maxDiscount;
        }
        break;
      case CouponType.FIXED:
        discount = this.value;
        break;
      case CouponType.FREE_SHIPPING:
        discount = 0;
        break;
      default:
        discount = 0;
    }

    return Math.min(discount, orderValue);
  }

  use(): void {
    if (!this.isValid()) {
      throw new Error(`Coupon ${this.code} is not valid`);
    }
    this.usedCount++;
  }

  toJSON(): ICoupon {
    return {
      id: this.id,
      code: this.code,
      type: this.type,
      value: this.value,
      minOrderValue: this.minOrderValue,
      maxDiscount: this.maxDiscount,
      isStackable: this.isStackable,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      usageLimit: this.usageLimit,
      usedCount: this.usedCount,
      applicableCategories: this.applicableCategories
    };
  }
}
