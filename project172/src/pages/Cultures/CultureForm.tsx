import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FlaskConical,
  Thermometer,
  Clock,
  Wind,
  Beaker,
  Star,
  AlertCircle,
} from 'lucide-react';
import { useLabStore } from '@/store/useLabStore';
import AppLayout from '@/components/Layout/AppLayout';
import { Button, Badge } from '@/components/Common';
import { cn } from '@/lib/utils';

const INOCULATION_METHODS = [
  { value: '涂布', label: '涂布', desc: '适用于分离纯化和计数' },
  { value: '划线', label: '划线', desc: '平板划线分离单菌落' },
  { value: '液体接种', label: '液体接种', desc: '种子液转接到液体培养基' },
];

const AERATION_OPTIONS = [
  { value: '静止', label: '静止培养', desc: '静置，无需振荡' },
  { value: '摇床200rpm', label: '摇床 200rpm', desc: '振荡培养，好氧条件' },
  { value: '厌氧罐', label: '厌氧罐', desc: '厌氧或微需氧培养' },
];

const GROWTH_RATE_OPTIONS = [
  { value: '快', label: '快', color: '#00B42A' },
  { value: '中', label: '中', color: '#FF7D00' },
  { value: '慢', label: '慢', color: '#86909C' },
];

interface FormData {
  strainId: string;
  mediumId: string;
  inoculumVolume: string;
  inoculationMethod: string;
  temperature: string;
  durationHours: string;
  aeration: string;
  growthRate: string;
  morphologyObservation: string;
  densityOd600: string;
  abnormalRecords: string;
  operator: string;
}

const initialFormData: FormData = {
  strainId: '',
  mediumId: '',
  inoculumVolume: '',
  inoculationMethod: '',
  temperature: '37',
  durationHours: '24',
  aeration: '',
  growthRate: '',
  morphologyObservation: '',
  densityOd600: '',
  abnormalRecords: '',
  operator: '当前用户',
};

export default function CultureForm() {
  const navigate = useNavigate();
  const { strains, media, addCulture } = useLabStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.strainId) {
      newErrors.strainId = '请选择菌株';
    }
    if (!formData.mediumId) {
      newErrors.mediumId = '请选择培养基';
    }
    if (!formData.inoculumVolume || Number(formData.inoculumVolume) <= 0) {
      newErrors.inoculumVolume = '请输入有效的接种量';
    }
    if (!formData.inoculationMethod) {
      newErrors.inoculationMethod = '请选择接种方式';
    }
    if (!formData.temperature) {
      newErrors.temperature = '请输入培养温度';
    }
    if (!formData.durationHours || Number(formData.durationHours) <= 0) {
      newErrors.durationHours = '请输入有效的培养时长';
    }
    if (!formData.aeration) {
      newErrors.aeration = '请选择通气条件';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const cultureData = {
      strainId: formData.strainId,
      mediumId: formData.mediumId,
      inoculumVolume: Number(formData.inoculumVolume),
      temperature: Number(formData.temperature),
      durationHours: Number(formData.durationHours),
      aeration: formData.aeration,
      growthRate: formData.growthRate || '未评估',
      morphologyObservation: formData.morphologyObservation,
      densityOd600: Number(formData.densityOd600) || 0,
      notes: `接种方式：${formData.inoculationMethod}${formData.abnormalRecords ? `；异常：${formData.abnormalRecords}` : ''}${formData.operator ? `；操作人：${formData.operator}` : ''}`,
    };

    addCulture(cultureData);
    navigate('/cultures');
  };

  const selectedStrain = strains.find((s) => s.id === formData.strainId);
  const selectedMedium = media.find((m) => m.id === formData.mediumId);

  return (
    <AppLayout
      breadcrumbItems={[
        { label: '培养记录', path: '/cultures' },
        { label: '新增培养记录' },
      ]}
    >
      <div className="min-h-full bg-[#F2F3F5] -m-6 p-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/cultures')}
                className="flex items-center justify-center h-10 w-10 rounded-lg bg-white border border-gray-200 text-gray-500 hover:border-[#165DFF] hover:text-[#165DFF] transition-colors shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-[22px] font-bold text-gray-900">新增培养记录</h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  填写微生物培养操作信息，记录培养过程和结果
                </p>
              </div>
            </div>
          </div>

          {(selectedStrain || selectedMedium) && (
            <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-white border border-blue-100">
              <div className="flex items-center gap-4 flex-wrap">
                {selectedStrain && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-500">已选菌株：</span>
                    <Badge type="info">{selectedStrain.name}</Badge>
                    <span className="text-[12px] text-gray-400">({selectedStrain.code})</span>
                  </div>
                )}
                {selectedMedium && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-500">已选培养基：</span>
                    <Badge type="success">{selectedMedium.name}</Badge>
                    <span className="text-[12px] text-gray-400">(pH {selectedMedium.phValue})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#165DFF]/10">
                    <FlaskConical className="h-4 w-4 text-[#165DFF]" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">菌株与培养基</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      选择菌株 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <select
                      value={formData.strainId}
                      onChange={(e) => updateField('strainId', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.strainId
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white',
                      )}
                    >
                      <option value="">请选择菌株</option>
                      {strains.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                    {errors.strainId && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.strainId}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      选择培养基 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <select
                      value={formData.mediumId}
                      onChange={(e) => updateField('mediumId', e.target.value)}
                      className={cn(
                        'w-full h-10 px-3.5 rounded-lg border transition-all',
                        'focus:outline-none focus:ring-2',
                        errors.mediumId
                          ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                          : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 bg-white',
                      )}
                    >
                      <option value="">请选择培养基</option>
                      {media.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (pH {m.phValue})
                        </option>
                      ))}
                    </select>
                    {errors.mediumId && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.mediumId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-cyan-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                    <Beaker className="h-4 w-4 text-cyan-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">接种参数</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      接种量（μL） <span className="text-[#F53F3F]">*</span>
                    </label>
                    <div className="relative">
                      <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="500"
                        value={formData.inoculumVolume}
                        onChange={(e) => updateField('inoculumVolume', e.target.value)}
                        className={cn(
                          'w-full h-10 pl-10 pr-12 rounded-lg border transition-all',
                          'focus:outline-none focus:ring-2',
                          errors.inoculumVolume
                            ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                            : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 placeholder-gray-400',
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                        μL
                      </span>
                    </div>
                    {errors.inoculumVolume && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.inoculumVolume}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      接种方式 <span className="text-[#F53F3F]">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INOCULATION_METHODS.map((opt) => {
                        const isSelected = formData.inoculationMethod === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateField('inoculationMethod', opt.value)}
                            title={opt.desc}
                            className={cn(
                              'px-4 py-2 rounded-lg text-[13px] font-medium transition-all border',
                              isSelected
                                ? 'bg-[#165DFF] text-white border-[#165DFF] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-[#165DFF] hover:text-[#165DFF]',
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {errors.inoculationMethod && (
                      <p className="mt-1.5 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.inoculationMethod}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Thermometer className="h-4 w-4 text-orange-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">培养条件</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-2">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      培养温度（℃） <span className="text-[#F53F3F]">*</span>
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min={0}
                        max={80}
                        step="0.5"
                        placeholder="37"
                        value={formData.temperature}
                        onChange={(e) => updateField('temperature', e.target.value)}
                        className={cn(
                          'w-full h-10 pl-10 pr-12 rounded-lg border transition-all',
                          'focus:outline-none focus:ring-2',
                          errors.temperature
                            ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                            : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 placeholder-gray-400',
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                        ℃
                      </span>
                    </div>
                    {errors.temperature && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.temperature}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      培养时间（h） <span className="text-[#F53F3F]">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="24"
                        value={formData.durationHours}
                        onChange={(e) => updateField('durationHours', e.target.value)}
                        className={cn(
                          'w-full h-10 pl-10 pr-12 rounded-lg border transition-all',
                          'focus:outline-none focus:ring-2',
                          errors.durationHours
                            ? 'border-[#F53F3F] focus:border-[#F53F3F] focus:ring-[#F53F3F]/20'
                            : 'border-gray-200 focus:border-[#165DFF] focus:ring-[#165DFF]/20',
                          'text-[14px] text-gray-700 placeholder-gray-400',
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">
                        小时
                      </span>
                    </div>
                    {errors.durationHours && (
                      <p className="mt-1 text-[12px] text-[#F53F3F] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.durationHours}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-[13px] font-medium text-gray-700 mb-2">
                    通气条件 <span className="text-[#F53F3F]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AERATION_OPTIONS.map((opt) => {
                      const isSelected = formData.aeration === opt.value;
                      const IconComp = opt.value === '静止' ? Clock : opt.value === '摇床200rpm' ? Wind : FlaskConical;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField('aeration', opt.value)}
                          className={cn(
                            'relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-sm',
                            isSelected
                              ? 'border-[#165DFF] bg-gradient-to-br from-[#165DFF]/5 to-white shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300',
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                isSelected ? 'bg-[#165DFF]/10' : 'bg-gray-100',
                              )}
                            >
                              <IconComp
                                className={cn(
                                  'h-5 w-5',
                                  isSelected ? 'text-[#165DFF]' : 'text-gray-500',
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <div
                                className={cn(
                                  'text-[14px] font-semibold mb-0.5',
                                  isSelected ? 'text-[#165DFF]' : 'text-gray-800',
                                )}
                              >
                                {opt.label}
                              </div>
                              <div className="text-[12px] text-gray-500 leading-relaxed">
                                {opt.desc}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#165DFF]">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.aeration && (
                    <p className="mt-2 text-[12px] text-[#F53F3F] flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.aeration}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              style={{ borderRadius: '8px' }}
            >
              <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-gray-800">结果评估</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-[13px] font-medium text-gray-700 mb-3">
                    生长速度评级（StarRating）
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {GROWTH_RATE_OPTIONS.map((opt) => {
                      const isSelected = formData.growthRate === opt.value;
                      const starIndex = GROWTH_RATE_OPTIONS.findIndex((o) => o.value === opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            updateField(
                              'growthRate',
                              formData.growthRate === opt.value ? '' : opt.value,
                            )
                          }
                          className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all',
                            isSelected
                              ? 'border-[var(--active-color)] bg-[var(--active-color)]/5 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300',
                          )}
                          style={{ ['--active-color' as string]: opt.color }}
                        >
                          <div className="flex items-center gap-0.5">
                            {GROWTH_RATE_OPTIONS.map((_, idx) => (
                              <Star
                                key={idx}
                                className={cn(
                                  'h-4 w-4 transition-colors',
                                  idx <= starIndex && isSelected
                                    ? 'fill-current'
                                    : 'fill-none',
                                )}
                                style={{
                                  color:
                                    idx <= starIndex && isSelected
                                      ? opt.color
                                      : '#D1D5DB',
                                }}
                              />
                            ))}
                          </div>
                          <span
                            className={cn(
                              'text-[14px] font-semibold',
                              isSelected ? 'text-[var(--active-color)]' : 'text-gray-600',
                            )}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-6">
                  <div className="md:col-span-1">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      形态观察记录
                    </label>
                    <textarea
                      rows={4}
                      placeholder="记录菌落形态、培养液状态、菌体特征等观察结果..."
                      value={formData.morphologyObservation}
                      onChange={(e) => updateField('morphologyObservation', e.target.value)}
                      className={cn(
                        'w-full px-3.5 py-2.5 rounded-lg border transition-all resize-none',
                        'border-gray-200 focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                        'text-[14px] text-gray-700 placeholder-gray-400',
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      OD600 光密度值
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="1.85"
                        value={formData.densityOd600}
                        onChange={(e) => updateField('densityOd600', e.target.value)}
                        className={cn(
                          'w-full h-14 px-5 pr-20 rounded-lg border-2 transition-all text-center',
                          'border-[#165DFF]/20 bg-gradient-to-br from-blue-50/30 to-white focus:outline-none focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20',
                          'text-[28px] font-bold text-[#165DFF] placeholder-gray-300',
                        )}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-medium">
                        OD600
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] text-gray-400 text-center">
                      平板培养可留空或填0
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    异常记录
                  </label>
                  <textarea
                    rows={2}
                    placeholder="记录培养过程中的异常情况，如污染、生长异常等..."
                    value={formData.abnormalRecords}
                    onChange={(e) => updateField('abnormalRecords', e.target.value)}
                    className={cn(
                      'w-full px-3.5 py-2.5 rounded-lg border transition-all resize-none',
                      'border-gray-200 focus:outline-none focus:border-[#F53F3F] focus:ring-2 focus:ring-[#F53F3F]/20',
                      'text-[14px] text-gray-700 placeholder-gray-400',
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm border-t border-gray-100 z-20">
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/cultures')}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  取消
                </Button>
                <Button
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSubmit}
                >
                  保存培养记录
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
