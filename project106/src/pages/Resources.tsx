import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Tool, InventoryItem, ExpenseRecord, ToolStatus, InventoryType, ExpenseType, ExpenseStatus, SplitMethod } from '../types';
import { Plus, Package, Droplets, Zap, Wrench, ArrowRightLeft, Check, X, Clock, TrendingDown, AlertTriangle, DollarSign, ChevronRight } from 'lucide-react';
import { resourcesAPI } from '../api/client';

type TabType = 'tools' | 'inventory' | 'expenses';

export default function Resources() {
  const { tools, inventory, expenses, currentUser, fetchAllData, updateToolLocal, updateInventoryLocal, updateExpenseLocal } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('tools');
  const [showToolBorrowModal, setShowToolBorrowModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);

  const [borrowForm, setBorrowForm] = useState({ expectedReturn: '' });
  const [inventoryForm, setInventoryForm] = useState({ name: '', type: 'seed' as InventoryType, quantity: 0, unit: 'kg', lowThreshold: 10 });
  const [expenseForm, setExpenseForm] = useState({ type: 'water' as ExpenseType, period: '', totalAmount: 0, splitMethod: 'equal' as SplitMethod });

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleBorrowTool = async () => {
    if (!selectedTool || !borrowForm.expectedReturn) return;
    const res = await resourcesAPI.borrowTool(selectedTool.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      borrowDate: new Date().toISOString().split('T')[0],
      expectedReturn: borrowForm.expectedReturn
    });
    if (res.data) {
      updateToolLocal(res.data);
      setShowToolBorrowModal(false);
      setBorrowForm({ expectedReturn: '' });
    }
  };

  const handleReturnTool = async (tool: Tool) => {
    const res = await resourcesAPI.returnTool(tool.id);
    if (res.data) updateToolLocal(res.data);
  };

  const handleAddInventory = async () => {
    if (!inventoryForm.name || inventoryForm.quantity <= 0) return;
    const res = await resourcesAPI.createInventoryItem(inventoryForm);
    if (res.success && res.data) {
      const invRes = await resourcesAPI.getInventory();
      if (invRes.data) useStore.getState().setInventory(invRes.data);
      setShowInventoryModal(false);
      setInventoryForm({ name: '', type: 'seed', quantity: 0, unit: 'kg', lowThreshold: 10 });
    }
  };

  const handleUpdateInventory = async (item: InventoryItem, delta: number) => {
    const res = await resourcesAPI.updateInventory(item.id, { quantity: Math.max(0, item.quantity + delta) });
    if (res.data) updateInventoryLocal(res.data);
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.period || expenseForm.totalAmount <= 0) return;
    const members = ['张三', '李四', '王五', '赵六'];
    const shareAmount = expenseForm.totalAmount / members.length;
    const res = await resourcesAPI.createExpense({
      type: expenseForm.type,
      period: expenseForm.period,
      totalAmount: expenseForm.totalAmount,
      splitMethod: expenseForm.splitMethod,
      individualShares: members.map((name, idx) => ({
        userId: `user-${idx + 1}`,
        userName: name,
        amount: shareAmount,
        paid: false
      }))
    });
    if (res.success && res.data) {
      const expRes = await resourcesAPI.getExpenses();
      if (expRes.data) useStore.getState().setExpenses(expRes.data);
      setShowExpenseModal(false);
      setExpenseForm({ type: 'water', period: '', totalAmount: 0, splitMethod: 'equal' });
    }
  };

  const handlePayShare = async (expense: ExpenseRecord) => {
    const res = await resourcesAPI.payShare(expense.id, currentUser.id);
    if (res.data) updateExpenseLocal(res.data);
  };

  const tabs = [
    { id: 'tools' as TabType, label: '工具借用', icon: Wrench, badge: tools.filter(t => t.status === 'borrowed').length },
    { id: 'inventory' as TabType, label: '库存管理', icon: Package, badge: inventory.filter(i => i.quantity <= i.lowThreshold).length },
    { id: 'expenses' as TabType, label: '水电分摊', icon: DollarSign, badge: expenses.filter(e => e.status !== 'paid').length },
  ];

  const getToolStatusLabel = (status: ToolStatus) => {
    const labels = { available: '可借用', borrowed: '已借出', maintenance: '维修中' };
    return labels[status];
  };

  const getToolStatusColor = (status: ToolStatus) => {
    const colors = {
      available: 'bg-green-100 text-green-700',
      borrowed: 'bg-amber-100 text-amber-700',
      maintenance: 'bg-red-100 text-red-700'
    };
    return colors[status];
  };

  const getExpenseTypeLabel = (type: ExpenseType) => {
    const labels = { water: '水费', electric: '电费' };
    return labels[type];
  };

  const getExpenseTypeIcon = (type: ExpenseType) => {
    return type === 'water' ? <Droplets className="w-5 h-5" /> : <Zap className="w-5 h-5" />;
  };

  const getExpenseStatusLabel = (status: ExpenseStatus) => {
    const labels = { pending: '待缴费', partial: '部分已缴', paid: '已全部结清' };
    return labels[status];
  };

  const getExpenseStatusColor = (status: ExpenseStatus) => {
    const colors = {
      pending: 'bg-red-100 text-red-700',
      partial: 'bg-amber-100 text-amber-700',
      paid: 'bg-green-100 text-green-700'
    };
    return colors[status];
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800">资源管理</h2>
          <p className="text-gray-500">管理工具、库存和费用分摊</p>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'tools') {
              if (tools.find(t => t.status === 'available')) {
                const available = tools.find(t => t.status === 'available');
                if (available) {
                  setSelectedTool(available);
                  setShowToolBorrowModal(true);
                }
              }
            } else if (activeTab === 'inventory') {
              setShowInventoryModal(true);
            } else {
              setShowExpenseModal(true);
            }
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'tools' ? '借用工具' : activeTab === 'inventory' ? '添加库存' : '添加费用'}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-garden-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-garden-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-garden-100 text-garden-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    tool.status === 'available' ? 'bg-green-100 text-green-600' :
                    tool.status === 'borrowed' ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{tool.name}</h3>
                    <p className="text-sm text-gray-500">{tool.type}</p>
                  </div>
                </div>
                <span className={`status-badge ${getToolStatusColor(tool.status)}`}>
                  {getToolStatusLabel(tool.status)}
                </span>
              </div>

              {tool.currentBorrower && (
                <div className="p-3 bg-amber-50 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700">
                      借用人: {tool.currentBorrower.userName}
                    </span>
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    预计归还: {tool.currentBorrower.expectedReturn}
                  </div>
                </div>
              )}

              {tool.borrowHistory.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">最近借用记录</h4>
                  <div className="space-y-1">
                    {tool.borrowHistory.slice(-3).reverse().map((record) => (
                      <div key={record.id} className="text-xs text-gray-500 flex justify-between">
                        <span>{record.userName}</span>
                        <span>{record.borrowDate}{record.returnDate ? ` → ${record.returnDate}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {tool.status === 'available' && (
                  <button
                    onClick={() => { setSelectedTool(tool); setShowToolBorrowModal(true); }}
                    className="btn-primary flex-1 text-sm"
                  >
                    借用
                  </button>
                )}
                {tool.status === 'borrowed' && tool.currentBorrower?.userId === currentUser.id && (
                  <button
                    onClick={() => handleReturnTool(tool)}
                    className="btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    归还
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {inventory.map((item) => {
            const isLow = item.quantity <= item.lowThreshold;
            return (
              <div key={item.id} className={`card p-6 ${isLow ? 'border-amber-300' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.type === 'seed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <span className={`status-badge ${
                          item.type === 'seed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.type === 'seed' ? '种子' : '肥料'}
                        </span>
                        {isLow && (
                          <span className="status-badge bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            低库存
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">最后更新: {item.lastUpdated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{item.quantity}</p>
                      <p className="text-sm text-gray-500">{item.unit}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleUpdateInventory(item, -1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateInventory(item, 1)}
                        className="w-8 h-8 rounded-lg bg-garden-100 hover:bg-garden-200 text-garden-700 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {isLow && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    库存低于警戒值 ({item.lowThreshold} {item.unit})，请及时补充
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'expenses' && !selectedExpense && (
        <div className="space-y-4">
          {expenses.length > 0 ? expenses.map((expense) => (
            <div
              key={expense.id}
              className="card p-6 cursor-pointer hover:border-garden-300"
              onClick={() => setSelectedExpense(expense)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    expense.type === 'water' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {getExpenseTypeIcon(expense.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-800">
                        {getExpenseTypeLabel(expense.type)} - {expense.period}
                      </h3>
                      <span className={`status-badge ${getExpenseStatusColor(expense.status)}`}>
                        {getExpenseStatusLabel(expense.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      总分摊: ¥{expense.totalAmount} · {expense.splitMethod === 'equal' ? '平均分摊' : '按面积分摊'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">缴费进度</p>
                    <p className="font-bold text-gray-800">
                      {expense.individualShares.filter(s => s.paid).length}/{expense.individualShares.length}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      expense.status === 'paid' ? 'bg-green-500' :
                      expense.status === 'partial' ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                    style={{ width: `${(expense.individualShares.filter(s => s.paid).length / expense.individualShares.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )) : (
            <div className="card p-12 text-center">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="font-display text-lg font-bold text-gray-800 mb-2">暂无费用记录</h3>
              <p className="text-gray-500">点击上方按钮添加新的费用分摊</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'expenses' && selectedExpense && (
        <div>
          <button
            onClick={() => setSelectedExpense(null)}
            className="text-gray-600 hover:text-garden-700 mb-4 flex items-center gap-2"
          >
            ← 返回列表
          </button>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  selectedExpense.type === 'water' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {getExpenseTypeIcon(selectedExpense.type)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-xl font-bold text-gray-800">
                      {getExpenseTypeLabel(selectedExpense.type)} - {selectedExpense.period}
                    </h2>
                    <span className={`status-badge ${getExpenseStatusColor(selectedExpense.status)}`}>
                      {getExpenseStatusLabel(selectedExpense.status)}
                    </span>
                  </div>
                  <p className="text-gray-500">
                    总金额: ¥{selectedExpense.totalAmount} · {selectedExpense.splitMethod === 'equal' ? '平均分摊' : '按面积分摊'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {selectedExpense.individualShares.map((share) => (
                <div key={share.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-garden-100 flex items-center justify-center text-garden-700 font-bold">
                      {share.userName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{share.userName}</p>
                      <p className="text-sm text-gray-500">应缴: ¥{share.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {share.paid ? (
                      <span className="status-badge bg-green-100 text-green-700 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        已缴费
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="status-badge bg-red-100 text-red-700">待缴费</span>
                        {share.userId === currentUser.id && (
                          <button
                            onClick={() => handlePayShare(selectedExpense)}
                            className="btn-primary text-sm py-1.5"
                          >
                            缴费
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showToolBorrowModal && selectedTool && (
        <div className="modal-backdrop" onClick={() => setShowToolBorrowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">借用工具</h3>
              <p className="text-gray-500">{selectedTool.name} - {selectedTool.type}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">预计归还日期</label>
                <input
                  type="date"
                  value={borrowForm.expectedReturn}
                  onChange={(e) => setBorrowForm({ ...borrowForm, expectedReturn: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="p-4 bg-garden-50 rounded-lg">
                <p className="text-sm text-garden-700">
                  <strong>借用人:</strong> {currentUser.name}
                </p>
                <p className="text-sm text-garden-600 mt-1">
                  <strong>借用日期:</strong> {new Date().toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowToolBorrowModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleBorrowTool} className="btn-primary" disabled={!borrowForm.expectedReturn}>
                确认借用
              </button>
            </div>
          </div>
        </div>
      )}

      {showInventoryModal && (
        <div className="modal-backdrop" onClick={() => setShowInventoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">添加库存</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  value={inventoryForm.type}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, type: e.target.value as InventoryType })}
                  className="input-field"
                >
                  <option value="seed">种子</option>
                  <option value="fertilizer">肥料</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={inventoryForm.name}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                  className="input-field"
                  placeholder="例如：番茄种子、腐熟羊粪"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input
                    type="number"
                    value={inventoryForm.quantity}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={inventoryForm.unit}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                    className="input-field"
                    placeholder="kg/粒"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">低库存预警值</label>
                <input
                  type="number"
                  value={inventoryForm.lowThreshold}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, lowThreshold: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowInventoryModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleAddInventory} className="btn-primary" disabled={!inventoryForm.name || inventoryForm.quantity <= 0}>
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-display text-lg font-bold text-gray-800">添加费用分摊</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">费用类型</label>
                  <select
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value as ExpenseType })}
                    className="input-field"
                  >
                    <option value="water">水费</option>
                    <option value="electric">电费</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">账单周期</label>
                  <input
                    type="text"
                    value={expenseForm.period}
                    onChange={(e) => setExpenseForm({ ...expenseForm, period: e.target.value })}
                    className="input-field"
                    placeholder="例如：2026年5月"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">总金额 (¥)</label>
                <input
                  type="number"
                  value={expenseForm.totalAmount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, totalAmount: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分摊方式</label>
                <select
                  value={expenseForm.splitMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, splitMethod: e.target.value as SplitMethod })}
                  className="input-field"
                >
                  <option value="equal">平均分摊</option>
                  <option value="by_area">按面积分摊</option>
                </select>
              </div>
              {expenseForm.totalAmount > 0 && (
                <div className="p-4 bg-garden-50 rounded-lg">
                  <p className="text-sm text-garden-700">
                    预计每人分摊: <strong>¥{(expenseForm.totalAmount / 4).toFixed(2)}</strong>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowExpenseModal(false)} className="btn-secondary">取消</button>
              <button onClick={handleCreateExpense} className="btn-primary" disabled={!expenseForm.period || expenseForm.totalAmount <= 0}>
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
