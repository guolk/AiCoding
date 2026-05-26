import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const PriceHistory: React.FC = () => {
  const { products, priceHistories, addPriceHistory } = useApp();
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [newPrice, setNewPrice] = useState('');
  const [newNote, setNewNote] = useState('');

  const selectedProductData = products.find((p) => p.id === selectedProduct);
  const productPriceHistory = priceHistories
    .filter((h) => h.productId === selectedProduct)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  const chartData = productPriceHistory.map((h) => ({
    date: new Date(h.recordedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    价格: h.price,
    note: h.note,
  }));

  if (productPriceHistory.length === 0 && selectedProductData) {
    chartData.push({
      date: new Date(selectedProductData.addedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      价格: selectedProductData.currentPrice,
      note: '当前价格',
    });
  }

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && newPrice) {
      addPriceHistory({
        productId: selectedProduct,
        price: parseFloat(newPrice),
        recordedAt: new Date().toISOString().split('T')[0],
        note: newNote || undefined,
      });
      setNewPrice('');
      setNewNote('');
    }
  };

  const getPriceTrend = () => {
    if (productPriceHistory.length < 2) return null;
    const first = productPriceHistory[0].price;
    const last = productPriceHistory[productPriceHistory.length - 1].price;
    const diff = last - first;
    const percent = ((diff / first) * 100).toFixed(1);
    return { diff, percent, isDown: diff < 0 };
  };

  const trend = getPriceTrend();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">价格历史追踪</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {trend && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${trend.isDown ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {trend.isDown ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                  <span className="text-sm font-medium">{trend.isDown ? '' : '+'}{trend.percent}%</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">当前价格</p>
              <p className="text-2xl font-bold text-teal-600">¥{selectedProductData?.currentPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '价格']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="价格"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ fill: '#0d9488', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                请选择产品查看价格历史
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-teal-500" />
              记录新价格
            </h3>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">价格 (元)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="输入价格"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="例如：双11特价"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                记录价格
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-teal-500" />
              价格记录
            </h3>
            {productPriceHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">暂无价格记录</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {productPriceHistory.slice().reverse().map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-800">¥{record.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(record.recordedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    {record.note && (
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                        {record.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceHistory;
