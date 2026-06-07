import { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  Truck,
  Calendar,
  Plus,
  X,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  formatNumber,
  formatDate,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Inventory as InventoryType, Product } from '@/../shared/types';

interface InventoryWithProduct extends InventoryType {
  product?: Product;
}

export default function Stock() {
  const { inventory, products, shipments } = useAppStore();
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryWithProduct | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    quantity: '',
    reason: '',
    type: 'add' as 'add' | 'reduce',
  });

  const warehouses = useMemo(() => {
    const unique = new Set(inventory.map((i) => i.warehouse));
    return Array.from(unique);
  }, [inventory]);

  const inventoryWithProducts: InventoryWithProduct[] = useMemo(() => {
    return inventory.map((inv) => ({
      ...inv,
      product: products.find((p) => p.id === inv.productId),
    }));
  }, [inventory, products]);

  const filteredInventory = useMemo(() => {
    return inventoryWithProducts.filter((inv) => {
      const matchesWarehouse = warehouseFilter === 'all' || inv.warehouse === warehouseFilter;
      const availableStock = inv.currentStock - inv.reservedStock;
      const isLowStock = availableStock <= inv.safetyStock;
      const matchesLowStock = !lowStockOnly || isLowStock;
      return matchesWarehouse && matchesLowStock;
    });
  }, [inventoryWithProducts, warehouseFilter, lowStockOnly]);

  const summaryData = useMemo(() => {
    const totalStockValue = inventoryWithProducts.reduce((sum, inv) => {
      const product = inv.product;
      return sum + (product ? product.cost * inv.currentStock : 0);
    }, 0);

    const lowStockItems = inventoryWithProducts.filter((inv) => {
      const availableStock = inv.currentStock - inv.reservedStock;
      return availableStock <= inv.safetyStock;
    }).length;

    const inTransit = shipments
      .filter((s) => s.status === 'shipping')
      .reduce((sum, s) => sum + s.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    const totalDaysCoverage = inventoryWithProducts.reduce((sum, inv) => {
      const availableStock = inv.currentStock - inv.reservedStock;
      const daysCoverage = inv.dailySalesRate > 0 ? availableStock / inv.dailySalesRate : 0;
      return sum + daysCoverage;
    }, 0);
    const avgDaysCoverage = inventoryWithProducts.length > 0 ? totalDaysCoverage / inventoryWithProducts.length : 0;

    return {
      totalStockValue,
      lowStockItems,
      inTransit,
      avgDaysCoverage,
    };
  }, [inventoryWithProducts, shipments]);

  const getDaysOfStock = (inv: InventoryType) => {
    const availableStock = inv.currentStock - inv.reservedStock;
    return inv.dailySalesRate > 0 ? availableStock / inv.dailySalesRate : 0;
  };

  const getStockPercentage = (inv: InventoryType) => {
    const maxStock = inv.safetyStock * 3;
    const availableStock = inv.currentStock - inv.reservedStock;
    return Math.min((availableStock / maxStock) * 100, 100);
  };

  const isLowStock = (inv: InventoryType) => {
    const availableStock = inv.currentStock - inv.reservedStock;
    return availableStock <= inv.safetyStock;
  };

  const needsRestockSoon = (inv: InventoryType) => {
    const daysOfStock = getDaysOfStock(inv);
    return daysOfStock <= inv.leadTimeDays;
  };

  const handleAdjustSubmit = () => {
    setShowAdjustModal(false);
    setAdjustForm({ quantity: '', reason: '', type: 'add' });
    setSelectedInventory(null);
  };

  const openAdjustModal = (inv: InventoryWithProduct) => {
    setSelectedInventory(inv);
    setShowAdjustModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总库存价值"
          value={formatCurrency(summaryData.totalStockValue)}
          change={5.2}
          icon={Package}
          color="blue"
          delay={0}
        />
        <StatCard
          title="低库存商品"
          value={formatNumber(summaryData.lowStockItems)}
          change={-2}
          icon={AlertTriangle}
          color="yellow"
          delay={100}
        />
        <StatCard
          title="在途数量"
          value={formatNumber(summaryData.inTransit)}
          change={12}
          icon={Truck}
          color="green"
          delay={200}
        />
        <StatCard
          title="平均库存覆盖"
          value={`${summaryData.avgDaysCoverage.toFixed(1)}天`}
          change={3.5}
          icon={Calendar}
          color="blue"
          delay={300}
        />
      </div>

      <div className="glass-card p-6 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-white">库存清单</h3>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="input-field text-sm"
            >
              <option value="all">全部仓库</option>
              {warehouses.map((wh) => (
                <option key={wh} value={wh}>{wh}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-400">仅显示低库存</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="data-table">
            <thead>
              <tr>
                <th>商品</th>
                <th>SKU</th>
                <th>仓库</th>
                <th>当前库存</th>
                <th>可用库存</th>
                <th>日销量</th>
                <th>库存水平</th>
                <th>可售天数</th>
                <th>补货日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((inv, index) => {
                const availableStock = inv.currentStock - inv.reservedStock;
                const daysOfStock = getDaysOfStock(inv);
                const lowStock = isLowStock(inv);
                const needRestock = needsRestockSoon(inv);
                const stockPct = getStockPercentage(inv);

                return (
                  <tr
                    key={inv.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.4s ease-out ${index * 50}ms forwards`,
                    }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{inv.product?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{inv.platform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-gray-300">{inv.product?.sku || '-'}</td>
                    <td>
                      <span className="badge badge-info">{inv.warehouse}</span>
                    </td>
                    <td className="font-mono text-white">{formatNumber(inv.currentStock)}</td>
                    <td className="font-mono">
                      <span className={lowStock ? 'text-danger-500' : 'text-white'}>
                        {formatNumber(availableStock)}
                      </span>
                    </td>
                    <td className="font-mono text-gray-300">{formatNumber(inv.dailySalesRate)}</td>
                    <td>
                      <div className="w-32">
                        <div className="progress-bar">
                          <div
                            className={cn(
                              'progress-bar-fill',
                              lowStock ? 'bg-danger-500' : stockPct < 50 ? 'bg-warning-500' : 'bg-success-500'
                            )}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-gray-500">安全库存: {inv.safetyStock}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {daysOfStock <= 7 ? (
                          <AlertTriangle size={14} className="text-danger-500" />
                        ) : daysOfStock <= 14 ? (
                          <Clock size={14} className="text-warning-500" />
                        ) : (
                          <CheckCircle size={14} className="text-success-500" />
                        )}
                        <span className={cn(
                          'font-mono',
                          daysOfStock <= 7 ? 'text-danger-500' : daysOfStock <= 14 ? 'text-warning-500' : 'text-white'
                        )}>
                          {daysOfStock.toFixed(1)}天
                        </span>
                      </div>
                    </td>
                    <td>
                      {inv.restockDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className={needRestock ? 'text-danger-500' : 'text-gray-400'} />
                          <span className={needRestock ? 'text-danger-500' : 'text-gray-300'}>
                            {formatDate(inv.restockDate)}
                          </span>
                        </div>
                      ) : (
                        needRestock && (
                          <span className="text-danger-500 text-sm flex items-center gap-1">
                            <AlertTriangle size={12} />
                            需补货
                          </span>
                        )
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => openAdjustModal(inv)}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                      >
                        调整库存
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-500">暂无符合条件的库存数据</p>
          </div>
        )}
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-xl w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">库存调整</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {selectedInventory && (
              <div className="mb-6 p-4 bg-dark-700/50 rounded-lg">
                <p className="font-medium text-white">{selectedInventory.product?.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  SKU: {selectedInventory.product?.sku} | 仓库: {selectedInventory.warehouse}
                </p>
                <p className="text-sm text-gray-400">
                  当前库存: <span className="font-mono text-white">{formatNumber(selectedInventory.currentStock)}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'add' })}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
                    adjustForm.type === 'add'
                      ? 'bg-success-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  )}
                >
                  增加库存
                </button>
                <button
                  onClick={() => setAdjustForm({ ...adjustForm, type: 'reduce' })}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
                    adjustForm.type === 'reduce'
                      ? 'bg-danger-600 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                  )}
                >
                  减少库存
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">调整数量</label>
                <input
                  type="number"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
                  placeholder="请输入数量"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">调整原因</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">请选择原因</option>
                  <option value="入库">采购入库</option>
                  <option value="退货">客户退货</option>
                  <option value="盘点">盘点调整</option>
                  <option value="损耗">库存损耗</option>
                  <option value="其他">其他原因</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleAdjustSubmit}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  确认调整
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
