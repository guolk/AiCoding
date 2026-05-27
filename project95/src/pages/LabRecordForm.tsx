import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ExperimentCondition, Reagent, Instrument, Environment, LabRecord } from '../types';

export default function LabRecordForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { labRecords, projects, addLabRecord, updateLabRecord, showToast, currentUser } = useStore();
  const isEdit = !!id;
  const existingRecord = isEdit ? labRecords.find((r) => r.id === parseInt(id!)) : null;

  const [formData, setFormData] = useState<Omit<LabRecord, 'id' | 'created_at' | 'updated_at'>>({
    experiment_date: existingRecord?.experiment_date || new Date().toISOString().split('T')[0],
    purpose: existingRecord?.purpose || '',
    method: existingRecord?.method || '',
    results: existingRecord?.results || '',
    conclusion: existingRecord?.conclusion || '',
    project_id: existingRecord?.project_id || 0,
    user_id: existingRecord?.user_id || currentUser?.id || 1,
    conditions: existingRecord?.conditions || {
      reagents: [],
      instruments: [],
      environment: { temperature: 25, humidity: 50, lighting: '实验室灯光' },
    },
  });

  const addReagent = () => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        reagents: [...formData.conditions.reagents, { name: '', batch: '', supplier: '' } as Reagent],
      },
    });
  };

  const updateReagent = (index: number, field: keyof Reagent, value: string) => {
    const reagents = [...formData.conditions.reagents];
    reagents[index] = { ...reagents[index], [field]: value };
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, reagents },
    });
  };

  const removeReagent = (index: number) => {
    const reagents = formData.conditions.reagents.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, reagents },
    });
  };

  const addInstrument = () => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        instruments: [...formData.conditions.instruments, { name: '', model: '', settings: '' } as Instrument],
      },
    });
  };

  const updateInstrument = (index: number, field: keyof Instrument, value: string) => {
    const instruments = [...formData.conditions.instruments];
    instruments[index] = { ...instruments[index], [field]: value };
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, instruments },
    });
  };

  const removeInstrument = (index: number) => {
    const instruments = formData.conditions.instruments.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, instruments },
    });
  };

  const updateEnvironment = (field: keyof Environment, value: number | string) => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        environment: { ...formData.conditions.environment, [field]: value },
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purpose.trim()) {
      showToast('请输入实验目的', 'error');
      return;
    }

    if (isEdit && existingRecord) {
      updateLabRecord(existingRecord.id, formData);
      showToast('实验记录更新成功', 'success');
    } else {
      addLabRecord(formData);
      showToast('实验记录创建成功', 'success');
    }
    navigate('/lab-records');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/lab-records')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            {isEdit ? '编辑实验记录' : '新建实验记录'}
          </h1>
          <p className="text-sm text-neutral-500">
            {isEdit ? '修改实验记录信息' : '记录新的实验数据'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">实验日期 *</label>
            <input
              type="date"
              value={formData.experiment_date}
              onChange={(e) => setFormData({ ...formData, experiment_date: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">所属项目</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) })}
              className="input-field"
            >
              <option value={0}>请选择项目</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">实验目的 *</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            className="input-textarea"
            rows={3}
            placeholder="请输入实验目的"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">实验方法</label>
          <textarea
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
            className="input-textarea"
            rows={4}
            placeholder="请输入实验方法"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">实验结果</label>
          <textarea
            value={formData.results}
            onChange={(e) => setFormData({ ...formData, results: e.target.value })}
            className="input-textarea"
            rows={4}
            placeholder="请输入实验结果"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">结论</label>
          <textarea
            value={formData.conclusion}
            onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
            className="input-textarea"
            rows={3}
            placeholder="请输入实验结论"
          />
        </div>

        <div className="border-t border-neutral-100 pt-6">
          <h3 className="font-medium text-neutral-900 mb-4">实验条件</h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-700">试剂信息</label>
              <button type="button" onClick={addReagent} className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> 添加试剂
              </button>
            </div>
            <div className="space-y-3">
              {formData.conditions.reagents.map((reagent, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <input
                    type="text"
                    value={reagent.name}
                    onChange={(e) => updateReagent(index, 'name', e.target.value)}
                    className="input-field flex-1"
                    placeholder="试剂名称"
                  />
                  <input
                    type="text"
                    value={reagent.batch}
                    onChange={(e) => updateReagent(index, 'batch', e.target.value)}
                    className="input-field w-32"
                    placeholder="批号"
                  />
                  <input
                    type="text"
                    value={reagent.supplier}
                    onChange={(e) => updateReagent(index, 'supplier', e.target.value)}
                    className="input-field w-40"
                    placeholder="供应商"
                  />
                  <button type="button" onClick={() => removeReagent(index)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-neutral-700">仪器设备</label>
              <button type="button" onClick={addInstrument} className="text-sm text-accent-600 hover:text-accent-700 flex items-center gap-1">
                <Plus className="w-4 h-4" /> 添加仪器
              </button>
            </div>
            <div className="space-y-3">
              {formData.conditions.instruments.map((instrument, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                  <input
                    type="text"
                    value={instrument.name}
                    onChange={(e) => updateInstrument(index, 'name', e.target.value)}
                    className="input-field flex-1"
                    placeholder="仪器名称"
                  />
                  <input
                    type="text"
                    value={instrument.model}
                    onChange={(e) => updateInstrument(index, 'model', e.target.value)}
                    className="input-field w-32"
                    placeholder="型号"
                  />
                  <input
                    type="text"
                    value={instrument.settings}
                    onChange={(e) => updateInstrument(index, 'settings', e.target.value)}
                    className="input-field w-48"
                    placeholder="设置参数"
                  />
                  <button type="button" onClick={() => removeInstrument(index)} className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">环境条件</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">温度 (°C)</label>
                <input
                  type="number"
                  value={formData.conditions.environment.temperature}
                  onChange={(e) => updateEnvironment('temperature', parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">湿度 (%)</label>
                <input
                  type="number"
                  value={formData.conditions.environment.humidity}
                  onChange={(e) => updateEnvironment('humidity', parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">光照</label>
                <input
                  type="text"
                  value={formData.conditions.environment.lighting}
                  onChange={(e) => updateEnvironment('lighting', e.target.value)}
                  className="input-field"
                  placeholder="光照条件"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <button type="button" onClick={() => navigate('/lab-records')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '创建记录'}
          </button>
        </div>
      </form>
    </div>
  );
}
