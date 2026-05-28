import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import type { InvestmentPhilosophy } from '../types';

export default function Growth() {
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<InvestmentPhilosophy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    quarter: getCurrentQuarter(),
  });

  const {
    investmentPhilosophy,
    addInvestmentPhilosophy,
    updateInvestmentPhilosophy,
    deleteInvestmentPhilosophy,
  } = useStore();

  function getCurrentQuarter() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `${year}-Q${quarter}`;
  }

  const handleSave = () => {
    if (selectedPhilosophy) {
      updateInvestmentPhilosophy(selectedPhilosophy.id, {
        content: formData.content,
        quarter: formData.quarter,
      });
    } else {
      addInvestmentPhilosophy({
        content: formData.content,
        quarter: formData.quarter,
      });
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      content: '',
      quarter: getCurrentQuarter(),
    });
    setSelectedPhilosophy(null);
    setShowForm(false);
  };

  const handleEdit = (philosophy: InvestmentPhilosophy) => {
    setSelectedPhilosophy(philosophy);
    setFormData({
      content: philosophy.content,
      quarter: philosophy.quarter,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteInvestmentPhilosophy(id);
  };

  const sortedPhilosophy = [...investmentPhilosophy].sort((a, b) => {
    const [yearA, qA] = a.quarter.split('-Q');
    const [yearB, qB] = b.quarter.split('-Q');
    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
    return parseInt(qB) - parseInt(qA);
  });

  const generateQuarters = () => {
    const quarters: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    
    for (let year = currentYear; year >= 2020; year--) {
      const maxQuarter = year === currentYear ? currentQuarter : 4;
      for (let q = maxQuarter; q >= 1; q--) {
        quarters.push(`${year}-Q${q}`);
      }
    }
    return quarters;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">成长追踪</h1>
          <p className="text-gray-500 mt-1">记录投资理念的进化和核心投资原则</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg animate-pulse">
            <span className="text-green-600">✓</span>
            保存成功！
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {sortedPhilosophy.length > 0 ? (
            sortedPhilosophy.map((philosophy, index) => (
              <div key={philosophy.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative">
                {index === 0 && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-gold-500 text-primary-800 px-3 py-1 text-sm font-medium rounded-full">最新</span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{philosophy.quarter}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(philosophy.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(philosophy)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(philosophy.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pl-15">
                  <div className="bg-gradient-to-r from-primary-50 to-gold-50 rounded-xl p-5 border-l-4 border-primary-500">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">核心投资原则</p>
                        <div className="space-y-2">
                          {philosophy.content.split('\n').filter((line) => line.trim()).map((line, idx) => (
                            <p key={idx} className="text-gray-600 flex items-start gap-2">
                              <span className="text-primary-500 font-medium">{idx + 1}.</span>
                              {line.replace(/^\d+\.\s*/, '').trim()}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-16 border border-gray-100 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-4">暂无投资理念记录</p>
              <p className="text-gray-400 text-sm mt-2">开始记录您的投资理念进化历程</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{showForm ? '编辑投资理念' : '添加投资理念'}</h3>
              {showForm && (
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  取消
                </button>
              )}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                添加投资理念
              </button>
            ) : (
              <div className="space-y-4">
                <select
                  value={formData.quarter}
                  onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {generateQuarters().map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <textarea
                  placeholder="请输入您的核心投资原则，每条原则占一行：

1. 安全边际是投资的基石
2. 投资优秀企业而非投机
3. 保持耐心，长期持有"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
                <button
                  onClick={handleSave}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  保存
                </button>
              </div>
            )}

            {!showForm && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-gold-50 rounded-xl">
                <p className="text-sm font-medium text-primary-800 mb-2">💡 投资理念提示</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 每季度更新一次核心原则</li>
                  <li>• 记录您的投资哲学进化</li>
                  <li>• 反思并改进投资方法</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
