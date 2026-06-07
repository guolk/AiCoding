import { useState, useMemo } from 'react';
import { ChevronDown, ArrowRight, Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import {
  formatCurrency,
  productStatusLabels,
  productStatusColors,
  platformNames,
  platformColors,
} from '@/lib/api';
import type { Product, ProductStatus, Platform } from '@/../shared/types';

const statusFlow: Record<ProductStatus, ProductStatus | null> = {
  listing: 'promoting',
  promoting: 'slow_selling',
  slow_selling: 'clearing',
  clearing: null,
};

const statusIcons = {
  listing: Package,
  promoting: TrendingUp,
  slow_selling: AlertTriangle,
  clearing: XCircle,
};

type StatusFilter = ProductStatus | 'all';
type PlatformFilter = Platform | 'all';

export function Lifecycle() {
  const { products, inventory, updateProductStatus } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const statusMatch = statusFilter === 'all' || p.status === statusFilter;
      const platformMatch = platformFilter === 'all' || p.platform === platformFilter;
      return statusMatch && platformMatch;
    });
  }, [products, statusFilter, platformFilter]);

  const getProductStock = (productId: string) => {
    const productInventory = inventory.filter((i) => i.productId === productId);
    return productInventory.reduce((sum, i) => sum + i.currentStock, 0);
  };

  const handleStatusChange = (productId: string, currentStatus: ProductStatus) => {
    const nextStatus = statusFlow[currentStatus];
    if (nextStatus) {
      updateProductStatus(productId, nextStatus);
    }
  };

  const getStatusColorClass = (status: ProductStatus) => {
    const colorMap: Record<ProductStatus, string> = {
      listing: 'before:bg-primary-500 text-primary-400',
      promoting: 'before:bg-success-500 text-success-500',
      slow_selling: 'before:bg-warning-500 text-warning-500',
      clearing: 'before:bg-danger-500 text-danger-500',
    };
    return colorMap[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">状态筛选：</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="input-field appearance-none pr-10 min-w-32"
            >
              <option value="all">全部状态</option>
              <option value="listing">上架中</option>
              <option value="promoting">推广中</option>
              <option value="slow_selling">滞销</option>
              <option value="clearing">清库</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">平台筛选：</span>
          <div className="relative">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as PlatformFilter)}
              className="input-field appearance-none pr-10 min-w-32"
            >
              <option value="all">全部平台</option>
              <option value="amazon">Amazon</option>
              <option value="ebay">eBay</option>
              <option value="shopify">Shopify</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="ml-auto text-sm text-gray-400">
          共 <span className="text-white font-medium">{filteredProducts.length}</span> 个产品
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((product: Product, index: number) => {
          const StatusIcon = statusIcons[product.status];
          const stock = getProductStock(product.id);
          const nextStatus = statusFlow[product.status];

          return (
            <div
              key={product.id}
              className={`glass-card-hover p-5 relative overflow-hidden ${getStatusColorClass(product.status)}`}
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
              }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl bg-current" />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-dark-700/50">
                    <StatusIcon size={20} className="text-current" />
                  </div>
                  <div>
                    <span className={`${productStatusColors[product.status]}`}>
                      {productStatusLabels[product.status]}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: platformColors[product.platform] }}
                      />
                      <span className="text-xs text-gray-500">
                        {platformNames[product.platform]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mb-4 font-mono">SKU: {product.sku}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-dark-700/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">售价</p>
                  <p className="text-lg font-bold text-white font-mono">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="bg-dark-700/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">成本</p>
                  <p className="text-lg font-bold text-gray-300 font-mono">
                    {formatCurrency(product.cost)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">库存</p>
                  <p className={`text-lg font-bold font-mono ${
                    stock < 50 ? 'text-danger-500' : stock < 100 ? 'text-warning-500' : 'text-success-500'
                  }`}>
                    {stock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">毛利率</p>
                  <p className={`text-lg font-bold font-mono ${
                    ((product.price - product.cost) / product.price) >= 0.5 ? 'text-success-500' : 'text-warning-500'
                  }`}>
                    {(((product.price - product.cost) / product.price) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {nextStatus && (
                <button
                  onClick={() => handleStatusChange(product.id, product.status)}
                  className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <span>转为 {productStatusLabels[nextStatus]}</span>
                  <ArrowRight size={16} />
                </button>
              )}
              {!nextStatus && (
                <div className="w-full py-2 text-center text-xs text-gray-500 border border-dashed border-dark-600 rounded-lg">
                  已到最终状态
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">暂无符合条件的产品</p>
        </div>
      )}
    </div>
  );
}
