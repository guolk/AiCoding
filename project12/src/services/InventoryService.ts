import { Product } from '../models';
import { 
  InventoryReservation, 
  ReservationStatus, 
  CheckoutErrorCode
} from '../types';

const { v4: uuidv4 } = require('uuid');

export class InventoryError extends Error {
  public code: CheckoutErrorCode;
  public details?: any;

  constructor(message: string, code: CheckoutErrorCode, details?: any) {
    super(message);
    this.name = 'InventoryError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, InventoryError.prototype);
  }
}

export class InventoryService {
  private products: Map<string, Product> = new Map();
  private reservations: Map<string, InventoryReservation> = new Map();
  private locks: Map<string, { promise: Promise<void>; resolve: () => void }> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(products: Product[] = []) {
    products.forEach(p => this.products.set(p.id, p));
  }

  addProduct(product: Product): void {
    this.products.set(product.id, product);
  }

  getProduct(productId: string): Product | undefined {
    return this.products.get(productId);
  }

  getStock(productId: string): number {
    const product = this.products.get(productId);
    return product ? product.stock : 0;
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = this.products.get(productId);
    if (!product) return false;
    return product.hasStock(quantity);
  }

  async checkMultipleStocks(items: { productId: string; quantity: number }[]): Promise<{
    sufficient: boolean;
    insufficientProducts: string[];
  }> {
    const insufficientProducts: string[] = [];

    for (const item of items) {
      const hasStock = await this.checkStock(item.productId, item.quantity);
      if (!hasStock) {
        insufficientProducts.push(item.productId);
      }
    }

    return {
      sufficient: insufficientProducts.length === 0,
      insufficientProducts
    };
  }

  async reserveStock(
    productId: string,
    quantity: number,
    ttlMs: number = 5 * 60 * 1000
  ): Promise<InventoryReservation> {
    await this.acquireLock(productId);

    try {
      const product = this.products.get(productId);
      if (!product) {
        throw this.createInventoryError(
          `Product ${productId} not found`,
          CheckoutErrorCode.INVENTORY_RESERVATION_FAILED
        );
      }

      if (!product.hasStock(quantity)) {
        throw this.createInventoryError(
          `Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${quantity}`,
          CheckoutErrorCode.INSUFFICIENT_STOCK,
          { productId, available: product.stock, requested: quantity }
        );
      }

      product.reduceStock(quantity);

      const reservation: InventoryReservation = {
        id: uuidv4(),
        productId,
        quantity,
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttlMs)
      };

      this.reservations.set(reservation.id, reservation);

      const timer = setTimeout(() => this.expireReservation(reservation.id), ttlMs);
      this.timers.set(reservation.id, timer);

      return reservation;
    } finally {
      this.releaseLock(productId);
    }
  }

  async reserveMultipleStocks(
    items: { productId: string; quantity: number }[],
    ttlMs: number = 5 * 60 * 1000
  ): Promise<InventoryReservation[]> {
    const productIds = [...new Set(items.map(i => i.productId))].sort();
    const reservations: InventoryReservation[] = [];

    try {
      for (const productId of productIds) {
        const productItems = items.filter(i => i.productId === productId);
        const totalQuantity = productItems.reduce((sum, i) => sum + i.quantity, 0);

        const reservation = await this.reserveStock(productId, totalQuantity, ttlMs);
        reservations.push(reservation);
      }

      return reservations;
    } catch (error) {
      for (const reservation of reservations) {
        await this.cancelReservation(reservation.id);
      }
      throw error;
    }
  }

  async confirmReservation(reservationId: string, orderId: string): Promise<InventoryReservation> {
    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      throw this.createInventoryError(
        `Reservation ${reservationId} not found`,
        CheckoutErrorCode.INVENTORY_RESERVATION_FAILED
      );
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw this.createInventoryError(
        `Cannot confirm reservation with status: ${reservation.status}`,
        CheckoutErrorCode.INVENTORY_RESERVATION_FAILED
      );
    }

    if (this.isReservationExpired(reservation)) {
      throw this.createInventoryError(
        `Reservation ${reservationId} has expired`,
        CheckoutErrorCode.INVENTORY_RESERVATION_FAILED
      );
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.orderId = orderId;

    return reservation;
  }

  async confirmMultipleReservations(
    reservationIds: string[],
    orderId: string
  ): Promise<InventoryReservation[]> {
    const results: InventoryReservation[] = [];

    for (const id of reservationIds) {
      const result = await this.confirmReservation(id, orderId);
      results.push(result);
    }

    return results;
  }

  async cancelReservation(reservationId: string): Promise<InventoryReservation> {
    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      throw this.createInventoryError(
        `Reservation ${reservationId} not found`,
        CheckoutErrorCode.INVENTORY_RESERVATION_FAILED
      );
    }

    if (reservation.status === ReservationStatus.CANCELLED || 
        reservation.status === ReservationStatus.EXPIRED) {
      return reservation;
    }

    const timer = this.timers.get(reservationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(reservationId);
    }

    if (reservation.status === ReservationStatus.PENDING) {
      const product = this.products.get(reservation.productId);
      if (product) {
        product.addStock(reservation.quantity);
      }
    }

    reservation.status = ReservationStatus.CANCELLED;

    return reservation;
  }

  async cancelMultipleReservations(reservationIds: string[]): Promise<InventoryReservation[]> {
    const results: InventoryReservation[] = [];

    for (const id of reservationIds) {
      try {
        const result = await this.cancelReservation(id);
        results.push(result);
      } catch (error) {
        console.error(`Failed to cancel reservation ${id}:`, error);
      }
    }

    return results;
  }

  private expireReservation(reservationId: string): void {
    const timer = this.timers.get(reservationId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(reservationId);
    }

    const reservation = this.reservations.get(reservationId);

    if (reservation && reservation.status === ReservationStatus.PENDING) {
      const product = this.products.get(reservation.productId);
      if (product) {
        product.addStock(reservation.quantity);
      }
      reservation.status = ReservationStatus.EXPIRED;
    }
  }

  private isReservationExpired(reservation: InventoryReservation): boolean {
    return new Date() > reservation.expiresAt;
  }

  private async acquireLock(productId: string): Promise<void> {
    while (this.locks.has(productId)) {
      const lockInfo = this.locks.get(productId);
      if (lockInfo) {
        await lockInfo.promise;
      }
    }

    let resolveLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });

    this.locks.set(productId, {
      promise: lockPromise,
      resolve: resolveLock!
    });
  }

  private releaseLock(productId: string): void {
    const lockInfo = this.locks.get(productId);
    if (lockInfo) {
      lockInfo.resolve();
      this.locks.delete(productId);
    }
  }

  private createInventoryError(
    message: string,
    code: CheckoutErrorCode,
    details?: any
  ): InventoryError {
    return new InventoryError(message, code, details);
  }

  getReservations(): InventoryReservation[] {
    return Array.from(this.reservations.values());
  }

  getReservation(reservationId: string): InventoryReservation | undefined {
    return this.reservations.get(reservationId);
  }

  getPendingReservationsForProduct(productId: string): InventoryReservation[] {
    return this.getReservations().filter(
      r => r.productId === productId && r.status === ReservationStatus.PENDING
    );
  }

  clearAllTimers(): void {
    for (const [reservationId, timer] of this.timers) {
      clearTimeout(timer);
      this.timers.delete(reservationId);
    }
  }

  cleanup(): void {
    this.clearAllTimers();
    this.products.clear();
    this.reservations.clear();
    this.locks.clear();
  }
}
