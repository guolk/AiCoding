import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Calendar, Pill, Stethoscope, X, Save, Clock, History } from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/Card';
import type { Medicine } from '@/types';
import { cn } from '@/lib/utils';

const MEDICINE_TYPES = ['汤剂', '丸剂', '散剂', '膏剂', '颗粒剂', '胶囊', '片剂', '药酒', '其他'];

function MedicineForm({
  medicine,
  onSave,
  onCancel,
}: {
  medicine?: Medicine;
  onSave: (data: Omit<Medicine, 'id' | 'isActive'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: medicine?.name || '',
    type: medicine?.type || '汤剂',
    dosage: medicine?.dosage || '',
    startDate: medicine?.startDate || new Date().toISOString().split('T')[0],
    endDate: medicine?.endDate || '',
    effect: medicine?.effect || '',
    notes: medicine?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">
              {medicine ? '编辑用药' : '添加用药'}
            </h3>
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Pill className="w-4 h-4 inline mr-1 text-primary" />
                药品名称
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="如：六味地黄丸"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-1 text-primary" />
                剂型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white cursor-pointer"
              >
                {MEDICINE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Pill className="w-4 h-4 inline mr-1 text-primary" />
              剂量与用法
            </label>
            <input
              type="text"
              required
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="如：每日3次，每次8丸"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-primary" />
                开始日期
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-secondary" />
                结束日期（可选）
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
              用药效果
            </label>
            <textarea
              value={formData.effect}
              onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="记录用药后的效果感受，如：睡眠改善、体力恢复等"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Edit2 className="w-4 h-4 inline mr-1 text-gray-500" />
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              placeholder="其他需要记录的信息，如不良反应、注意事项等"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MedicineCard({
  medicine,
  onEdit,
  onToggle,
  onDelete,
}: {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card hoverable className={cn(
      'group relative overflow-hidden',
      !medicine.isActive && 'opacity-75'
    )}>
      {!medicine.isActive && (
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
            已停用
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
              {medicine.name}
            </h3>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
              {medicine.type}
            </span>
          </div>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <Pill className="w-4 h-4" />
            {medicine.dosage}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(medicine)}
            className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-primary/10 text-gray-400 hover:text-primary flex items-center justify-center transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggle(medicine.id)}
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
              medicine.isActive
                ? 'bg-green-50 hover:bg-green-100 text-green-500'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
            )}
            title={medicine.isActive ? '标记停用' : '标记恢复'}
          >
            {medicine.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(medicine.id)}
            className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{medicine.startDate}</span>
          {medicine.endDate && (
            <>
              <span className="text-gray-300">→</span>
              <span>{medicine.endDate}</span>
            </>
          )}
        </div>
      </div>

      {medicine.effect && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">用药效果：</p>
          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">{medicine.effect}</p>
        </div>
      )}

      {medicine.notes && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">备注：</p>
          <p className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg">{medicine.notes}</p>
        </div>
      )}
    </Card>
  );
}

export default function MedicinePage() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>();
  const [showHistory, setShowHistory] = useState(false);

  const { activeMedicines, historyMedicines } = useMemo(() => {
    const active = medicines.filter(m => m.isActive);
    const history = medicines.filter(m => !m.isActive);
    return { activeMedicines: active, historyMedicines: history };
  }, [medicines]);

  const handleAdd = (data: Omit<Medicine, 'id' | 'isActive'>) => {
    const newMedicine: Medicine = {
      ...data,
      id: Date.now().toString(),
      isActive: !data.endDate || new Date(data.endDate) > new Date(),
    };
    addMedicine(newMedicine);
    setShowForm(false);
  };

  const handleUpdate = (data: Omit<Medicine, 'id' | 'isActive'>) => {
    if (!editingMedicine) return;
    updateMedicine(editingMedicine.id, {
      ...data,
      isActive: !data.endDate || new Date(data.endDate) > new Date(),
    });
    setEditingMedicine(undefined);
  };

  const handleToggle = (id: string) => {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
      updateMedicine(id, { isActive: !medicine.isActive });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条用药记录吗？')) {
      deleteMedicine(id);
    }
  };

  const displayMedicines = showHistory ? historyMedicines : activeMedicines;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">用药管理</h2>
            <p className="text-gray-500">记录和追踪中药使用情况，管理您的健康</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setShowHistory(false)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  !showHistory ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Clock className="w-4 h-4" />
                在用 ({activeMedicines.length})
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
                  showHistory ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <History className="w-4 h-4" />
                历史 ({historyMedicines.length})
              </button>
            </div>
            <button
              onClick={() => {
                setEditingMedicine(undefined);
                setShowForm(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加用药
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayMedicines.map((medicine) => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
            onEdit={setEditingMedicine}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {displayMedicines.length === 0 && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            {showHistory ? (
              <History className="w-10 h-10 text-gray-400" />
            ) : (
              <Pill className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">
            {showHistory ? '暂无历史用药记录' : '暂无正在服用的药物'}
          </h4>
          <p className="text-gray-500 mb-4">
            {showHistory
              ? '您还没有停用的药物记录'
              : '点击上方按钮添加您的第一条用药记录'}
          </p>
          {!showHistory && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加用药
            </button>
          )}
        </Card>
      )}

      {showForm && (
        <MedicineForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingMedicine && (
        <MedicineForm
          medicine={editingMedicine}
          onSave={handleUpdate}
          onCancel={() => setEditingMedicine(undefined)}
        />
      )}
    </div>
  );
}
