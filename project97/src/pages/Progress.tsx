import { BarChart3, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useProgressAnalysis } from '../stores/progressStore';
import { useQuestionStore } from '../stores/questionStore';
import { useWrongNoteStore } from '../stores/wrongNoteStore';
import { useTrainingStore } from '../stores/trainingStore';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const topicLabels: Record<string, string> = {
  number_theory: '数论',
  combinatorics: '组合',
  algebra: '代数',
  geometry: '几何',
};

export function Progress() {
  const navigate = useNavigate();
  const { questions } = useQuestionStore();
  const { wrongNotes } = useWrongNoteStore();
  const { getAverageScore, getScoreTrend, getTopicErrorRates, getMasteryHeatmap } = useProgressAnalysis();
  const { trainingRecords, getStreakDays } = useTrainingStore();

  const scoreTrend = getScoreTrend();
  const topicErrorRates = getTopicErrorRates();
  const masteryHeatmap = getMasteryHeatmap();
  const averageScore = getAverageScore();
  const streakDays = getStreakDays();

  const heatmapData = [
    { topic: '数论', difficulty: '入门', ...masteryHeatmap.find((d) => d.topic === 'number_theory' && d.difficulty === 1) || { total: 0, mastered: 0 } },
    { topic: '数论', difficulty: '中等', ...masteryHeatmap.find((d) => d.topic === 'number_theory' && d.difficulty === 3) || { total: 0, mastered: 0 } },
    { topic: '数论', difficulty: '竞赛级', ...masteryHeatmap.find((d) => d.topic === 'number_theory' && d.difficulty === 5) || { total: 0, mastered: 0 } },
    { topic: '组合', difficulty: '入门', ...masteryHeatmap.find((d) => d.topic === 'combinatorics' && d.difficulty === 1) || { total: 0, mastered: 0 } },
    { topic: '组合', difficulty: '中等', ...masteryHeatmap.find((d) => d.topic === 'combinatorics' && d.difficulty === 3) || { total: 0, mastered: 0 } },
    { topic: '组合', difficulty: '竞赛级', ...masteryHeatmap.find((d) => d.topic === 'combinatorics' && d.difficulty === 5) || { total: 0, mastered: 0 } },
    { topic: '代数', difficulty: '入门', ...masteryHeatmap.find((d) => d.topic === 'algebra' && d.difficulty === 1) || { total: 0, mastered: 0 } },
    { topic: '代数', difficulty: '中等', ...masteryHeatmap.find((d) => d.topic === 'algebra' && d.difficulty === 3) || { total: 0, mastered: 0 } },
    { topic: '代数', difficulty: '竞赛级', ...masteryHeatmap.find((d) => d.topic === 'algebra' && d.difficulty === 5) || { total: 0, mastered: 0 } },
    { topic: '几何', difficulty: '入门', ...masteryHeatmap.find((d) => d.topic === 'geometry' && d.difficulty === 1) || { total: 0, mastered: 0 } },
    { topic: '几何', difficulty: '中等', ...masteryHeatmap.find((d) => d.topic === 'geometry' && d.difficulty === 3) || { total: 0, mastered: 0 } },
    { topic: '几何', difficulty: '竞赛级', ...masteryHeatmap.find((d) => d.topic === 'geometry' && d.difficulty === 5) || { total: 0, mastered: 0 } },
  ];

  const getMasteryRate = (mastered: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((mastered / total) * 100);
  };

  const getHeatmapColor = (rate: number) => {
    if (rate >= 80) return 'bg-success';
    if (rate >= 50) return 'bg-success/60';
    if (rate >= 30) return 'bg-yellow-500';
    if (rate >= 10) return 'bg-danger/60';
    return 'bg-danger/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">进度分析</h1>
        <p className="text-text-secondary mt-1">全面了解你的学习情况和进步趋势</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{averageScore}</p>
              <p className="text-sm text-text-muted">平均成绩</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{streakDays}</p>
              <p className="text-sm text-text-muted">连续学习</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-danger/10">
              <AlertTriangle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{wrongNotes.length}</p>
              <p className="text-sm text-text-muted">错题总数</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <Target className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{questions.length}</p>
              <p className="text-sm text-text-muted">题库总量</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>成绩趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {scoreTrend.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#F8FAFC' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366F1"
                      strokeWidth={2}
                      dot={{ fill: '#6366F1', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-text-muted">暂无模拟考试记录</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>各专题错误率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicErrorRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="label"
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '错误率']}
                  />
                  <Bar dataKey="errorRate" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>掌握程度热图</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {['入门', '中等', '竞赛级'].map((diff) => (
              <div key={diff} className="text-center text-sm text-text-muted mb-2">
                {diff}
              </div>
            ))}
            {['数论', '组合', '代数', '几何'].map((topic) =>
              ['入门', '中等', '竞赛级'].map((diff) => {
                const data = heatmapData.find(
                  (d) => d.topic === topic && d.difficulty === diff
                );
                const rate = getMasteryRate(data?.mastered || 0, data?.total || 0);
                return (
                  <div key={`${topic}-${diff}`} className="text-center">
                    <div
                      className={`w-full aspect-square rounded-lg ${getHeatmapColor(rate)} flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-sm">
                        {data?.total > 0 ? `${rate}%` : '-'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">{topic}</p>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-danger/30" />
              <span className="text-xs text-text-muted">0-10%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-danger/60" />
              <span className="text-xs text-text-muted">10-30%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs text-text-muted">30-50%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success/60" />
              <span className="text-xs text-text-muted">50-80%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-xs text-text-muted">80-100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>差距分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-background-hover rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-primary font-medium">目标竞赛水平</span>
                <span className="text-primary font-bold">CMO</span>
              </div>
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-success rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-sm text-text-muted mt-2">距离目标还需强化几何和数论的高难度题目</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/training/reinforce')}>
                针对性训练
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => navigate('/errors')}>
                复习错题
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
