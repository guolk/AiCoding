import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { Question, QuestionType, RandomRule, PaperMode } from '@/types';
import Button from '@/components/Button';

const typeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  programming: '编程题',
};

interface SelectedQuestion {
  questionId: number;
  title: string;
  type: QuestionType;
  score: number;
}

export default function PaperCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mode: 'manual' as PaperMode,
    tags: '',
    selectedQuestions: [] as SelectedQuestion[],
    randomRules: [{
      questionType: 'single_choice' as QuestionType,
      count: 5,
      difficulty: '' as '' | 'easy' | 'medium' | 'hard',
      tags: '',
      scorePerQuestion: 2,
    }],
  });

  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [questionFilter, setQuestionFilter] = useState({
    type: '',
    difficulty: '',
    search: '',
  });

  useEffect(() => {
    if (formData.mode === 'manual') {
      loadAvailableQuestions();
    }
  }, [questionFilter]);

  const loadAvailableQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const params: any = { page: 1, pageSize: 100 };
      if (questionFilter.type) params.type = questionFilter.type;
      if (questionFilter.difficulty) params.difficulty = questionFilter.difficulty;
      if (questionFilter.search) params.search = questionFilter.search;

      const result: any = await examApi.getQuestions(params);
      const selectedIds = formData.selectedQuestions.map(q => q.questionId);
      setAvailableQuestions((result.items || []).filter((q: Question) => !selectedIds.includes(q.id)));
    } catch (err) {
      console.error('加载题目失败:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const toggleQuestion = (q: Question) => {
    const exists = formData.selectedQuestions.find(sq => sq.questionId === q.id);
    if (exists) {
      setFormData({
        ...formData,
        selectedQuestions: formData.selectedQuestions.filter(sq => sq.questionId !== q.id)
      });
    } else {
      setFormData({
        ...formData,
        selectedQuestions: [
          ...formData.selectedQuestions,
          {
            questionId: q.id,
            title: q.title,
            type: q.type,
            score: q.score,
          }
        ]
      });
    }
  };

  const updateQuestionScore = (questionId: number, score: number) => {
    setFormData({
      ...formData,
      selectedQuestions: formData.selectedQuestions.map(q =>
        q.questionId === questionId ? { ...q, score } : q
      )
    });
  };

  const removeQuestion = (questionId: number) => {
    setFormData({
      ...formData,
      selectedQuestions: formData.selectedQuestions.filter(q => q.questionId !== questionId)
    });
  };

  const updateRandomRule = (index: number, field: string, value: any) => {
    const newRules = [...formData.randomRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFormData({ ...formData, randomRules: newRules });
  };

  const addRandomRule = () => {
    setFormData({
      ...formData,
      randomRules: [
        ...formData.randomRules,
        {
          questionType: 'single_choice' as QuestionType,
          count: 5,
          difficulty: '' as '' | 'easy' | 'medium' | 'hard',
          tags: '',
          scorePerQuestion: 2,
        }
      ]
    });
  };

  const removeRandomRule = (index: number) => {
    if (formData.randomRules.length > 1) {
      setFormData({
        ...formData,
        randomRules: formData.randomRules.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data: any = {
        title: formData.title,
        description: formData.description,
        mode: formData.mode,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (formData.mode === 'manual') {
        data.questions = formData.selectedQuestions.map(q => ({
          questionId: q.questionId,
          score: q.score,
        }));
      } else {
        data.randomRules = formData.randomRules.map(r => ({
          questionType: r.questionType,
          count: r.count,
          difficulty: r.difficulty || undefined,
          tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
          scorePerQuestion: r.scorePerQuestion,
        }));
      }

      await examApi.createPaper(data);
      navigate('/exam/papers');
    } catch (err: any) {
      alert(err.message || '创建失败');
    } finally {
      setSaving(false);
    }
  };

  const totalScore = formData.mode === 'manual'
    ? formData.selectedQuestions.reduce((sum, q) => sum + q.score, 0)
    : formData.randomRules.reduce((sum, r) => sum + r.count * r.scorePerQuestion, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/exam/papers" className="text-gray-500 hover:text-gray-700 mr-4">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-900">新建试卷</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">试卷名称 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入试卷名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">组卷模式</label>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as PaperMode })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="manual">手动选题</option>
                  <option value="random">随机抽题</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">试卷描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="试卷描述（可选）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="例如: 期中测试, 高等数学"
              />
            </div>
          </div>

          {formData.mode === 'manual' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">题库选题</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="搜索题目..."
                    value={questionFilter.search}
                    onChange={(e) => setQuestionFilter({ ...questionFilter, search: e.target.value })}
                    className="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <select
                    value={questionFilter.type}
                    onChange={(e) => setQuestionFilter({ ...questionFilter, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">所有题型</option>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <select
                    value={questionFilter.difficulty}
                    onChange={(e) => setQuestionFilter({ ...questionFilter, difficulty: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">所有难度</option>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {loadingQuestions ? (
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                  ) : availableQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">暂无可用题目</div>
                  ) : (
                    availableQuestions.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestion(q)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-1">
                              <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                {typeLabels[q.type]}
                              </span>
                              <span className="text-xs text-gray-500">{q.score}分</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.title }} />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">已选题目</h2>
                <p className="text-sm text-gray-500 mb-4">
                  共 {formData.selectedQuestions.length} 道题，总分 {totalScore} 分
                </p>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {formData.selectedQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">请从左侧选择题目</div>
                  ) : (
                    formData.selectedQuestions.map((q, index) => (
                      <div key={q.questionId} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-700">{index + 1}.</span>
                              <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                                {typeLabels[q.type]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{q.title}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={q.score}
                              onChange={(e) => updateQuestionScore(q.questionId, parseFloat(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.questionId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.mode === 'random' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">抽题规则</h2>
                <span className="text-sm text-gray-500">预计总分: {totalScore} 分</span>
              </div>

              <div className="space-y-4">
                {formData.randomRules.map((rule, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">规则 {index + 1}</span>
                      {formData.randomRules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRandomRule(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          删除
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">题型</label>
                        <select
                          value={rule.questionType}
                          onChange={(e) => updateRandomRule(index, 'questionType', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          {Object.entries(typeLabels).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">题数</label>
                        <input
                          type="number"
                          min="1"
                          value={rule.count}
                          onChange={(e) => updateRandomRule(index, 'count', parseInt(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">每题分数</label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={rule.scorePerQuestion}
                          onChange={(e) => updateRandomRule(index, 'scorePerQuestion', parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">难度</label>
                        <select
                          value={rule.difficulty}
                          onChange={(e) => updateRandomRule(index, 'difficulty', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          <option value="">不限</option>
                          <option value="easy">简单</option>
                          <option value="medium">中等</option>
                          <option value="hard">困难</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">标签</label>
                        <input
                          type="text"
                          placeholder="可选"
                          value={rule.tags}
                          onChange={(e) => updateRandomRule(index, 'tags', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRandomRule}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                + 添加抽题规则
              </button>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link to="/exam/papers">
              <Button type="button" variant="secondary">取消</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? '创建中...' : '创建试卷'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
