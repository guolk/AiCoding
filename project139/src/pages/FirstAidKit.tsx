import { useState, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, AlertTriangle, ClipboardCheck, ChevronRight } from 'lucide-react';
import type { FirstAidItem, ExpiryStatus } from '@/types';
import { CATEGORY_LABELS } from '@/types';
import { useAppStore } from '@/store';
import { getExpiryStatus, getDaysUntilExpiry, getExpiryStatusBgColor, getExpiryStatusLabel, getExpiryStatusTextColor, generateId } from '@/utils/helpers';

type TabKey = 'list' | 'expiry' | 'inventory';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'list', label: '物品清单' },
  { key: 'expiry', label: '有效期预警' },
  { key: 'inventory', label: '盘点提醒' },
];

interface FormData {
  name: string;
  quantity: number;
  specification: string;
  expiryDate: string;
  purpose: string;
  category: string;
  location: string;
  safeQuantity: number;
}

const emptyForm: FormData = {
  name: '',
  quantity: 1,
  specification: '',
  expiryDate: '',
  purpose: '',
  category: 'bandage',
  location: '',
  safeQuantity: 1,
};

function StatusBadge({ status }: { status: ExpiryStatus }) {
  const textColor = getExpiryStatusTextColor(status);
  const bgColor = getExpiryStatusBgColor(status);
  const label = getExpiryStatusLabel(status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}

export default function FirstAidKit() {
  const { firstAidItems, addFirstAidItem, updateFirstAidItem, deleteFirstAidItem, inventoryChecks, addInventoryCheck, updateInventoryCheck } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [checkingInProgress, setCheckingInProgress] = useState(false);
  const [checkItems, setCheckItems] = useState<Record<string, 'ok' | 'missing' | 'expired'>>({});

  const filteredItems = useMemo(() => {
    return firstAidItems.filter(item => {
      const matchesSearch = item.name.includes(searchQuery) || item.purpose.includes(searchQuery) || item.location.includes(searchQuery);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [firstAidItems, searchQuery, categoryFilter]);

  const expiringItems = useMemo(() => {
    return firstAidItems
      .map(item => ({
        ...item,
        status: getExpiryStatus(item.expiryDate),
        daysLeft: getDaysUntilExpiry(item.expiryDate),
      }))
      .filter(item => item.status !== 'normal')
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [firstAidItems]);

  const lastCompletedCheck = useMemo(() => {
    const completed = inventoryChecks.filter(c => c.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return completed[0] || null;
  }, [inventoryChecks]);

  const activeCheck = useMemo(() => {
    return inventoryChecks.find(c => c.status === 'in_progress') || null;
  }, [inventoryChecks]);

  const nextCheckDate = useMemo(() => {
    if (lastCompletedCheck) {
      const d = new Date(lastCompletedCheck.date);
      d.setMonth(d.getMonth() + 3);
      return d.toISOString().split('T')[0];
    }
    return null;
  }, [lastCompletedCheck]);

  const daysUntilNextCheck = useMemo(() => {
    if (!nextCheckDate) return null;
    return Math.ceil((new Date(nextCheckDate).getTime() - new Date().getTime()) / 86400000);
  }, [nextCheckDate]);

  const isCheckDue = daysUntilNextCheck !== null && daysUntilNextCheck <= 0;

  function openAddModal() {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  }

  function openEditModal(item: FirstAidItem) {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      specification: item.specification,
      expiryDate: item.expiryDate,
      purpose: item.purpose,
      category: item.category,
      location: item.location,
      safeQuantity: item.safeQuantity,
    });
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateFirstAidItem(editingId, { ...formData });
    } else {
      addFirstAidItem({ ...formData });
    }
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyForm);
  }

  function handleDelete(id: string) {
    deleteFirstAidItem(id);
    setDeleteConfirmId(null);
  }

  function startInventoryCheck() {
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(new Date().getTime() + 90 * 86400000).toISOString().split('T')[0];
    const initialCheckItems: Record<string, 'ok' | 'missing' | 'expired'> = {};
    firstAidItems.forEach(item => {
      initialCheckItems[item.id] = 'ok';
    });
    setCheckItems(initialCheckItems);
    addInventoryCheck({ date: today, nextDate, status: 'in_progress', checkedItems: [] });
    setCheckingInProgress(true);
  }

  function completeInventoryCheck() {
    const active = inventoryChecks.find(c => c.status === 'in_progress');
    if (!active) return;
    const checkedItems = Object.entries(checkItems).map(([itemId, status]) => ({ itemId, status }));
    updateInventoryCheck(active.id, { status: 'completed', checkedItems });
    setCheckingInProgress(false);
    setCheckItems({});
  }

  function getCardBorderColor(status: ExpiryStatus): string {
    if (status === 'expired' || status === 'urgent') return 'border-l-4 border-l-red-500';
    if (status === 'warning') return 'border-l-4 border-l-amber-400';
    return '';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0D7377' }}>
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">急救包管理</h1>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={activeTab === tab.key ? { backgroundColor: '#0D7377' } : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'list' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索物品名称、用途、位置..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                />
              </div>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium shrink-0 transition-colors hover:opacity-90"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Plus className="w-4 h-4" />
                添加物品
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === 'all' ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
                style={categoryFilter === 'all' ? { backgroundColor: '#0D7377' } : undefined}
              >
                全部
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    categoryFilter === key ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                  style={categoryFilter === key ? { backgroundColor: '#0D7377' } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">名称</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">规格</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">数量/安全量</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">有效期</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">用途</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">位置</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">状态</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => {
                      const status = getExpiryStatus(item.expiryDate);
                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-3 px-4 text-gray-600">{item.specification}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={item.quantity < item.safeQuantity ? 'text-red-600 font-medium' : 'text-gray-900'}>
                              {item.quantity}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-500">{item.safeQuantity}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.expiryDate}</td>
                          <td className="py-3 px-4 text-gray-600 max-w-[150px] truncate">{item.purpose}</td>
                          <td className="py-3 px-4 text-gray-600">{item.location}</td>
                          <td className="py-3 px-4 text-center"><StatusBadge status={status} /></td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 rounded-md text-[#0D7377] hover:bg-[#0D7377]/10 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">暂无物品数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expiry' && (
          <div>
            {expiringItems.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-gray-500">所有物品有效期状态正常</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expiringItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${getCardBorderColor(item.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">剩余天数</span>
                        <span className={`font-bold text-lg ${getExpiryStatusTextColor(item.status)}`}>
                          {item.daysLeft < 0 ? `已过期${Math.abs(item.daysLeft)}天` : `${item.daysLeft}天`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">有效期至</span>
                        <span className="text-gray-700">{item.expiryDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">规格</span>
                        <span className="text-gray-700">{item.specification}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">位置</span>
                        <span className="text-gray-700">{item.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            {!checkingInProgress ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">盘点信息</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">上次盘点</p>
                      <p className="text-lg font-medium text-gray-900">{lastCompletedCheck ? lastCompletedCheck.date : '暂无记录'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">下次盘点</p>
                      <p className="text-lg font-medium text-gray-900">{nextCheckDate || '暂无计划'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-500 mb-1">距离下次盘点</p>
                      <p className={`text-lg font-medium ${daysUntilNextCheck !== null && daysUntilNextCheck <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                        {daysUntilNextCheck !== null ? `${daysUntilNextCheck} 天` : '--'}
                      </p>
                    </div>
                  </div>
                  {isCheckDue && (
                    <div className="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-amber-700 font-medium">盘点时间已到，请尽快进行盘点</span>
                      </div>
                      <button
                        onClick={startInventoryCheck}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-colors"
                        style={{ backgroundColor: '#0D7377' }}
                      >
                        <ClipboardCheck className="w-4 h-4" />
                        开始盘点
                      </button>
                    </div>
                  )}
                </div>

                {inventoryChecks.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">盘点历史</h3>
                    <div className="space-y-3">
                      {inventoryChecks.filter(c => c.status === 'completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(check => (
                        <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">盘点日期：{check.date}</p>
                              <p className="text-xs text-gray-500">共检查 {check.checkedItems.length} 项</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">盘点进行中</h3>
                  <button
                    onClick={completeInventoryCheck}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#0D7377' }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成盘点
                  </button>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">物品名称</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">规格</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">当前数量</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">确认</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">缺失</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-600">过期</th>
                        </tr>
                      </thead>
                      <tbody>
                        {firstAidItems.map(item => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                            <td className="py-3 px-4 text-gray-600">{item.specification}</td>
                            <td className="py-3 px-4 text-gray-600">{item.quantity}</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setCheckItems(prev => ({ ...prev, [item.id]: 'ok' }))}
                                className={`p-1.5 rounded-md transition-colors ${checkItems[item.id] === 'ok' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-300 hover:text-emerald-400'}`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setCheckItems(prev => ({ ...prev, [item.id]: 'missing' }))}
                                className={`p-1.5 rounded-md transition-colors ${checkItems[item.id] === 'missing' ? 'text-amber-600 bg-amber-50' : 'text-gray-300 hover:text-amber-400'}`}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setCheckItems(prev => ({ ...prev, [item.id]: 'expired' }))}
                                className={`p-1.5 rounded-md transition-colors ${checkItems[item.id] === 'expired' ? 'text-red-600 bg-red-50' : 'text-gray-300 hover:text-red-400'}`}
                              >
                                <AlertTriangle className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{editingId ? '编辑物品' : '添加物品'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.quantity}
                      onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">安全库存量</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.safeQuantity}
                      onChange={e => setFormData(prev => ({ ...prev, safeQuantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">规格</label>
                  <input
                    type="text"
                    value={formData.specification}
                    onChange={e => setFormData(prev => ({ ...prev, specification: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用途</label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={e => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D7377]/30 focus:border-[#0D7377]"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#0D7377' }}
                  >
                    {editingId ? '保存' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">确认删除</h3>
              <p className="text-sm text-gray-500 mb-6">删除后无法恢复，确定要删除该物品吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
