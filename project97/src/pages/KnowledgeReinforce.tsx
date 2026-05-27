import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useQuestionStore } from '../stores/questionStore';
import { useWrongNoteStore } from '../stores/wrongNoteStore';
import { useProgressAnalysis } from '../stores/progressStore';

export function KnowledgeReinforce() {
  const navigate = useNavigate();
  const { questions } = useQuestionStore();
  const { wrongNotes } = useWrongNoteStore();
  const { getTopicErrorRates } = useProgressAnalysis();

  const topicErrorRates = getTopicErrorRates();

  const weakTopics = topicErrorRates
    .filter((t) => t.errorRate > 20)
    .sort((a, b) => b.errorRate - a.errorRate);

  const topicLabels: Record<string, string> = {
    number_theory: '数论',
    combinatorics: '组合',
    algebra: '代数',
    geometry: '几何',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/training')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">知识强化训练</h1>
          <p className="text-text-secondary mt-1">针对薄弱知识点进行专项训练</p>
        </div>
      </div>

      {weakTopics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakTopics.map((topic) => {
            const topicQuestions = questions.filter((q) => q.topic === topic.topic);
            const weakQuestionIds = wrongNotes
              .filter((n) => topicQuestions.some((q) => q.id === n.questionId))
              .map((n) => n.questionId);

            return (
              <Card key={topic.topic}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-danger" />
                    {topicLabels[topic.topic]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">错误率</span>
                    <span className="text-danger font-bold">{topic.errorRate.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-background-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full"
                      style={{ width: `${topic.errorRate}%` }}
                    />
                  </div>
                  <p className="text-sm text-text-muted">
                    错题数量: {weakQuestionIds.length} / 题目总数: {topicQuestions.length}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/training/daily?topic=${topic.topic}`)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    开始训练
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="w-12 h-12 text-success mx-auto mb-4" />
            <p className="text-text-primary font-medium">暂无薄弱知识点</p>
            <p className="text-text-muted text-sm mt-1">继续保持良好的学习状态！</p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/training/daily')}>
              去刷题
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>所有专题概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topicErrorRates.map((topic) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-3 bg-background-hover rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Brain className={`w-5 h-5 ${topic.errorRate > 20 ? 'text-danger' : 'text-success'}`} />
                  <span className="text-text-primary font-medium">
                    {topicLabels[topic.topic]}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-muted">
                    错误率 {topic.errorRate.toFixed(1)}%
                  </span>
                  <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${topic.errorRate > 20 ? 'bg-danger' : 'bg-success'}`}
                      style={{ width: `${Math.min(topic.errorRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
