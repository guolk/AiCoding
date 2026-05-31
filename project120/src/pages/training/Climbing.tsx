import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mountain,
  Plus,
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  TrendingUp,
  Video,
  X,
  Target,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { formatDateShort, formatDuration, formatTimestamp } from '@/utils/dateUtils';
import { ClimbingDetails, VideoAnnotation } from '@/types';
import { generateId } from '@/utils/storage';
import { useForm } from 'react-hook-form';

interface ClimbingFormData {
  date: string;
  location: string;
  duration: number;
  routeName: string;
  grade: string;
  wallType: string;
  completionType: string;
  attempts: number;
  keyMoves: string;
  notes: string;
}

export default function ClimbingPage() {
  const navigate = useNavigate();
  const { records, addRecord, deleteRecord } = useTrainingStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteRecord(id);
    setDeleteConfirm(null);
  };

  const climbingRecords = records.filter((r) => r.sportType === 'climbing');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClimbingFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      duration: 90,
      routeName: '',
      grade: '5.10a',
      wallType: 'bouldering',
      completionType: 'attempt',
      attempts: 1,
      keyMoves: '',
      notes: '',
    },
  });

  const onSubmit = (data: ClimbingFormData) => {
    const details: ClimbingDetails = {
      routeName: data.routeName,
      grade: data.grade,
      completionType: data.completionType as ClimbingDetails['completionType'],
      attempts: data.attempts,
      keyMoves: data.keyMoves.split(',').map((m) => m.trim()).filter(Boolean),
      wallType: data.wallType as ClimbingDetails['wallType'],
    };

    addRecord({
      sportType: 'climbing',
      date: new Date(data.date).toISOString(),
      location: data.location,
      duration: data.duration,
      details,
      videoAnnotations: [],
      notes: data.notes,
    });

    setShowForm(false);
    reset();
  };

  const completionLabels: Record<string, string> = {
    onsight: 'Onsight',
    flash: 'Flash',
    redpoint: '红点',
    attempt: '尝试',
  };

  const completionColors: Record<string, string> = {
    onsight: 'bg-success-500/20 text-success-400',
    flash: 'bg-secondary-500/20 text-secondary-400',
    redpoint: 'bg-primary-500/20 text-primary-400',
    attempt: 'bg-dark-600 text-dark-300',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-primary-400">训练记录</span>
            <ChevronRight size={14} />
            <span className="text-white">攀岩</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mountain className="text-primary-500" size={28} />
            攀岩训练记录
          </h1>
          <p className="text-dark-400 mt-1">记录你的每次攀登突破</p>
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
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{climbingRecords.length}</p>
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
              climbingRecords.reduce((sum, r) => sum + r.duration, 0)
            )}
          </p>
          <p className="text-sm text-dark-400">总训练时长</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {climbingRecords.filter(
              (r) => (r.details as ClimbingDetails).completionType !== 'attempt'
            ).length}
          </p>
          <p className="text-sm text-dark-400">成功完成</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Star className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-primary-400">
            {climbingRecords.length > 0
              ? (() => {
                  const details = climbingRecords.map(
                    (r) => r.details as ClimbingDetails
                  );
                  const redpointed = details.filter(
                    (d) => d.completionType === 'redpoint'
                  );
                  if (redpointed.length === 0) return '-';
                  return redpointed.sort((a, b) => b.grade.localeCompare(a.grade))[0]
                    .grade;
                })()
              : '-'}
          </p>
          <p className="text-sm text-dark-400">最高红点等级</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">训练记录列表</h2>

        {climbingRecords.length === 0 ? (
          <div className="text-center py-12">
            <Mountain className="mx-auto text-dark-600 mb-4" size={48} />
            <p className="text-dark-400 mb-4">还没有攀岩训练记录</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              记录第一次训练
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {climbingRecords.map((record) => {
              const details = record.details as ClimbingDetails;
              return (
                <div
                  key={record.id}
                  className="bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white text-lg">
                            {details.routeName || '未命名路线'}
                          </h3>
                          <span className="badge badge-primary text-sm">
                            {details.grade}
                          </span>
                          <span
                            className={`badge ${
                              completionColors[details.completionType]
                            }`}
                          >
                            {completionLabels[details.completionType]}
                          </span>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm(record.id)}
                          className="p-2 text-dark-500 hover:text-danger-400 hover:bg-dark-600 rounded-lg transition-all"
                          title="删除记录"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {record.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDateShort(record.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(record.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target size={14} />
                          {details.attempts} 次尝试
                        </span>
                      </div>
                      {details.keyMoves.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-dark-500 mb-2">动作要点:</p>
                          <div className="flex flex-wrap gap-2">
                            {details.keyMoves.map((move, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-dark-600 rounded-lg text-sm text-dark-200"
                              >
                                {move}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {record.notes && (
                        <p className="mt-3 text-sm text-dark-300">{record.notes}</p>
                      )}
                    </div>

                    {record.videoAnnotations.length > 0 && (
                      <div className="md:w-48">
                        <div className="flex items-center gap-2 text-sm text-secondary-400 mb-2">
                          <Video size={16} />
                          视频标注 ({record.videoAnnotations.length})
                        </div>
                        <div className="space-y-1">
                          {record.videoAnnotations.map((ann) => (
                            <div
                              key={ann.id}
                              className="text-xs bg-dark-600 rounded-lg px-3 py-2"
                            >
                              <span className="text-primary-400">
                                [{formatTimestamp(ann.timestamp)}]
                              </span>{' '}
                              <span className="text-dark-300">{ann.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                <Plus size={20} className="text-primary-500" />
                添加攀岩训练记录
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="label">训练时长 (分钟)</label>
                  <input
                    {...register('duration', { required: '请输入时长', min: 1 })}
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
              </div>

              <div>
                <label className="label">地点</label>
                <input
                  {...register('location', { required: '请输入地点' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：岩石先锋攀岩馆"
                />
                {errors.location && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">路线名称</label>
                  <input
                    {...register('routeName', { required: '请输入路线名称' })}
                    type="text"
                    className="input-field"
                    placeholder="例如：火焰之路"
                  />
                  {errors.routeName && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.routeName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">难度等级</label>
                  <select {...register('grade')} className="input-field">
                    <option value="V0">V0 (抱石)</option>
                    <option value="V1">V1 (抱石)</option>
                    <option value="V2">V2 (抱石)</option>
                    <option value="V3">V3 (抱石)</option>
                    <option value="V4">V4 (抱石)</option>
                    <option value="V5">V5 (抱石)</option>
                    <option value="5.9">5.9</option>
                    <option value="5.10a">5.10a</option>
                    <option value="5.10b">5.10b</option>
                    <option value="5.10c">5.10c</option>
                    <option value="5.10d">5.10d</option>
                    <option value="5.11a">5.11a</option>
                    <option value="5.11b">5.11b</option>
                    <option value="5.11c">5.11c</option>
                    <option value="5.11d">5.11d</option>
                    <option value="5.12a">5.12a</option>
                    <option value="5.12b">5.12b</option>
                    <option value="5.12c">5.12c</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">岩壁类型</label>
                  <select {...register('wallType')} className="input-field">
                    <option value="bouldering">抱石</option>
                    <option value="sport">运动攀</option>
                    <option value="trad">传统攀</option>
                  </select>
                </div>
                <div>
                  <label className="label">完成方式</label>
                  <select {...register('completionType')} className="input-field">
                    <option value="attempt">尝试</option>
                    <option value="redpoint">红点</option>
                    <option value="flash">闪攀</option>
                    <option value="onsight">Onsight</option>
                  </select>
                </div>
                <div>
                  <label className="label">尝试次数</label>
                  <input
                    {...register('attempts', { min: 1 })}
                    type="number"
                    className="input-field"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="label">动作要点 (逗号分隔)</label>
                <input
                  {...register('keyMoves')}
                  type="text"
                  className="input-field"
                  placeholder="例如：动态移动, 脚点精准, 核心收紧"
                />
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  {...register('notes')}
                  className="input-field h-24 resize-none"
                  placeholder="记录今天的感受、困难点、下次注意事项..."
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
                确定要删除这条攀岩训练记录吗？删除后将无法恢复。
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
