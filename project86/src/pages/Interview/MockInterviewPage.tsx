import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MockInterview } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Users, Calendar, Target, Star, PlusCircle, X } from 'lucide-react';
import { generateId } from '../../utils/storage';

const MockInterviewPage: React.FC = () => {
  const { state, updateMockInterview, deleteMockInterview } = useAppContext();
  const [selectedInterview, setSelectedInterview] = useState<MockInterview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<MockInterview | null>(null);

  const handleSaveInterview = (interviewData: Partial<MockInterview>) => {
    if (editingInterview) {
      updateMockInterview({ ...editingInterview, ...interviewData } as MockInterview);
    } else {
      const newInterview: MockInterview = {
        id: generateId(),
        date: interviewData.date || new Date().toISOString().split('T')[0],
        company: interviewData.company || '',
        position: interviewData.position || '',
        questions: interviewData.questions || [],
        overallScore: interviewData.overallScore || 0,
        notes: interviewData.notes || '',
      };
      updateMockInterview(newInterview);
    }
    setIsModalOpen(false);
    setEditingInterview(null);
  };

  const handleDeleteInterview = (id: string) => {
    deleteMockInterview(id);
    if (selectedInterview?.id === id) {
      setSelectedInterview(null);
    }
  };

  const sortedInterviews = [...state.mockInterviews].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const avgScore = state.mockInterviews.length > 0
    ? (state.mockInterviews.reduce((sum, i) => sum + i.overallScore, 0) / state.mockInterviews.length).toFixed(1)
    : '0';

  const stats = {
    total: state.mockInterviews.length,
    avgScore,
    latest: sortedInterviews[0]?.date || '-',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">模拟面试</h1>
          <p className="text-slate-500 mt-1">记录每次模拟面试，持续提升面试能力</p>
        </div>
        <Button onClick={() => { setEditingInterview(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          新增记录
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">模拟面试次数</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">平均评分</p>
                <p className={`text-2xl font-bold ${getScoreColor(parseFloat(avgScore))}`}>{avgScore}</p>
              </div>
              <Star className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">最近面试</p>
                <p className="text-2xl font-bold text-slate-800">{stats.latest}</p>
              </div>
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">日期</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">公司</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">职位</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">题目数</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">评分</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedInterviews.map(interview => (
                    <tr
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedInterview?.id === interview.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-slate-800">{interview.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{interview.company}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-600">{interview.position}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{interview.questions.length} 题</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getScoreBgColor(interview.overallScore)}`}
                              style={{ width: `${interview.overallScore}%` }}
                            />
                          </div>
                          <span className={`font-medium ${getScoreColor(interview.overallScore)}`}>
                            {interview.overallScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingInterview(interview);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这条记录吗？')) {
                                handleDeleteInterview(interview.id);
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
              {sortedInterviews.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无模拟面试记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedInterview ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedInterview.company}</CardTitle>
                      <p className="text-slate-500 mt-1">{selectedInterview.position}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedInterview.overallScore)}`}>
                        {selectedInterview.overallScore}
                      </div>
                      <p className="text-xs text-slate-500">综合评分</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {selectedInterview.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {selectedInterview.questions.length} 道题目
                    </span>
                  </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">面试题目记录</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedInterview.questions.map((q, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-slate-800 flex-1">
                          {index + 1}. {q.question}
                        </p>
                        <Badge variant={q.answerScore >= 8 ? 'success' : q.answerScore >= 6 ? 'warning' : 'danger'}>
                          {q.answerScore}/10
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">改进点：</p>
                        <p className="text-sm text-slate-500">{q.improvement || '暂无'}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">总结笔记</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 whitespace-pre-wrap">{selectedInterview.notes || '暂无总结'}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一条记录查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInterview ? '编辑面试记录' : '新增面试记录'}
        size="xl"
      >
        <InterviewForm
          initialData={editingInterview}
          onSave={handleSaveInterview}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const InterviewForm: React.FC<{
  initialData: MockInterview | null;
  onSave: (data: Partial<MockInterview>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    company: initialData?.company || '',
    position: initialData?.position || '',
    overallScore: initialData?.overallScore || 75,
    notes: initialData?.notes || '',
    questions: initialData?.questions || [{ question: '', answerScore: 7, improvement: '' }],
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', answerScore: 7, improvement: '' }]
    });
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData({
        ...formData,
        questions: formData.questions.filter((_, i) => i !== index)
      });
    }
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const newQuestions = [...formData.questions];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">面试日期</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">公司</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：字节跳动"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            综合评分：<span className="text-primary-600 font-bold">{formData.overallScore}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.overallScore}
            onChange={(e) => setFormData({ ...formData, overallScore: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">职位</label>
        <input
          type="text"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="例如：前端工程师"
          required
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">面试题目</label>
          <Button type="button" size="sm" variant="secondary" onClick={addQuestion}>
            <PlusCircle className="w-4 h-4 mr-1" />
            添加题目
          </Button>
        </div>
        <div className="space-y-3">
          {formData.questions.map((q, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4 relative">
              {formData.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              )}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">题目 {index + 1}</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="题目内容"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    得分：<span className="text-primary-600">{q.answerScore}/10</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={q.answerScore}
                    onChange={(e) => updateQuestion(index, 'answerScore', parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">改进点</label>
                <textarea
                  value={q.improvement}
                  onChange={(e) => updateQuestion(index, 'improvement', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  rows={2}
                  placeholder="记录回答中的不足和改进方向..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">总结笔记</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="记录本次面试的整体表现、需要改进的地方、后续学习计划..."
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

export default MockInterviewPage;
