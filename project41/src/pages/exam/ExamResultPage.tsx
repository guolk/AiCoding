import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { SubmissionDetail, QuestionResult, QuestionType } from '@/types';
import Button from '@/components/Button';

const typeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  programming: '编程题',
};

export default function ExamResultPage() {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [expandedQid, setExpandedQid] = useState<number | null>(null);

  useEffect(() => {
    if (submissionId) {
      loadResult();
    }
  }, [submissionId]);

  const loadResult = async () => {
    if (!submissionId) return;
    try {
      const result: any = await examApi.getSubmission(parseInt(submissionId));
      setSubmission(result);
    } catch (err: any) {
      alert(err.message || '加载结果失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载成绩中...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">无法找到成绩记录</div>
      </div>
    );
  }

  const totalScore = submission.results.reduce((sum, r) => sum + r.score, 0);
  const maxScore = submission.results.reduce((sum, r) => sum + r.maxScore, 0);
  const correctCount = submission.results.filter(r => r.isCorrect === true).length;
  const incorrectCount = submission.results.filter(r => r.isCorrect === false).length;
  const pendingCount = submission.results.filter(r => r.isCorrect === null || r.isCorrect === undefined).length;

  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const isPassed = percentage >= 60;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">考试成绩</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-xl p-8 mb-8 ${isPassed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-center">
            <div className="text-6xl mb-4">{isPassed ? '🎉' : '📋'}</div>
            <h2 className={`text-3xl font-bold mb-2 ${isPassed ? 'text-green-700' : 'text-red-700'}`}>
              {isPassed ? '恭喜通过' : '成绩详情'}
            </h2>
            <div className="flex justify-center items-baseline gap-2 mb-4">
              <span className="text-5xl font-bold text-gray-900">
                {totalScore.toFixed(1)}
              </span>
              <span className="text-2xl text-gray-500">/ {maxScore}</span>
              <span className="text-xl text-gray-500 ml-2">
                ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-center gap-8 text-sm text-gray-600">
              <div>
                <span className="font-medium text-green-600">{correctCount}</span> 题正确
              </div>
              <div>
                <span className="font-medium text-red-600">{incorrectCount}</span> 题错误
              </div>
              {pendingCount > 0 && (
                <div>
                  <span className="font-medium text-amber-600">{pendingCount}</span> 题待批阅
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">答题详情</h3>
          <div className="space-y-4">
            {submission.results.map((result, idx) => (
              <div
                key={result.questionId}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedQid(
                    expandedQid === result.questionId ? null : result.questionId
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      result.isCorrect === true
                        ? 'bg-green-100 text-green-800'
                        : result.isCorrect === false
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded mr-2">
                        {typeLabels[result.questionType]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {result.score.toFixed(1)} / {result.maxScore} 分
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {result.isCorrect === true && (
                      <span className="text-green-600 text-sm">✓ 正确</span>
                    )}
                    {result.isCorrect === false && (
                      <span className="text-red-600 text-sm">✗ 错误</span>
                    )}
                    {result.isCorrect === null || result.isCorrect === undefined ? (
                      <span className="text-amber-600 text-sm">待批阅</span>
                    ) : null}
                    <span className="text-gray-400">
                      {expandedQid === result.questionId ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {expandedQid === result.questionId && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">您的答案</label>
                        <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm">
                          {typeof result.userAnswer === 'object'
                            ? JSON.stringify(result.userAnswer, null, 2)
                            : String(result.userAnswer) || '(未作答)'}
                        </div>
                      </div>

                      {result.correctAnswer !== undefined && result.correctAnswer !== null && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">正确答案</label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                            {typeof result.correctAnswer === 'object'
                              ? JSON.stringify(result.correctAnswer, null, 2)
                              : String(result.correctAnswer)}
                          </div>
                        </div>
                      )}

                      {result.manualComment && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">批阅评语</label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                            {result.manualComment}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Link to="/exam/my-exams">
            <Button>返回我的考试</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
