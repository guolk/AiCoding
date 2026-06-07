import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  ArrowLeftRight,
  History,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  X,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ANALYSIS_TYPE_LABELS, type TypeAnalysis } from '../../shared/types';

const ANALYSIS_ICONS = {
  comparison: ArrowLeftRight,
  evolution: History,
  periodization: Calendar
};

const ANALYSIS_DESCRIPTIONS = {
  comparison: '对同类文物的型制、纹饰、工艺等方面进行横向对比分析，找出异同点',
  evolution: '建立某类器物从早期到晚期的型制演变序列，梳理发展脉络',
  periodization: '记录分期断代的依据和标准，为文物年代判定提供参考'
};

export default function TypeAnalysisForm() {
  const { id, mode } = useParams<{ id?: string; mode?: string }>();
  const navigate = useNavigate();
  const { addAnalysis, updateAnalysis, setLoading, loading, relics } = useAppStore();
  const isEdit = !!id;
  const isNew = !id;

  const [formData, setFormData] = useState<Partial<TypeAnalysis>>({
    name: '',
    type: 'comparison',
    description: '',
    relicIds: [],
    analysisData: {}
  });

  const [comparisonFields, setComparisonFields] = useState<{ field: string; values: Record<string, string> }[]>([
    { field: '年代', values: {} },
    { field: '型制', values: {} },
    { field: '纹饰', values: {} },
    { field: '工艺', values: {} }
  ]);

  const [evolutionStages, setEvolutionStages] = useState<{ period: string; features: string; relicId: string }[]>([
    { period: '', features: '', relicId: '' }
  ]);

  const [periodizationCriteria, setPeriodizationCriteria] = useState<{ feature: string; standard: string; evidence: string }[]>([
    { feature: '', standard: '', evidence: '' }
  ]);

  const [newField, setNewField] = useState('');

  useEffect(() => {
    if (relics.length === 0) {
      api.relics.getAll().then(data => useAppStore.getState().setRelics(data));
    }
  }, [relics.length]);

  useEffect(() => {
    if (id) {
      const loadAnalysis = async () => {
        try {
          setLoading(true);
          const data = await api.analysis.getById(id);
          setFormData(data);
          if (data.analysisData) {
            if (data.type === 'comparison' && data.analysisData.fields) {
              setComparisonFields(data.analysisData.fields as any);
            } else if (data.type === 'evolution' && data.analysisData.stages) {
              setEvolutionStages(data.analysisData.stages as any);
            } else if (data.type === 'periodization' && data.analysisData.criteria) {
              setPeriodizationCriteria(data.analysisData.criteria as any);
            }
          }
        } catch (err: any) {
          alert(err.message);
          navigate('/analysis');
        } finally {
          setLoading(false);
        }
      };
      loadAnalysis();
    }
  }, [id, setLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('请输入分析名称');
      return;
    }

    let analysisData: Record<string, unknown> = {};
    if (formData.type === 'comparison') {
      analysisData = { fields: comparisonFields };
    } else if (formData.type === 'evolution') {
      analysisData = { stages: evolutionStages };
    } else if (formData.type === 'periodization') {
      analysisData = { criteria: periodizationCriteria };
    }

    const submitData = { ...formData, analysisData };

    try {
      setLoading(true);
      if (isNew) {
        const newItem = await api.analysis.create(submitData);
        addAnalysis(newItem);
        navigate('/analysis');
      } else if (isEdit && id) {
        const updated = await api.analysis.update(id, submitData);
        updateAnalysis(updated);
        navigate('/analysis');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRelic = (relicId: string) => {
    setFormData(prev => ({
      ...prev,
      relicIds: prev.relicIds?.includes(relicId)
        ? prev.relicIds.filter(id => id !== relicId)
        : [...(prev.relicIds || []), relicId]
    }));
  };

  const addComparisonField = () => {
    if (!newField.trim()) return;
    setComparisonFields([...comparisonFields, { field: newField.trim(), values: {} }]);
    setNewField('');
  };

  const updateComparisonValue = (fieldIndex: number, relicId: string, value: string) => {
    setComparisonFields(fields => fields.map((f, i) =>
      i === fieldIndex ? { ...f, values: { ...f.values, [relicId]: value } } : f
    ));
  };

  if (loading && id) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  const TypeIcon = ANALYSIS_ICONS[formData.type || 'comparison'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/analysis')}
            className="p-2 rounded-lg hover:bg-accent-gold/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {isNew ? '新建类型分析' : '编辑类型分析'}
            </h1>
            <p className="text-ink-light">
              {ANALYSIS_TYPE_LABELS[formData.type || 'comparison']}
            </p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card-border-gold p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">基本信息</h2>
          <div className="divider-gold mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="input-label">分析名称 *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="请输入分析名称"
              />
            </div>
            <div>
              <label className="input-label">分析类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(['comparison', 'evolution', 'periodization'] as const).map(type => {
                  const Icon = ANALYSIS_ICONS[type];
                  const selected = formData.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                        selected
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                          : 'border-primary-200 hover:border-accent-gold/50 text-ink-light'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{ANALYSIS_TYPE_LABELS[type]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-ink-light mt-2">
                {ANALYSIS_DESCRIPTIONS[formData.type || 'comparison']}
              </p>
            </div>
            <div>
              <label className="input-label">选择关联文物</label>
              <div className="max-h-[200px] overflow-y-auto border border-primary-200 rounded-lg p-2 space-y-1">
                {relics.map(relic => {
                  const selected = formData.relicIds?.includes(relic.id);
                  return (
                    <button
                      key={relic.id}
                      type="button"
                      onClick={() => toggleRelic(relic.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        selected ? 'bg-accent-gold/10 text-ink' : 'hover:bg-primary-50 text-ink-light'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${selected ? 'text-accent-gold' : 'opacity-30'}`} />
                      <span className="text-sm text-left">{relic.name}</span>
                      <span className="text-xs text-ink-light ml-auto">{relic.era}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-ink-light mt-1">
                已选择 {formData.relicIds?.length || 0} 件文物
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="input-label">分析描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field min-h-[80px]"
                placeholder="简要描述本次分析的目的和范围..."
              />
            </div>
          </div>
        </div>

        {formData.type === 'comparison' && (
          <div className="card-border-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-accent-gold" />
                横向比较分析
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  placeholder="添加比较字段"
                  className="input-field w-40 text-sm py-1.5"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addComparisonField())}
                />
                <button type="button" onClick={addComparisonField} className="btn-secondary px-3 py-1.5">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divider-gold mb-6" />

            {formData.relicIds?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary-50">
                      <th className="text-left p-3 font-semibold text-ink border-b border-primary-200 min-w-[120px]">
                        比较项目
                      </th>
                      {formData.relicIds.map(relicId => {
                        const relic = relics.find(r => r.id === relicId);
                        return (
                          <th key={relicId} className="text-left p-3 font-semibold text-ink border-b border-primary-200 min-w-[150px]">
                            {relic?.name}
                          </th>
                        );
                      })}
                      <th className="p-3 border-b border-primary-200 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFields.map((field, fieldIndex) => (
                      <tr key={fieldIndex} className="border-b border-primary-100">
                        <td className="p-3 font-medium text-ink">{field.field}</td>
                        {formData.relicIds!.map(relicId => (
                          <td key={relicId} className="p-3">
                            <input
                              type="text"
                              value={field.values[relicId] || ''}
                              onChange={(e) => updateComparisonValue(fieldIndex, relicId, e.target.value)}
                              className="input-field py-1.5 text-sm"
                              placeholder={`输入${field.field}...`}
                            />
                          </td>
                        ))}
                        <td className="p-3">
                          {comparisonFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setComparisonFields(fields => fields.filter((_, i) => i !== fieldIndex))}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-ink-light">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>请先选择要比较的文物</p>
              </div>
            )}
          </div>
        )}

        {formData.type === 'evolution' && (
          <div className="card-border-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <History className="w-5 h-5 text-accent-gold" />
                演变序列
              </h2>
              <button
                type="button"
                onClick={() => setEvolutionStages([...evolutionStages, { period: '', features: '', relicId: '' }])}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加阶段
              </button>
            </div>
            <div className="divider-gold mb-6" />

            <div className="space-y-4">
              {evolutionStages.map((stage, index) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-accent-gold/30 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent-gold border-4 border-white shadow" />
                  <div className="card p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <label className="input-label text-sm">时期 / 阶段</label>
                        <input
                          type="text"
                          value={stage.period}
                          onChange={(e) => setEvolutionStages(stages => stages.map((s, i) => i === index ? { ...s, period: e.target.value } : s))}
                          className="input-field text-sm py-1.5"
                          placeholder="如：商代早期"
                        />
                      </div>
                      <div>
                        <label className="input-label text-sm">代表文物</label>
                        <select
                          value={stage.relicId}
                          onChange={(e) => setEvolutionStages(stages => stages.map((s, i) => i === index ? { ...s, relicId: e.target.value } : s))}
                          className="input-field text-sm py-1.5"
                        >
                          <option value="">选择文物</option>
                          {relics.map(relic => (
                            <option key={relic.id} value={relic.id}>{relic.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end justify-end">
                        {evolutionStages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setEvolutionStages(stages => stages.filter((_, i) => i !== index))}
                            className="btn-danger flex items-center gap-1 px-3 py-1.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="input-label text-sm">典型特征</label>
                      <textarea
                        value={stage.features}
                        onChange={(e) => setEvolutionStages(stages => stages.map((s, i) => i === index ? { ...s, features: e.target.value } : s))}
                        className="input-field text-sm py-1.5 min-h-[60px]"
                        placeholder="描述这一阶段的典型器型、纹饰、工艺特征..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.type === 'periodization' && (
          <div className="card-border-gold p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-gold" />
                分期断代依据
              </h2>
              <button
                type="button"
                onClick={() => setPeriodizationCriteria([...periodizationCriteria, { feature: '', standard: '', evidence: '' }])}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加依据
              </button>
            </div>
            <div className="divider-gold mb-6" />

            <div className="space-y-3">
              {periodizationCriteria.map((criterion, index) => (
                <div key={index} className="card p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3">
                      <label className="input-label text-sm">断代特征</label>
                      <input
                        type="text"
                        value={criterion.feature}
                        onChange={(e) => setPeriodizationCriteria(criteria => criteria.map((c, i) => i === index ? { ...c, feature: e.target.value } : c))}
                        className="input-field text-sm py-1.5"
                        placeholder="如：器型、纹饰"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="input-label text-sm">分期标准</label>
                      <input
                        type="text"
                        value={criterion.standard}
                        onChange={(e) => setPeriodizationCriteria(criteria => criteria.map((c, i) => i === index ? { ...c, standard: e.target.value } : c))}
                        className="input-field text-sm py-1.5"
                        placeholder="如：西周早期分裆较高"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="input-label text-sm">依据来源</label>
                      <input
                        type="text"
                        value={criterion.evidence}
                        onChange={(e) => setPeriodizationCriteria(criteria => criteria.map((c, i) => i === index ? { ...c, evidence: e.target.value } : c))}
                        className="input-field text-sm py-1.5"
                        placeholder="如：《西周青铜器分期断代研究》"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end justify-end">
                      {periodizationCriteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPeriodizationCriteria(criteria => criteria.filter((_, i) => i !== index))}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
