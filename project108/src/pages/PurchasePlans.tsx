
import { useState } from 'react';
import {
  Plus,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  X,
  Gift,
  Users,
  Edit2,
  Trash2,
  ShoppingCart,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { formatDate, getDaysUntil } from '../utils/date';
import type { PurchasePlan, PlanItem } from '../types';

export default function PurchasePlans() {
  const {
    purchasePlans,
    planItems,
    holidays,
    contacts,
    giftIdeas,
    addPurchasePlan,
    updatePlanItem,
    addPlanItem,
  } = useAppStore();

  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-ink-100 text-ink-600';
      case 'active':
        return 'bg-secondary-100 text-secondary-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-ink-100 text-ink-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning':
        return '规划中';
      case 'active':
        return '进行中';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

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
            购买计划
          </h1>
          <p className="text-ink-500 mt-1">
            共 {purchasePlans.length} 个计划 ·{' '}
            {planItems.filter((pi) => pi.status === 'pending').length} 件待采购
          </p>
        </div>
        <button
          onClick={() => setShowAddPlanModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          创建计划
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {purchasePlans.map((plan) => {
          const items = planItems.filter((pi) => pi.planId === plan.id);
          const totalBudgetAllocated = items.reduce((sum, i) => sum + i.budget, 0);
          const totalSpent = items
            .filter((i) => i.price)
            .reduce((sum, i) => sum + (i.price || 0), 0);
          const completedCount = items.filter(
            (i) => i.status === 'given'
          ).length;
          const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;
          const daysUntil = getDaysUntil(plan.deadline);

          return (
            <div
              key={plan.id}
              onClick={() => {
                setSelectedPlanId(plan.id);
                setShowAddItemModal(true);
              }}
              className="card card-hover cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-ink-900">{plan.holidayName}</h3>
                  <p className="text-sm text-ink-500 mt-1">
                    {formatDate(plan.deadline)}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                  {getStatusText(plan.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500 flex items-center gap-1">
                    <Gift size={14} />
                    礼物数量
                  </span>
                  <span className="font-medium text-ink-800">
                    {items.length} 件
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500 flex items-center gap-1">
                    <DollarSign size={14} />
                    总预算
                  </span>
                  <span className="font-medium text-ink-800">
                    ¥{plan.totalBudget.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500 flex items-center gap-1">
                    <DollarSign size={14} />
                    已分配
                  </span>
                  <span className="font-medium text-primary-600">
                    ¥{totalBudgetAllocated.toLocaleString()}
                  </span>
                </div>

                {plan.status !== 'planning' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-500 flex items-center gap-1">
                      <DollarSign size={14} />
                      已花费
                    </span>
                    <span className="font-medium text-secondary-600">
                      ¥{totalSpent.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500 flex items-center gap-1">
                    <Clock size={14} />
                    剩余时间
                  </span>
                  <span
                    className={`font-medium ${
                      daysUntil <= 7 ? 'text-accent-600' : 'text-ink-800'
                    }`}
                  >
                    {daysUntil <= 0 ? '已截止' : `${daysUntil}天`}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-ink-500">
                  <span>进度</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          );
        })}

        <div
          onClick={() => setShowAddPlanModal(true)}
          className="card card-hover cursor-pointer border-2 border-dashed border-ink-200 hover:border-primary-400 flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-3">
            <Plus size={24} className="text-primary-500" />
          </div>
          <p className="text-ink-600 font-medium">创建新计划</p>
          <p className="text-ink-400 text-sm mt-1">为节日或特别日子规划礼物</p>
        </div>
      </div>

      {selectedPlanId && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg text-ink-900">
                {purchasePlans.find((p) => p.id === selectedPlanId)?.holidayName} - 礼物清单
              </h2>
              <p className="text-ink-500 text-sm mt-1">
                点击状态按钮可以更新进度
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlanId(null)}
                className="btn-ghost"
              >
                关闭
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {planItems
              .filter((pi) => pi.planId === selectedPlanId)
              .map((item) => {
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
                        <p className="font-medium text-ink-800">
                          {item.giftName}
                        </p>
                        <p className="text-sm text-ink-500">
                          送给 {contact?.name} · 预算 ¥{item.budget}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-ink-500">
                        {formatDate(item.deadline)}
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors hover:opacity-80 ${getItemStatusColor(
                          item.status
                        )}`}
                      >
                        {getItemStatusText(item.status)}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {showAddPlanModal && (
        <AddPlanModal
          holidays={holidays}
          onClose={() => setShowAddPlanModal(false)}
          onSave={(plan) => {
            addPurchasePlan(plan);
            setShowAddPlanModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddPlanModal({
  holidays,
  onClose,
  onSave,
}: {
  holidays: any[];
  onClose: () => void;
  onSave: (
    plan: Omit<PurchasePlan, 'id' | 'userId' | 'createdAt' | 'status'>
  ) => void;
}) {
  const [formData, setFormData] = useState({
    holidayId: '',
    holidayName: '',
    totalBudget: 0,
    deadline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.holidayName || !formData.deadline) return;
    onSave(formData);
  };

  const selectHoliday = (holiday: any) => {
    setFormData((prev) => ({
      ...prev,
      holidayId: holiday.id,
      holidayName: holiday.name,
      deadline: holiday.date,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-scale-in">
        <div className="p-6 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-ink-900">
            创建购买计划
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
              选择节日
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {holidays.slice(0, 6).map((holiday) => (
                <button
                  key={holiday.id}
                  type="button"
                  onClick={() => selectHoliday(holiday)}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    formData.holidayId === holiday.id
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <p className="font-medium text-ink-800">{holiday.name}</p>
                  <p className="text-xs text-ink-500">{holiday.date}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              计划名称 *
            </label>
            <input
              type="text"
              value={formData.holidayName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, holidayName: e.target.value }))
              }
              className="input-field"
              placeholder="如：2026年春节"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                总预算 (¥) *
              </label>
              <input
                type="number"
                value={formData.totalBudget}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalBudget: parseFloat(e.target.value),
                  }))
                }
                className="input-field"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                截止日期 *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              创建计划
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
