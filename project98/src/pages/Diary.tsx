import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, ClipboardList } from 'lucide-react';
import { useStore } from '../store';
import type { TradeRecord, PositionTrack, ReviewRecord } from '../types';

type TabType = 'trades' | 'positions' | 'reviews';

export default function Diary() {
  const [activeTab, setActiveTab] = useState<TabType>('trades');
  const [selectedTrade, setSelectedTrade] = useState<TradeRecord | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PositionTrack | null>(null);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    stock_code: '',
    stock_name: '',
    action: 'buy' as 'buy' | 'sell',
    price: '',
    quantity: '',
    reason: '',
    logic: '',
    trade_time: new Date().toISOString().slice(0, 16),
    current_price: '',
    valuation: '',
    notes: '',
    success: true,
    analysis: '',
    lessons_learned: '',
  });

  const {
    tradeRecords,
    positionTracks,
    reviewRecords,
    addTradeRecord,
    updateTradeRecord,
    deleteTradeRecord,
    addPositionTrack,
    updatePositionTrack,
    deletePositionTrack,
    addReviewRecord,
    updateReviewRecord,
    deleteReviewRecord,
  } = useStore();

  const handleSave = () => {
    if (activeTab === 'trades') {
      if (selectedTrade) {
        updateTradeRecord(selectedTrade.id, {
          stock_code: formData.stock_code,
          stock_name: formData.stock_name,
          action: formData.action,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          logic: formData.logic,
          trade_time: formData.trade_time,
        });
      } else {
        addTradeRecord({
          stock_code: formData.stock_code,
          stock_name: formData.stock_name,
          action: formData.action,
          price: parseFloat(formData.price),
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          logic: formData.logic,
          trade_time: formData.trade_time,
        });
      }
    } else if (activeTab === 'positions') {
      if (selectedPosition) {
        updatePositionTrack(selectedPosition.id, {
          stock_code: formData.stock_code,
          stock_name: formData.stock_name,
          current_price: parseFloat(formData.current_price),
          valuation: parseFloat(formData.valuation),
          notes: formData.notes,
        });
      } else {
        addPositionTrack({
          stock_code: formData.stock_code,
          stock_name: formData.stock_name,
          current_price: parseFloat(formData.current_price),
          valuation: parseFloat(formData.valuation),
          notes: formData.notes,
        });
      }
    } else {
      if (selectedReview) {
        updateReviewRecord(selectedReview.id, {
          stock_code: formData.stock_code,
          stock_name: formData.stock_name,
          success: formData.success,
          analysis: formData.analysis,
          lessons_learned: formData.lessons_learned,
        });
      } else {
        addReviewRecord({
          stock_code: formData.stock_code,
          stock_name: formData.stock_name,
          success: formData.success,
          analysis: formData.analysis,
          lessons_learned: formData.lessons_learned,
        });
      }
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      stock_code: '',
      stock_name: '',
      action: 'buy',
      price: '',
      quantity: '',
      reason: '',
      logic: '',
      trade_time: new Date().toISOString().slice(0, 16),
      current_price: '',
      valuation: '',
      notes: '',
      success: true,
      analysis: '',
      lessons_learned: '',
    });
    setSelectedTrade(null);
    setSelectedPosition(null);
    setSelectedReview(null);
    setShowForm(false);
  };

  const handleEdit = (item: TradeRecord | PositionTrack | ReviewRecord) => {
    if ('action' in item) {
      const trade = item as TradeRecord;
      setSelectedTrade(trade);
      setFormData({
        ...formData,
        stock_code: trade.stock_code,
        stock_name: trade.stock_name,
        action: trade.action,
        price: trade.price.toString(),
        quantity: trade.quantity.toString(),
        reason: trade.reason,
        logic: trade.logic,
        trade_time: trade.trade_time.slice(0, 16),
      });
    } else if ('current_price' in item) {
      const position = item as PositionTrack;
      setSelectedPosition(position);
      setFormData({
        ...formData,
        stock_code: position.stock_code,
        stock_name: position.stock_name,
        current_price: position.current_price.toString(),
        valuation: position.valuation.toString(),
        notes: position.notes,
      });
    } else {
      const review = item as ReviewRecord;
      setSelectedReview(review);
      setFormData({
        ...formData,
        stock_code: review.stock_code,
        stock_name: review.stock_name,
        success: review.success,
        analysis: review.analysis,
        lessons_learned: review.lessons_learned,
      });
    }
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'trades') {
      deleteTradeRecord(id);
    } else if (activeTab === 'positions') {
      deletePositionTrack(id);
    } else {
      deleteReviewRecord(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">投资日记</h1>
          <p className="text-gray-500 mt-1">记录交易决策、持仓跟踪和事后复盘</p>
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
          { id: 'trades', label: '交易记录', icon: ArrowUpCircle },
          { id: 'positions', label: '持仓跟踪', icon: ClipboardList },
          { id: 'reviews', label: '事后复盘', icon: ArrowDownCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as TabType);
              // 切换标签时保持表单状态不变，只重置选中项
              setSelectedTrade(null);
              setSelectedPosition(null);
              setSelectedReview(null);
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
          {activeTab === 'trades' && (
            <>
              {tradeRecords.length > 0 ? (
                tradeRecords.map((trade) => (
                  <div key={trade.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          trade.action === 'buy' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {trade.action === 'buy' ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{trade.stock_name}</h3>
                          <p className="text-sm text-gray-500">{trade.stock_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(trade)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">操作</p>
                        <p className={`font-medium ${trade.action === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                          {trade.action === 'buy' ? '买入' : '卖出'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">价格</p>
                        <p className="font-medium text-gray-800">¥{trade.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">数量</p>
                        <p className="font-medium text-gray-800">{trade.quantity}股</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">时间</p>
                        <p className="font-medium text-gray-800">
                          {new Date(trade.trade_time).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">买入理由</p>
                        <p className="text-gray-600">{trade.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">决策逻辑</p>
                        <p className="text-gray-600">{trade.logic}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <ArrowUpCircle className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无交易记录</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'positions' && (
            <>
              {positionTracks.length > 0 ? (
                positionTracks.map((position) => (
                  <div key={position.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{position.stock_name}</h3>
                        <p className="text-sm text-gray-500">{position.stock_code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(position)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(position.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">当前价格</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">¥{position.current_price.toFixed(2)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">估值(P/E)</p>
                        <p className="text-xl font-bold text-purple-600 mt-1">{position.valuation}</p>
                      </div>
                    </div>
                    {position.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">跟踪笔记</p>
                        <p className="text-gray-600 mt-1">{position.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无持仓跟踪</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              {reviewRecords.length > 0 ? (
                reviewRecords.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          review.success ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {review.success ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-red-600 text-lg">✗</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{review.stock_name}</h3>
                          <p className="text-sm text-gray-500">{review.stock_code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          review.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {review.success ? '成功' : '失败'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">复盘分析</p>
                          <p className="text-gray-600">{review.analysis}</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-amber-800">经验教训</p>
                          <p className="text-amber-700 mt-1">{review.lessons_learned}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                  <ArrowDownCircle className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-gray-500 mt-4">暂无复盘记录</p>
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
                添加{activeTab === 'trades' ? '交易记录' : activeTab === 'positions' ? '持仓跟踪' : '复盘记录'}
              </button>
            ) : (
              <div className="space-y-4">
                {activeTab === 'trades' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="股票代码"
                        value={formData.stock_code}
                        onChange={(e) => setFormData({ ...formData, stock_code: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="股票名称"
                        value={formData.stock_name}
                        onChange={(e) => setFormData({ ...formData, stock_name: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <select
                      value={formData.action}
                      onChange={(e) => setFormData({ ...formData, action: e.target.value as 'buy' | 'sell' })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="buy">买入</option>
                      <option value="sell">卖出</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="价格"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="数量"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <input
                      type="datetime-local"
                      value={formData.trade_time}
                      onChange={(e) => setFormData({ ...formData, trade_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <textarea
                      placeholder="买入理由"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="决策逻辑"
                      value={formData.logic}
                      onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                {activeTab === 'positions' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="股票代码"
                        value={formData.stock_code}
                        onChange={(e) => setFormData({ ...formData, stock_code: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="股票名称"
                        value={formData.stock_name}
                        onChange={(e) => setFormData({ ...formData, stock_name: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="当前价格"
                        value={formData.current_price}
                        onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="估值(P/E)"
                        value={formData.valuation}
                        onChange={(e) => setFormData({ ...formData, valuation: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <textarea
                      placeholder="跟踪笔记"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </>
                )}

                {activeTab === 'reviews' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="股票代码"
                        value={formData.stock_code}
                        onChange={(e) => setFormData({ ...formData, stock_code: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        placeholder="股票名称"
                        value={formData.stock_name}
                        onChange={(e) => setFormData({ ...formData, stock_name: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-700">结果</span>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="success"
                          checked={formData.success}
                          onChange={() => setFormData({ ...formData, success: true })}
                          className="text-green-600"
                        />
                        <span className="text-green-600">成功</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="success"
                          checked={!formData.success}
                          onChange={() => setFormData({ ...formData, success: false })}
                          className="text-red-600"
                        />
                        <span className="text-red-600">失败</span>
                      </label>
                    </div>
                    <textarea
                      placeholder="复盘分析"
                      value={formData.analysis}
                      onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <textarea
                      placeholder="经验教训"
                      value={formData.lessons_learned}
                      onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                      rows={3}
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
