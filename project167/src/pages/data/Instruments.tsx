import { useState } from 'react';
import { useWeatherStore } from '@/store';
import { Settings, Plus, Edit2, Trash2, CheckCircle, XCircle, Calendar, Wrench } from 'lucide-react';

export default function Instruments() {
  const instruments = useWeatherStore((state) => state.instruments);
  const addInstrument = useWeatherStore((state) => state.addInstrument);
  const updateInstrument = useWeatherStore((state) => state.updateInstrument);
  const deleteInstrument = useWeatherStore((state) => state.deleteInstrument);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    model: '',
    serialNumber: '',
    calibrationDate: '',
    nextCalibrationDate: '',
    tempError: 0.1,
    humidityError: 1,
    pressureError: 0.5,
    windSpeedError: 0.1,
    precipitationError: 0.1,
    isActive: true,
  });

  const startEdit = (inst: any) => {
    setEditingId(inst.id);
    setFormData({ ...inst });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateInstrument(editingId, formData);
    } else {
      addInstrument(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      model: '',
      serialNumber: '',
      calibrationDate: '',
      nextCalibrationDate: '',
      tempError: 0.1,
      humidityError: 1,
      pressureError: 0.5,
      windSpeedError: 0.1,
      precipitationError: 0.1,
      isActive: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除这台仪器吗？')) {
      deleteInstrument(id);
    }
  };

  const isCalibrationDue = (date: string) => {
    return new Date(date) < new Date();
  };

  const errorFields = [
    { key: 'tempError', label: '气温', unit: '°C' },
    { key: 'humidityError', label: '湿度', unit: '%' },
    { key: 'pressureError', label: '气压', unit: 'hPa' },
    { key: 'windSpeedError', label: '风速', unit: 'm/s' },
    { key: 'precipitationError', label: '降水', unit: 'mm' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">仪器管理</h1>
          <p className="text-slate-500 mt-1">共 {instruments.length} 台观测仪器</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加仪器
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? '编辑仪器' : '添加新仪器'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">仪器名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="如：自动气象站A"
                  />
                </div>
                <div>
                  <label className="input-label">仪器类型 *</label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input"
                    placeholder="如：综合观测站"
                  />
                </div>
                <div>
                  <label className="input-label">型号 *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="input"
                    placeholder="如：AWS-2000"
                  />
                </div>
                <div>
                  <label className="input-label">序列号 *</label>
                  <input
                    type="text"
                    required
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="input"
                    placeholder="如：SN20230001"
                  />
                </div>
                <div>
                  <label className="input-label">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    上次校准日期
                  </label>
                  <input
                    type="date"
                    value={formData.calibrationDate}
                    onChange={(e) => setFormData({ ...formData, calibrationDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">
                    <Wrench className="w-4 h-4 inline mr-1" />
                    下次校准日期
                  </label>
                  <input
                    type="date"
                    value={formData.nextCalibrationDate}
                    onChange={(e) => setFormData({ ...formData, nextCalibrationDate: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-medium text-slate-700 mb-4">误差范围</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {errorFields.map((field) => (
                    <div key={field.key}>
                      <label className="input-label text-xs">
                        {field.label} ({field.unit})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData[field.key as keyof typeof formData] as number}
                        onChange={(e) => setFormData({ ...formData, [field.key]: parseFloat(e.target.value) })}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-slate-700">
                  仪器处于启用状态
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? '保存修改' : '添加仪器'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instruments.map((inst) => (
          <div key={inst.id} className={`card p-6 ${!inst.isActive ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${inst.isActive ? 'bg-primary-100' : 'bg-slate-100'} flex items-center justify-center`}>
                  <Settings className={`w-6 h-6 ${inst.isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{inst.name}</h3>
                  <p className="text-sm text-slate-500">{inst.type} · {inst.model}</p>
                </div>
              </div>
              <span className={`badge ${inst.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {inst.isActive ? '启用' : '停用'}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">序列号</span>
                <span className="font-mono text-slate-700">{inst.serialNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">上次校准</span>
                <span className="text-slate-700">{inst.calibrationDate || '--'}</span>
              </div>
              <div className={`flex justify-between py-2 border-b border-slate-50 ${isCalibrationDue(inst.nextCalibrationDate) ? 'text-danger-600' : ''}`}>
                <span className="text-slate-500">下次校准</span>
                <span className="flex items-center gap-1">
                  {isCalibrationDue(inst.nextCalibrationDate) && (
                    <XCircle className="w-4 h-4" />
                  )}
                  {inst.nextCalibrationDate || '--'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">测量误差</p>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-slate-400">气温</p>
                  <p className="font-medium text-slate-700">±{inst.tempError}°C</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">湿度</p>
                  <p className="font-medium text-slate-700">±{inst.humidityError}%</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">气压</p>
                  <p className="font-medium text-slate-700">±{inst.pressureError}hPa</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">风速</p>
                  <p className="font-medium text-slate-700">±{inst.windSpeedError}m/s</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">降水</p>
                  <p className="font-medium text-slate-700">±{inst.precipitationError}mm</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => startEdit(inst)}
                className="btn btn-secondary text-sm py-1 px-3 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                编辑
              </button>
              <button
                onClick={() => handleDelete(inst.id)}
                className="btn btn-danger text-sm py-1 px-3 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
