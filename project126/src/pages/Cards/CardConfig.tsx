import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Settings, CreditCard, Pause, Play, Calendar, ArrowUp, CreditCard as CardIcon, Trash2, Eye, Edit2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useCardStore } from '@/stores/useCardStore';
import { useMemberStore } from '@/stores/useMemberStore';
import { getDaysBetween, getToday } from '@/utils/date';
import { Modal } from '@/components/Modal/Modal';
import type { CardTypeFormData } from '@/types/card';

export const CardConfig = () => {
  const { cardTypes, addCardType, updateCardType, toggleCardTypeActive, deleteCardType, operations, getOperationsByCardId } = useCardStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState<typeof cardTypes[0] | null>(null);
  const [showOperationsModal, setShowOperationsModal] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<typeof cardTypes[0] | null>(null);
  const [formData, setFormData] = useState<CardTypeFormData>({
    name: '',
    type: 'monthly',
    price: 0,
    durationDays: undefined,
    totalCount: undefined,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) {
      alert('请填写卡名称和价格');
      return;
    }

    if (editingCard) {
      updateCardType(editingCard.id, formData);
    } else {
      addCardType(formData);
    }
    setShowAddModal(false);
    setEditingCard(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'monthly',
      price: 0,
      durationDays: undefined,
      totalCount: undefined,
      description: '',
    });
  };

  const handleEdit = (card: typeof cardTypes[0]) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      type: card.type,
      price: card.price,
      durationDays: card.durationDays,
      totalCount: card.totalCount,
      description: card.description,
    });
    setShowAddModal(true);
  };

  const handleDelete = (card: typeof cardTypes[0]) => {
    setDeleteTarget(card);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    try {
      deleteCardType(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || '删除失败');
      setDeleteTarget(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly': return '月卡';
      case 'quarterly': return '季卡';
      case 'yearly': return '年卡';
      case 'count': return '次卡';
      case 'stored': return '储值卡';
      default: return type;
    }
  };

  const cardOperations = showOperationsModal ? getOperationsByCardId(showOperationsModal) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">卡型配置</h1>
          <p className="text-slate-500 mt-1">配置会员卡类型和规则</p>
        </div>
        <button
          onClick={() => {
            setEditingCard(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          新增卡型
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardTypes.map((cardType) => (
          <div
            key={cardType.id}
            className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
              cardType.isActive ? 'border-slate-100 hover:shadow-md' : 'border-slate-200 opacity-75'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  cardType.isActive
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-600'
                    : 'bg-slate-200'
                }`}>
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{cardType.name}</h3>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    cardType.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cardType.isActive ? '启用' : '停用'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">类型</span>
                <span className="font-medium text-slate-700">{getTypeLabel(cardType.type)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">价格</span>
                <span className="font-bold text-xl text-slate-800">¥{cardType.price}</span>
              </div>
              {cardType.durationDays && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">有效期</span>
                  <span className="font-medium text-slate-700">{cardType.durationDays} 天</span>
                </div>
              )}
              {cardType.totalCount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">次数</span>
                  <span className="font-medium text-slate-700">{cardType.totalCount} 次</span>
                </div>
              )}
            </div>

            {cardType.description && (
              <p className="mt-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
              {cardType.description}
            </p>
            )}

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleEdit(cardType)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
              <button
                onClick={() => toggleCardTypeActive(cardType.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg transition-colors ${
                  cardType.isActive
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {cardType.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {cardType.isActive ? '停用' : '启用'}
              </button>
              <button
                onClick={() => handleDelete(cardType)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCard(null);
          resetForm();
        }}
        title={editingCard ? '编辑卡型' : '新增卡型'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
              卡名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="如：月卡、季卡、30次卡等"
            />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                卡类型 <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              >
                <option value="monthly">月卡</option>
                <option value="quarterly">季卡</option>
                <option value="yearly">年卡</option>
                <option value="count">次卡</option>
                <option value="stored">储值卡</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                价格 <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="请输入价格"
              />
            </div>
            {['monthly', 'quarterly', 'yearly'].includes(formData.type) ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  有效期（天）
                </label>
                <input
                  type="number"
                  value={formData.durationDays || ''}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                  placeholder={
                    formData.type === 'monthly' ? '30' :
                    formData.type === 'quarterly' ? '90' : '365'
                  }
                />
              </div>
            ) : null}
            {formData.type === 'count' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  次数
                </label>
                <input
                  type="number"
                  value={formData.totalCount || ''}
                  onChange={(e) => setFormData({ ...formData, totalCount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                  placeholder="请输入可用次数"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
              placeholder="请输入卡型描述"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingCard(null);
                resetForm();
              }}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              {editingCard ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-slate-800 font-medium">
                确定要删除卡型「{deleteTarget?.name}」吗？
              </p>
              <p className="text-sm text-slate-500 mt-1">
                删除后不可恢复。如果该卡型下存在会员卡，则无法删除。
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
