import React, { useState } from 'react';
import { Sliders, Calculator, Award } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { WeightedScore } from '../../types';

const WeightSettings: React.FC = () => {
  const { weightSettings, updateWeightSettings, products } = useApp();
  const [localWeights, setLocalWeights] = useState(weightSettings);
  const [scores, setScores] = useState<WeightedScore[]>([]);
  const [showScores, setShowScores] = useState(false);
  const [productScores, setProductScores] = useState<Record<string, Record<string, number>>>({});

  const handleWeightChange = (index: number, value: number) => {
    const newWeights = [...localWeights];
    newWeights[index] = { ...newWeights[index], weight: value };
    setLocalWeights(newWeights);
  };

  const totalWeight = localWeights.reduce((sum, w) => sum + w.weight, 0);

  const calculateScores = () => {
    const newProductScores: Record<string, Record<string, number>> = {};
    products.forEach((product) => {
      newProductScores[product.id] = {};
      localWeights.forEach((w) => {
        newProductScores[product.id][w.metric] = Math.floor(Math.random() * 40) + 60;
      });
    });
    setProductScores(newProductScores);

    const calculatedScores: WeightedScore[] = products.map((product) => {
      const scores: Record<string, number> = {};
      let totalScore = 0;
      localWeights.forEach((w) => {
        const score = newProductScores[product.id][w.metric];
        scores[w.metric] = score;
        totalScore += score * (w.weight / 100);
      });
      return {
        productId: product.id,
        productName: product.name,
        scores,
        totalScore: Math.round(totalScore * 10) / 10,
        rank: 0,
      };
    });

    calculatedScores.sort((a, b) => b.totalScore - a.totalScore);
    calculatedScores.forEach((s, i) => (s.rank = i + 1));

    setScores(calculatedScores);
    setShowScores(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700';
    if (rank === 2) return 'bg-gray-100 text-gray-700';
    if (rank === 3) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">需求权重设置</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Sliders size={20} className="text-purple-600" />
            设置各指标权重
          </h3>

          <div className="space-y-6">
            {localWeights.map((weight, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{weight.metric}</span>
                  <span className="text-lg font-bold text-purple-600">{weight.weight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weight.weight}
                  onChange={(e) => handleWeightChange(index, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-lg ${totalWeight === 100 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">权重总计</span>
              <span className={`text-lg font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                {totalWeight}%
              </span>
            </div>
            {totalWeight !== 100 && (
              <p className="text-xs text-yellow-600 mt-1">请调整权重使其总和为100%</p>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => updateWeightSettings(localWeights)}
              className="flex-1 py-2.5 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              保存权重设置
            </button>
            <button
              onClick={calculateScores}
              className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calculator size={18} />
              计算推荐排名
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" />
            加权得分排名
          </h3>

          {!showScores ? (
            <div className="text-center py-12 text-gray-500">
              <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
              <p>点击"计算推荐排名"查看结果</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scores.map((score) => (
                <div
                  key={score.productId}
                  className={`p-4 rounded-lg border-2 ${
                    score.rank === 1 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRankBadge(score.rank)}`}>
                        #{score.rank}
                      </span>
                      <span className="font-semibold text-gray-800">{score.productName}</span>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(score.totalScore)}`}>
                      {score.totalScore}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {localWeights.map((w) => (
                      <div key={w.metric} className="flex justify-between text-sm">
                        <span className="text-gray-500">{w.metric}</span>
                        <span className={`font-medium ${getScoreColor(productScores[score.productId]?.[w.metric] || 0)}`}>
                          {productScores[score.productId]?.[w.metric] || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeightSettings;
