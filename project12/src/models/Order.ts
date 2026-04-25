import { 
  Order as IOrder, 
  OrderItem, 
  OrderStatus, 
  ShippingAddress 
} from '../types';

const { v4: uuidv4 } = require('uuid');

export class Order implements IOrder {
  public id: string;
  public userId: string;
  public items: OrderItem[];
  public originalTotal: number;
  public discountAmount: number;
  public finalTotal: number;
  public status: OrderStatus;
  public createdAt: Date;
  public updatedAt: Date;
  public paymentId?: string;
  public appliedCoupons: string[];
  public shippingAddress?: ShippingAddress;

  constructor(
    userId: string,
    items: OrderItem[],
    originalTotal: number,
    discountAmount: number,
    finalTotal: number,
    shippingAddress?: ShippingAddress,
    appliedCoupons: string[] = []
  ) {
    this.id = uuidv4();
    this.userId = userId;
    this.items = [...items];
    this.originalTotal = originalTotal;
    this.discountAmount = discountAmount;
    this.finalTotal = finalTotal;
    this.status = OrderStatus.PENDING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.appliedCoupons = [...appliedCoupons];
    this.shippingAddress = shippingAddress;
  }

  static create(data: {
    userId: string;
    items: OrderItem[];
    originalTotal: number;
    discountAmount: number;
    finalTotal: number;
    shippingAddress?: ShippingAddress;
    appliedCoupons?: string[];
  }): Order {
    return new Order(
      data.userId,
      data.items,
      data.originalTotal,
      data.discountAmount,
      data.finalTotal,
      data.shippingAddress,
      data.appliedCoupons
    );
  }

  confirm(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error(`Cannot confirm order with status: ${this.status}`);
    }
    this.status = OrderStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  markAsPaid(paymentId: string): void {
    if (this.status !== OrderStatus.CONFIRMED && this.status !== OrderStatus.PENDING) {
      throw new Error(`Cannot mark order as paid with status: ${this.status}`);
    }
    this.status = OrderStatus.PAID;
    this.paymentId = paymentId;
    this.updatedAt = new Date();
  }

  ship(): void {
    if (this.status !== OrderStatus.PAID) {
      throw new Error(`Cannot ship order with status: ${this.status}`);
    }
    this.status = OrderStatus.SHIPPED;
    this.updatedAt = new Date();
  }

  deliver(): void {
    if (this.status !== OrderStatus.SHIPPED) {
      throw new Error(`Cannot deliver order with status: ${this.status}`);
    }
    this.status = OrderStatus.DELIVERED;
    this.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this.status === OrderStatus.SHIPPED || this.status === OrderStatus.DELIVERED) {
      throw new Error(`Cannot cancel order with status: ${this.status}`);
    }
    this.status = OrderStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  refund(): void {
    if (this.status !== OrderStatus.PAID && this.status !== OrderStatus.DELIVERED) {
      throw new Error(`Cannot refund order with status: ${this.status}`);
    }
    this.status = OrderStatus.REFUNDED;
    this.updatedAt = new Date();
  }

  calculateItemTotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  toJSON(): IOrder {
    return {
      id: this.id,
      userId: this.userId,
      items: this.items,
      originalTotal: this.originalTotal,
      discountAmount: this.discountAmount,
      finalTotal: this.finalTotal,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      paymentId: this.paymentId,
      appliedCoupons: this.appliedCoupons,
      shippingAddress: this.shippingAddress
    };
  }
}
