import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { SubmissionDetail, QuestionType } from '@/types';
import Button from '@/components/Button';

const typeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  programming: '编程题',
};

interface SubmissionListItem {
  id: number;
  examId: number;
  userId: number;
  username: string;
  realName?: string;
  status: string;
  totalScore?: number;
  submittedAt?: string;
}

export default function GradingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examIdParam = searchParams.get('examId');

  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(
    examIdParam ? parseInt(examIdParam) : null
  );

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadSubmissions();
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const result: any = await examApi.getExams({ page: 1, pageSize: 100, status: 'ended' });
      setExams(result.items || []);
      if (!selectedExamId && result.items?.length > 0) {
        setSelectedExamId(result.items[0].id);
      }
    } catch (err) {
      console.error('加载考试列表失败:', err);
    }
  };

  const loadSubmissions = async () => {
    if (!selectedExamId) return;
    setLoading(true);
    try {
      const result: any = await examApi.getExamSubmissions(selectedExamId);
      setSubmissions(result || []);
    } catch (err) {
      console.error('加载答卷列表失败:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionDetail = async (submissionId: number) => {
    try {
      const result: any = await examApi.getSubmission(submissionId);
      setSelectedSubmission(result);
    } catch (err: any) {
      alert(err.message || '加载答卷详情失败');
    }
  };

  const handleGrade = async (questionId: number, score: number, comment?: string) => {
    if (!selectedSubmission) return;
    setSaving(true);
    try {
      await examApi.manualGrade({
        submissionId: selectedSubmission.id,
        questionId,
        score,
        comment,
      });
      await loadSubmissionDetail(selectedSubmission.id);
    } catch (err: any) {
      alert(err.message || '评分失败');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedSubmission) return;
    if (!confirm('确定要完成批阅吗？完成后将无法修改评分。')) return;
    
    try {
      await examApi.finalizeGrading(selectedSubmission.id);
      await loadSubmissionDetail(selectedSubmission.id);
    } catch (err: any) {
      alert(err.message || '完成批阅失败');
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/exam/dashboard" className="text-gray-500 hover:text-gray-700 mr-4">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-900">手动评分</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">选择考试:</label>
            <select
              value={selectedExamId || ''}
              onChange={(e) => setSelectedExamId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[300px]"
            >
              <option value="">请选择考试</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
              <h3 className="text-sm font-medium text-gray-700 mb-3">答卷列表</h3>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无答卷</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => loadSubmissionDetail(sub.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSubmission?.id === sub.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {sub.realName || sub.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '未提交'}
                          </div>
                        </div>
                        <div className="text-right">
                          {sub.totalScore !== undefined && sub.totalScore !== null ? (
                            <span className={`font-bold ${getScoreColor(sub.totalScore, 100)}`}>
                              {sub.totalScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className={`text-sm px-2 py-0.5 rounded ${
                              sub.status === 'submitted'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {sub.status === 'submitted' ? '待批阅' : '已批阅'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedSubmission.results[0]?.userAnswer ? '查看答卷' : '查看答卷'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      考生: {submissions.find(s => s.id === selectedSubmission.id)?.realName || 
                        submissions.find(s => s.id === selectedSubmission.id)?.username}
                    </p>
                  </div>
                  {selectedSubmission.status !== 'graded' && (
                    <Button type="button" onClick={handleFinalize} disabled={saving}>
                      完成批阅
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedSubmission.results.map((result, idx) => {
                    const needsGrading = result.isCorrect === null || result.isCorrect === undefined;
                    const [localScore, setLocalScore] = useState(result.score);
                    const [localComment, setLocalComment] = useState(result.manualComment || '');

                    return (
                      <div key={result.questionId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded mr-2">
                                {typeLabels[result.questionType]}
                              </span>
                              <span className="text-sm text-gray-500">满分: {result.maxScore} 分</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-lg font-bold ${
                              needsGrading ? 'text-amber-600' : getScoreColor(result.score, result.maxScore)
                            }`}>
                              {result.score.toFixed(1)} 分
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">考生答案</label>
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm whitespace-pre-wrap font-mono">
                              {typeof result.userAnswer === 'object'
                                ? JSON.stringify(result.userAnswer, null, 2)
                                : String(result.userAnswer) || '(未作答)'}
                            </div>
                          </div>

                          {result.correctAnswer !== undefined && result.correctAnswer !== null && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">参考答案</label>
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm whitespace-pre-wrap font-mono">
                                {typeof result.correctAnswer === 'object'
                                  ? JSON.stringify(result.correctAnswer, null, 2)
                                  : String(result.correctAnswer)}
                              </div>
                            </div>
                          )}

                          {needsGrading && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max={result.maxScore}
                                      step="0.5"
                                      value={localScore}
                                      onChange={(e) => setLocalScore(parseFloat(e.target.value) || 0)}
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <span className="text-gray-500">/ {result.maxScore}</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">评语</label>
                                  <input
                                    type="text"
                                    value={localComment}
                                    onChange={(e) => setLocalComment(e.target.value)}
                                    placeholder="输入评语（可选）"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                              </div>
                              <div className="mt-3">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleGrade(result.questionId, localScore, localComment)}
                                  disabled={saving}
                                >
                                  {saving ? '保存中...' : '保存评分'}
                                </Button>
                              </div>
                            </div>
                          )}

                          {!needsGrading && result.manualComment && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">批阅评语</label>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                {result.manualComment}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-500">请从左侧选择一份答卷进行批阅</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
