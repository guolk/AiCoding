import { useState } from 'react';
import {
  Plane,
  Plus,
  ChevronRight,
  Mountain,
  Footprints,
  Waves,
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  X,
  Edit2,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CheckCircle,
  Circle,
  AlertTriangle,
} from 'lucide-react';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { Trip, SportType } from '@/types';
import { formatDateShort, daysBetween, getRelativeTime } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';
import { generateId } from '@/utils/storage';

interface TripFormData {
  name: string;
  description: string;
  location: string;
  sportType: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  estimatedCost: string;
  weather: string;
  safetyConsiderations: string;
  packingList: string;
  activityNotes: string;
}

export default function TripsPage() {
  const { trips, addTrip, updateTrip, deleteTrip } = useCommunityStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [filter, setFilter] = useState<
    'all' | 'planned' | 'in-progress' | 'completed' | 'cancelled'
  >('all');

  const filteredTrips =
    filter === 'all'
      ? trips
      : trips.filter((t) => t.status === filter);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TripFormData>({
    defaultValues: {
      name: '',
      description: '',
      location: '',
      sportType: 'climbing',
      category: 'day_trip',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planned',
      estimatedCost: '',
      weather: '',
      safetyConsiderations: '',
      packingList: '',
      activityNotes: '',
    },
  });

  const openEditForm = (trip: Trip) => {
    setEditingId(trip.id);
    setValue('name', trip.name);
    setValue('description', trip.description);
    setValue('location', trip.location);
    setValue('sportType', trip.sportType);
    setValue('category', trip.category);
    setValue('startDate', trip.startDate.split('T')[0]);
    setValue('endDate', trip.endDate.split('T')[0]);
    setValue('status', trip.status);
    setValue('estimatedCost', trip.estimatedCost?.toString() || '');
    setValue('weather', trip.weather || '');
    setValue('safetyConsiderations', trip.safetyConsiderations || '');
    setValue(
      'packingList',
      trip.packingList.map((item) => `${item.item}${item.checked ? ' ✓' : ''}`).join('\n')
    );
    setValue('activityNotes', trip.activityNotes || '');
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      name: '',
      description: '',
      location: '',
      sportType: 'climbing',
      category: 'day_trip',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'planned',
      estimatedCost: '',
      weather: '',
      safetyConsiderations: '',
      packingList: '',
      activityNotes: '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: TripFormData) => {
    const packingList = data.packingList
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => ({
        id: generateId(),
        item: line.replace(' ✓', ''),
        checked: line.includes('✓'),
      }));

    const tripData = {
      name: data.name,
      description: data.description,
      location: data.location,
      sportType: data.sportType as SportType,
      category: data.category as Trip['category'],
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      status: data.status as Trip['status'],
      estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
      weather: data.weather || undefined,
      safetyConsiderations: data.safetyConsiderations || undefined,
      packingList,
      activityNotes: data.activityNotes || undefined,
    };

    if (editingId) {
      updateTrip(editingId, tripData);
    } else {
      addTrip(tripData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此旅行计划吗？')) {
      deleteTrip(id);
    }
  };

  const sportIcons: Record<SportType, React.ReactNode> = {
    climbing: <Mountain size={18} />,
    skateboarding: <Footprints size={18} />,
    surfing: <Waves size={18} />,
  };

  const sportColors: Record<SportType, string> = {
    climbing: 'bg-primary-500/20 text-primary-400',
    skateboarding: 'bg-skate-500/20 text-skate-400',
    surfing: 'bg-surfing-500/20 text-surfing-400',
  };

  const categoryLabels: Record<string, string> = {
    day_trip: '单日游',
    weekend: '周末游',
    vacation: '度假',
    competition: '比赛',
    expedition: '远征',
  };

  const statusLabels: Record<string, string> = {
    planned: '计划中',
    'in-progress': '进行中',
    completed: '已完成',
    cancelled: '已取消',
  };

  const statusColors: Record<string, string> = {
    planned: 'bg-info-500/20 text-info-400',
    'in-progress': 'bg-primary-500/20 text-primary-400',
    completed: 'bg-success-500/20 text-success-400',
    cancelled: 'bg-dark-600 text-dark-400',
  };

  const weatherIcons: Record<string, React.ReactNode> = {
    sunny: <Sun size={18} className="text-warning-400" />,
    cloudy: <Cloud size={18} className="text-dark-400" />,
    rainy: <CloudRain size={18} className="text-info-400" />,
    snowy: <Snowflake size={18} className="text-white" />,
  };

  const TripCard = ({ trip }: { trip: Trip }) => {
    const daysToStart = daysBetween(new Date().toISOString(), trip.startDate);
    const daysToEnd = daysBetween(new Date().toISOString(), trip.endDate);
    const duration = daysBetween(trip.startDate, trip.endDate) + 1;
    const isUpcoming = daysToStart > 0 && trip.status === 'planned';
    const isExpired = daysToEnd < 0 && trip.status !== 'completed' && trip.status !== 'cancelled';

    return (
      <div
        className={`card hover:border-primary-500/30 transition-colors cursor-pointer ${
          trip.status === 'completed' ? 'border border-success-500/30' : ''
        } ${isExpired ? 'border border-danger-500/30' : ''}`}
        onClick={() => setSelectedTrip(trip)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sportColors[trip.sportType]}`}>
              {sportIcons[trip.sportType]}
            </div>
            <div>
              <h3 className="font-semibold text-white">{trip.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${statusColors[trip.status]}`}>
                  {statusLabels[trip.status]}
                </span>
                <span className="badge bg-dark-600 text-dark-300 text-xs">
                  {categoryLabels[trip.category]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(trip);
              }}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Edit2 size={14} className="text-dark-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(trip.id);
              }}
              className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
            >
              <Trash2 size={14} className="text-danger-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-dark-400 mb-2">
          <MapPin size={14} className="text-danger-400 shrink-0" />
          <span className="truncate">{trip.location}</span>
        </div>

        <p className="text-sm text-dark-400 line-clamp-2 mb-4">{trip.description}</p>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <Calendar size={14} className="mx-auto text-primary-400 mb-1" />
            <p className="text-dark-400">时长</p>
            <p className="text-white font-medium">{duration}天</p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <Clock size={14} className="mx-auto text-success-400 mb-1" />
            <p className="text-dark-400">开始</p>
            <p className="text-white font-medium">
              {trip.status === 'in-progress'
                ? '进行中'
                : trip.status === 'completed'
                ? '已结束'
                : isUpcoming
                ? `${daysToStart}天后`
                : `${Math.abs(daysToStart)}天前`}
            </p>
          </div>
          <div className="bg-dark-700/50 rounded-lg p-2 text-center">
            <Star size={14} className="mx-auto text-warning-400 mb-1" />
            <p className="text-dark-400">装备</p>
            <p className="text-white font-medium">
              {trip.packingList.filter((p) => p.checked).length}/
              {trip.packingList.length}
            </p>
          </div>
        </div>

        {trip.estimatedCost && (
          <div className="mt-3 pt-3 border-t border-dark-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">预算</span>
              <span className="text-warning-400 font-medium">
                ¥{trip.estimatedCost.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const stats = {
    total: trips.length,
    planned: trips.filter((t) => t.status === 'planned').length,
    inProgress: trips.filter((t) => t.status === 'in-progress').length,
    completed: trips.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-skate-400">社群挑战</span>
            <ChevronRight size={14} />
            <span className="text-white">运动旅行</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plane className="text-skate-500" size={28} />
            运动旅行计划
          </h1>
          <p className="text-dark-400 mt-1">规划你的极限运动之旅</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          新建计划
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { type: 'all' as const, label: '全部', icon: <Plane size={16} /> },
          { type: 'planned' as const, label: '计划中', icon: <Calendar size={16} /> },
          { type: 'in-progress' as const, label: '进行中', icon: <Clock size={16} /> },
          { type: 'completed' as const, label: '已完成', icon: <CheckCircle size={16} /> },
        ].map((tab) => (
          <button
            key={tab.type}
            onClick={() => setFilter(tab.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              filter === tab.type
                ? 'bg-skate-500/20 text-skate-400 border border-skate-500/30'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-skate-500/20 rounded-xl flex items-center justify-center">
              <Plane className="text-skate-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-dark-400">总计划</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-info-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-info-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.planned}</p>
          <p className="text-sm text-dark-400">计划中</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
          <p className="text-sm text-dark-400">进行中</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.completed}</p>
          <p className="text-sm text-dark-400">已完成</p>
        </div>
      </div>

      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Plane className="mx-auto text-dark-600 mb-4" size={48} />
          <p className="text-dark-400 mb-2">还没有旅行计划</p>
          <p className="text-dark-500 text-sm mb-4">
            规划你的下一次极限运动之旅吧！
          </p>
          <button onClick={openAddForm} className="btn-primary">
            新建第一个计划
          </button>
        </div>
      )}

      {selectedTrip && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {selectedTrip.name}
              </h2>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sportColors[selectedTrip.sportType]}`}>
                    {sportIcons[selectedTrip.sportType]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${statusColors[selectedTrip.status]}`}>
                        {statusLabels[selectedTrip.status]}
                      </span>
                      <span className="badge bg-dark-600 text-dark-300">
                        {categoryLabels[selectedTrip.category]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-dark-300">
                <MapPin size={18} className="text-danger-400 shrink-0" />
                <span>{selectedTrip.location}</span>
              </div>

              <p className="text-dark-300">{selectedTrip.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">开始日期</p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedTrip.startDate)}
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">结束日期</p>
                  <p className="text-white font-medium">
                    {formatDateShort(selectedTrip.endDate)}
                  </p>
                </div>
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-1">行程天数</p>
                  <p className="text-white font-medium">
                    {daysBetween(selectedTrip.startDate, selectedTrip.endDate) + 1} 天
                  </p>
                </div>
                {selectedTrip.estimatedCost && (
                  <div className="bg-dark-700/50 rounded-xl p-4">
                    <p className="text-xs text-dark-400 mb-1">预算</p>
                    <p className="text-warning-400 font-medium">
                      ¥{selectedTrip.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedTrip.weather && (
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-sm text-dark-400 mb-3">天气情况</p>
                  <div className="flex items-center gap-3">
                    {weatherIcons[selectedTrip.weather]}
                    <span className="text-white">
                      {selectedTrip.weather === 'sunny'
                        ? '晴朗'
                        : selectedTrip.weather === 'cloudy'
                        ? '多云'
                        : selectedTrip.weather === 'rainy'
                        ? '降雨'
                        : '降雪'}
                    </span>
                  </div>
                </div>
              )}

              {selectedTrip.safetyConsiderations && (
                <div className="bg-danger-500/10 rounded-xl p-4 border border-danger-500/20">
                  <p className="text-sm text-danger-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    安全注意事项
                  </p>
                  <p className="text-dark-300 text-sm">
                    {selectedTrip.safetyConsiderations}
                  </p>
                </div>
              )}

              {selectedTrip.packingList.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-3 flex items-center gap-2">
                    <Users size={16} />
                    装备清单 ({selectedTrip.packingList.filter((p) => p.checked).length}/
                    {selectedTrip.packingList.length})
                  </p>
                  <div className="space-y-2">
                    {selectedTrip.packingList.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          item.checked
                            ? 'bg-success-500/10'
                            : 'bg-dark-700/50'
                        }`}
                      >
                        {item.checked ? (
                          <CheckCircle size={16} className="text-success-400 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-dark-500 shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            item.checked ? 'text-dark-400 line-through' : 'text-white'
                          }`}
                        >
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTrip.activityNotes && (
                <div>
                  <p className="text-sm text-dark-400 mb-2">活动记录</p>
                  <p className="text-dark-300 text-sm bg-dark-700/50 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedTrip.activityNotes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedTrip(null);
                    openEditForm(selectedTrip);
                  }}
                  className="btn-primary flex-1"
                >
                  编辑计划
                </button>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="btn-outline flex-1"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingId ? '编辑计划' : '新建旅行计划'}
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
                <label className="label">计划名称</label>
                <input
                  {...register('name', { required: '请输入计划名称' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：阳朔攀岩之旅"
                />
                {errors.name && (
                  <p className="text-danger-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">描述</label>
                <textarea
                  {...register('description', { required: '请输入描述' })}
                  className="input-field h-20 resize-none"
                  placeholder="描述这次旅行的计划..."
                />
                {errors.description && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">运动类型</label>
                  <select {...register('sportType')} className="input-field">
                    <option value="climbing">攀岩</option>
                    <option value="skateboarding">滑板</option>
                    <option value="surfing">冲浪</option>
                  </select>
                </div>
                <div>
                  <label className="label">计划类型</label>
                  <select {...register('category')} className="input-field">
                    <option value="day_trip">单日游</option>
                    <option value="weekend">周末游</option>
                    <option value="vacation">度假</option>
                    <option value="competition">比赛</option>
                    <option value="expedition">远征</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">地点</label>
                <input
                  {...register('location', { required: '请输入地点' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：广西阳朔"
                />
                {errors.location && (
                  <p className="text-danger-400 text-sm mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">开始日期</label>
                  <input
                    {...register('startDate', { required: '请选择开始日期' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.startDate && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">结束日期</label>
                  <input
                    {...register('endDate', { required: '请选择结束日期' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.endDate && (
                    <p className="text-danger-400 text-sm mt-1">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">状态</label>
                  <select {...register('status')} className="input-field">
                    <option value="planned">计划中</option>
                    <option value="in-progress">进行中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                </div>
                <div>
                  <label className="label">预算 (元)</label>
                  <input
                    {...register('estimatedCost')}
                    type="number"
                    className="input-field"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div>
                <label className="label">天气预测</label>
                <select {...register('weather')} className="input-field">
                  <option value="">未知</option>
                  <option value="sunny">晴朗</option>
                  <option value="cloudy">多云</option>
                  <option value="rainy">降雨</option>
                  <option value="snowy">降雪</option>
                </select>
              </div>

              <div>
                <label className="label">装备清单 (每行一个，末尾加 ✓ 表示已准备好)</label>
                <textarea
                  {...register('packingList')}
                  className="input-field h-24 resize-none"
                  placeholder="登山鞋 ✓\n头盔\n安全带 ✓\n快挂组"
                />
                <p className="text-xs text-dark-500 mt-1">
                  在物品末尾加 ✓ 表示已准备好
                </p>
              </div>

              <div>
                <label className="label">安全注意事项</label>
                <textarea
                  {...register('safetyConsiderations')}
                  className="input-field h-20 resize-none"
                  placeholder="检查装备状态，注意天气变化，告知家人行程..."
                />
              </div>

              <div>
                <label className="label">活动记录/备注</label>
                <textarea
                  {...register('activityNotes')}
                  className="input-field h-24 resize-none"
                  placeholder="记录这次旅行的详细活动..."
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
                  {editingId ? '保存修改' : '创建计划'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
