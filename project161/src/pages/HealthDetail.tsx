import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { ArrowLeft, HeartPulse, TreePine, Shield, Wrench, MapPin, Trash2, AlertCircle, X, Check } from 'lucide-react';
import { SEVERITY_LABELS, MEASURE_TYPE_LABELS } from '@/types';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

export default function HealthDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { healthAssessments, getProtectionMeasuresByAssessmentId, trees, deleteHealthAssessment } = useTreeStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const assessment = healthAssessments.find((a) => a.id === id);

  const handleDelete = () => {
    if (id) {
      deleteHealthAssessment(id);
      navigate('/health');
    }
  };
  if (!assessment) {
    return (
      <div className="p-8 text-center">
        <p className="text-brown-700/60">未找到该评估记录</p>
        <Link to="/health" className="text-forest-600 hover:underline mt-2 inline-block">返回列表</Link>
      </div>
    );
  }

  const tree = trees.find((t) => t.id === assessment.treeId);
  const measures = getProtectionMeasuresByAssessmentId(assessment.id);

  const radarData = [
    { dimension: '根系保护', score: assessment.rootProtectionScore * 10 },
    { dimension: '光照条件', score: assessment.lightConditionScore * 10 },
    { dimension: '土壤质量', score: assessment.soilQualityScore * 10 },
    { dimension: '综合评分', score: assessment.overallScore },
  ];

  const conditionItems = [
    { label: '树干腐朽', value: assessment.trunkDecay },
    { label: '空洞状况', value: assessment.hollowStatus },
    { label: '折断状况', value: assessment.breakStatus },
    { label: '病虫害', value: assessment.pestDisease },
    { label: '土壤板结', value: assessment.soilCompaction },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none': return 'bg-forest-100 text-forest-700';
      case 'mild': return 'bg-amber-100 text-amber-500';
      case 'moderate': return 'bg-orange-100 text-orange-700';
      case 'severe': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'none': return 'bg-forest-400';
      case 'mild': return 'bg-amber-300';
      case 'moderate': return 'bg-orange-400';
      case 'severe': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const effectLabels: Record<string, string> = { effective: '有效', partial: '部分有效', ineffective: '无效' };
  const effectColors: Record<string, string> = { effective: 'bg-forest-100 text-forest-700', partial: 'bg-amber-100 text-amber-500', ineffective: 'bg-red-100 text-red-700' };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/health" className="p-2 rounded-lg hover:bg-forest-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-forest-600" />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-forest-600 flex items-center gap-3">
              <HeartPulse className="w-8 h-8" />
              {assessment.treeSpecies} 健康评估
            </h1>
            <p className="text-brown-700/60 mt-1">评估日期：{assessment.assessmentDate} | 评估员：{assessment.assessor}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          删除评估
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6 mb-6">
            <div className="text-center mb-4">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white ${
                assessment.overallScore >= 80 ? 'bg-gradient-to-br from-forest-400 to-forest-600' : assessment.overallScore >= 60 ? 'bg-gradient-to-br from-amber-300 to-amber-400' : 'bg-gradient-to-br from-red-400 to-red-600'
              }`}>
                {assessment.overallScore}
              </div>
              <p className="mt-2 text-sm text-brown-700/60">综合评分</p>
            </div>

            {tree && (
              <div className="border-t border-forest-100 pt-4 space-y-2">
                <p className="text-sm text-brown-700/60 flex items-center gap-2"><TreePine className="w-4 h-4 text-forest-500" />{tree.species} ({tree.scientificName})</p>
                <p className="text-sm text-brown-700/60 flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" />{tree.location}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
            <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              生长环境评估
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#95D5B2" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#5C4033' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar name="评分" dataKey="score" stroke="#2D6A4F" fill="#95D5B2" fillOpacity={0.5} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-brown-700/60">根系保护空间</span>
                <span className="font-medium">{assessment.rootProtectionScore}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brown-700/60">光照条件</span>
                <span className="font-medium">{assessment.lightConditionScore}/10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brown-700/60">土壤质量</span>
                <span className="font-medium">{assessment.soilQualityScore}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
            <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5" />
              现状描述
            </h2>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {conditionItems.map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full ${getSeverityDot(item.value)} mb-2`} />
                  <p className="text-xs text-brown-700/60">{item.label}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getSeverityColor(item.value)}`}>
                    {SEVERITY_LABELS[item.value as keyof typeof SEVERITY_LABELS]}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-forest-50/50 rounded-lg p-4">
              <p className="text-sm text-brown-700/80 leading-relaxed">{assessment.notes}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-forest-100 p-6">
            <h2 className="font-serif text-lg font-semibold text-forest-600 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              保护处理措施
            </h2>
            {measures.length > 0 ? (
              <div className="space-y-3">
                {measures.map((measure) => (
                  <div key={measure.id} className="border border-forest-100 rounded-lg p-4 hover:bg-forest-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-forest-100 text-forest-700">
                          {MEASURE_TYPE_LABELS[measure.type]}
                        </span>
                        <span className="text-sm text-brown-700/60">{measure.operationDate}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${effectColors[measure.effect]}`}>
                        {effectLabels[measure.effect]}
                      </span>
                    </div>
                    <p className="text-sm text-brown-700/80">{measure.description}</p>
                    <p className="text-xs text-brown-700/50 mt-1">操作人：{measure.operator}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brown-700/50 text-center py-4">暂无保护措施记录</p>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brown-700">确认删除</h3>
                <p className="text-sm text-brown-700/60">此操作不可恢复</p>
              </div>
            </div>
            <p className="text-sm text-brown-700/70 mb-6">
              确定要删除这条健康评估记录吗？相关的保护措施记录也会一并删除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-forest-200 rounded-lg text-brown-700/70 hover:bg-forest-50 transition-colors"
              >
                <X className="w-4 h-4" />
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
