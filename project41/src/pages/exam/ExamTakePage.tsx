import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { QuestionType, AnswerSubmit, ExamStartResult } from '@/types';
import Button from '@/components/Button';

const typeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  programming: '编程题',
};

export default function ExamTakePage() {
  const navigate = useNavigate();
  const { examId } = useParams<{ examId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamStartResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (examId && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startExam();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        examApi.logEvent(parseInt(examId || '0'), 'tab_switch', { count: newCount });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft > 0]);

  useEffect(() => {
    if (examData && Object.keys(answers).length > 0) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraft();
      }, 30000);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [answers]);

  const startExam = async () => {
    if (!examId) return;
    try {
      const result: any = await examApi.startExam(parseInt(examId));
      setExamData(result);
      setAnswers(result.savedAnswers || {});
      setTimeLeft(result.duration * 60);
    } catch (err: any) {
      alert(err.message || '无法开始考试');
      navigate('/exam/my-exams');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = useCallback(async () => {
    if (!examId || !examData) return;
    try {
      const answerList: AnswerSubmit[] = Object.entries(answers).map(([qid, ans]) => ({
        questionId: parseInt(qid),
        answer: ans,
      }));
      await examApi.saveDraft(parseInt(examId), answerList);
      setLastSaveTime(new Date());
    } catch (err) {
      console.error('草稿保存失败:', err);
    }
  }, [examId, answers, examData]);

  const handleAutoSubmit = () => {
    if (examData && !isSubmitting) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!examId || !examData) return;
    setIsSubmitting(true);

    try {
      const answerList: AnswerSubmit[] = Object.entries(answers).map(([qid, ans]) => ({
        questionId: parseInt(qid),
        answer: ans,
      }));

      const result: any = await examApi.submitExam(parseInt(examId), answerList);
      navigate(`/exam/result/${result.submissionId}`);
    } catch (err: any) {
      alert(err.message || '提交失败');
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getAnswerProgress = () => {
    if (!examData) return { answered: 0, total: 0 };
    const total = examData.questions.length;
    const answered = examData.questions.filter(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '').length;
    return { answered, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">加载考试中...</div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">无法加载考试数据</div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const progress = getAnswerProgress();
  const isTimeWarning = timeLeft < 300;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">{examData.title}</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">答题进度:</span>
                <span className="text-sm font-medium text-gray-900">
                  {progress.answered} / {progress.total}
                </span>
              </div>
              <div className={`flex items-center space-x-2 ${isTimeWarning ? 'text-red-600' : 'text-gray-900'}`}>
                <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              {tabSwitchCount > 0 && (
                <div className="text-sm text-red-600">
                  已切换标签页 {tabSwitchCount} 次
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-20">
              <h3 className="text-sm font-medium text-gray-700 mb-3">题目导航</h3>
              <div className="grid grid-cols-5 gap-2">
                {examData.questions.map((q, idx) => {
                  const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== '';
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : hasAnswer
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></span>
                    已答
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></span>
                    未答
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {typeLabels[currentQuestion.type]}
                </span>
                <span className="text-sm text-gray-500">
                  第 {currentQuestionIndex + 1} 题 / 共 {examData.questions.length} 题
                </span>
                <span className="text-sm text-gray-500 ml-auto">
                  分值: {currentQuestion.score} 分
                </span>
              </div>

              <div className="prose max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: currentQuestion.title }} />
              </div>

              <div className="border-t border-gray-200 pt-6">
                {currentQuestion.type === 'single_choice' && (
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          answers[currentQuestion.id] === idx
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id] === idx}
                          onChange={() => handleAnswerChange(currentQuestion.id, idx)}
                          className="mr-3"
                        />
                        <span className="font-medium mr-2">{opt}.</span>
                        <span>选项 {opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'multiple_choice' && (
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((opt, idx) => {
                      const selected = (answers[currentQuestion.id] || []).includes(idx);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            selected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const current = (answers[currentQuestion.id] || []) as number[];
                              if (selected) {
                                handleAnswerChange(currentQuestion.id, current.filter(i => i !== idx));
                              } else {
                                handleAnswerChange(currentQuestion.id, [...current, idx]);
                              }
                            }}
                            className="mr-3"
                          />
                          <span className="font-medium mr-2">{opt}.</span>
                          <span>选项 {opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'true_false' && (
                  <div className="flex gap-4">
                    {[true, false].map((val) => (
                      <label
                        key={val ? 'true' : 'false'}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors flex-1 justify-center ${
                          answers[currentQuestion.id] === val
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQuestion.id}`}
                          checked={answers[currentQuestion.id] === val}
                          onChange={() => handleAnswerChange(currentQuestion.id, val)}
                          className="mr-2"
                        />
                        <span className="font-medium">{val ? '正确' : '错误'}</span>
                      </label>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'fill_blank' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-2">请在下方输入答案：</p>
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="输入您的答案..."
                    />
                  </div>
                )}

                {currentQuestion.type === 'short_answer' && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="请输入您的答案..."
                    />
                  </div>
                )}

                {currentQuestion.type === 'programming' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">编程语言:</span>
                      <span className="text-sm font-medium">{currentQuestion.language || 'Python'}</span>
                    </div>
                    <textarea
                      value={answers[currentQuestion.id] || currentQuestion.templateCode || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={16}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder="请编写您的代码..."
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                上一题
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={saveDraft}
                >
                  保存草稿
                  {lastSaveTime && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({lastSaveTime.toLocaleTimeString()})
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                >
                  交卷
                </Button>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentQuestionIndex(Math.min(examData.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === examData.questions.length - 1}
              >
                下一题
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">确认交卷</h3>
            <p className="text-gray-600 mb-2">
              您已完成 <span className="font-medium">{progress.answered}</span> / <span className="font-medium">{progress.total}</span> 道题目
            </p>
            {progress.answered < progress.total && (
              <p className="text-amber-600 text-sm mb-4">
                还有 {progress.total - progress.answered} 道题目未作答，确定要交卷吗？
              </p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                继续答题
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? '提交中...' : '确认交卷'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
