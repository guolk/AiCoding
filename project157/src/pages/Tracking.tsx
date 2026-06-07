import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Star } from 'lucide-react';
import { useAppStore } from '../store';

export default function Tracking() {
  const navigate = useNavigate();
  const { students, getEvaluationsByStudentId, getArtworksByStudentId } = useAppStore();

  const getLatestEvaluation = (studentId: string) => {
    const evaluations = getEvaluationsByStudentId(studentId);
    return evaluations[0];
  };

  const getAvgScore = (studentId: string) => {
    const eval_ = getLatestEvaluation(studentId);
    if (!eval_) return 0;
    return Math.round((eval_.composition + eval_.color + eval_.line + eval_.creativity + eval_.expression) / 5);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-400 to-emerald-500';
    if (score >= 6) return 'from-primary-400 to-orange-500';
    return 'from-yellow-400 to-amber-500';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-gray-800 mb-2">
            📈 学员发展追踪
          </h1>
          <p className="text-gray-500">
            追踪学员绘画能力成长，提供个性化发展建议
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {students.map((student, index) => {
          const latestEval = getLatestEvaluation(student.id);
          const avgScore = getAvgScore(student.id);
          const artworks = getArtworksByStudentId(student.id);
          
          return (
            <div
              key={student.id}
              className="card cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/tracking/${student.id}`)}
            >
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-warm">
                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br ${getScoreColor(avgScore)} flex items-center justify-center text-white font-display text-xl shadow-lg`}>
                    {avgScore}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-display text-gray-800 group-hover:text-primary-600 transition-colors mb-1">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span className="tag bg-purple-50 text-purple-700">{student.className}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      最新评估：{latestEval?.date || '暂无'}
                    </span>
                  </div>
                  
                  {latestEval && (
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">构图</span>
                        <span className="font-medium text-gray-700">{latestEval.composition}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">色彩</span>
                        <span className="font-medium text-gray-700">{latestEval.color}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">线条</span>
                        <span className="font-medium text-gray-700">{latestEval.line}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">创意</span>
                        <span className="font-medium text-gray-700">{latestEval.creativity}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">表现力</span>
                        <span className="font-medium text-gray-700">{latestEval.expression}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-display text-primary-600">{artworks.length}</div>
                    <div className="text-xs text-gray-500">作品数量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-display text-green-600">
                      {latestEval ? '↑' : '-'}
                    </div>
                    <div className="text-xs text-gray-500">成长趋势</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-500 group-hover:bg-primary-100 transition-colors">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
