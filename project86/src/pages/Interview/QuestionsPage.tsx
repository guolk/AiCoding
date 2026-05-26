import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { InterviewQuestion } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, MessageSquare, Search, Filter, BookOpen, Star, Clock, Copy, Check, Shuffle } from 'lucide-react';
import { generateId } from '../../utils/storage';

const QuestionsPage: React.FC = () => {
  const { state, updateInterviewQuestion, deleteInterviewQuestion } = useAppContext();
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMastery, setFilterMastery] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [randomQuestion, setRandomQuestion] = useState<InterviewQuestion | null>(null);
  const [showRandomAnswer, setShowRandomAnswer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allCategories = Array.from(new Set(state.interviewQuestions.map(q => q.category)));

  const filteredQuestions = state.interviewQuestions.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    if (filterMastery !== 'all') {
      const mastery = parseInt(filterMastery);
      if (mastery === 0 && q.mastery < 50) return true;
      if (mastery === 50 && q.mastery >= 50 && q.mastery < 80) return true;
      if (mastery === 80 && q.mastery >= 80) return true;
      return false;
    }
    if (searchQuery && !q.question.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !q.answer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSaveQuestion = (questionData: Partial<InterviewQuestion>) => {
    if (editingQuestion) {
      updateInterviewQuestion({ ...editingQuestion, ...questionData } as InterviewQuestion);
    } else {
      const newQuestion: InterviewQuestion = {
        id: generateId(),
        category: questionData.category || '',
        question: questionData.question || '',
        answer: questionData.answer || '',
        mastery: questionData.mastery || 50,
        lastReviewed: new Date().toISOString().split('T')[0],
      };
      updateInterviewQuestion(newQuestion);
    }
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    deleteInterviewQuestion(id);
    if (selectedQuestion?.id === id) {
      setSelectedQuestion(null);
    }
  };

  const handleMasteryChange = (question: InterviewQuestion, mastery: number) => {
    const updatedQuestion = { 
      ...question, 
      mastery, 
      lastReviewed: new Date().toISOString().split('T')[0] 
    };
    updateInterviewQuestion(updatedQuestion);
    if (selectedQuestion?.id === question.id) {
      setSelectedQuestion(updatedQuestion);
    }
  };

  const handleCopyAnswer = (answer: string, id: string) => {
    navigator.clipboard.writeText(answer);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * state.interviewQuestions.length);
    setRandomQuestion(state.interviewQuestions[randomIndex]);
    setShowRandomAnswer(false);
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-green-600';
    if (mastery >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getMasteryBgColor = (mastery: number) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const stats = {
    total: state.interviewQuestions.length,
    mastered: state.interviewQuestions.filter(q => q.mastery >= 80).length,
    learning: state.interviewQuestions.filter(q => q.mastery >= 50 && q.mastery < 80).length,
    weak: state.interviewQuestions.filter(q => q.mastery < 50).length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">问题答案库</h1>
          <p className="text-slate-500 mt-1">积累面试问题，构建个人知识库</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleRandomQuestion}>
            <Shuffle className="w-4 h-4 mr-1" />
            随机抽题
          </Button>
          <Button onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            新增问题
          </Button>
        </div>
      </div>

      {randomQuestion && (
        <Card className="mb-6 border-primary-300 bg-primary-50/50">
          <CardHeader className="flex items-start justify-between">
            <div>
              <Badge variant="primary" className="mb-2">随机抽题</Badge>
              <CardTitle className="text-lg">{randomQuestion.question}</CardTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">{randomQuestion.category}</Badge>
                <span className={`text-sm font-medium ${getMasteryColor(randomQuestion.mastery)}`}>
                  掌握度: {randomQuestion.mastery}%
                </span>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setRandomQuestion(null)}>
              关闭
            </Button>
          </CardHeader>
          <CardContent>
            {showRandomAnswer ? (
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap">{randomQuestion.answer}</p>
              </div>
            ) : (
              <Button onClick={() => setShowRandomAnswer(true)}>
                <BookOpen className="w-4 h-4 mr-1" />
                查看答案
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总计</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">熟练掌握</p>
                <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
              </div>
              <Star className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">学习中</p>
                <p className="text-2xl font-bold text-amber-600">{stats.learning}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">需加强</p>
                <p className="text-2xl font-bold text-red-600">{stats.weak}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索问题或答案..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部分类</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <select
              value={filterMastery}
              onChange={(e) => setFilterMastery(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部掌握度</option>
              <option value="0">需加强（{'<'}50%）</option>
              <option value="50">学习中（50-80%）</option>
              <option value="80">熟练掌握（{'≥'}80%）</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">问题</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">分类</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">掌握度</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">上次复习</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuestions.map(q => (
                    <tr
                      key={q.id}
                      onClick={() => { setSelectedQuestion(q); setShowAnswer(false); }}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedQuestion?.id === q.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800 line-clamp-2">{q.question}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{q.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getMasteryBgColor(q.mastery)}`}
                              style={{ width: `${q.mastery}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getMasteryColor(q.mastery)}`}>
                            {q.mastery}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {q.lastReviewed}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingQuestion(q);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个问题吗？')) {
                                handleDeleteQuestion(q.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredQuestions.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无面试问题</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedQuestion ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedQuestion.question}</CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="primary">{selectedQuestion.category}</Badge>
                      <span className="text-sm text-slate-500">
                        上次复习: {selectedQuestion.lastReviewed}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">掌握度</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedQuestion.mastery}
                          onChange={(e) => handleMasteryChange(selectedQuestion, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <span className={`text-lg font-bold ${getMasteryColor(selectedQuestion.mastery)}`}>
                        {selectedQuestion.mastery}%
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleMasteryChange(selectedQuestion, Math.max(0, selectedQuestion.mastery - 10))}
                      >
                        -10%
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleMasteryChange(selectedQuestion, Math.min(100, selectedQuestion.mastery + 10))}
                      >
                        +10%
                      </Button>
                    </div>
                  </div>

                  {showAnswer ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700">参考答案</p>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleCopyAnswer(selectedQuestion.answer, selectedQuestion.id)}
                        >
                          {copiedId === selectedQuestion.id ? (
                            <><Check className="w-4 h-4 mr-1" />已复制</>
                          ) : (
                            <><Copy className="w-4 h-4 mr-1" />复制</>
                          )}
                        </Button>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-slate-700 whitespace-pre-wrap">{selectedQuestion.answer}</p>
                      </div>
                      <Button variant="secondary" onClick={() => setShowAnswer(false)}>
                        隐藏答案
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowAnswer(true)}>
                      <BookOpen className="w-4 h-4 mr-1" />
                      查看答案
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一个问题查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? '编辑问题' : '新增问题'}
        size="xl"
      >
        <QuestionForm
          initialData={editingQuestion}
          categories={allCategories}
          onSave={handleSaveQuestion}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const QuestionForm: React.FC<{
  initialData: InterviewQuestion | null;
  categories: string[];
  onSave: (data: Partial<InterviewQuestion>) => void;
  onCancel: () => void;
}> = ({ initialData, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    question: initialData?.question || '',
    answer: initialData?.answer || '',
    mastery: initialData?.mastery || 50,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：JavaScript"
            list="category-list"
            required
          />
          <datalist id="category-list">
            {categories.map(cat => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            掌握度：<span className="text-primary-600 font-bold">{formData.mastery}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.mastery}
            onChange={(e) => setFormData({ ...formData, mastery: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">问题</label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={2}
          placeholder="输入面试问题..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">参考答案</label>
        <textarea
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={10}
          placeholder="输入你的答案整理..."
          required
        />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

export default QuestionsPage;
