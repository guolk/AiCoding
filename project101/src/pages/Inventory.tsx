import { useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { InventoryCategory, INVENTORY_CATEGORY_LABELS } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import {
  Package, Plus, RefreshCw, Edit2, Trash2, AlertTriangle, X,
  Hash, Layers, ShoppingCart, Filter
} from 'lucide-react';

type CategoryFilter = 'all' | InventoryCategory;

export default function Inventory() {
  const {
    inventoryItems,
    addInventoryItem,
    updateInventoryItem,
    restockInventoryItem,
    deleteInventoryItem,
    getLowStockItems
  } = useAppStore();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const [newItem, setNewItem] = useState({
    name: '',
    category: 'toiletries' as InventoryCategory,
    quantity: 0,
    minStock: 10,
    unit: '',
    notes: ''
  });

  const [editItem, setEditItem] = useState({
    name: '',
    category: 'toiletries' as InventoryCategory,
    quantity: 0,
    minStock: 10,
    unit: '',
    notes: ''
  });

  const filteredItems = categoryFilter === 'all'
    ? inventoryItems
    : inventoryItems.filter(item => item.category === categoryFilter);

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aLow = a.quantity <= a.minStock;
    const bLow = b.quantity <= b.minStock;
    if (aLow && !bLow) return -1;
    if (!aLow && bLow) return 1;
    return 0;
  });

  const lowStockItems = getLowStockItems();

  const categoryCounts = {
    all: inventoryItems.length,
    toiletries: inventoryItems.filter(i => i.category === 'toiletries').length,
    bedding: inventoryItems.filter(i => i.category === 'bedding').length,
    cleaning: inventoryItems.filter(i => i.category === 'cleaning').length,
    other: inventoryItems.filter(i => i.category === 'other').length
  };

  const categoryIcons: Record<InventoryCategory, React.ReactNode> = {
    toiletries: <Hash className="w-4 h-4" />,
    bedding: <Layers className="w-4 h-4" />,
    cleaning: <ShoppingCart className="w-4 h-4" />,
    other: <Package className="w-4 h-4" />
  };

  const categoryColors: Record<InventoryCategory, string> = {
    toiletries: 'bg-blue-50 text-blue-700',
    bedding: 'bg-purple-50 text-purple-700',
    cleaning: 'bg-green-50 text-green-700',
    other: 'bg-gray-50 text-gray-700'
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.unit.trim()) return;
    addInventoryItem({
      name: newItem.name.trim(),
      category: newItem.category,
      quantity: newItem.quantity,
      minStock: newItem.minStock,
      unit: newItem.unit.trim(),
      notes: newItem.notes || undefined
    });
    setShowAddModal(false);
    setNewItem({ name: '', category: 'toiletries', quantity: 0, minStock: 10, unit: '', notes: '' });
  };

  const openEditModal = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;
    setEditItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minStock: item.minStock,
      unit: item.unit,
      notes: item.notes || ''
    });
    setSelectedItemId(itemId);
    setShowEditModal(true);
  };

  const handleEditItem = () => {
    if (!selectedItemId || !editItem.name.trim() || !editItem.unit.trim()) return;
    updateInventoryItem(selectedItemId, {
      name: editItem.name.trim(),
      category: editItem.category,
      quantity: editItem.quantity,
      minStock: editItem.minStock,
      unit: editItem.unit.trim(),
      notes: editItem.notes || undefined
    });
    setShowEditModal(false);
    setSelectedItemId(null);
  };

  const openRestockModal = (itemId: string) => {
    setSelectedItemId(itemId);
    setRestockQuantity('');
    setShowRestockModal(true);
  };

  const handleRestock = () => {
    if (!selectedItemId || !restockQuantity || Number(restockQuantity) <= 0) return;
    restockInventoryItem(selectedItemId, Number(restockQuantity));
    setShowRestockModal(false);
    setSelectedItemId(null);
    setRestockQuantity('');
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('确定要删除这个库存项目吗？')) {
      deleteInventoryItem(itemId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">耗材库存管理</h1>
              <p className="mt-1 text-sm text-gray-500">
                管理各类耗材库存，及时补货避免短缺
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              添加耗材
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {lowStockItems.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">库存预警</h3>
                <p className="text-sm text-red-600 mt-1">
                  有 <span className="font-semibold">{lowStockItems.length}</span> 项耗材库存已低于最低水平，请及时补货
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">分类筛选:</span>
          </div>
          {(['all', 'toiletries', 'bedding', 'cleaning', 'other'] as CategoryFilter[]).map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                categoryFilter === category
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
              )}
            >
              {category !== 'all' && categoryIcons[category]}
              {category === 'all' ? '全部' : INVENTORY_CATEGORY_LABELS[category]}
              <span className={cn(
                'ml-1',
                categoryFilter === category ? 'text-emerald-100' : 'text-gray-400'
              )}>
                ({categoryCounts[category]})
              </span>
            </button>
          ))}
        </div>

        {sortedItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无耗材</h3>
            <p className="text-gray-500 mb-4">
              {categoryFilter === 'all'
                ? '还没有添加任何耗材'
                : `没有${INVENTORY_CATEGORY_LABELS[categoryFilter]}类的耗材`}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加第一个耗材
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      耗材名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      当前库存
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      最低库存
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      上次补货
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedItems.map((item) => {
                    const isLowStock = item.quantity <= item.minStock;
                    const stockPercentage = item.minStock > 0
                      ? Math.min((item.quantity / item.minStock) * 100, 150)
                      : 100;

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          'transition-colors',
                          isLowStock ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              isLowStock ? 'bg-red-100' : 'bg-amber-50'
                            )}>
                              {isLowStock ? (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                              ) : (
                                <Package className="w-5 h-5 text-amber-500" />
                              )}
                            </div>
                            <div>
                              <p className={cn(
                                'font-medium',
                                isLowStock ? 'text-red-900' : 'text-gray-900'
                              )}>
                                {item.name}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                            categoryColors[item.category]
                          )}>
                            {categoryIcons[item.category]}
                            {INVENTORY_CATEGORY_LABELS[item.category]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'font-semibold',
                              isLowStock ? 'text-red-600' : 'text-gray-900'
                            )}>
                              {item.quantity}
                              <span className="text-sm font-normal text-gray-500 ml-1">{item.unit}</span>
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-300',
                                  stockPercentage <= 50 ? 'bg-red-500' :
                                  stockPercentage <= 100 ? 'bg-amber-500' : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {item.minStock}
                            <span className="text-sm text-gray-400 ml-1">{item.unit}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-sm">
                            {item.lastRestockedAt ? formatDate(item.lastRestockedAt) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openRestockModal(item.id)}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
                                isLowStock
                                  ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              )}
                            >
                              <RefreshCw className="w-4 h-4" />
                              补货
                            </button>
                            <button
                              onClick={() => openEditModal(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">添加耗材</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">耗材名称</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="例如：一次性拖鞋"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as InventoryCategory })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {(Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{INVENTORY_CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    placeholder="例如：双、瓶"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">初始数量</label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
                  <input
                    type="number"
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  rows={2}
                  placeholder="可选备注..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name.trim() || !newItem.unit.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">编辑耗材</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">耗材名称</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value as InventoryCategory })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  >
                    {(Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[]).map((cat) => (
                      <option key={cat} value={cat}>{INVENTORY_CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={editItem.unit}
                    onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前数量</label>
                  <input
                    type="number"
                    value={editItem.quantity}
                    onChange={(e) => setEditItem({ ...editItem, quantity: Number(e.target.value) })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
                  <input
                    type="number"
                    value={editItem.minStock}
                    onChange={(e) => setEditItem({ ...editItem, minStock: Number(e.target.value) })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={editItem.notes}
                  onChange={(e) => setEditItem({ ...editItem, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleEditItem}
                disabled={!editItem.name.trim() || !editItem.unit.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestockModal && selectedItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">库存补货</h2>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-700">
                  当前库存：<span className="font-semibold">
                    {inventoryItems.find(i => i.id === selectedItemId)?.quantity || 0}
                    {inventoryItems.find(i => i.id === selectedItemId)?.unit || ''}
                  </span>
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-1">补货数量</label>
              <input
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
                min={1}
                placeholder="请输入补货数量"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowRestockModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleRestock}
                disabled={!restockQuantity || Number(restockQuantity) <= 0}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认补货
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
