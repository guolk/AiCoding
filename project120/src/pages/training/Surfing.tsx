import { useState } from 'react';
import {
  Waves,
  Plus,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  X,
  Timer,
  Wind,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useTrainingStore } from '@/stores/useTrainingStore';
import { formatDateShort, formatDuration } from '@/utils/dateUtils';
import { SurfingDetails } from '@/types';
import { generateId } from '@/utils/storage';
import { useForm } from 'react-hook-form';

interface SurfFormData {
  date: string;
  location: string;
  duration: number;
  waveHeight: string;
  rideTime: number;
  boardType: string;
  conditions: string;
  maneuvers: string;
  notes: string;
}

export default function SurfingPage() {
  const { records, addRecord, deleteRecord } = useTrainingStore();
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteRecord(id);
    setDeleteConfirm(null);
  };

  const surfRecords = records.filter((r) => r.sportType === 'surfing');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SurfFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      duration: 120,
      waveHeight: '1米',
      rideTime: 5,
      boardType: '7ft Funboard',
      conditions: '',
      maneuvers: '',
      notes: '',
    },
  });

  const onSubmit = (data: SurfFormData) => {
    const details: SurfingDetails = {
      waveHeight: data.waveHeight,
      rideTime: data.rideTime,
      maneuvers: data.maneuvers.split(',').map((m) => m.trim()).filter(Boolean),
      boardType: data.boardType,
      conditions: data.conditions,
    };

    addRecord({
      sportType: 'surfing',
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-primary-400">训练记录</span>
            <ChevronRight size={14} />
            <span className="text-white">冲浪</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Waves className="text-surfing-500" size={28} />
            冲浪训练记录
          </h1>
          <p className="text-dark-400 mt-1">记录每次海浪中的体验</p>
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
            <div className="w-10 h-10 bg-surfing-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-surfing-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{surfRecords.length}</p>
          <p className="text-sm text-dark-400">总冲浪次数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-secondary-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-secondary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatDuration(
              surfRecords.reduce((sum, r) => sum + r.duration, 0)
            )}
          </p>
          <p className="text-sm text-dark-400">总冲浪时长</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Timer className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {surfRecords.length > 0
              ? Math.round(
                  surfRecords.reduce((sum, r) => {
                    const details = r.details as SurfingDetails;
                    return sum + details.rideTime;
                  }, 0) / surfRecords.length
                )
              : 0}
            s
          </p>
          <p className="text-sm text-dark-400">平均骑乘时间</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <Waves className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {surfRecords.length > 0
              ? (() => {
                  const maneuvers = new Set(
                    surfRecords.flatMap((r) => {
                      const details = r.details as SurfingDetails;
                      return details.maneuvers;
                    })
                  );
                  return maneuvers.size;
                })()
              : 0}
          </p>
          <p className="text-sm text-dark-400">已掌握动作</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">训练记录列表</h2>

        {surfRecords.length === 0 ? (
          <div className="text-center py-12">
            <Waves className="mx-auto text-dark-600 mb-4" size={48} />
            <p className="text-dark-400 mb-4">还没有冲浪训练记录</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              记录第一次冲浪
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {surfRecords.map((record) => {
              const details = record.details as SurfingDetails;
              return (
                <div
                  key={record.id}
                  className="bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white text-lg">
                            {record.location}
                          </h3>
                          <span className="badge badge-secondary">
                            {details.waveHeight}
                          </span>
                          <span className="badge badge-success">
                            {details.rideTime}s
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
                          <Calendar size={14} />
                          {formatDateShort(record.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(record.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Waves size={14} />
                          {details.boardType}
                        </span>
                        {details.conditions && (
                          <span className="flex items-center gap-1">
                            <Wind size={14} />
                            {details.conditions}
                          </span>
                        )}
                      </div>
                      {details.maneuvers.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-dark-500 mb-2">完成动作:</p>
                          <div className="flex flex-wrap gap-2">
                            {details.maneuvers.map((maneuver, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-surfing-500/20 text-surfing-400 rounded-lg text-sm"
                              >
                                {maneuver}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {record.notes && (
                        <p className="mt-3 text-sm text-dark-300">{record.notes}</p>
                      )}
                    </div>
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
                <Plus size={20} className="text-surfing-500" />
                添加冲浪训练记录
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
                  <label className="label">冲浪时长 (分钟)</label>
                  <input
                    {...register('duration', {
                      required: '请输入时长',
                      min: 1,
                    })}
                    type="number"
                    className="input-field"
                    placeholder="120"
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
                  placeholder="例如：三亚后海"
                />
                {errors.location && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">浪高</label>
                  <select {...register('waveHeight')} className="input-field">
                    <option value="0.5米以下">0.5米以下</option>
                    <option value="0.5-1米">0.5-1米</option>
                    <option value="1米">1米</option>
                    <option value="1-1.5米">1-1.5米</option>
                    <option value="1.5米">1.5米</option>
                    <option value="1.5-2米">1.5-2米</option>
                    <option value="2米以上">2米以上</option>
                  </select>
                </div>
                <div>
                  <label className="label">平均骑乘时间 (秒)</label>
                  <input
                    {...register('rideTime', { min: 0 })}
                    type="number"
                    className="input-field"
                    placeholder="5"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">浪板类型</label>
                  <select {...register('boardType')} className="input-field">
                    <option value="5ft Shortboard">5ft Shortboard</option>
                    <option value="6ft Shortboard">6ft Shortboard</option>
                    <option value="7ft Funboard">7ft Funboard</option>
                    <option value="8ft Minimal">8ft Minimal</option>
                    <option value="9ft Longboard">9ft Longboard</option>
                    <option value="Softboard">Softboard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">海况</label>
                <input
                  {...register('conditions')}
                  type="text"
                  className="input-field"
                  placeholder="例如：风力中等，浪形不错"
                />
              </div>

              <div>
                <label className="label">完成动作 (逗号分隔)</label>
                <input
                  {...register('maneuvers')}
                  type="text"
                  className="input-field"
                  placeholder="例如：Bottom turn, Cutback, Top turn"
                />
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  {...register('notes')}
                  className="input-field h-24 resize-none"
                  placeholder="记录今天的感受、突破、下次注意事项..."
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
                确定要删除这条冲浪训练记录吗？删除后将无法恢复。
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
