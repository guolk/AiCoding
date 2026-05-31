import { useState } from 'react';
import {
  Footprints,
  Plus,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  X,
  Target,
  Check,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { formatDateShort, formatDuration } from '@/utils/dateUtils';
import { SkateboardingDetails } from '@/types';
import { generateId } from '@/utils/storage';
import { useForm } from 'react-hook-form';

interface SkateFormData {
  date: string;
  location: string;
  duration: number;
  locationType: string;
  notes: string;
}

export default function SkateboardingPage() {
  const { records, addRecord, deleteRecord } = useTrainingStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tricks, setTricks] = useState([
    { name: '', attempts: 0, successes: 0, falls: 0, notes: '' },
  ]);

  const handleDelete = (id: string) => {
    deleteRecord(id);
    setDeleteConfirm(null);
  };

  const skateRecords = records.filter((r) => r.sportType === 'skateboarding');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkateFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      duration: 90,
      locationType: 'park',
      notes: '',
    },
  });

  const addTrick = () => {
    setTricks([...tricks, { name: '', attempts: 0, successes: 0, falls: 0, notes: '' }]);
  };

  const removeTrick = (index: number) => {
    setTricks(tricks.filter((_, i) => i !== index));
  };

  const updateTrick = (index: number, field: string, value: string | number) => {
    const newTricks = [...tricks];
    newTricks[index] = { ...newTricks[index], [field]: value };
    setTricks(newTricks);
  };

  const onSubmit = (data: SkateFormData) => {
    const details: SkateboardingDetails = {
      locationType: data.locationType as SkateboardingDetails['locationType'],
      tricks: tricks
        .filter((t) => t.name.trim())
        .map((t) => ({
          id: generateId(),
          name: t.name,
          attempts: Number(t.attempts),
          successes: Number(t.successes),
          falls: Number(t.falls),
          notes: t.notes,
        })),
    };

    addRecord({
      sportType: 'skateboarding',
      date: new Date(data.date).toISOString(),
      location: data.location,
      duration: data.duration,
      details,
      videoAnnotations: [],
      notes: data.notes,
    });

    setShowForm(false);
    setTricks([{ name: '', attempts: 0, successes: 0, falls: 0, notes: '' }]);
    reset();
  };

  const locationTypeLabels: Record<string, string> = {
    street: '街式',
    park: '公园',
    vert: 'U池',
    bowl: '碗池',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-primary-400">训练记录</span>
            <ChevronRight size={14} />
            <span className="text-white">滑板</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Footprints className="text-skate-500" size={28} />
            滑板训练记录
          </h1>
          <p className="text-dark-400 mt-1">记录每次技巧练习的突破</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          添加记录
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{skateRecords.length}</p>
          <p className="text-sm text-dark-400">总训练次数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatDuration(
              skateRecords.reduce((sum, r) => sum + r.duration, 0)
            )}
          </p>
          <p className="text-sm text-dark-400">总训练时长</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <Check className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {skateRecords.reduce((sum, r) => {
              const details = r.details as SkateboardingDetails;
              return sum + details.tricks.reduce((s, t) => s + t.successes, 0);
            }, 0)}
          </p>
          <p className="text-sm text-dark-400">总成功次数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-danger-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-danger-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {skateRecords.reduce((sum, r) => {
              const details = r.details as SkateboardingDetails;
              return sum + details.tricks.reduce((s, t) => s + t.falls, 0);
            }, 0)}
          </p>
          <p className="text-sm text-dark-400">总跌落次数</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">训练记录列表</h2>

        {skateRecords.length === 0 ? (
          <div className="text-center py-12">
            <Footprints className="mx-auto text-dark-600 mb-4" size={48} />
            <p className="text-dark-400 mb-4">还没有滑板训练记录</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              记录第一次训练
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {skateRecords.map((record) => {
              const details = record.details as SkateboardingDetails;
              const totalSuccess = details.tricks.reduce(
                (s, t) => s + t.successes,
                0
              );
              const totalAttempts = details.tricks.reduce(
                (s, t) => s + t.attempts,
                0
              );
              const successRate =
                totalAttempts > 0
                  ? Math.round((totalSuccess / totalAttempts) * 100)
                  : 0;

              return (
                <div
                  key={record.id}
                  className="bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="badge badge-secondary text-sm">
                          {locationTypeLabels[details.locationType]}
                        </span>
                        <span className="text-dark-400 text-sm flex items-center gap-1">
                          <MapPin size={14} />
                          {record.location}
                        </span>
                        <span className="text-dark-400 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDateShort(record.date)}
                        </span>
                        <span className="text-dark-400 text-sm flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(record.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-dark-300 text-sm">
                          成功率:{' '}
                          <span
                            className={`font-semibold ${
                              successRate >= 60
                                ? 'text-success-400'
                                : 'text-warning-400'
                            }`}
                          >
                            {successRate}%
                          </span>
                        </span>
                        <span className="text-dark-300 text-sm">
                          技巧:{' '}
                          <span className="text-white font-semibold">
                            {details.tricks.length}
                          </span>{' '}
                          个
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(record.id)}
                      className="p-2 text-dark-500 hover:text-danger-400 hover:bg-dark-600 rounded-lg transition-all"
                      title="删除记录"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.tricks.map((trick) => (
                      <div
                        key={trick.id}
                        className="bg-dark-800/50 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">
                            {trick.name}
                          </span>
                          <span
                            className={`badge ${
                              trick.successes > 0
                                ? 'badge-success'
                                : 'badge-secondary'
                            }`}
                          >
                            {trick.attempts > 0
                              ? Math.round(
                                  (trick.successes / trick.attempts) * 100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-dark-400">
                          <span className="flex items-center gap-1">
                            <Target size={12} />
                            尝试: {trick.attempts}
                          </span>
                          <span className="flex items-center gap-1 text-success-400">
                            <Check size={12} />
                            成功: {trick.successes}
                          </span>
                          <span className="flex items-center gap-1 text-danger-400">
                            <AlertTriangle size={12} />
                            跌落: {trick.falls}
                          </span>
                        </div>
                        {trick.notes && (
                          <p className="mt-2 text-xs text-dark-500">
                            {trick.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {record.notes && (
                    <p className="mt-4 text-sm text-dark-300">{record.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Plus size={20} className="text-skate-500" />
                添加滑板训练记录
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">日期</label>
                  <input
                    {...register('date', { required: '请选择日期' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.date && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">时长 (分钟)</label>
                  <input
                    {...register('duration', {
                      required: '请输入时长',
                      min: 1,
                    })}
                    type="number"
                    className="input-field"
                    placeholder="90"
                  />
                  {errors.duration && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.duration.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">场地类型</label>
                  <select {...register('locationType')} className="input-field">
                    <option value="park">公园</option>
                    <option value="street">街式</option>
                    <option value="vert">U池</option>
                    <option value="bowl">碗池</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">地点</label>
                <input
                  {...register('location', { required: '请输入地点' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：城市滑板公园"
                />
                {errors.location && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">练习的技巧</label>
                  <button
                    type="button"
                    onClick={addTrick}
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    添加技巧
                  </button>
                </div>
                <div className="space-y-3">
                  {tricks.map((trick, index) => (
                    <div
                      key={index}
                      className="bg-dark-700/50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-dark-300">
                          技巧 #{index + 1}
                        </span>
                        {tricks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTrick(index)}
                            className="text-danger-400 hover:text-danger-300 text-xs"
                          >
                            移除
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={trick.name}
                            onChange={(e) =>
                              updateTrick(index, 'name', e.target.value)
                            }
                            className="input-field"
                            placeholder="技巧名称 (如: Ollie)"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={trick.attempts}
                            onChange={(e) =>
                              updateTrick(index, 'attempts', e.target.value)
                            }
                            className="input-field"
                            placeholder="尝试次数"
                            min="0"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={trick.successes}
                            onChange={(e) =>
                              updateTrick(index, 'successes', e.target.value)
                            }
                            className="input-field"
                            placeholder="成功次数"
                            min="0"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={trick.falls}
                            onChange={(e) =>
                              updateTrick(index, 'falls', e.target.value)
                            }
                            className="input-field"
                            placeholder="跌落次数"
                            min="0"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={trick.notes}
                        onChange={(e) =>
                          updateTrick(index, 'notes', e.target.value)
                        }
                        className="input-field mt-3 text-sm"
                        placeholder="备注 (可选)"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  {...register('notes')}
                  className="input-field h-24 resize-none"
                  placeholder="记录今天的感受、进步点、需要改进的地方..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary flex-1">
                  保存记录
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
                确定要删除这条滑板训练记录吗？删除后将无法恢复。
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
