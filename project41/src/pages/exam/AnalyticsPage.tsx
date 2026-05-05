import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { ExamAnalytics, ScoreDistribution, QuestionStats, KnowledgePointStats } from '@/types';

export default function AnalyticsPage() {
  const { examId } = useParams<{ examId: string }>();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ExamAnalytics | null>(null);

  useEffect(() => {
    if (examId) {
      loadAnalytics();
    }
  }, [examId]);

  const loadAnalytics = async () => {
    if (!examId) return;
    try {
      const result: any = await examApi.getExamAnalytics(parseInt(examId));
      setAnalytics(result);
    } catch (err: any) {
      alert(err.message || '加载成绩分析失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载成绩分析中...</div>
      </div>
    );
  }

  if (!analytics || analytics.totalSubmissions === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link to="/exam/exams" className="text-gray-500 hover:text-gray-700 mr-4">
                ← 返回
              </Link>
              <h1 className="text-xl font-bold text-gray-900">成绩分析</h1>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500">暂无提交数据，无法进行成绩分析</p>
          </div>
        </main>
      </div>
    );
  }

  const maxScoreInDist = Math.max(...analytics.scoreDistribution.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/exam/exams" className="text-gray-500 hover:text-gray-700 mr-4">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-900">成绩分析 - {analytics.examTitle}</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{analytics.totalSubmissions}</div>
            <div className="text-sm text-gray-500">参加人数</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{analytics.avgScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">平均分</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">{analytics.maxScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">最高分</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">{analytics.minScore.toFixed(1)}</div>
            <div className="text-sm text-gray-500">最低分</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{analytics.passRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">及格率</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分数分布</h3>
            <div className="space-y-3">
              {analytics.scoreDistribution.map((dist: ScoreDistribution) => (
                <div key={dist.range} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-gray-600 text-right">{dist.range}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        dist.range === '0-59' ? 'bg-red-400' :
                        dist.range === '60-69' ? 'bg-orange-400' :
                        dist.range === '70-79' ? 'bg-yellow-400' :
                        dist.range === '80-89' ? 'bg-green-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(dist.count / maxScoreInDist) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-600">{dist.count}人</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">知识点掌握情况</h3>
            {analytics.knowledgeStats.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无知识点数据</p>
            ) : (
              <div className="space-y-4">
                {analytics.knowledgeStats.map((kp: KnowledgePointStats) => (
                  <div key={kp.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{kp.name}</span>
                      <span className={`text-sm font-medium ${
                        kp.correctRate >= 80 ? 'text-green-600' :
                        kp.correctRate >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {kp.correctRate.toFixed(1)}% 正确率
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-500 ${
                          kp.correctRate >= 80 ? 'bg-green-400' :
                          kp.correctRate >= 60 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${kp.correctRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{kp.totalQuestions} 道题</span>
                      <span>平均 {kp.avgScore.toFixed(1)} 分</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">各题正答率统计</h3>
          {analytics.questionStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无题目数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">题号</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">题目</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">作答人数</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">正答率</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">平均分</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.questionStats.map((qs: QuestionStats, idx: number) => (
                    <tr key={qs.questionId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">第 {idx + 1} 题</td>
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate" title={qs.questionTitle}>
                        {qs.questionTitle}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{qs.totalAttempts}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          qs.correctRate >= 80 ? 'bg-green-100 text-green-800' :
                          qs.correctRate >= 60 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {qs.correctRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{qs.avgScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">知识点掌握热图</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {analytics.knowledgeStats.map((kp: KnowledgePointStats) => {
              const intensity = kp.correctRate;
              let bgColor = 'bg-gray-200';
              let textColor = 'text-gray-800';
              
              if (intensity >= 90) {
                bgColor = 'bg-emerald-500';
                textColor = 'text-white';
              } else if (intensity >= 80) {
                bgColor = 'bg-emerald-400';
                textColor = 'text-white';
              } else if (intensity >= 70) {
                bgColor = 'bg-green-400';
                textColor = 'text-white';
              } else if (intensity >= 60) {
                bgColor = 'bg-amber-400';
                textColor = 'text-white';
              } else if (intensity >= 40) {
                bgColor = 'bg-orange-400';
                textColor = 'text-white';
              } else {
                bgColor = 'bg-red-400';
                textColor = 'text-white';
              }
              
              return (
                <div
                  key={kp.name}
                  className={`${bgColor} ${textColor} rounded-lg p-4 text-center transition-transform hover:scale-105 cursor-default`}
                >
                  <div className="text-xs opacity-80 mb-1">{kp.name}</div>
                  <div className="text-2xl font-bold">{kp.correctRate.toFixed(0)}%</div>
                  <div className="text-xs opacity-80 mt-1">{kp.totalQuestions} 道题</div>
                </div>
              );
            })}
          </div>
          
          {analytics.knowledgeStats.length === 0 && (
            <p className="text-gray-500 text-center py-8">暂无知识点数据</p>
          )}
          
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-400"></span>
              <span className="text-gray-600">0-40%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-orange-400"></span>
              <span className="text-gray-600">40-60%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-amber-400"></span>
              <span className="text-gray-600">60-70%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-400"></span>
              <span className="text-gray-600">70-80%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-400"></span>
              <span className="text-gray-600">80-90%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-500"></span>
              <span className="text-gray-600">90-100%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
