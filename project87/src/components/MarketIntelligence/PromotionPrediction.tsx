import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar as CalendarIcon, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const PromotionPrediction: React.FC = () => {
  const { promotionPredictions, products } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('智能手机');

  const categories = [...new Set(promotionPredictions.map((p) => p.category))];
  const categoryPredictions = promotionPredictions.filter((p) => p.category === selectedCategory);

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const chartData = monthNames.map((month, index) => {
    const prediction = categoryPredictions.find((p) => p.month === index + 1);
    return {
      month,
      折扣率: prediction ? prediction.discountRate : 0,
      活动: prediction?.eventName || '',
      准确率: prediction?.historicalAccuracy || 0,
    };
  });

  const nextPromotion = categoryPredictions
    .filter((p) => p.month >= new Date().getMonth() + 1)
    .sort((a, b) => a.month - b.month)[0] || categoryPredictions[0];

  const barColors = chartData.map((d) => {
    if (d.折扣率 >= 20) return '#dc2626';
    if (d.折扣率 >= 15) return '#f59e0b';
    if (d.折扣率 >= 10) return '#10b981';
    return '#e5e7eb';
  });

  const categoryProducts = products.filter((p) => p.category === selectedCategory);
  const avgPrice = categoryProducts.length > 0
    ? Math.round(categoryProducts.reduce((sum, p) => sum + p.currentPrice, 0) / categoryProducts.length)
    : 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">促销节点预测</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CalendarIcon size={20} className="text-indigo-500" />
              {selectedCategory} 全年促销预测
            </h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value: number, name: string) => {
                    if (name === '折扣率') {
                      return [`${value}%`, name];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="折扣率" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-600"></div>
              <span className="text-sm text-gray-600">大促 (≥20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-sm text-gray-600">中促 (15-20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span className="text-sm text-gray-600">小促 (10-15%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {nextPromotion && (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={24} />
                <h3 className="text-lg font-semibold">下一个促销节点</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-indigo-100">活动名称</span>
                  <span className="font-semibold">{nextPromotion.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">预计月份</span>
                  <span className="font-semibold">{nextPromotion.month}月</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">预期折扣</span>
                  <span className="font-semibold text-2xl">{nextPromotion.discountRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-100">历史准确率</span>
                  <span className="font-semibold">{(nextPromotion.historicalAccuracy * 100).toFixed(0)}%</span>
                </div>
                {avgPrice > 0 && (
                  <div className="pt-3 border-t border-white/20">
                    <p className="text-indigo-100 text-sm">预计可节省</p>
                    <p className="text-3xl font-bold">
                      ¥{Math.round(avgPrice * nextPromotion.discountRate / 100).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-indigo-500" />
              促销建议
            </h3>
            <div className="space-y-3">
              {categoryPredictions
                .sort((a, b) => b.discountRate - a.discountRate)
                .map((prediction) => (
                  <div key={prediction.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <TrendingUp size={18} className="text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">{prediction.eventName}</p>
                      <p className="text-sm text-gray-500">
                        {prediction.month}月 · {prediction.discountRate}% 折扣 · 准确率 {(prediction.historicalAccuracy * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionPrediction;
