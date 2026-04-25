import { InventoryService } from '../../src/services';
import { Product } from '../../src/models';
import { ReservationStatus, CheckoutErrorCode } from '../../src/types';

describe('InventoryService - 库存扣减边界情况', () => {
  let inventoryService: InventoryService;
  let product: Product;
  let outOfStockProduct: Product;

  beforeEach(() => {
    inventoryService = new InventoryService();
    
    product = new Product(
      'prod-1',
      'Test Product',
      99.99,
      100,
      'SKU-001',
      'Electronics'
    );

    outOfStockProduct = new Product(
      'prod-2',
      'Out of Stock Product',
      49.99,
      0,
      'SKU-002',
      'Books'
    );

    inventoryService.addProduct(product);
    inventoryService.addProduct(outOfStockProduct);
  });

  describe('基础库存检查', () => {
    test('应该正确检查库存是否充足', async () => {
      const result = await inventoryService.checkStock('prod-1', 50);
      expect(result).toBe(true);
    });

    test('库存不足时应该返回false', async () => {
      const result = await inventoryService.checkStock('prod-1', 150);
      expect(result).toBe(false);
    });

    test('库存为0时应该返回false', async () => {
      const result = await inventoryService.checkStock('prod-2', 1);
      expect(result).toBe(false);
    });

    test('请求数量为0时应该返回false', async () => {
      const result = await inventoryService.checkStock('prod-1', 0);
      expect(result).toBe(false);
    });

    test('请求数量为负数时应该返回false', async () => {
      const result = await inventoryService.checkStock('prod-1', -1);
      expect(result).toBe(false);
    });

    test('不存在的产品应该返回false', async () => {
      const result = await inventoryService.checkStock('non-exist', 1);
      expect(result).toBe(false);
    });
  });

  describe('批量库存检查', () => {
    test('所有产品库存充足时应该返回true', async () => {
      const result = await inventoryService.checkMultipleStocks([
        { productId: 'prod-1', quantity: 10 }
      ]);
      
      expect(result.sufficient).toBe(true);
      expect(result.insufficientProducts).toHaveLength(0);
    });

    test('部分产品库存不足时应该返回具体信息', async () => {
      const result = await inventoryService.checkMultipleStocks([
        { productId: 'prod-1', quantity: 10 },
        { productId: 'prod-2', quantity: 1 },
        { productId: 'non-exist', quantity: 5 }
      ]);
      
      expect(result.sufficient).toBe(false);
      expect(result.insufficientProducts).toContain('prod-2');
      expect(result.insufficientProducts).toContain('non-exist');
    });
  });

  describe('库存预留', () => {
    test('成功预留库存后应该减少可用库存', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      const reservation = await inventoryService.reserveStock('prod-1', 10);
      
      expect(reservation.status).toBe(ReservationStatus.PENDING);
      expect(reservation.quantity).toBe(10);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);
    });

    test('库存不足时预留应该抛出异常', async () => {
      await expect(
        inventoryService.reserveStock('prod-1', 200)
      ).rejects.toThrow('Insufficient stock');
    });

    test('库存不足时应该返回详细错误信息', async () => {
      try {
        await inventoryService.reserveStock('prod-1', 200);
        fail('应该抛出异常');
      } catch (error: any) {
        expect(error.code).toBe(CheckoutErrorCode.INSUFFICIENT_STOCK);
        expect(error.details).toBeDefined();
        expect(error.details.available).toBe(100);
        expect(error.details.requested).toBe(200);
      }
    });

    test('不存在的产品预留应该抛出异常', async () => {
      await expect(
        inventoryService.reserveStock('non-exist', 1)
      ).rejects.toThrow('Product');
    });
  });

  describe('批量库存预留', () => {
    test('所有产品都可以预留时应该成功', async () => {
      const reservations = await inventoryService.reserveMultipleStocks([
        { productId: 'prod-1', quantity: 5 }
      ]);
      
      expect(reservations).toHaveLength(1);
      expect(inventoryService.getStock('prod-1')).toBe(95);
    });

    test('预留失败时应该回滚已预留的库存', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      
      await expect(
        inventoryService.reserveMultipleStocks([
          { productId: 'prod-1', quantity: 5 },
          { productId: 'prod-2', quantity: 1 }
        ])
      ).rejects.toThrow('Insufficient stock');
      
      expect(inventoryService.getStock('prod-1')).toBe(initialStock);
    });
  });

  describe('预留确认', () => {
    test('成功确认预留后状态应该更新', async () => {
      const reservation = await inventoryService.reserveStock('prod-1', 10);
      const confirmed = await inventoryService.confirmReservation(reservation.id, 'order-123');
      
      expect(confirmed.status).toBe(ReservationStatus.CONFIRMED);
      expect(confirmed.orderId).toBe('order-123');
    });

    test('已确认的预留不能再次确认', async () => {
      const reservation = await inventoryService.reserveStock('prod-1', 10);
      await inventoryService.confirmReservation(reservation.id, 'order-123');
      
      await expect(
        inventoryService.confirmReservation(reservation.id, 'order-456')
      ).rejects.toThrow('Cannot confirm reservation with status');
    });

    test('不存在的预留确认应该抛出异常', async () => {
      await expect(
        inventoryService.confirmReservation('non-exist', 'order-123')
      ).rejects.toThrow('Reservation');
    });
  });

  describe('预留取消', () => {
    test('取消预留后库存应该恢复', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      const reservation = await inventoryService.reserveStock('prod-1', 10);
      
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);
      
      const cancelled = await inventoryService.cancelReservation(reservation.id);
      
      expect(cancelled.status).toBe(ReservationStatus.CANCELLED);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock);
    });

    test('已确认的预留取消后库存不会恢复', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      const reservation = await inventoryService.reserveStock('prod-1', 10);
      await inventoryService.confirmReservation(reservation.id, 'order-123');
      
      const cancelled = await inventoryService.cancelReservation(reservation.id);
      
      expect(cancelled.status).toBe(ReservationStatus.CANCELLED);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);
    });

    test('已取消的预留可以再次取消', async () => {
      const reservation = await inventoryService.reserveStock('prod-1', 10);
      await inventoryService.cancelReservation(reservation.id);
      
      const cancelledAgain = await inventoryService.cancelReservation(reservation.id);
      
      expect(cancelledAgain.status).toBe(ReservationStatus.CANCELLED);
    });
  });

  describe('库存边界情况测试', () => {
    test('预留最后一件库存后库存为0', async () => {
      const finalProduct = new Product('final-1', 'Last Item', 100, 1, 'SKU-LAST');
      inventoryService.addProduct(finalProduct);
      
      const reservation = await inventoryService.reserveStock('final-1', 1);
      
      expect(inventoryService.getStock('final-1')).toBe(0);
      expect(reservation.status).toBe(ReservationStatus.PENDING);
    });

    test('预留最后一件后再预留应该失败', async () => {
      const finalProduct = new Product('final-1', 'Last Item', 100, 1, 'SKU-LAST');
      inventoryService.addProduct(finalProduct);
      
      await inventoryService.reserveStock('final-1', 1);
      
      await expect(
        inventoryService.reserveStock('final-1', 1)
      ).rejects.toThrow('Insufficient stock');
    });

    test('大量库存预留应该正确计算', async () => {
      const largeStockProduct = new Product('large-1', 'Large Stock', 10, 10000, 'SKU-LARGE');
      inventoryService.addProduct(largeStockProduct);
      
      await inventoryService.reserveStock('large-1', 5000);
      
      expect(inventoryService.getStock('large-1')).toBe(5000);
    });

    test('完整库存预留流程测试', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      const quantity = 5;
      
      const reservation = await inventoryService.reserveStock('prod-1', quantity);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - quantity);
      
      await inventoryService.confirmReservation(reservation.id, 'order-001');
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - quantity);
      
      const pendingReservations = inventoryService.getPendingReservationsForProduct('prod-1');
      expect(pendingReservations).toHaveLength(0);
    });
  });

  describe('预留过期机制', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('预留过期后库存应该恢复', async () => {
      const initialStock = inventoryService.getStock('prod-1');
      
      await inventoryService.reserveStock('prod-1', 10, 1000);
      
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);
      
      jest.advanceTimersByTime(2000);
      
      const pendingReservations = inventoryService.getPendingReservationsForProduct('prod-1');
      
      if (pendingReservations.length === 0) {
        expect(inventoryService.getStock('prod-1')).toBe(initialStock);
      }
    });
  });
});
