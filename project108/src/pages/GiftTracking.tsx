

import { useState } from 'react';
import {
  Package,
  ShoppingCart,
  MapPin,
  Calendar,
  Plus,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  MessageSquare,
  DollarSign,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatDate } from '../utils/date';
import type { Inventory, PlanItem } from '../types';

type TabType = 'inventory' | 'pending' | 'feedback';

export default function GiftTracking() {
  const {
    inventory,
    planItems,
    contacts,
    giftHistory,
    addInventory,
    updateInventory,
    deleteInventory,
    updatePlanItem,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const pendingItems = planItems.filter((pi) => pi.status !== 'given');
  const deliveredItems = planItems.filter((pi) => pi.status === 'given' && pi.feedback);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'inventory', label: '库存管理', icon: <Package size={18} />, count: inventory.length },
    { id: 'pending', label: '待购买进度', icon: <Clock size={18} />, count: pendingItems.length },
    { id: 'feedback', label: '对方反馈', icon: <MessageSquare size={18} />, count: deliveredItems.length },
  ];

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-ink-100 text-ink-600';
      case 'purchased':
        return 'bg-secondary-100 text-secondary-700';
      case 'delivered':
        return 'bg-accent-100 text-accent-700';
      case 'given':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-ink-100 text-ink-600';
    }
  };

  const getItemStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待采购';
      case 'purchased':
        return '已购买';
      case 'delivered':
        return '已到货';
      case 'given':
        return '已送出';
      default:
        return status;
    }
  };

  const nextStatus = (current: string) => {
    const flow = ['pending', 'purchased', 'delivered', 'given'];
    const currentIndex = flow.indexOf(current);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : current;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">
            礼物跟踪
          </h1>
          <p className="text-ink-500 mt-1">
            管理库存、追踪购买进度、记录对方反馈
          </p>
        </div>
        {activeTab === 'inventory' && (
          <button
            onClick={() => {
              setEditingInventory(null);
              setShowAddInventoryModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            添加库存
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-soft'
                : 'bg-white text-ink-600 hover:bg-ink-50'
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-ink-100'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2">
              <Package className="text-primary-500" size={20} />
              礼物库存
            </h2>
            <p className="text-sm text-ink-500">
              共 {inventory.length} 项库存
            </p>
          </div>

          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500">还没有添加任何库存</p>
              <p className="text-ink-400 text-sm mt-1">点击上方按钮添加礼物包装材料等</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-ink-50 to-warm-50 border border-ink-100 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink-800">{item.name}</h3>
                      <p className="text-sm text-ink-500 mt-1">
                        数量: {item.quantity} 件
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingInventory(item);
                          setShowAddInventoryModal(true);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center"
                      >
                        <Edit2 size={16} className="text-ink-500" />
                      </button>
                      <button
                        onClick={() => deleteInventory(item.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-ink-100">
                    <div className="flex items-center gap-1.5 text-sm text-ink-500">
                      <MapPin size={14} className="text-primary-500" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-ink-500">
                      <Calendar size={14} className="text-secondary-500" />
                      {formatDate(item.purchaseDate)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-ink-500">
                      <DollarSign size={14} className="text-accent-600" />
                      ¥{item.price}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-sm text-ink-500 mt-3 pt-3 border-t border-ink-100">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingItems.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-ink-500">太棒了！没有待处理的礼物</p>
              <p className="text-ink-400 text-sm mt-1">所有礼物都已准备就绪</p>
            </div>
          ) : (
            ['pending', 'purchased', 'delivered'].map((status) => {
              const items = pendingItems.filter((pi) => pi.status === status);
              if (items.length === 0) return null;

              return (
                <div key={status} className="card">
                  <h3 className="font-semibold text-ink-800 mb-4 flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getItemStatusColor(status)}`}>
                      {getItemStatusText(status)}
                    </span>
                    <span className="text-ink-500 text-sm">({items.length} 件)</span>
                  </h3>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const contact = contacts.find((c) => c.id === item.contactId);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-ink-50 hover:bg-ink-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 flex items-center justify-center overflow-hidden">
                              {contact?.avatar ? (
                                <img
                                  src={contact.avatar}
                                  alt={contact.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-ink-600">
                                  {contact?.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-ink-800">{item.giftName}</p>
                              <p className="text-sm text-ink-500">
                                送给 {contact?.name} · 预算 ¥{item.budget}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-ink-500">
                              截止: {formatDate(item.deadline)}
                            </span>
                            <button
                              onClick={() => {
                                const next = nextStatus(item.status);
                                updatePlanItem(item.id, {
                                  status: next as PlanItem['status'],
                                  purchaseDate:
                                    next === 'purchased'
                                      ? new Date().toISOString().split('T')[0]
                                      : undefined,
                                  givenDate:
                                    next === 'given'
                                      ? new Date().toISOString().split('T')[0]
                                      : undefined,
                                });
                              }}
                              className="btn-secondary text-sm"
                            >
                              标记为{getItemStatusText(nextStatus(item.status))}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-ink-900 flex items-center gap-2 mb-6">
            <MessageSquare className="text-primary-500" size={20} />
            对方反馈记录
          </h2>

          {deliveredItems.length === 0 && giftHistory.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500">还没有反馈记录</p>
              <p className="text-ink-400 text-sm mt-1">送出礼物后记录对方的反应</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveredItems.map((item) => {
                const contact = contacts.find((c) => c.id === item.contactId);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-secondary-50 border border-green-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-secondary-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {contact?.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-ink-600">
                            {contact?.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-ink-800">{item.giftName}</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            已送出
                          </span>
                        </div>
                        <p className="text-sm text-ink-500 mb-2">
                          送给 {contact?.name} · {item.givenDate ? formatDate(item.givenDate) : ''}
                          {item.price && ` · 花费 ¥${item.price}`}
                        </p>
                        <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                          <MessageSquare size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-ink-700">{item.feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {giftHistory.map((gh) => {
                const contact = contacts.find((c) => c.id === gh.contactId);
                return (
                  <div
                    key={gh.id}
                    className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-secondary-50 border border-green-100"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-secondary-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {contact?.avatar ? (
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-ink-600">
                            {contact?.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-ink-800">{gh.giftName}</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {gh.occasion}
                          </span>
                        </div>
                        <p className="text-sm text-ink-500 mb-2">
                          送给 {contact?.name} · {formatDate(gh.date)} · 花费 ¥{gh.price}
                        </p>
                        <div className="flex items-start gap-2 bg-white/60 rounded-lg p-3">
                          <MessageSquare size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-ink-700">{gh.reaction}</p>
                        </div>
                        {gh.notes && (
                          <p className="text-xs text-ink-500 mt-2 pt-2 border-t border-green-100">
                            备注: {gh.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showAddInventoryModal && (
        <AddInventoryModal
          item={editingInventory}
          onClose={() => {
            setShowAddInventoryModal(false);
            setEditingInventory(null);
          }}
          onSave={(item) => {
            if (editingInventory) {
              updateInventory(editingInventory.id, item);
            } else {
              addInventory(item);
            }
            setShowAddInventoryModal(false);
            setEditingInventory(null);
          }}
        />
      )}
    </div>
  );
}

function AddInventoryModal({
  item,
  onClose,
  onSave,
}: {
  item: Inventory | null;
  onClose: () => void;
  onSave: (item: Omit<Inventory, 'id' | 'userId'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    quantity: item?.quantity || 1,
    location: item?.location || '',
    purchaseDate: item?.purchaseDate || new Date().toISOString().split('T')[0],
    price: item?.price || 0,
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-ink-900">
            {item ? '编辑库存' : '添加库存'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-ink-100 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              物品名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="input-field"
              placeholder="如：备用礼物包装纸"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                数量 *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 1,
                  }))
                }
                className="input-field"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                价格 (¥)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="input-field"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              存放位置 *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="input-field"
              placeholder="如：书房储物柜"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              购买日期
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="input-field h-20 resize-none"
              placeholder="添加备注信息..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {item ? '保存修改' : '添加库存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
