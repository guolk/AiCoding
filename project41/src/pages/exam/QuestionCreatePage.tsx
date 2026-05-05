import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { QuestionType, DifficultyLevel, Question } from '@/types';
import Button from '@/components/Button';

const typeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  programming: '编程题',
};

export default function QuestionCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'single_choice' as QuestionType,
    difficulty: 'medium' as DifficultyLevel,
    score: 1,
    explanation: '',
    tags: '' as string,
    knowledgePoints: '' as string,
    singleChoice: {
      options: ['', '', '', ''],
      correctAnswer: 0,
    },
    multipleChoice: {
      options: ['', '', '', ''],
      correctAnswers: [] as number[],
    },
    trueFalse: {
      correctAnswer: true,
    },
    fillBlank: {
      blanks: [{ answer: '', hint: '' }],
    },
    shortAnswer: {
      referenceAnswer: '',
    },
    programming: {
      language: 'python',
      templateCode: '',
      testCases: [{ input: '', expectedOutput: '', hidden: false }],
      timeLimit: 5000,
      memoryLimit: 256,
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      loadQuestion(parseInt(id));
    }
  }, [id, isEdit]);

  const loadQuestion = async (questionId: number) => {
    setLoading(true);
    try {
      const q: any = await examApi.getQuestion(questionId);
      const qData = q.questionData || {};

      setFormData({
        title: q.title,
        type: q.type,
        difficulty: q.difficulty,
        score: q.score,
        explanation: q.explanation || '',
        tags: q.tags?.join(', ') || '',
        knowledgePoints: q.knowledgePoints?.join(', ') || '',
        singleChoice: {
          options: qData.options || ['', '', '', ''],
          correctAnswer: qData.correctAnswer ?? 0,
        },
        multipleChoice: {
          options: qData.options || ['', '', '', ''],
          correctAnswers: qData.correctAnswers || [],
        },
        trueFalse: {
          correctAnswer: qData.correctAnswer ?? true,
        },
        fillBlank: {
          blanks: qData.blanks || [{ answer: '', hint: '' }],
        },
        shortAnswer: {
          referenceAnswer: qData.referenceAnswer || '',
        },
        programming: {
          language: qData.language || 'python',
          templateCode: qData.templateCode || '',
          testCases: qData.testCases || [{ input: '', expectedOutput: '', hidden: false }],
          timeLimit: qData.timeLimit || 5000,
          memoryLimit: qData.memoryLimit || 256,
        },
      });
    } catch (err: any) {
      alert(err.message || '加载题目失败');
      navigate('/exam/questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let questionData: Record<string, any> = {};

      switch (formData.type) {
        case 'single_choice':
          questionData = {
            options: formData.singleChoice.options.filter(o => o.trim()),
            correctAnswer: formData.singleChoice.correctAnswer,
          };
          break;
        case 'multiple_choice':
          questionData = {
            options: formData.multipleChoice.options.filter(o => o.trim()),
            correctAnswers: formData.multipleChoice.correctAnswers,
          };
          break;
        case 'true_false':
          questionData = {
            correctAnswer: formData.trueFalse.correctAnswer,
          };
          break;
        case 'fill_blank':
          questionData = {
            blanks: formData.fillBlank.blanks.filter(b => b.answer.trim()),
          };
          break;
        case 'short_answer':
          questionData = {
            referenceAnswer: formData.shortAnswer.referenceAnswer,
          };
          break;
        case 'programming':
          questionData = {
            language: formData.programming.language,
            templateCode: formData.programming.templateCode,
            testCases: formData.programming.testCases.filter(t => t.input || t.expectedOutput),
            timeLimit: formData.programming.timeLimit,
            memoryLimit: formData.programming.memoryLimit,
          };
          break;
      }

      const data = {
        title: formData.title,
        type: formData.type,
        difficulty: formData.difficulty,
        score: formData.score,
        explanation: formData.explanation,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        knowledge_points: formData.knowledgePoints.split(',').map(t => t.trim()).filter(Boolean),
        question_data: questionData,
      };

      if (isEdit && id) {
        await examApi.updateQuestion(parseInt(id), data);
      } else {
        await examApi.createQuestion(data);
      }

      navigate('/exam/questions');
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/exam/questions" className="text-gray-500 hover:text-gray-700 mr-4">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {isEdit ? '编辑题目' : '新建题目'}
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目类型</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分值</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">题目内容（支持HTML）</label>
              <textarea
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="请输入题目内容，支持HTML标签"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 数学, 代数, 函数"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">知识点（逗号分隔）</label>
                <input
                  type="text"
                  value={formData.knowledgePoints}
                  onChange={(e) => setFormData({ ...formData, knowledgePoints: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: 一元二次方程, 因式分解"
                />
              </div>
            </div>
          </div>

          {formData.type === 'single_choice' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">单选题选项</h2>
              <div className="space-y-3">
                {formData.singleChoice.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="correct"
                        checked={formData.singleChoice.correctAnswer === idx}
                        onChange={() => setFormData({
                          ...formData,
                          singleChoice: { ...formData.singleChoice, correctAnswer: idx }
                        })}
                        className="mr-2"
                      />
                      <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.singleChoice.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, singleChoice: { ...formData.singleChoice, options: newOptions } });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="选项内容"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  singleChoice: { ...formData.singleChoice, options: [...formData.singleChoice.options, ''] }
                })}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                + 添加选项
              </button>
            </div>
          )}

          {formData.type === 'multiple_choice' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">多选题选项（可多选）</h2>
              <div className="space-y-3">
                {formData.multipleChoice.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.multipleChoice.correctAnswers.includes(idx)}
                        onChange={(e) => {
                          const newAnswers = e.target.checked
                            ? [...formData.multipleChoice.correctAnswers, idx]
                            : formData.multipleChoice.correctAnswers.filter(i => i !== idx);
                          setFormData({
                            ...formData,
                            multipleChoice: { ...formData.multipleChoice, correctAnswers: newAnswers }
                          });
                        }}
                        className="mr-2"
                      />
                      <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.multipleChoice.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, multipleChoice: { ...formData.multipleChoice, options: newOptions } });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="选项内容"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  multipleChoice: { ...formData.multipleChoice, options: [...formData.multipleChoice.options, ''] }
                })}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                + 添加选项
              </button>
            </div>
          )}

          {formData.type === 'true_false' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">正确答案</h2>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tfAnswer"
                    checked={formData.trueFalse.correctAnswer === true}
                    onChange={() => setFormData({
                      ...formData,
                      trueFalse: { correctAnswer: true }
                    })}
                    className="mr-2"
                  />
                  <span>正确</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tfAnswer"
                    checked={formData.trueFalse.correctAnswer === false}
                    onChange={() => setFormData({
                      ...formData,
                      trueFalse: { correctAnswer: false }
                    })}
                    className="mr-2"
                  />
                  <span>错误</span>
                </label>
              </div>
            </div>
          )}

          {formData.type === 'fill_blank' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">填空答案（用{{}}在题目中标记空位）</h2>
              <div className="space-y-4">
                {formData.fillBlank.blanks.map((blank, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700">空 {idx + 1}</span>
                      {formData.fillBlank.blanks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newBlanks = formData.fillBlank.blanks.filter((_, i) => i !== idx);
                            setFormData({ ...formData, fillBlank: { blanks: newBlanks } });
                          }}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          删除
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={blank.answer}
                      onChange={(e) => {
                        const newBlanks = [...formData.fillBlank.blanks];
                        newBlanks[idx] = { ...newBlanks[idx], answer: e.target.value };
                        setFormData({ ...formData, fillBlank: { blanks: newBlanks } });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder="正确答案（支持多个答案用|分隔）"
                    />
                    <input
                      type="text"
                      value={blank.hint}
                      onChange={(e) => {
                        const newBlanks = [...formData.fillBlank.blanks];
                        newBlanks[idx] = { ...newBlanks[idx], hint: e.target.value };
                        setFormData({ ...formData, fillBlank: { blanks: newBlanks } });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="提示（可选）"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  fillBlank: { blanks: [...formData.fillBlank.blanks, { answer: '', hint: '' }] }
                })}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700"
              >
                + 添加空
              </button>
            </div>
          )}

          {formData.type === 'short_answer' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">参考答案（供批阅参考）</h2>
              <textarea
                value={formData.shortAnswer.referenceAnswer}
                onChange={(e) => setFormData({
                  ...formData,
                  shortAnswer: { referenceAnswer: e.target.value }
                })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="输入参考答案..."
              />
            </div>
          )}

          {formData.type === 'programming' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">编程题设置</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">编程语言</label>
                  <select
                    value={formData.programming.language}
                    onChange={(e) => setFormData({
                      ...formData,
                      programming: { ...formData.programming, language: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时间限制 (ms)</label>
                  <input
                    type="number"
                    value={formData.programming.timeLimit}
                    onChange={(e) => setFormData({
                      ...formData,
                      programming: { ...formData.programming, timeLimit: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内存限制 (MB)</label>
                  <input
                    type="number"
                    value={formData.programming.memoryLimit}
                    onChange={(e) => setFormData({
                      ...formData,
                      programming: { ...formData.programming, memoryLimit: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">代码模板（可选）</label>
                <textarea
                  value={formData.programming.templateCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    programming: { ...formData.programming, templateCode: e.target.value }
                  })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="例如: def solution():\n    pass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">测试用例</label>
                <div className="space-y-3">
                  {formData.programming.testCases.map((tc, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">测试用例 {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center text-sm">
                            <input
                              type="checkbox"
                              checked={tc.hidden}
                              onChange={(e) => {
                                const newTCs = [...formData.programming.testCases];
                                newTCs[idx] = { ...newTCs[idx], hidden: e.target.checked };
                                setFormData({ ...formData, programming: { ...formData.programming, testCases: newTCs } });
                              }}
                              className="mr-1"
                            />
                            隐藏
                          </label>
                          {formData.programming.testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newTCs = formData.programming.testCases.filter((_, i) => i !== idx);
                                setFormData({ ...formData, programming: { ...formData.programming, testCases: newTCs } });
                              }}
                              className="text-red-500 text-sm hover:text-red-700"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">输入</label>
                          <textarea
                            value={tc.input}
                            onChange={(e) => {
                              const newTCs = [...formData.programming.testCases];
                              newTCs[idx] = { ...newTCs[idx], input: e.target.value };
                              setFormData({ ...formData, programming: { ...formData.programming, testCases: newTCs } });
                            }}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">期望输出</label>
                          <textarea
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              const newTCs = [...formData.programming.testCases];
                              newTCs[idx] = { ...newTCs[idx], expectedOutput: e.target.value };
                              setFormData({ ...formData, programming: { ...formData.programming, testCases: newTCs } });
                            }}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    programming: {
                      ...formData.programming,
                      testCases: [...formData.programming.testCases, { input: '', expectedOutput: '', hidden: false }]
                    }
                  })}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                >
                  + 添加测试用例
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">答案解析（可选）</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入答案解析..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/exam/questions">
              <Button type="button" variant="secondary">取消</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : (isEdit ? '保存修改' : '创建题目')}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
