import { useState } from 'react';
import { useWeatherStore } from '@/store';
import { validateObservation, getQualityFlagColor, getQualityFlagLabel, DEFAULT_QUALITY_RANGES } from '@/utils/quality';
import { Thermometer, Droplets, Gauge, Wind, CloudRain, Eye, Clock, Plus, AlertCircle } from 'lucide-react';

export default function DataEntry() {
  const addObservation = useWeatherStore((state) => state.addObservation);
  const instruments = useWeatherStore((state) => state.instruments).filter((i) => i.isActive);

  const [formData, setFormData] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    temperature: '',
    humidity: '',
    pressure: '',
    windSpeed: '',
    windDirection: '',
    precipitation: '',
    visibility: '',
    instrumentId: instruments[0]?.id || '',
    remark: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewObs, setPreviewObs] = useState<any>(null);
  const [validation, setValidation] = useState<{ issues: string[]; flaggedFields: string[] }>({ issues: [], flaggedFields: [] });

  const parseNum = (val: string): number | null => {
    if (val === '' || val === null) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  };

  const handlePreview = () => {
    const obs = {
      datetime: new Date(formData.datetime).toISOString(),
      temperature: parseNum(formData.temperature),
      humidity: parseNum(formData.humidity),
      pressure: parseNum(formData.pressure),
      windSpeed: parseNum(formData.windSpeed),
      windDirection: parseNum(formData.windDirection),
      precipitation: parseNum(formData.precipitation),
      visibility: parseNum(formData.visibility),
      instrumentId: formData.instrumentId,
      remark: formData.remark,
    };

    const valid = validateObservation(obs);
    setValidation({ issues: valid.issues, flaggedFields: valid.flaggedFields });

    const preview = { ...obs, qualityFlag: 'normal', reviewStatus: 'pending' } as any;
    const { checkQualityFlag } = require('@/utils/quality');
    preview.qualityFlag = checkQualityFlag(preview);

    setPreviewObs(preview);
    setShowPreview(true);
  };

  const handleSubmit = () => {
    if (!formData.datetime || !formData.instrumentId) {
      setValidation({ issues: ['请填写观测时间和选择仪器'], flaggedFields: ['datetime', 'instrumentId'] });
      return;
    }

    addObservation({
      datetime: new Date(formData.datetime).toISOString(),
      temperature: parseNum(formData.temperature),
      humidity: parseNum(formData.humidity),
      pressure: parseNum(formData.pressure),
      windSpeed: parseNum(formData.windSpeed),
      windDirection: parseNum(formData.windDirection),
      precipitation: parseNum(formData.precipitation),
      visibility: parseNum(formData.visibility),
      instrumentId: formData.instrumentId,
      remark: formData.remark,
    });

    setFormData({
      datetime: new Date().toISOString().slice(0, 16),
      temperature: '',
      humidity: '',
      pressure: '',
      windSpeed: '',
      windDirection: '',
      precipitation: '',
      visibility: '',
      instrumentId: instruments[0]?.id || '',
      remark: '',
    });
    setShowPreview(false);
    setValidation({ issues: [], flaggedFields: [] });
  };

  const fields = [
    { key: 'temperature', label: '气温', icon: Thermometer, unit: '°C', min: DEFAULT_QUALITY_RANGES.temperature.min, max: DEFAULT_QUALITY_RANGES.temperature.max },
    { key: 'humidity', label: '相对湿度', icon: Droplets, unit: '%', min: DEFAULT_QUALITY_RANGES.humidity.min, max: DEFAULT_QUALITY_RANGES.humidity.max },
    { key: 'pressure', label: '气压', icon: Gauge, unit: 'hPa', min: DEFAULT_QUALITY_RANGES.pressure.min, max: DEFAULT_QUALITY_RANGES.pressure.max },
    { key: 'windSpeed', label: '风速', icon: Wind, unit: 'm/s', min: DEFAULT_QUALITY_RANGES.windSpeed.min, max: DEFAULT_QUALITY_RANGES.windSpeed.max },
    { key: 'windDirection', label: '风向', icon: Wind, unit: '°', min: 0, max: 360 },
    { key: 'precipitation', label: '降水量', icon: CloudRain, unit: 'mm', min: DEFAULT_QUALITY_RANGES.precipitation.min, max: DEFAULT_QUALITY_RANGES.precipitation.max },
    { key: 'visibility', label: '能见度', icon: Eye, unit: 'km', min: DEFAULT_QUALITY_RANGES.visibility.min, max: DEFAULT_QUALITY_RANGES.visibility.max },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">手动录入</h1>
        <p className="text-slate-500 mt-1">录入气象要素定时观测记录</p>
      </div>

      {validation.issues.length > 0 && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-danger-500 mt-0.5" />
            <div>
              <p className="font-medium text-danger-800">存在以下问题：</p>
              <ul className="mt-2 text-sm text-danger-700 space-y-1">
                {validation.issues.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">基本信息</h2>

          <div>
            <label className="input-label">
              <Clock className="w-4 h-4 inline mr-1" />
              观测时间
            </label>
            <input
              type="datetime-local"
              value={formData.datetime}
              onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
              className={`input ${validation.flaggedFields.includes('datetime') ? 'border-danger-400' : ''}`}
            />
          </div>

          <div>
            <label className="input-label">观测仪器</label>
            <select
              value={formData.instrumentId}
              onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
              className={`input ${validation.flaggedFields.includes('instrumentId') ? 'border-danger-400' : ''}`}
            >
              {instruments.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.model})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">备注</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="input"
              rows={3}
              placeholder="可选填观测备注信息..."
            />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">气象要素</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="input-label">
                  <field.icon className="w-4 h-4 inline mr-1" />
                  {field.label} ({field.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData[field.key as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  placeholder={`${field.min} ~ ${field.max}`}
                  className={`input ${validation.flaggedFields.includes(field.key) ? 'border-danger-400' : ''}`}
                />
                <p className="text-xs text-slate-400 mt-1">正常范围: {field.min} ~ {field.max}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showPreview && previewObs && (
        <div className="card p-6 border-2 border-primary-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">数据预览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">气温</p>
              <p className="font-semibold">{previewObs.temperature?.toFixed(1) || '--'}°C</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">湿度</p>
              <p className="font-semibold">{previewObs.humidity?.toFixed(0) || '--'}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">气压</p>
              <p className="font-semibold">{previewObs.pressure?.toFixed(1) || '--'}hPa</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">风速</p>
              <p className="font-semibold">{previewObs.windSpeed?.toFixed(1) || '--'}m/s</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">降水</p>
              <p className="font-semibold">{previewObs.precipitation?.toFixed(1) || '--'}mm</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">能见度</p>
              <p className="font-semibold">{previewObs.visibility?.toFixed(1) || '--'}km</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg col-span-2">
              <p className="text-slate-500">质量标记</p>
              <span className={`badge ${getQualityFlagColor(previewObs.qualityFlag)}`}>
                {getQualityFlagLabel(previewObs.qualityFlag)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-end">
        <button onClick={handlePreview} className="btn btn-secondary">
          预览质量
        </button>
        <button onClick={handleSubmit} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          保存记录
        </button>
      </div>
    </div>
  );
}
