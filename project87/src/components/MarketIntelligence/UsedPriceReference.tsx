import React, { useState } from 'react';
import { Search, Plus, Tag, BarChart2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const UsedPriceReference: React.FC = () => {
  const { usedPriceReferences, products, addUsedPriceReference } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReference, setNewReference] = useState({
    productName: '',
    brand: '',
    model: '',
    condition: 'good' as const,
    minPrice: '',
    maxPrice: '',
    source: '闲鱼',
  });

  const filteredReferences = usedPriceReferences.filter(
    (ref) =>
      ref.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conditionLabels: Record<string, string> = {
    new: '全新',
    'like-new': '准新',
    good: '良好',
    fair: '一般',
  };

  const conditionColors: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-700',
    'like-new': 'bg-blue-100 text-blue-700',
    good: 'bg-yellow-100 text-yellow-700',
    fair: 'bg-gray-100 text-gray-700',
  };

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    const minPrice = parseFloat(newReference.minPrice);
    const maxPrice = parseFloat(newReference.maxPrice);
    if (newReference.productName && minPrice && maxPrice) {
      addUsedPriceReference({
        ...newReference,
        minPrice,
        maxPrice,
        averagePrice: Math.round((minPrice + maxPrice) / 2),
        recordedAt: new Date().toISOString(),
      });
      setNewReference({
        productName: '',
        brand: '',
        model: '',
        condition: 'good',
        minPrice: '',
        maxPrice: '',
        source: '闲鱼',
      });
      setShowAddModal(false);
    }
  };

  const productNames = [...new Set(products.map((p) => p.name))];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">二手市场估值参考</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索产品名称或品牌..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Plus size={18} />
            添加参考
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReferences.map((ref) => (
          <div key={ref.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">{ref.productName}</h3>
                  <p className="text-pink-100 text-sm">{ref.brand} {ref.model}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[ref.condition]}`}>
                  {conditionLabels[ref.condition]}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">价格区间</span>
                <span className="text-sm font-medium text-gray-700">
                  ¥{ref.minPrice.toLocaleString()} - ¥{ref.maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">参考均价</span>
                  <span className="text-2xl font-bold text-pink-600">
                    ¥{ref.averagePrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  {ref.source}
                </span>
                <span>
                  {new Date(ref.recordedAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReferences.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          <BarChart2 size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg">没有找到二手价格参考</p>
          <p className="mt-2">点击"添加参考"记录市场数据</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">添加二手价格参考</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddReference} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">产品名称</label>
                <input
                  type="text"
                  list="productNames"
                  value={newReference.productName}
                  onChange={(e) => setNewReference({ ...newReference, productName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="选择或输入产品名称"
                  required
                />
                <datalist id="productNames">
                  {productNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                  <input
                    type="text"
                    value={newReference.brand}
                    onChange={(e) => setNewReference({ ...newReference, brand: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例如：Apple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">型号/配置</label>
                  <input
                    type="text"
                    value={newReference.model}
                    onChange={(e) => setNewReference({ ...newReference, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="例如：256GB"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">成色</label>
                <select
                  value={newReference.condition}
                  onChange={(e) => setNewReference({ ...newReference, condition: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="new">全新</option>
                  <option value="like-new">准新（99新）</option>
                  <option value="good">良好（95新）</option>
                  <option value="fair">一般（9成新及以下）</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最低价格 (元)</label>
                  <input
                    type="number"
                    value={newReference.minPrice}
                    onChange={(e) => setNewReference({ ...newReference, minPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最高价格 (元)</label>
                  <input
                    type="number"
                    value={newReference.maxPrice}
                    onChange={(e) => setNewReference({ ...newReference, maxPrice: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">数据来源</label>
                <select
                  value={newReference.source}
                  onChange={(e) => setNewReference({ ...newReference, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="闲鱼">闲鱼</option>
                  <option value="转转">转转</option>
                  <option value="找靓机">找靓机</option>
                  <option value="爱回收">爱回收</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsedPriceReference;
