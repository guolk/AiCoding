import { useState } from 'react';
import {
  Shield,
  Plus,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  Edit2,
  Trash2,
  Calendar,
  History,
} from 'lucide-react';
import { useSafetyStore } from '@/stores/useSafetyStore';
import { Equipment } from '@/types';
import { formatDateShort, daysBetween, isOverdue, isWithinDays } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';

interface EquipmentFormData {
  name: string;
  type: string;
  brand: string;
  model: string;
  purchaseDate: string;
  lastCheckDate: string;
  checkIntervalDays: number;
  condition: string;
  notes: string;
}

export default function EquipmentPage() {
  const {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    getOverdueEquipment,
    getUpcomingEquipmentChecks,
  } = useSafetyStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const overdue = getOverdueEquipment();
  const upcoming = getUpcomingEquipmentChecks();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    defaultValues: {
      name: '',
      type: 'other',
      brand: '',
      model: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
      checkIntervalDays: 30,
      condition: 'good',
      notes: '',
    },
  });

  const openEditForm = (item: Equipment) => {
    setEditingId(item.id);
    setValue('name', item.name);
    setValue('type', item.type);
    setValue('brand', item.brand);
    setValue('model', item.model);
    setValue('purchaseDate', item.purchaseDate.split('T')[0]);
    setValue('lastCheckDate', item.lastCheckDate.split('T')[0]);
    setValue('checkIntervalDays', item.checkIntervalDays);
    setValue('condition', item.condition);
    setValue('notes', item.notes);
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      name: '',
      type: 'other',
      brand: '',
      model: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
      checkIntervalDays: 30,
      condition: 'good',
      notes: '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: EquipmentFormData) => {
    const equipmentData = {
      name: data.name,
      type: data.type as Equipment['type'],
      brand: data.brand,
      model: data.model,
      purchaseDate: new Date(data.purchaseDate).toISOString(),
      lastCheckDate: new Date(data.lastCheckDate).toISOString(),
      nextCheckDate: new Date(
        new Date(data.lastCheckDate).getTime() + data.checkIntervalDays * 24 * 60 * 60 * 1000
      ).toISOString(),
      checkIntervalDays: data.checkIntervalDays,
      condition: data.condition as Equipment['condition'],
      maintenanceLogs: [],
      notes: data.notes,
    };

    if (editingId) {
      updateEquipment(editingId, equipmentData);
    } else {
      addEquipment(equipmentData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此装备吗？')) {
      deleteEquipment(id);
    }
  };

  const conditionLabels: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    needs_replacement: '需更换',
  };

  const conditionColors: Record<string, string> = {
    excellent: 'bg-success-500/20 text-success-400',
    good: 'bg-primary-500/20 text-primary-400',
    fair: 'bg-secondary-500/20 text-secondary-400',
    needs_replacement: 'bg-danger-500/20 text-danger-400',
  };

  const typeLabels: Record<string, string> = {
    harness: '安全带',
    helmet: '头盔',
    rope: '绳索',
    shoes: '鞋具',
    board: '板类',
    wetsuit: '防寒服',
    other: '其他',
  };

  const getStatusBadge = (item: Equipment) => {
    if (isOverdue(item.nextCheckDate)) {
      return (
        <span className="badge badge-danger flex items-center gap-1">
          <AlertTriangle size={12} />
          已逾期
        </span>
      );
    }
    if (isWithinDays(item.nextCheckDate, 7)) {
      return (
        <span className="badge bg-warning-500/20 text-warning-400 flex items-center gap-1">
          <Clock size={12} />
          即将到期
        </span>
      );
    }
    return (
      <span className="badge badge-success flex items-center gap-1">
        <CheckCircle size={12} />
        状态正常
      </span>
    );
  };

  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <div
      className={`bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors cursor-pointer ${
        isOverdue(item.nextCheckDate) ? 'border border-danger-500/30' : ''
      }`}
      onClick={() => setSelectedEquipment(item)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOverdue(item.nextCheckDate)
                ? 'bg-danger-500/20'
                : item.condition === 'needs_replacement'
                ? 'bg-danger-500/20'
                : 'bg-success-500/20'
            }`}
          >
            <Shield
              className={`${
                isOverdue(item.nextCheckDate)
                  ? 'text-danger-400'
                  : item.condition === 'needs_replacement'
                  ? 'text-danger-400'
                  : 'text-success-400'
              }`}
              size={20}
            />
          </div>
          <div>
            <h3 className="font-semibold text-white">{item.name}</h3>
            <span className="text-sm text-dark-400">{typeLabels[item.type]}</span>
          </div>
        </div>
        {getStatusBadge(item)}
      </div>

      <div className="flex items-center gap-4 text-sm text-dark-400 mb-3">
        <span>{item.brand}</span>
        {item.model && <span className="text-dark-500">|</span>}
        {item.model && <span>{item.model}</span>}
      </div>

      <div className="flex items-center justify-between">
        <span className={`badge ${conditionColors[item.condition]}`}>
          {conditionLabels[item.condition]}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(item);
            }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <Edit2 size={14} className="text-dark-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <Trash2 size={14} className="text-danger-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-success-400">风险管理</span>
            <ChevronRight size={14} />
            <span className="text-white">装备检查</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-success-500" size={28} />
            装备安全管理
          </h1>
          <p className="text-dark-400 mt-1">追踪装备检查和维护记录</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          添加装备
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <Shield className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{equipment.length}</p>
          <p className="text-sm text-dark-400">总装备数</p>
        </div>
        <div className={`card ${overdue.length > 0 ? 'border border-danger-500/30' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-danger-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-danger-400" size={20} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${overdue.length > 0 ? 'text-danger-400' : 'text-white'}`}>
            {overdue.length}
          </p>
          <p className="text-sm text-dark-400">已逾期检查</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-warning-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{upcoming.length}</p>
          <p className="text-sm text-dark-400">即将检查</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {equipment.filter((e) => e.condition === 'excellent' || e.condition === 'good').length}
          </p>
          <p className="text-sm text-dark-400">状态良好</p>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="card border border-danger-500/30 bg-danger-500/5">
          <h2 className="text-lg font-semibold text-danger-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            需要立即检查 ({overdue.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdue.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="card border border-warning-500/30 bg-warning-500/5">
          <h2 className="text-lg font-semibold text-warning-400 mb-4 flex items-center gap-2">
            <Clock size={20} />
            即将到期检查 ({upcoming.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">所有装备</h2>
        {equipment.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto text-dark-600 mb-4" size={48} />
            <p className="text-dark-400 mb-4">还没有装备记录</p>
            <button onClick={openAddForm} className="btn-primary">
              添加第一个装备
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {selectedEquipment && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEquipment(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{selectedEquipment.name}</h2>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`badge ${conditionColors[selectedEquipment.condition]}`}>
                  {conditionLabels[selectedEquipment.condition]}
                </span>
                <span className="badge bg-dark-600 text-dark-300">
                  {typeLabels[selectedEquipment.type]}
                </span>
                {getStatusBadge(selectedEquipment)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">品牌</p>
                  <p className="text-white font-medium">{selectedEquipment.brand}</p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">型号</p>
                  <p className="text-white font-medium">{selectedEquipment.model || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1">
                    <Calendar size={12} />
                    购买日期
                  </p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedEquipment.purchaseDate)}
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1 flex items-center gap-1">
                    <History size={12} />
                    上次检查
                  </p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedEquipment.lastCheckDate)}
                  </p>
                </div>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  isOverdue(selectedEquipment.nextCheckDate)
                    ? 'bg-danger-500/10 border border-danger-500/30'
                    : 'bg-dark-700/50'
                }`}
              >
                <p className="text-xs text-dark-400 mb-1">下次检查日期</p>
                <p className={`font-medium ${
                  isOverdue(selectedEquipment.nextCheckDate)
                    ? 'text-danger-400'
                    : 'text-white'
                }`}>
                  {formatDateShort(selectedEquipment.nextCheckDate)}
                  {!isOverdue(selectedEquipment.nextCheckDate) && (
                    <span className="text-dark-500 ml-2">
                      ({daysBetween(new Date().toISOString(), selectedEquipment.nextCheckDate)}天后)
                    </span>
                  )}
                  {isOverdue(selectedEquipment.nextCheckDate) && (
                    <span className="text-danger-400 ml-2">
                      (已逾期{Math.abs(
                        daysBetween(new Date().toISOString(), selectedEquipment.nextCheckDate)
                      )}天)
                    </span>
                  )}
                </p>
              </div>

              {selectedEquipment.maintenanceLogs.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-2 flex items-center gap-1">
                    <History size={14} />
                    维护记录
                  </p>
                  <div className="space-y-2">
                    {selectedEquipment.maintenanceLogs.map((log, idx) => (
                      <div key={idx} className="bg-dark-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{log.action}</span>
                          <span className="text-xs text-dark-400">
                            {formatDateShort(log.date)}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-dark-400">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEquipment.notes && (
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-2">备注</p>
                  <p className="text-white">{selectedEquipment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? '编辑装备' : '添加装备'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="label">装备名称</label>
                <input
                  {...register('name', { required: '请输入装备名称' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：攀岩安全带"
                />
                {errors.name && (
                  <p className="text-danger-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">类型</label>
                  <select {...register('type')} className="input-field">
                    <option value="harness">安全带</option>
                    <option value="helmet">头盔</option>
                    <option value="rope">绳索</option>
                    <option value="shoes">鞋具</option>
                    <option value="board">板类</option>
                    <option value="wetsuit">防寒服</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="label">状态</label>
                  <select {...register('condition')} className="input-field">
                    <option value="excellent">优秀</option>
                    <option value="good">良好</option>
                    <option value="fair">一般</option>
                    <option value="needs_replacement">需更换</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">品牌</label>
                  <input
                    {...register('brand', { required: '请输入品牌' })}
                    type="text"
                    className="input-field"
                    placeholder="例如：Black Diamond"
                  />
                  {errors.brand && (
                    <p className="text-danger-400 text-sm mt-1">{errors.brand.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">型号</label>
                  <input
                    {...register('model')}
                    type="text"
                    className="input-field"
                    placeholder="例如：Solution"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">购买日期</label>
                  <input
                    {...register('purchaseDate', { required: '请选择日期' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.purchaseDate && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.purchaseDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">上次检查日期</label>
                  <input
                    {...register('lastCheckDate', { required: '请选择日期' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.lastCheckDate && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.lastCheckDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">检查间隔 (天)</label>
                <input
                  {...register('checkIntervalDays', { min: 1 })}
                  type="number"
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  {...register('notes')}
                  className="input-field h-20 resize-none"
                  placeholder="记录装备的使用情况、磨损情况等..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? '保存修改' : '添加装备'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
