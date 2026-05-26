import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const ProductComparison: React.FC = () => {
  const { products } = useApp();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(products.slice(0, 2).map((p) => p.id));
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  const allDimensions = useMemo(() => {
    const dims = new Set<string>();
    selectedProducts.forEach((p) => {
      p.specs.forEach((s) => dims.add(s.dimension));
    });
    return Array.from(dims);
  }, [selectedProducts]);

  const getSpecValue = (productId: string, dimension: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.specs.find((s) => s.dimension === dimension)?.value || '-';
  };

  const hasDifference = (dimension: string) => {
    const values = selectedProductIds.map((id) => getSpecValue(id, dimension));
    return new Set(values).size > 1;
  };

  const toggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      if (selectedProductIds.length > 2) {
        setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
      }
    } else {
      if (selectedProductIds.length < 5) {
        setSelectedProductIds([...selectedProductIds, productId]);
      }
    }
  };

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">产品横向对比</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-3">选择对比产品 (最多5款)</h3>
        {categories.map((category) => (
          <div key={category} className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {products
                .filter((p) => p.category === category)
                .map((product) => (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedProductIds.includes(product.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {product.name}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {selectedProducts.length < 2 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
          <p className="text-lg">请至少选择2款产品进行对比</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 sticky left-0 bg-gray-50 z-10 min-w-32">
                    对比项
                  </th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="px-4 py-3 text-center min-w-40">
                      <div className="relative">
                        <button
                          onClick={() => toggleProduct(product.id)}
                          className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <X size={14} />
                        </button>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-600 font-medium sticky left-0 bg-white">当前价格</td>
                  {selectedProducts.map((product) => (
                    <td key={product.id} className="px-4 py-3 text-center">
                      <span className="text-xl font-bold text-blue-600">
                        ¥{product.currentPrice.toLocaleString()}
                      </span>
                    </td>
                  ))}
                </tr>

                {allDimensions.slice(0, showAllSpecs ? allDimensions.length : 8).map((dimension) => {
                  const isDiff = hasDifference(dimension);
                  return (
                    <tr key={dimension} className={`border-b border-gray-100 ${isDiff ? 'diff-highlight' : ''}`}>
                      <td className={`px-4 py-2.5 text-sm font-medium sticky left-0 ${isDiff ? 'bg-yellow-50' : 'bg-white'}`}>
                        <span className={isDiff ? 'text-orange-700' : 'text-gray-600'}>
                          {isDiff && <span className="mr-1">●</span>}
                          {dimension}
                        </span>
                      </td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="px-4 py-2.5 text-center text-sm">
                          <span className={isDiff ? 'font-semibold text-gray-800' : 'text-gray-700'}>
                            {getSpecValue(product.id, dimension)}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {allDimensions.length > 8 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mx-auto"
              >
                {showAllSpecs ? (
                  <><ChevronUp size={16} /> 收起部分规格</>
                ) : (
                  <><ChevronDown size={16} /> 展开全部 {allDimensions.length} 项规格</>
                )}
              </button>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border-t border-yellow-100">
            <p className="text-xs text-yellow-700 flex items-center gap-2">
              <span className="text-orange-500">●</span>
              黄色高亮表示该规格在不同产品间存在差异，便于快速对比
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductComparison;
