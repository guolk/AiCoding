import { useState } from 'react';
import { Plus, Edit2, Trash2, BarChart3, CheckSquare } from 'lucide-react';
import { useStore } from '../store';
import type { Strategy, BacktestRecord } from '../types';

type TabType = 'strategies' | 'backtest';

export default function Strategy() {
  const [activeTab, setActiveTab] = useState<TabType>('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logic: '',
    stock_selection: '',
    timing: '',
    position_management: '',
    strategy_id: '',
    start_date: '',
    end_date: '',
    return_rate: '',
    max_drawdown: '',
    notes: '',
  });

  const {
    strategies,
    backtestRecords,
    addStrategy,
    updateStrategy,
    deleteStrategy,
    addBacktestRecord,
    updateBacktestRecord,
    deleteBacktestRecord,
  } = useStore();

  const handleSave = () => {
    if (activeTab === 'strategies') {
      if (selectedStrategy) {
        updateStrategy(selectedStrategy.id, {
          name: formData.name,
          logic: formData.logic,
          stock_selection: formData.stock_selection,
          timing: formData.timing,
          position_management: formData.position_management,
        });
      } else {
        addStrategy({
          name: formData.name,
          logic: formData.logic,
          stock_selection: formData.stock_selection,
          timing: formData.timing,
          position_management: formData.position_management,
        });
      }
    } else {
      if (selectedBacktest) {
        updateBacktestRecord(selectedBacktest.id, {
          strategy_id: formData.strategy_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          return_rate: parseFloat(formData.return_rate),
          max_drawdown: parseFloat(formData.max_drawdown),
          notes: formData.notes,
        });
      } else {
        addBacktestRecord({
          strategy_id: formData.strategy_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          return_rate: parseFloat(formData.return_rate),
          max_drawdown: parseFloat(formData.max_drawdown),
          notes: formData.notes,
        });
      }
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logic: '',
      stock_selection: '',
      timing: '',
      position_management: '',
      strategy_id: '',
      start_date: '',
      end_date: '',
      return_rate: '',
      max_drawdown: '',
      notes: '',
    });
    setSelectedStrategy(null);
    setSelectedBacktest(null);
    setShowForm(false);
  };

  const handleEdit = (item: Strategy | BacktestRecord) => {
    if ('logic' in item) {
      const strategy = item as Strategy;
      setSelectedStrategy(strategy);
      setFormData({
        ...formData,
        name: strategy.name,
        logic: strategy.logic,
        stock_selection: strategy.stock_selection,
        timing: strategy.timing,
        position_management: strategy.position_management,
      });
    } else {
      const backtest = item as BacktestRecord;
      setSelectedBacktest(backtest);
      setFormData({
        ...formData,
        strategy_id: backtest.strategy_id,
        start_date: backtest.start_date,
        end_date: backtest.end_date,
        return_rate: backtest.return_rate.toString(),
        max_drawdown: backtest.max_drawdown.toString(),
        notes: backtest.notes,
      });
    }
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'strategies') {
      deleteStrategy(id);
    } else {
      deleteBacktestRecord(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">策略研究</h1>
          <p className="text-gray-500 mt-1">记录投资策略、回测结果和适用性分析</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg animate-pulse">
            <span className="text-green-600">✓</span>
            保存成功！
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'strategies', label: '策略文档', icon: CheckSquare },
          { id: 'backtest', label: '回测记录', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as TabType);
              // 切换标签时保持表单状态不变，只重置选中项
              setSelectedStrategy(null);
              setSelectedBacktest(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'strategies' && (
            <>
              {strategies.length > 0 ? (
                strategies.map((strategy) => (
                  <div key={strategy.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{strategy.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{new Date(strategy.created_at).toLocaleDateString('zh-CN')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(strategy)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(strategy.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700">策略逻辑</p>
                        <p className="text-gray-600 mt-1 text-sm">{strategy.logic}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700">选股标准</p>
                        <p className="text-gray-600 mt-1 text-sm">{strategy.stock_selection}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700">买卖时机</p>
                        <p className="text-gray-600 mt-1 text-sm">{strategy.timing}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700">仓位管理</p>
                        <p className="text-gray-600 mt-1 text-sm">{strategy.position_management}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无策略文档</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'backtest' && (
            <>
              {backtestRecords.length > 0 ? (
                backtestRecords.map((record) => (
                  <div key={record.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{record.strategy_name || '未命名策略'}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {record.start_date} ~ {record.end_date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">收益率</p>
                        <p className="text-xl font-bold text-green-600 mt-1">+{record.return_rate}%</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">最大回撤</p>
                        <p className="text-xl font-bold text-red-600 mt-1">{record.max_drawdown}%</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">测试周期</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                          {Math.floor((new Date(record.end_date).getTime() - new Date(record.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} 个月
                        </p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">分析备注</p>
                        <p className="text-gray-600 mt-1">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无回测记录</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">{showForm ? '编辑' : '添加'}</h3>
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
                添加{activeTab === 'strategies' ? '策略文档' : '回测记录'}
              </button>
            ) : (
              <div className="space-y-4">
                {activeTab === 'strategies' && (
                  <>
                    <input
                      type="text"
                      placeholder="策略名称"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="策略逻辑"
                      value={formData.logic}
                      onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="选股标准"
                      value={formData.stock_selection}
                      onChange={(e) => setFormData({ ...formData, stock_selection: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="买卖时机"
                      value={formData.timing}
                      onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="仓位管理"
                      value={formData.position_management}
                      onChange={(e) => setFormData({ ...formData, position_management: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                {activeTab === 'backtest' && (
                  <>
                    <select
                      value={formData.strategy_id}
                      onChange={(e) => setFormData({ ...formData, strategy_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">选择策略</option>
                      {strategies.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="date"
                        placeholder="开始日期"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="date"
                        placeholder="结束日期"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="收益率(%)"
                        value={formData.return_rate}
                        onChange={(e) => setFormData({ ...formData, return_rate: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="最大回撤(%)"
                        value={formData.max_drawdown}
                        onChange={(e) => setFormData({ ...formData, max_drawdown: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <textarea
                      placeholder="分析备注"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                <button
                  onClick={handleSave}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  保存
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
