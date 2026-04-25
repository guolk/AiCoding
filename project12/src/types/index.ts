export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  category?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentId?: string;
  appliedCoupons: string[];
  shippingAddress?: ShippingAddress;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  zipCode?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  isStackable: boolean;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  applicableCategories?: string[];
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping'
}

export interface DiscountRule {
  id: string;
  type: DiscountType;
  threshold: number;
  discount: number;
  description: string;
  validFrom?: Date;
  validUntil?: Date;
}

export enum DiscountType {
  AMOUNT_OFF = 'amount_off',
  PERCENTAGE_OFF = 'percentage_off'
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutRequest {
  userId: string;
  items: CartItem[];
  couponCodes?: string[];
  shippingAddress: ShippingAddress;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cardDetails?: CardDetails;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  processedAt: Date;
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay'
}

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface PricingResult {
  originalTotal: number;
  couponDiscount: number;
  promoDiscount: number;
  finalTotal: number;
  appliedCoupons: AppliedCoupon[];
  appliedPromos: DiscountRule[];
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  type: CouponType;
  discountAmount: number;
}

export interface InventoryReservation {
  id: string;
  productId: string;
  quantity: number;
  orderId?: string;
  status: ReservationStatus;
  createdAt: Date;
  expiresAt: Date;
}

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export interface CheckoutResult {
  success: boolean;
  order?: Order;
  payment?: PaymentResponse;
  error?: CheckoutError;
}

export interface CheckoutError {
  code: CheckoutErrorCode;
  message: string;
  details?: any;
}

export enum CheckoutErrorCode {
  INSUFFICIENT_STOCK = 'insufficient_stock',
  INVALID_COUPON = 'invalid_coupon',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_TIMEOUT = 'payment_timeout',
  ORDER_CREATION_FAILED = 'order_creation_failed',
  INVENTORY_RESERVATION_FAILED = 'inventory_reservation_failed',
  VALIDATION_ERROR = 'validation_error'
}
