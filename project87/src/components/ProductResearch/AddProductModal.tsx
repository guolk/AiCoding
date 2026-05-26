import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Product, CategoryDimensions, ProductSpec } from '../../types';

interface AddProductModalProps {
  product?: Product;
  onClose: () => void;
  categoryDimensions: CategoryDimensions[];
}

const AddProductModal: React.FC<AddProductModalProps> = ({ product, onClose, categoryDimensions }) => {
  const { addProduct, updateProduct } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [newSpecDimension, setNewSpecDimension] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setBrand(product.brand);
      setUrl(product.url || '');
      setSource(product.source || '');
      setCurrentPrice(product.currentPrice.toString());
      setSpecs(product.specs);
    }
  }, [product]);

  useEffect(() => {
    if (category && !product) {
      const dims = categoryDimensions.find((cd) => cd.category === category);
      if (dims) {
        setSpecs(dims.dimensions.map((d) => ({ dimension: d, value: '' })));
      }
    }
  }, [category, categoryDimensions, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const finalCategory = showCustomCategory ? customCategory : category;
    
    if (!name.trim()) {
      setError('请输入产品名称');
      return;
    }
    if (!brand.trim()) {
      setError('请输入品牌');
      return;
    }
    if (!finalCategory) {
      setError('请选择或输入品类');
      return;
    }
    if (!currentPrice || parseFloat(currentPrice) <= 0) {
      setError('请输入有效的价格');
      return;
    }
    
    const productData = {
      name: name.trim(),
      category: finalCategory,
      brand: brand.trim(),
      url: url || undefined,
      source: source || undefined,
      currentPrice: parseFloat(currentPrice),
      specs: specs.filter((s) => s.dimension && s.value),
      isFavorite: product?.isFavorite || false,
      imageUrl: undefined,
    };

    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }
    onClose();
  };

  const addSpec = () => {
    if (newSpecDimension) {
      setSpecs([...specs, { dimension: newSpecDimension, value: newSpecValue }]);
      setNewSpecDimension('');
      setNewSpecValue('');
    }
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'dimension' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const parseUrl = () => {
    if (url) {
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('jd.com')) {
          setSource('京东');
        } else if (urlObj.hostname.includes('taobao.com') || urlObj.hostname.includes('tmall.com')) {
          setSource('淘宝/天猫');
        } else if (urlObj.hostname.includes('apple.com')) {
          setSource('Apple官网');
        } else if (urlObj.hostname.includes('huawei.com')) {
          setSource('华为商城');
        } else {
          setSource(urlObj.hostname);
        }
      } catch {
        // Invalid URL
      }
    }
  };

  const allCategories = [...categoryDimensions.map((cd) => cd.category), '自定义品类'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">
            {product ? '编辑产品' : '添加产品'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：iPhone 15 Pro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品牌 *</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：Apple"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">品类 *</label>
              <select
                value={showCustomCategory ? '自定义品类' : category}
                onChange={(e) => {
                  if (e.target.value === '自定义品类') {
                    setShowCustomCategory(true);
                  } else {
                    setShowCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">选择品类</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {showCustomCategory && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="输入自定义品类"
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前价格 (元) *</label>
              <input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：7999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">来源网站</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：京东"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">产品链接</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={parseUrl}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={parseUrl}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Link2 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">产品规格</label>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={spec.dimension}
                    onChange={(e) => updateSpec(index, 'dimension', e.target.value)}
                    placeholder="规格名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpec(index, 'value', e.target.value)}
                    placeholder="规格值"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newSpecDimension}
                onChange={(e) => setNewSpecDimension(e.target.value)}
                placeholder="自定义规格名称"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="规格值"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSpec}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {product ? '保存修改' : '添加产品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
