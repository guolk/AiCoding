import { useState } from 'react';
import {
  MapPin,
  Plus,
  ChevronRight,
  AlertTriangle,
  Phone,
  Hospital,
  Navigation,
  X,
  Star,
  Edit2,
  Mountain,
  Footprints,
  Waves,
  Trees,
} from 'lucide-react';
import { useSafetyStore } from '@/stores/useSafetyStore';
import { Location } from '@/types';
import { useForm } from 'react-hook-form';

interface LocationFormData {
  name: string;
  type: string;
  address: string;
  safetyRating: number;
  notes: string;
  nearestHospital: string;
  emergencyPhone: string;
  evacuationRoute: string;
}

export default function LocationsPage() {
  const { locations, addLocation, updateLocation } = useSafetyStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LocationFormData>({
    defaultValues: {
      name: '',
      type: 'climbing_gym',
      address: '',
      safetyRating: 4,
      notes: '',
      nearestHospital: '',
      emergencyPhone: '120',
      evacuationRoute: '',
    },
  });

  const openEditForm = (location: Location) => {
    setEditingId(location.id);
    setValue('name', location.name);
    setValue('type', location.type);
    setValue('address', location.address);
    setValue('safetyRating', location.safetyRating);
    setValue('notes', location.notes);
    setValue('nearestHospital', location.emergencyPlan.nearestHospital);
    setValue('emergencyPhone', location.emergencyPlan.emergencyPhone);
    setValue('evacuationRoute', location.emergencyPlan.evacuationRoute);
    setShowForm(true);
  };

  const openAddForm = () => {
    setEditingId(null);
    reset({
      name: '',
      type: 'climbing_gym',
      address: '',
      safetyRating: 4,
      notes: '',
      nearestHospital: '',
      emergencyPhone: '120',
      evacuationRoute: '',
    });
    setShowForm(true);
  };

  const onSubmit = (data: LocationFormData) => {
    const locationData = {
      name: data.name,
      type: data.type as Location['type'],
      address: data.address,
      safetyRating: data.safetyRating,
      riskFactors: [],
      emergencyPlan: {
        nearestHospital: data.nearestHospital,
        emergencyPhone: data.emergencyPhone,
        evacuationRoute: data.evacuationRoute,
      },
      photos: [],
      notes: data.notes,
    };

    if (editingId) {
      updateLocation(editingId, locationData);
    } else {
      addLocation(locationData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const typeLabels: Record<string, string> = {
    climbing_gym: '攀岩馆',
    skate_park: '滑板公园',
    surf_spot: '冲浪点',
    outdoor: '户外场地',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    climbing_gym: <Mountain size={20} />,
    skate_park: <Footprints size={20} />,
    surf_spot: <Waves size={20} />,
    outdoor: <Trees size={20} />,
  };

  const typeColors: Record<string, string> = {
    climbing_gym: 'bg-primary-500/20 text-primary-400',
    skate_park: 'bg-skate-500/20 text-skate-400',
    surf_spot: 'bg-surfing-500/20 text-surfing-400',
    outdoor: 'bg-success-500/20 text-success-400',
  };

  const severityColors: Record<string, string> = {
    low: 'text-success-400 bg-success-500/20',
    medium: 'text-warning-400 bg-warning-500/20',
    high: 'text-danger-400 bg-danger-500/20',
  };

  const severityLabels: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-warning-400 fill-warning-400' : 'text-dark-600'}
          />
        ))}
      </div>
    );
  };

  const avgSafetyRating = locations.length > 0
    ? (locations.reduce((sum, l) => sum + l.safetyRating, 0) / locations.length).toFixed(1)
    : '0';

  const highRiskLocations = locations.filter(
    (l) => l.riskFactors.some((r) => r.severity === 'high')
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-dark-400 text-sm mb-2">
            <span className="text-success-400">风险管理</span>
            <ChevronRight size={14} />
            <span className="text-white">场地评估</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="text-success-500" size={28} />
            训练场地安全评估
          </h1>
          <p className="text-dark-400 mt-1">评估场地风险，制定应急方案</p>
        </div>
        <button
          onClick={openAddForm}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          添加场地
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-success-500/20 rounded-xl flex items-center justify-center">
              <MapPin className="text-success-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{locations.length}</p>
          <p className="text-sm text-dark-400">总场地数</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-warning-500/20 rounded-xl flex items-center justify-center">
              <Star className="text-warning-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{avgSafetyRating}</p>
          <p className="text-sm text-dark-400">平均安全评分</p>
        </div>
        <div className={`card ${highRiskLocations > 0 ? 'border border-danger-500/30' : ''}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-danger-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-danger-400" size={20} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${highRiskLocations > 0 ? 'text-danger-400' : 'text-white'}`}>
            {highRiskLocations}
          </p>
          <p className="text-sm text-dark-400">高风险场地</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Hospital className="text-primary-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {locations.filter((l) => l.emergencyPlan.nearestHospital).length}
          </p>
          <p className="text-sm text-dark-400">已评估应急方案</p>
        </div>
      </div>

      {highRiskLocations > 0 && (
        <div className="card border border-danger-500/30 bg-danger-500/5">
          <h2 className="text-lg font-semibold text-danger-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            高风险场地提醒
          </h2>
          <div className="space-y-3">
            {locations
              .filter((l) => l.riskFactors.some((r) => r.severity === 'high'))
              .map((location) => (
                <div
                  key={location.id}
                  className="bg-dark-700/50 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-dark-700"
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        typeColors[location.type]
                      }`}
                    >
                      {typeIcons[location.type]}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{location.name}</h3>
                      <p className="text-xs text-danger-400">
                        存在高风险因素：
                        {location.riskFactors
                          .filter((r) => r.severity === 'high')
                          .map((r) => r.name)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-dark-500" />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">所有场地</h2>
        {locations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto text-dark-600 mb-4" size={48} />
            <p className="text-dark-400 mb-4">还没有场地记录</p>
            <button onClick={openAddForm} className="btn-primary">
              添加第一个场地
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-dark-700/50 rounded-xl p-5 hover:bg-dark-700 transition-colors cursor-pointer"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        typeColors[location.type]
                      }`}
                    >
                      {typeIcons[location.type]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{location.name}</h3>
                      <span className="text-sm text-dark-400">
                        {typeLabels[location.type]}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(location);
                    }}
                    className="p-2 hover:bg-dark-600 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} className="text-dark-400" />
                  </button>
                </div>

                <p className="text-sm text-dark-400 mb-3 flex items-center gap-1">
                  <MapPin size={14} />
                  {location.address}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-500">安全评分:</span>
                    {renderStars(location.safetyRating)}
                  </div>
                  {location.riskFactors.length > 0 && (
                    <span className={`badge px-2 py-0.5 text-xs ${
                      location.riskFactors.some((r) => r.severity === 'high')
                        ? 'bg-danger-500/20 text-danger-400'
                        : location.riskFactors.some((r) => r.severity === 'medium')
                        ? 'bg-warning-500/20 text-warning-400'
                        : 'bg-success-500/20 text-success-400'
                    }`}>
                      {location.riskFactors.length} 个风险点
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedLocation(null)}
        >
          <div
            className="bg-dark-900 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{selectedLocation.name}</h2>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-dark-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`badge ${typeColors[selectedLocation.type]}`}>
                  {typeLabels[selectedLocation.type]}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-dark-500">安全评分:</span>
                  {renderStars(selectedLocation.safetyRating)}
                </div>
              </div>

              <div className="bg-dark-700/50 rounded-xl p-4">
                <p className="text-xs text-dark-400 mb-1">地址</p>
                <p className="text-white flex items-center gap-2">
                  <MapPin size={14} className="text-dark-400" />
                  {selectedLocation.address}
                </p>
              </div>

              {selectedLocation.riskFactors.length > 0 && (
                <div>
                  <p className="text-sm text-dark-400 mb-2 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    风险因素
                  </p>
                  <div className="space-y-2">
                    {selectedLocation.riskFactors.map((risk, idx) => (
                      <div key={idx} className="bg-dark-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white text-sm">{risk.name}</span>
                          <span className={`badge px-2 py-0.5 text-xs ${severityColors[risk.severity]}`}>
                            {severityLabels[risk.severity]}
                          </span>
                        </div>
                        <p className="text-xs text-dark-400">{risk.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-secondary-500/10 border border-secondary-500/20 rounded-xl p-4">
                <p className="text-sm text-secondary-400 mb-3 flex items-center gap-1">
                  <Navigation size={14} />
                  应急方案
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-dark-400 mb-1 flex items-center gap-1">
                      <Hospital size={12} />
                      最近医院
                    </p>
                    <p className="text-white">
                      {selectedLocation.emergencyPlan.nearestHospital || '未填写'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 mb-1 flex items-center gap-1">
                      <Phone size={12} />
                      紧急电话
                    </p>
                    <p className="text-white font-medium">
                      {selectedLocation.emergencyPlan.emergencyPhone || '未填写'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 mb-1 flex items-center gap-1">
                      <Navigation size={12} />
                      疏散路线
                    </p>
                    <p className="text-white">
                      {selectedLocation.emergencyPlan.evacuationRoute || '未填写'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedLocation.notes && (
                <div className="bg-dark-700/50 rounded-xl p-4">
                  <p className="text-xs text-dark-400 mb-2">备注</p>
                  <p className="text-white">{selectedLocation.notes}</p>
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
                {editingId ? '编辑场地' : '添加场地'}
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
                <label className="label">场地名称</label>
                <input
                  {...register('name', { required: '请输入场地名称' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：岩石先锋攀岩馆"
                />
                {errors.name && (
                  <p className="text-danger-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">场地类型</label>
                  <select {...register('type')} className="input-field">
                    <option value="climbing_gym">攀岩馆</option>
                    <option value="skate_park">滑板公园</option>
                    <option value="surf_spot">冲浪点</option>
                    <option value="outdoor">户外场地</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    安全评分: <span className="text-primary-400">{getValues('safetyRating')}</span>
                  </label>
                  <input
                    {...register('safetyRating', { min: 1, max: 5 })}
                    type="range"
                    min="1"
                    max="5"
                    className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="label">地址</label>
                <input
                  {...register('address', { required: '请输入地址' })}
                  type="text"
                  className="input-field"
                  placeholder="例如：北京市朝阳区体育路88号"
                />
                {errors.address && (
                  <p className="text-danger-400 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="bg-secondary-500/5 border border-secondary-500/20 rounded-xl p-4 space-y-4">
                <p className="text-sm text-secondary-400 font-medium">应急方案</p>

                <div>
                  <label className="label">最近医院</label>
                  <input
                    {...register('nearestHospital')}
                    type="text"
                    className="input-field"
                    placeholder="例如：朝阳医院"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">紧急电话</label>
                    <input
                      {...register('emergencyPhone')}
                      type="text"
                      className="input-field"
                      placeholder="例如：120"
                    />
                  </div>
                  <div>
                    <label className="label">疏散路线</label>
                    <input
                      {...register('evacuationRoute')}
                      type="text"
                      className="input-field"
                      placeholder="例如：主出入口"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">备注</label>
                <textarea
                  {...register('notes')}
                  className="input-field h-20 resize-none"
                  placeholder="记录场地的其他注意事项..."
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
                  {editingId ? '保存修改' : '添加场地'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
