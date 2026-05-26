import React, { useState } from 'react';
import { Zap, Plus, BarChart3 } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const SceneEvaluation: React.FC = () => {
  const { products, sceneEvaluations, addSceneEvaluation } = useApp();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [scene, setScene] = useState('');
  const [suitabilityScore, setSuitabilityScore] = useState(75);
  const [notes, setNotes] = useState('');

  const sceneSuggestions = [
    '日常通勤',
    '商务办公',
    '游戏娱乐',
    '摄影创作',
    '户外运动',
    '学生学习',
    '家庭使用',
    '旅行出行',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct && scene) {
      addSceneEvaluation({
        productId: selectedProduct,
        scene,
        suitabilityScore,
        notes,
      });
      setScene('');
      setSuitabilityScore(75);
      setNotes('');
    }
  };

  const getProductEvaluations = (productId: string) => {
    return sceneEvaluations.filter((e) => e.productId === productId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-blue-100 text-blue-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">使用场景模拟评估</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-orange-500" />
            新增场景评估
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择产品</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">请选择要评估的产品</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">使用场景</label>
              <input
                type="text"
                value={scene}
                onChange={(e) => setScene(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="例如：每天2小时通勤路上听音乐"
                required
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {sceneSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScene(s)}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-orange-100 hover:text-orange-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">适合度评分</label>
                <span className={`px-3 py-1 rounded-full text-lg font-bold ${getScoreBg(suitabilityScore)}`}>
                  {suitabilityScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={suitabilityScore}
                onChange={(e) => setSuitabilityScore(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>不适合</span>
                <span>一般</span>
                <span>非常适合</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">评估备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="说明为什么适合或不适合..."
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              添加评估
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-teal-500" />
            产品场景适配度
          </h3>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>还没有添加产品</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              {products.map((product) => {
                const evaluations = getProductEvaluations(product.id);
                const avgScore = evaluations.length > 0
                  ? Math.round(evaluations.reduce((sum, e) => sum + e.suitabilityScore, 0) / evaluations.length)
                  : null;

                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                      {avgScore !== null && (
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreBg(avgScore)}`}>
                          综合 {avgScore}%
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      {evaluations.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">暂无场景评估</p>
                      ) : (
                        <div className="space-y-3">
                          {evaluations.map((eval_) => (
                            <div key={eval_.id} className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${getScoreColor(eval_.suitabilityScore)}`} />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">{eval_.scene}</span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreBg(eval_.suitabilityScore)}`}>
                                    {eval_.suitabilityScore}%
                                  </span>
                                </div>
                                {eval_.notes && (
                                  <p className="text-xs text-gray-500 mt-1">{eval_.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneEvaluation;
