import { useState } from 'react';
import {
  Heart,
  Plus,
  Calendar,
  Clock,
  ChevronRight,
  X,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { formatDateShort, daysBetween } from '@/utils/dateUtils';
import { InjuryRecord } from '@/types';
import { useForm } from 'react-hook-form';

interface InjuryFormData {
  bodyPart: string;
  severity: string;
  injuryDate: string;
  treatment: string;
  status: string;
  recoveryProgress: number;
  expectedReturn: string;
  notes: string;
}

export default function InjuryPage() {
  const { injuries, addInjury, updateInjury, deleteInjury } = useTrainingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedInjury, setSelectedInjury] = useState<InjuryRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const activeInjuries = injuries.filter((i) => i.status !== 'recovered');
  const recoveredInjuries = injuries.filter((i) => i.status === 'recovered');

  const handleDelete = (id: string) => {
    deleteInjury(id);
    setDeleteConfirm(null);
    if (selectedInjury?.id === id) {
      setSelectedInjury(null);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InjuryFormData>({
    defaultValues: {
      bodyPart: '',
      severity: 'mild',
      injuryDate: new Date().toISOString().split('T')[0],
      treatment: '',
      status: 'recovering',
      recoveryProgress: 0,
      expectedReturn: '',
      notes: '',
    },
  });

  const openEditForm = (injury: InjuryRecord) => {
    setEditingId(injury.id);
    setValue('bodyPart', injury.bodyPart);
    setValue('severity', injury.severity);
    setValue('injuryDate', injury.injuryDate.split('T')[0]);
    setValue('treatment', injury.treatment);
    setValue('status', injury.status);
    setValue('recoveryProgress', injury.recoveryProgress);
    setValue(
      'expectedReturn',
      injury.expectedReturn ? injury.expectedReturn.split('T')[0] : ''
    );
    setValue('notes', '');
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      bodyPart: '',
      severity: 'mild',
      injuryDate: new Date().toISOString().split('T')[0],
      treatment: '',
      status: 'recovering',
      recoveryProgress: 0,
      expectedReturn: '',
      notes: '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: InjuryFormData) => {
    if (editingId) {
      updateInjury(editingId, {
        bodyPart: data.bodyPart,
        severity: data.severity as InjuryRecord['severity'],
        injuryDate: new Date(data.injuryDate).toISOString(),
        treatment: data.treatment,
        status: data.status as InjuryRecord['status'],
        recoveryProgress: data.recoveryProgress,
        expectedReturn: data.expectedReturn
          ? new Date(data.expectedReturn).toISOString()
          : '',
      });
    } else {
      addInjury({
        bodyPart: data.bodyPart,
        severity: data.severity as InjuryRecord['severity'],
        injuryDate: new Date(data.injuryDate).toISOString(),
        treatment: data.treatment,
        status: data.status as InjuryRecord['status'],
        recoveryProgress: data.recoveryProgress,
        expectedReturn: data.expectedReturn
          ? new Date(data.expectedReturn).toISOString()
          : '',
        rehabilitationLogs: [],
      });
    }
    setShowForm(false);
    setEditingId(null);
  };

  const severityLabels: Record<string, string> = {
    mild: '轻微',
    moderate: '中等',
    severe: '严重',
  };

  const severityColors: Record<string, string> = {
    mild: 'bg-success-500/20 text-success-400',
    moderate: 'bg-primary-500/20 text-primary-400',
    severe: 'bg-danger-500/20 text-danger-400',
  };

  const statusLabels: Record<string, string> = {
    recovering: '恢复中',
    recovered: '已康复',
    chronic: '慢性',
  };

  const InjuryCard = ({ injury }: { injury: InjuryRecord }) => (
    <div
      key={injury.id}
      className="bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors cursor-pointer"
      onClick={() => setSelectedInjury(injury)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              injury.status === 'recovered'
                ? 'bg-success-500/20'
                : severityColors[injury.severity]
            }`}
          >
            {injury.status === 'recovered' ? (
              <CheckCircle size={20} />
            ) : (
              <Activity size={20} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white">{injury.bodyPart}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${severityColors[injury.severity]}`}>
                {severityLabels[injury.severity]}
              </span>
              <span
                className={`badge ${
                  injury.status === 'recovered'
                    ? 'badge-success'
                    : injury.status === 'chronic'
                    ? 'badge-danger'
                    : 'badge-secondary'
                }`}
              >
                {statusLabels[injury.status]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(injury);
            }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            title="编辑"
          >
            <Plus size={16} className="text-dark-400 rotate-45" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm(injury.id);
            }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-dark-400 hover:text-danger-400"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-dark-400">恢复进度</span>
          <span className="text-white font-medium">{injury.recoveryProgress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-fill ${
              injury.recoveryProgress === 100
                ? 'bg-gradient-to-r from-success-600 to-success-400'
                : ''
            }`}
            style={{ width: `${injury.recoveryProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          受伤: {formatDateShort(injury.injuryDate)}
        </span>
        {injury.expectedReturn && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            预计: {formatDateShort(injury.expectedReturn)}
            {injury.status !== 'recovered' && (
              <span className="text-primary-400 ml-1">
                ({daysBetween(new Date().toISOString(), injury.expectedReturn)}天后)
              </span>
            )}
          </span>
        )}
      </div>

      {injury.treatment && (
        <p className="mt-3 text-sm text-dark-300">
          <span className="text-dark-500">治疗方案: </span>
          {injury.treatment}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-primary-400">训练记录</span>
            <ChevronRight size={14} />
            <span className="text-white">伤病管理</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="text-danger-500" size={28} />
            伤病管理
          </h1>
          <p className="text-dark-400 mt-1">记录伤病，追踪康复过程</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          记录伤病
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-danger-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-danger-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{activeInjuries.length}</p>
          <p className="text-sm text-dark-400">恢复中</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{recoveredInjuries.length}</p>
          <p className="text-sm text-dark-400">已康复</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {activeInjuries.length > 0
              ? Math.round(
                  activeInjuries.reduce(
                    (sum, i) => sum + i.recoveryProgress,
                    0
                  ) / activeInjuries.length
                )
              : 0}
            %
          </p>
          <p className="text-sm text-dark-400">平均恢复进度</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{injuries.length}</p>
          <p className="text-sm text-dark-400">总伤病记录</p>
        </div>
      </div>

      {activeInjuries.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="text-danger-500" size={20} />
            恢复中 ({activeInjuries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInjuries.map((injury) => (
              <InjuryCard key={injury.id} injury={injury} />
            ))}
          </div>
        </div>
      )}

      {recoveredInjuries.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="text-success-500" size={20} />
            已康复 ({recoveredInjuries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recoveredInjuries.map((injury) => (
              <InjuryCard key={injury.id} injury={injury} />
            ))}
          </div>
        </div>
      )}

      {injuries.length === 0 && (
        <div className="card text-center py-12">
          <Heart className="mx-auto text-dark-600 mb-4" size={48} />
          <p className="text-dark-400 mb-4">还没有伤病记录</p>
          <p className="text-dark-500 text-sm mb-4">
            希望你永远不需要这个功能！但如果受伤了，请务必记录并追踪恢复过程。
          </p>
          <button onClick={openAddForm} className="btn-outline">
            记录第一次伤病
          </button>
        </div>
      )}

      {selectedInjury && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedInjury(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {selectedInjury.bodyPart}
              </h2>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setSelectedInjury(null);
                    openEditForm(selectedInjury);
                  }}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Plus size={20} className="text-dark-400 rotate-45" />
                </button>
                <button
                  onClick={() => {
                    setSelectedInjury(null);
                    setDeleteConfirm(selectedInjury.id);
                  }}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-danger-400"
                  title="删除"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedInjury(null)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-dark-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`badge ${severityColors[selectedInjury.severity]}`}>
                  {severityLabels[selectedInjury.severity]}
                </span>
                <span
                  className={`badge ${
                    selectedInjury.status === 'recovered'
                      ? 'badge-success'
                      : 'badge-secondary'
                  }`}
                >
                  {statusLabels[selectedInjury.status]}
                </span>
              </div>

              <div>
                <p className="text-sm text-dark-400 mb-2">恢复进度</p>
                <div className="progress-bar h-3">
                  <div
                    className="progress-fill"
                    style={{ width: `${selectedInjury.recoveryProgress}%` }}
                  ></div>
                </div>
                <p className="text-right text-white font-semibold mt-1">
                  {selectedInjury.recoveryProgress}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">受伤日期</p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedInjury.injuryDate)}
                  </p>
                </div>
                {selectedInjury.expectedReturn && (
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <p className="text-xs text-dark-400 mb-1">预计康复</p>
                    <p className="text-white font-medium">
                      {formatDateShort(selectedInjury.expectedReturn)}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="text-xs text-dark-400 mb-2">治疗方案</p>
                <p className="text-white">{selectedInjury.treatment}</p>
              </div>

              {selectedInjury.rehabilitationLogs.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-2">康复日志</p>
                  <div className="space-y-2">
                    {selectedInjury.rehabilitationLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="bg-dark-700/50 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">
                            {log.activity}
                          </span>
                          <span className="text-xs text-dark-400">
                            {formatDateShort(log.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-dark-400">
                            疼痛程度:
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-3 h-3 rounded-full ${
                                  level <= log.painLevel
                                    ? 'bg-danger-500'
                                    : 'bg-dark-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                {editingId ? '编辑伤病记录' : '记录伤病'}
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
                <label className="label">受伤部位</label>
                <input
                  {...register('bodyPart', { required: '请输入受伤部位' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：左前臂、右脚踝"
                />
                {errors.bodyPart && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.bodyPart.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">严重程度</label>
                  <select {...register('severity')} className="input-field">
                    <option value="mild">轻微</option>
                    <option value="moderate">中等</option>
                    <option value="severe">严重</option>
                  </select>
                </div>
                <div>
                  <label className="label">状态</label>
                  <select {...register('status')} className="input-field">
                    <option value="recovering">恢复中</option>
                    <option value="recovered">已康复</option>
                    <option value="chronic">慢性</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">受伤日期</label>
                  <input
                    {...register('injuryDate', { required: '请选择日期' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.injuryDate && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.injuryDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">预计康复日期</label>
                  <input
                    {...register('expectedReturn')}
                    type="date"
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  恢复进度:{' '}
                  <span className="text-primary-400">{watch('recoveryProgress')}%</span>
                </label>
                <input
                  {...register('recoveryProgress')}
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="label">治疗方案</label>
                <textarea
                  {...register('treatment', { required: '请输入治疗方案' })}
                  className="input-field h-24 resize-none"
                  placeholder="例如：休息、冰敷、物理治疗..."
                />
                {errors.treatment && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.treatment.message}
                  </p>
                )}
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
                  {editingId ? '保存修改' : '保存记录'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-danger-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="text-danger-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">确认删除</h3>
                  <p className="text-sm text-dark-400">此操作无法撤销</p>
                </div>
              </div>
              <p className="text-dark-300 mb-6">
                确定要删除这条伤病记录吗？删除后将无法恢复。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
