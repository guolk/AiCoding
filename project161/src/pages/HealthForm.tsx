import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { ArrowLeft, Save } from 'lucide-react';
import type { HealthAssessment } from '@/types';

export default function HealthForm() {
  const navigate = useNavigate();
  const { trees, addHealthAssessment } = useTreeStore();

  const [form, setForm] = useState({
    treeId: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    trunkDecay: 'none' as HealthAssessment['trunkDecay'],
    hollowStatus: 'none' as HealthAssessment['hollowStatus'],
    breakStatus: 'none' as HealthAssessment['breakStatus'],
    pestDisease: 'none' as HealthAssessment['pestDisease'],
    soilCompaction: 'none' as HealthAssessment['soilCompaction'],
    rootProtectionScore: 5,
    lightConditionScore: 5,
    soilQualityScore: 5,
    assessor: '',
    notes: '',
  });

  const severityOptions = [
    { value: 'none', label: '无' },
    { value: 'mild', label: '轻度' },
    { value: 'moderate', label: '中度' },
    { value: 'severe', label: '重度' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tree = trees.find((t) => t.id === form.treeId);
    const overallScore = Math.round(
      (form.rootProtectionScore * 3 + form.lightConditionScore * 3 + form.soilQualityScore * 4) +
      (form.trunkDecay === 'none' ? 15 : form.trunkDecay === 'mild' ? 10 : form.trunkDecay === 'moderate' ? 5 : 0) +
      (form.hollowStatus === 'none' ? 15 : form.hollowStatus === 'mild' ? 10 : form.hollowStatus === 'moderate' ? 5 : 0) +
      (form.pestDisease === 'none' ? 10 : form.pestDisease === 'mild' ? 7 : form.pestDisease === 'moderate' ? 3 : 0)
    );

    const newAssessment: HealthAssessment = {
      id: `ha${Date.now()}`,
      treeId: form.treeId,
      treeSpecies: tree?.species || '',
      assessmentDate: form.assessmentDate,
      overallScore: Math.min(overallScore, 100),
      trunkDecay: form.trunkDecay,
      hollowStatus: form.hollowStatus,
      breakStatus: form.breakStatus,
      pestDisease: form.pestDisease,
      soilCompaction: form.soilCompaction,
      rootProtectionScore: form.rootProtectionScore,
      lightConditionScore: form.lightConditionScore,
      soilQualityScore: form.soilQualityScore,
      assessor: form.assessor,
      notes: form.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    addHealthAssessment(newAssessment);
    navigate('/health');
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/health" className="p-2 rounded-lg hover:bg-forest-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-forest-600" />
        </Link>
        <h1 className="font-serif text-3xl font-bold text-forest-600">新增健康评估</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">基本信息</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">选择古树</label>
              <select value={form.treeId} onChange={(e) => setForm({ ...form, treeId: e.target.value })}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" required>
                <option value="">请选择</option>
                {trees.map((t) => (
                  <option key={t.id} value={t.id}>{t.species} - {t.location}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">评估日期</label>
              <input type="date" value={form.assessmentDate} onChange={(e) => setForm({ ...form, assessmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" required />
            </div>
            <div>
              <label className="block text-sm text-brown-700/60 mb-1">评估员</label>
              <input type="text" value={form.assessor} onChange={(e) => setForm({ ...form, assessor: e.target.value })}
                className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400" required />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">健康状况</h2>
          <div className="space-y-4">
            {[
              { key: 'trunkDecay', label: '树干腐朽' },
              { key: 'hollowStatus', label: '空洞状况' },
              { key: 'breakStatus', label: '折断状况' },
              { key: 'pestDisease', label: '病虫害' },
              { key: 'soilCompaction', label: '土壤板结' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <span className="text-sm text-brown-700/70 w-20">{label}</span>
                <div className="flex gap-2">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, [key]: opt.value })}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        form[key as keyof typeof form] === opt.value
                          ? 'bg-forest-600 text-white border-forest-600'
                          : 'border-forest-200 text-brown-700/60 hover:bg-forest-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">生长环境评估</h2>
          <div className="space-y-4">
            {[
              { key: 'rootProtectionScore', label: '根系保护空间', value: form.rootProtectionScore },
              { key: 'lightConditionScore', label: '光照条件', value: form.lightConditionScore },
              { key: 'soilQualityScore', label: '土壤质量', value: form.soilQualityScore },
            ].map(({ key, label, value }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-brown-700/70">{label}</span>
                  <span className="text-sm font-medium text-forest-600">{value}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={value}
                  onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                  className="w-full h-2 bg-forest-100 rounded-lg appearance-none cursor-pointer accent-forest-600"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4">备注</h2>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-forest-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
            placeholder="请详细描述古树当前健康状况..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/health" className="px-6 py-2.5 border border-forest-200 rounded-lg text-brown-700/70 hover:bg-forest-50 transition-colors">
            取消
          </Link>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors shadow-md">
            <Save className="w-4 h-4" />
            提交评估
          </button>
        </div>
      </form>
    </div>
  );
}
