import { InventoryService, InventoryError } from '../../src/services';
import { Product } from '../../src/models';
import { ReservationStatus, CheckoutErrorCode } from '../../src/types';

describe('InventoryService - 高级场景测试', () => {
  let inventoryService: InventoryService;
  let product1: Product;
  let product2: Product;
  let product3: Product;

  beforeEach(() => {
    inventoryService = new InventoryService();
    
    product1 = new Product(
      'prod-1',
      'Product 1',
      100,
      100,
      'SKU-001',
      'Electronics'
    );

    product2 = new Product(
      'prod-2',
      'Product 2',
      50,
      50,
      'SKU-002',
      'Books'
    );

    product3 = new Product(
      'prod-3',
      'Product 3',
      200,
      200,
      'SKU-003',
      'Clothing'
    );

    inventoryService.addProduct(product1);
    inventoryService.addProduct(product2);
    inventoryService.addProduct(product3);
  });

  afterEach(() => {
    inventoryService.cleanup();
  });

  describe('批量预留复杂场景', () => {
    test('批量预留多个产品应该正确减少所有库存', async () => {
      const initialStock1 = inventoryService.getStock('prod-1');
      const initialStock2 = inventoryService.getStock('prod-2');
      const initialStock3 = inventoryService.getStock('prod-3');

      const reservations = await inventoryService.reserveMultipleStocks([
        { productId: 'prod-1', quantity: 10 },
        { productId: 'prod-2', quantity: 5 },
        { productId: 'prod-3', quantity: 20 }
      ]);

      expect(reservations).toHaveLength(3);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock1 - 10);
      expect(inventoryService.getStock('prod-2')).toBe(initialStock2 - 5);
      expect(inventoryService.getStock('prod-3')).toBe(initialStock3 - 20);
    });

    test('批量预留部分失败时应该回滚所有预留', async () => {
      const initialStock1 = inventoryService.getStock('prod-1');
      const initialStock2 = inventoryService.getStock('prod-2');

      await expect(
        inventoryService.reserveMultipleStocks([
          { productId: 'prod-1', quantity: 10 },
          { productId: 'prod-2', quantity: 1000 }
        ])
      ).rejects.toThrow(InventoryError);

      expect(inventoryService.getStock('prod-1')).toBe(initialStock1);
      expect(inventoryService.getStock('prod-2')).toBe(initialStock2);
    });

    test('批量预留后确认所有预留', async () => {
      const reservations = await inventoryService.reserveMultipleStocks([
        { productId: 'prod-1', quantity: 5 },
        { productId: 'prod-2', quantity: 5 }
      ]);

      const confirmed = await inventoryService.confirmMultipleReservations(
        reservations.map(r => r.id),
        'order-123'
      );

      expect(confirmed).toHaveLength(2);
      confirmed.forEach(r => {
        expect(r.status).toBe(ReservationStatus.CONFIRMED);
        expect(r.orderId).toBe('order-123');
      });
    });

    test('批量预留后取消所有预留', async () => {
      const initialStock1 = inventoryService.getStock('prod-1');
      const initialStock2 = inventoryService.getStock('prod-2');

      const reservations = await inventoryService.reserveMultipleStocks([
        { productId: 'prod-1', quantity: 10 },
        { productId: 'prod-2', quantity: 10 }
      ]);

      const cancelled = await inventoryService.cancelMultipleReservations(
        reservations.map(r => r.id)
      );

      expect(cancelled).toHaveLength(2);
      cancelled.forEach(r => {
        expect(r.status).toBe(ReservationStatus.CANCELLED);
      });

      expect(inventoryService.getStock('prod-1')).toBe(initialStock1);
      expect(inventoryService.getStock('prod-2')).toBe(initialStock2);
    });

    test('批量预留时包含不存在的产品应该抛出错误', async () => {
      const initialStock1 = inventoryService.getStock('prod-1');

      await expect(
        inventoryService.reserveMultipleStocks([
          { productId: 'prod-1', quantity: 5 },
          { productId: 'non-exist', quantity: 5 }
        ])
      ).rejects.toThrow('Product');

      expect(inventoryService.getStock('prod-1')).toBe(initialStock1);
    });
  });

  describe('预留过期机制测试', () => {
    test('预留过期后库存应该恢复', async () => {
      const initialStock = inventoryService.getStock('prod-1');

      const reservation = await inventoryService.reserveStock('prod-1', 10, 100);

      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);

      await new Promise(resolve => setTimeout(resolve, 150));

      const pendingReservations = inventoryService.getPendingReservationsForProduct('prod-1');
      expect(pendingReservations).toHaveLength(0);
    });

    test('已确认的预留过期时不应该恢复库存', async () => {
      const initialStock = inventoryService.getStock('prod-1');

      const reservation = await inventoryService.reserveStock('prod-1', 10, 100);
      await inventoryService.confirmReservation(reservation.id, 'order-123');

      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);
    });

    test('已取消的预留过期时不应该有问题', async () => {
      const initialStock = inventoryService.getStock('prod-1');

      const reservation = await inventoryService.reserveStock('prod-1', 10, 100);
      await inventoryService.cancelReservation(reservation.id);

      expect(inventoryService.getStock('prod-1')).toBe(initialStock);

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(inventoryService.getStock('prod-1')).toBe(initialStock);
    });
  });

  describe('库存检查边界情况', () => {
    test('检查0库存时应该返回false', async () => {
      const zeroStockProduct = new Product('zero-1', 'Zero', 10, 0, 'SKU-ZERO');
      inventoryService.addProduct(zeroStockProduct);

      const result = await inventoryService.checkStock('zero-1', 1);
      expect(result).toBe(false);
    });

    test('检查负数数量时应该返回false', async () => {
      const result = await inventoryService.checkStock('prod-1', -1);
      expect(result).toBe(false);
    });

    test('检查不存在的产品时应该返回false', async () => {
      const result = await inventoryService.checkStock('non-exist', 1);
      expect(result).toBe(false);
    });

    test('检查数量等于库存时应该返回true', async () => {
      const stock = inventoryService.getStock('prod-1');
      const result = await inventoryService.checkStock('prod-1', stock);
      expect(result).toBe(true);
    });

    test('检查数量超过库存时应该返回false', async () => {
      const stock = inventoryService.getStock('prod-1');
      const result = await inventoryService.checkStock('prod-1', stock + 1);
      expect(result).toBe(false);
    });
  });

  describe('库存操作连续测试', () => {
    test('连续预留多个产品应该正确计算', async () => {
      const initialStock = inventoryService.getStock('prod-1');

      for (let i = 0; i < 5; i++) {
        await inventoryService.reserveStock('prod-1', 10);
      }

      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 50);
    });

    test('预留-取消-预留 应该正确处理', async () => {
      const initialStock = inventoryService.getStock('prod-1');

      const reservation1 = await inventoryService.reserveStock('prod-1', 10);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);

      await inventoryService.cancelReservation(reservation1.id);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock);

      const reservation2 = await inventoryService.reserveStock('prod-1', 20);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 20);
    });

    test('预留-确认-预留 应该正确处理', async () => {
      const initialStock = inventoryService.getStock('prod-1');

      const reservation1 = await inventoryService.reserveStock('prod-1', 10);
      await inventoryService.confirmReservation(reservation1.id, 'order-1');
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 10);

      const reservation2 = await inventoryService.reserveStock('prod-1', 20);
      expect(inventoryService.getStock('prod-1')).toBe(initialStock - 30);
    });
  });

  describe('批量库存检查', () => {
    test('所有产品库存充足时返回true', async () => {
      const result = await inventoryService.checkMultipleStocks([
        { productId: 'prod-1', quantity: 10 },
        { productId: 'prod-2', quantity: 10 },
        { productId: 'prod-3', quantity: 10 }
      ]);

      expect(result.sufficient).toBe(true);
      expect(result.insufficientProducts).toHaveLength(0);
    });

    test('部分产品库存不足时返回具体信息', async () => {
      const result = await inventoryService.checkMultipleStocks([
        { productId: 'prod-1', quantity: 10 },
        { productId: 'prod-2', quantity: 1000 },
        { productId: 'prod-3', quantity: 10 },
        { productId: 'non-exist', quantity: 1 }
      ]);

      expect(result.sufficient).toBe(false);
      expect(result.insufficientProducts).toContain('prod-2');
      expect(result.insufficientProducts).toContain('non-exist');
    });

    test('空列表应该返回true', async () => {
      const result = await inventoryService.checkMultipleStocks([]);

      expect(result.sufficient).toBe(true);
      expect(result.insufficientProducts).toHaveLength(0);
    });
  });

  describe('错误处理', () => {
    test('预留库存时抛出的错误应该包含详细信息', async () => {
      try {
        await inventoryService.reserveStock('prod-1', 1000);
        fail('应该抛出错误');
      } catch (error: any) {
        expect(error).toBeInstanceOf(InventoryError);
        expect(error.code).toBe(CheckoutErrorCode.INSUFFICIENT_STOCK);
        expect(error.details).toBeDefined();
        expect(error.details.available).toBe(100);
        expect(error.details.requested).toBe(1000);
      }
    });

    test('确认不存在的预留应该抛出错误', async () => {
      await expect(
        inventoryService.confirmReservation('non-exist', 'order-123')
      ).rejects.toThrow('Reservation');
    });

    test('取消不存在的预留应该抛出错误', async () => {
      await expect(
        inventoryService.cancelReservation('non-exist')
      ).rejects.toThrow('Reservation');
    });

    test('确认已确认的预留应该抛出错误', async () => {
      const reservation = await inventoryService.reserveStock('prod-1', 1);
      await inventoryService.confirmReservation(reservation.id, 'order-123');

      await expect(
        inventoryService.confirmReservation(reservation.id, 'order-456')
      ).rejects.toThrow('Cannot confirm reservation');
    });
  });

  describe('清理功能', () => {
    test('cleanup应该清除所有数据', async () => {
      await inventoryService.reserveStock('prod-1', 10);
      await inventoryService.reserveStock('prod-2', 5);

      expect(inventoryService.getReservations().length).toBeGreaterThan(0);

      inventoryService.cleanup();

      expect(inventoryService.getReservations().length).toBe(0);
    });

    test('clearAllTimers应该清除所有定时器', async () => {
      await inventoryService.reserveStock('prod-1', 10, 1000);
      await inventoryService.reserveStock('prod-2', 5, 1000);

      inventoryService.clearAllTimers();

      const initialStock1 = inventoryService.getStock('prod-1');
      const initialStock2 = inventoryService.getStock('prod-2');

      await new Promise(resolve => setTimeout(resolve, 1500));

      expect(inventoryService.getStock('prod-1')).toBe(initialStock1);
      expect(inventoryService.getStock('prod-2')).toBe(initialStock2);
    });
  });

  describe('产品管理', () => {
    test('应该能够添加新产品', () => {
      const newProduct = new Product('new-1', 'New Product', 99.99, 10, 'SKU-NEW');
      inventoryService.addProduct(newProduct);

      expect(inventoryService.getProduct('new-1')).toBeDefined();
      expect(inventoryService.getStock('new-1')).toBe(10);
    });

    test('应该能够查询产品信息', () => {
      const product = inventoryService.getProduct('prod-1');
      
      expect(product).toBeDefined();
      expect(product?.id).toBe('prod-1');
      expect(product?.name).toBe('Product 1');
      expect(product?.price).toBe(100);
      expect(product?.stock).toBe(100);
    });

    test('查询不存在的产品应该返回undefined', () => {
      const product = inventoryService.getProduct('non-exist');
      expect(product).toBeUndefined();
    });
  });
});
