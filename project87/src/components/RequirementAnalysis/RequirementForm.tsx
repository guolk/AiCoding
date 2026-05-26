import React, { useState } from 'react';
import { Save, Target, DollarSign, Star } from 'lucide-react';
import { useApp } from '../../store/AppContext';

const RequirementForm: React.FC = () => {
  const { requirements, addRequirement } = useApp();
  const [useCase, setUseCase] = useState('');
  const [budget, setBudget] = useState('');
  const [topMetrics, setTopMetrics] = useState<string[]>(['', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const validMetrics = topMetrics.filter((m) => m.trim());
    
    if (!useCase.trim()) {
      setError('请描述使用场景');
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      setError('请输入有效的预算金额');
      return;
    }
    if (validMetrics.length === 0) {
      setError('请至少填写一个重要指标');
      return;
    }
    
    addRequirement({
      useCase: useCase.trim(),
      budget: parseFloat(budget),
      topMetrics: validMetrics,
    });
    setUseCase('');
    setBudget('');
    setTopMetrics(['', '', '']);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateMetric = (index: number, value: string) => {
    const newMetrics = [...topMetrics];
    newMetrics[index] = value;
    setTopMetrics(newMetrics);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">购买需求梳理</h2>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <Save size={20} />
          需求已成功保存！
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            填写我的购买需求
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用场景描述
              </label>
              <textarea
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="例如：日常通勤使用，主要用来拍照、刷社交媒体、偶尔玩游戏，需要续航好..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                预算范围 (元)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：5000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star size={16} className="inline mr-1 text-yellow-500" />
                最重要的三个指标
              </label>
              <div className="space-y-2">
                {topMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={metric}
                      onChange={(e) => updateMetric(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={index === 0 ? '最看重的指标，例如：续航能力' : `第${index + 1}重要的指标`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              保存需求
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">历史需求记录</h3>
          {requirements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>还没有保存的需求记录</p>
              <p className="text-sm mt-2">填写左侧表单开始记录</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {requirements.slice().reverse().map((req) => (
                <div key={req.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ¥{req.budget.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{req.useCase}</p>
                  <div className="flex flex-wrap gap-1">
                    {req.topMetrics.map((metric, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {metric}
                      </span>
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

export default RequirementForm;
