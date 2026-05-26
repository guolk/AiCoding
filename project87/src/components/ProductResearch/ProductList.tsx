import React, { useState } from 'react';
import { Heart, Plus, Trash2, Edit2, ExternalLink, Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import AddProductModal from './AddProductModal';
import { Product } from '../../types';

const ProductList: React.FC = () => {
  const { products, toggleFavorite, deleteProduct, categoryDimensions } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || product.isFavorite;
    return matchesCategory && matchesSearch && matchesFavorite;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">产品收藏与管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          添加产品
        </button>
      </div>

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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">全部品类</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavoritesOnly}
              onChange={(e) => setShowFavoritesOnly(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-gray-700">仅显示收藏</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand} · {product.category}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-2 rounded-full transition-colors ${product.isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <Heart size={20} fill={product.isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">¥{product.currentPrice.toLocaleString()}</p>
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  <ExternalLink size={14} />
                  {product.source || '查看来源'}
                </a>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">核心规格</h4>
              <div className="space-y-1">
                {product.specs.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-500">{spec.dimension}</span>
                    <span className="text-gray-800 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={() => setEditingProduct(product)}
                className="flex-1 flex items-center justify-center gap-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={16} />
                编辑
              </button>
              <button
                onClick={() => deleteProduct(product.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">没有找到符合条件的产品</p>
          <p className="mt-2">点击上方"添加产品"按钮开始收藏</p>
        </div>
      )}

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          categoryDimensions={categoryDimensions}
        />
      )}

      {editingProduct && (
        <AddProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          categoryDimensions={categoryDimensions}
        />
      )}
    </div>
  );
};

export default ProductList;
