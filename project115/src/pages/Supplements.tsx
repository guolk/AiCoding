import { useState } from 'react';
import { 
  Plus, 
  Leaf, 
  AlertTriangle, 
  Edit2,
  Trash2,
  Star,
  Package,
  Calendar,
  CheckCircle,
  Info
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { 
  formatDate, 
  isExpired, 
  getExpiryStatus 
} from '../utils/dateUtils';
import { cn } from '../lib/utils';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';
import { Supplement } from '../types';

interface SupplementFormData {
  name: string;
  brand: string;
  dosage: string;
  effects: string;
  subjectiveFeedback: string;
  initialQuantity: number;
  currentQuantity: number;
  expiryDate: string;
  interactions: string;
}

const initialFormData: SupplementFormData = {
  name: '',
  brand: '',
  dosage: '',
  effects: '',
  subjectiveFeedback: '',
  initialQuantity: 0,
  currentQuantity: 0,
  expiryDate: '',
  interactions: ''
};

export function Supplements() {
  const { supplements, addSupplement, updateSupplement, deleteSupplement } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [formData, setFormData] = useState<SupplementFormData>(initialFormData);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);

  const lowStock = supplements.filter(s => {
    const percentage = s.initialQuantity > 0 ? (s.currentQuantity / s.initialQuantity) * 100 : 0;
    return percentage <= 30;
  });
  const expiringSoon = supplements.filter(s => {
    const status = getExpiryStatus(s.expiryDate);
    return status === 'urgent' || status === 'warning' || status === 'expired';
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const supplementData = {
      name: formData.name,
      brand: formData.brand,
      dosage: formData.dosage,
      effects: formData.effects.split('\n').filter(e => e.trim()),
      subjectiveFeedback: formData.subjectiveFeedback,
      initialQuantity: formData.initialQuantity,
      currentQuantity: formData.currentQuantity,
      expiryDate: formData.expiryDate,
      interactions: formData.interactions.split('\n').filter(i => i.trim())
    };

    if (editingSupplement) {
      updateSupplement(editingSupplement.id, supplementData);
    } else {
      addSupplement({
        ...supplementData,
        currentQuantity: formData.initialQuantity
      });
    }

    handleCloseModal();
  };

  const handleOpenEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setFormData({
      name: supplement.name,
      brand: supplement.brand,
      dosage: supplement.dosage,
      effects: supplement.effects.join('\n'),
      subjectiveFeedback: supplement.subjectiveFeedback,
      initialQuantity: supplement.initialQuantity,
      currentQuantity: supplement.currentQuantity,
      expiryDate: supplement.expiryDate,
      interactions: supplement.interactions.join('\n')
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplement(null);
    setFormData(initialFormData);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个保健品吗？')) {
      deleteSupplement(id);
    }
  };

  const getStockPercentage = (current: number, initial: number): number => {
    if (initial <= 0) return 0;
    return Math.round((current / initial) * 100);
  };

  const getStockColor = (percentage: number): string => {
    if (percentage <= 30) return 'bg-red-500';
    if (percentage <= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">保健品管理</h1>
          <p className="text-slate-500">追踪您的保健品库存和效果</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
        >
          <Plus className="w-5 h-5" />
          新增保健品
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="保健品总数"
          value={supplements.length}
          icon={Leaf}
          color="purple"
        />
        <StatCard
          title="库存不足"
          value={lowStock.length}
          icon={Package}
          color="orange"
        />
        <StatCard
          title="即将过期"
          value={expiringSoon.length}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {supplements.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="暂无保健品"
          description="点击上方按钮添加您的第一个保健品"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplements.map((supplement) => {
            const stockPercentage = getStockPercentage(supplement.currentQuantity, supplement.initialQuantity);
            const hasInteractions = supplement.interactions.length > 0;

            return (
              <div
                key={supplement.id}
                className={cn(
                  "bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md",
                  isExpired(supplement.expiryDate) ? "border-red-200 bg-red-50/50" : "border-slate-100"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{supplement.name}</h3>
                      <p className="text-sm text-slate-500">{supplement.brand || '品牌未知'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedSupplement(supplement)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      title="查看详情"
                    >
                      <Info className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(supplement)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplement.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">库存进度</span>
                      <span className="text-xs font-medium text-slate-700">
                        {supplement.currentQuantity} / {supplement.initialQuantity} ({stockPercentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", getStockColor(stockPercentage))}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    有效期: {formatDate(supplement.expiryDate)}
                  </div>

                  {supplement.dosage && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      用法: {supplement.dosage}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {supplement.effects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {supplement.effects.slice(0, 2).map((effect, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full"
                        >
                          {effect}
                        </span>
                      ))}
                      {supplement.effects.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                          +{supplement.effects.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {hasInteractions && (
                    <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      有相互作用
                    </span>
                  )}
                </div>

                {stockPercentage <= 30 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      库存不足，请及时补充
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSupplement ? '编辑保健品' : '新增保健品'}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                保健品名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 钙片"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                品牌
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 汤臣倍健"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                用法用量
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="如: 每日2片"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                有效期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                初始数量
              </label>
              <input
                type="number"
                min="0"
                value={formData.initialQuantity}
                onChange={(e) => setFormData({ ...formData, initialQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                当前剩余
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentQuantity}
                onChange={(e) => setFormData({ ...formData, currentQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              功效（每行一个）
            </label>
            <textarea
              value={formData.effects}
              onChange={(e) => setFormData({ ...formData, effects: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="如：&#10;补充钙质&#10;预防骨质疏松"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              相互作用风险（每行一个）
            </label>
            <textarea
              value={formData.interactions}
              onChange={(e) => setFormData({ ...formData, interactions: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="如：&#10;与抗凝药同用可能增加出血风险"
            />
            <p className="text-xs text-slate-500 mt-1">
              注意：保健品可能与药物产生相互作用，请咨询医生或药师
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              效果追踪（主观感受）
            </label>
            <textarea
              value={formData.subjectiveFeedback}
              onChange={(e) => setFormData({ ...formData, subjectiveFeedback: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
              placeholder="记录服用后的感受和效果..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              {editingSupplement ? '保存修改' : '添加保健品'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!selectedSupplement}
        onClose={() => setSelectedSupplement(null)}
        title="保健品详情"
        size="lg"
      >
        {selectedSupplement && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-16 h-16 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedSupplement.name}</h2>
                <p className="text-slate-500">{selectedSupplement.brand || '品牌未知'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">用法用量</p>
                <p className="font-medium text-slate-800">{selectedSupplement.dosage || '-'}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">有效期</p>
                <p className="font-medium text-slate-800">{formatDate(selectedSupplement.expiryDate)}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-2">库存</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">
                      {selectedSupplement.currentQuantity} / {selectedSupplement.initialQuantity}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {getStockPercentage(selectedSupplement.currentQuantity, selectedSupplement.initialQuantity)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getStockColor(getStockPercentage(selectedSupplement.currentQuantity, selectedSupplement.initialQuantity))
                      )}
                      style={{ 
                        width: `${getStockPercentage(selectedSupplement.currentQuantity, selectedSupplement.initialQuantity)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedSupplement.effects.length > 0 && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-sm text-emerald-700 font-medium mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  功效
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSupplement.effects.map((effect, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-full"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedSupplement.interactions.length > 0 && (
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  相互作用风险
                </p>
                <ul className="space-y-1 text-sm text-orange-600">
                  {selectedSupplement.interactions.map((interaction, index) => (
                    <li key={index}>• {interaction}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedSupplement.subjectiveFeedback && (
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">效果追踪</p>
                <p className="font-medium text-slate-800">{selectedSupplement.subjectiveFeedback}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedSupplement(null)}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              关闭
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
