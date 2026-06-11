import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTreeStore } from '@/store/treeStore';
import { HeartPulse, Plus, TreePine, Calendar, User, ArrowRight } from 'lucide-react';
import { SEVERITY_LABELS } from '@/types';

export default function HealthList() {
  const { healthAssessments, trees } = useTreeStore();
  const [filterScore, setFilterScore] = useState('');

  const sorted = [...healthAssessments].sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate));

  const filtered = sorted.filter((a) => {
    if (filterScore === 'good') return a.overallScore >= 80;
    if (filterScore === 'fair') return a.overallScore >= 60 && a.overallScore < 80;
    if (filterScore === 'poor') return a.overallScore < 60;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-forest-600">健康评估</h1>
          <p className="text-brown-700/70 mt-1">共 {filtered.length} 条评估记录</p>
        </div>
        <Link
          to="/health/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          新增评估
        </Link>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { value: '', label: '全部' },
          { value: 'good', label: '良好 (≥80)' },
          { value: 'fair', label: '一般 (60-79)' },
          { value: 'poor', label: '堪忧 (<60)' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterScore(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterScore === f.value ? 'bg-forest-600 text-white' : 'bg-white border border-forest-200 text-brown-700/70 hover:bg-forest-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((assessment) => {
          const tree = trees.find((t) => t.id === assessment.treeId);
          return (
            <Link
              key={assessment.id}
              to={`/health/${assessment.id}`}
              className="bg-white rounded-xl shadow-sm border border-forest-100 p-5 hover:shadow-md transition-all duration-200 flex items-center gap-6 group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                assessment.overallScore >= 80 ? 'from-forest-400 to-forest-600' : assessment.overallScore >= 60 ? 'from-amber-300 to-amber-400' : 'from-red-400 to-red-600'
              }`}>
                <HeartPulse className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-serif text-lg font-semibold text-brown-700 flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-forest-500" />
                    {assessment.treeSpecies}
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${
                    assessment.overallScore >= 80 ? 'bg-forest-100 text-forest-700' : assessment.overallScore >= 60 ? 'bg-amber-100 text-amber-500' : 'bg-red-100 text-red-700'
                  }`}>
                    {assessment.overallScore >= 80 ? '良好' : assessment.overallScore >= 60 ? '一般' : '堪忧'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-brown-700/60">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{assessment.assessmentDate}</span>
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{assessment.assessor}</span>
                  {tree && <span>{tree.location}</span>}
                </div>
              </div>

              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-3xl font-bold text-brown-700">{assessment.overallScore}</p>
                  <p className="text-xs text-brown-700/50">综合评分</p>
                </div>
                <ArrowRight className="w-5 h-5 text-brown-700/30 group-hover:text-forest-500 transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
