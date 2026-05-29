import { useState } from 'react';
import { Plus, AlertTriangle, Upload, Package, Search, TrendingDown, X, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { INVENTORY_SOURCE_LABELS, INVENTORY_SOURCE_COLORS, LEGO_COLORS } from '../utils/constants';

export default function Inventory() {
  const { inventory, searchQuery, addInventoryItem } = useAppStore();
  const [filterSource, setFilterSource] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    part_num: string;
    part_name: string;
    color_id: number;
    quantity: number;
    min_quantity: number;
    source: 'set' | 'spare' | 'purchase' | 'other';
    notes: string;
  }>({
    part_num: '',
    part_name: '',
    color_id: 1,
    quantity: 10,
    min_quantity: 5,
    source: 'set',
    notes: '',
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSource = filterSource === 'all' || item.source === filterSource;
    const matchesSearch = !searchQuery ||
      item.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.part_num.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const lowStockItems = inventory.filter((item) => item.quantity < item.min_quantity);

  const totalParts = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueParts = inventory.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedColor = LEGO_COLORS.find(c => c.id === formData.color_id) || LEGO_COLORS[0];
    
    addInventoryItem({
      part_num: formData.part_num,
      part_name: formData.part_name,
      color_id: formData.color_id,
      color_name: selectedColor.name,
      color_rgb: selectedColor.rgb,
      quantity: formData.quantity,
      min_quantity: formData.min_quantity,
      source: formData.source,
      notes: formData.notes || undefined,
    });

    setShowAddModal(false);
    setFormData({
      part_num: '',
      part_name: '',
      color_id: 1,
      quantity: 10,
      min_quantity: 5,
      source: 'set',
      notes: '',
    });
  };

  const selectedColor = LEGO_COLORS.find(c => c.id === formData.color_id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">总零件数</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {totalParts.toLocaleString()}
              </h3>
            </div>
            <div className="p-3 rounded-brick bg-lego-yellow/20 text-amber-700">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">零件种类</p>
              <h3 className="text-2xl font-display font-bold text-lego-dark">
                {uniqueParts}
              </h3>
            </div>
            <div className="p-3 rounded-brick bg-lego-blue/10 text-lego-blue">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="brick-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">低库存预警</p>
              <h3 className={`text-2xl font-display font-bold ${lowStockItems.length > 0 ? 'text-lego-red' : 'text-emerald-600'}`}>
                {lowStockItems.length}
              </h3>
            </div>
            <div className={`p-3 rounded-brick ${lowStockItems.length > 0 ? 'bg-lego-red/10 text-lego-red' : 'bg-emerald-100 text-emerald-600'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="brick-card p-4 border-lego-yellow/50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-amber-500" />
            <h3 className="font-display font-semibold text-lego-dark">低库存提醒</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-amber-50 rounded-brick flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-brick border border-gray-200 flex-shrink-0"
                  style={{ backgroundColor: item.color_rgb }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-lego-dark truncate">
                    {item.part_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.color_name} · {item.part_num}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-lego-red">
                    {item.quantity} / {item.min_quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    缺 {item.min_quantity - item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="brick-input w-40"
          >
            <option value="all">全部来源</option>
            <option value="set">{INVENTORY_SOURCE_LABELS.set}</option>
            <option value="spare">{INVENTORY_SOURCE_LABELS.spare}</option>
            <option value="purchase">{INVENTORY_SOURCE_LABELS.purchase}</option>
            <option value="other">{INVENTORY_SOURCE_LABELS.other}</option>
          </select>
          <span className="text-sm text-gray-500">
            共 {filteredInventory.length} 种零件
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="brick-btn-secondary flex items-center gap-2">
            <Upload size={18} />
            <span>图片识别</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="brick-btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            <span>添加零件</span>
          </button>
        </div>
      </div>

      <div className="brick-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                零件
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                颜色
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                数量
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                来源
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                备注
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredInventory.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-brick border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: item.color_rgb }}
                    />
                    <div>
                      <p className="font-medium text-lego-dark">{item.part_name}</p>
                      <p className="text-xs text-gray-500">{item.part_num}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: item.color_rgb }}
                    />
                    <span className="text-sm text-gray-600">{item.color_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${
                      item.quantity < item.min_quantity ? 'text-lego-red' : 'text-lego-dark'
                    }`}>
                      {item.quantity}
                    </span>
                    <span className="text-xs text-gray-400">
                      / {item.min_quantity}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${INVENTORY_SOURCE_COLORS[item.source]}`}>
                    {INVENTORY_SOURCE_LABELS[item.source]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {item.quantity < item.min_quantity ? (
                    <span className="flex items-center gap-1 text-sm text-lego-red">
                      <TrendingDown size={14} />
                      低库存
                    </span>
                  ) : (
                    <span className="text-sm text-emerald-600">正常</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInventory.length === 0 && (
        <div className="brick-card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-brick flex items-center justify-center">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-lego-dark mb-2">没有找到零件</h3>
          <p className="text-gray-500">尝试添加新零件或调整筛选条件</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-brick shadow-lego-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-display font-semibold text-lego-dark">添加新零件</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-brick transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">零件编号 *</label>
                  <input
                    type="text"
                    required
                    value={formData.part_num}
                    onChange={(e) => setFormData({ ...formData, part_num: e.target.value })}
                    className="brick-input"
                    placeholder="如：3001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">零件名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.part_name}
                    onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                    className="brick-input"
                    placeholder="如：Brick 2x4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
                <select
                  value={formData.color_id}
                  onChange={(e) => setFormData({ ...formData, color_id: Number(e.target.value) })}
                  className="brick-input"
                >
                  {LEGO_COLORS.slice(0, 50).map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name}
                    </option>
                  ))}
                </select>
                {selectedColor && (
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: selectedColor.rgb }}
                    />
                    <span className="text-sm text-gray-500">{selectedColor.name}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前数量</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="brick-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低库存</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                    className="brick-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">来源</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as 'set' | 'spare' | 'purchase' | 'other' })}
                  className="brick-input"
                >
                  <option value="set">{INVENTORY_SOURCE_LABELS.set}</option>
                  <option value="spare">{INVENTORY_SOURCE_LABELS.spare}</option>
                  <option value="purchase">{INVENTORY_SOURCE_LABELS.purchase}</option>
                  <option value="other">{INVENTORY_SOURCE_LABELS.other}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="brick-input resize-none"
                  rows={2}
                  placeholder="可选备注信息..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="brick-btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="brick-btn-primary flex items-center gap-2">
                  <Check size={16} />
                  添加零件
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
