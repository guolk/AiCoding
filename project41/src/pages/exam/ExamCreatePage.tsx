import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { Paper, ExamStatus } from '@/types';
import Button from '@/components/Button';

const statusOptions: { value: ExamStatus; label: string }[] = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
];

export default function ExamCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paperIdParam = searchParams.get('paperId');
  const editId = searchParams.get('editId');
  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const [formData, setFormData] = useState({
    title: '',
    paperId: paperIdParam ? parseInt(paperIdParam) : 0,
    startTime: tomorrow.toISOString().slice(0, 16),
    endTime: dayAfter.toISOString().slice(0, 16),
    duration: 120,
    status: 'draft' as ExamStatus,
    shuffleQuestions: false,
    shuffleOptions: false,
    allowLateSubmit: false,
    autoSubmit: true,
    antiCheatEnabled: true,
    maxTabSwitchCount: 3,
  });

  useEffect(() => {
    loadPapers();
    if (editId) {
      loadExam(parseInt(editId));
    }
  }, [editId]);

  const loadPapers = async () => {
    try {
      const result: any = await examApi.getPapers({ page: 1, pageSize: 100 });
      setPapers(result.items || []);
    } catch (err) {
      console.error('加载试卷失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExam = async (examId: number) => {
    try {
      const exam: any = await examApi.getExam(examId);
      setFormData({
        title: exam.title,
        paperId: exam.paperId,
        startTime: exam.startTime?.slice(0, 16) || formData.startTime,
        endTime: exam.endTime?.slice(0, 16) || formData.endTime,
        duration: exam.duration,
        status: exam.status,
        shuffleQuestions: exam.shuffleQuestions,
        shuffleOptions: exam.shuffleOptions,
        allowLateSubmit: exam.allowLateSubmit,
        autoSubmit: exam.autoSubmit,
        antiCheatEnabled: exam.antiCheatEnabled,
        maxTabSwitchCount: exam.maxTabSwitchCount,
      });
    } catch (err: any) {
      alert(err.message || '加载考试失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        allowedRoles: ['student'],
      };

      if (editId) {
        await examApi.updateExam(parseInt(editId), data);
      } else {
        await examApi.createExam(data);
      }

      navigate('/exam/exams');
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link to="/exam/exams" className="text-gray-500 hover:text-gray-700 mr-4">
              ← 返回
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              {editId ? '编辑考试' : '新建考试'}
            </h1>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">考试名称 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入考试名称"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联试卷 *</label>
                {loading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-500">
                    加载中...
                  </div>
                ) : (
                  <select
                    value={formData.paperId}
                    onChange={(e) => setFormData({ ...formData, paperId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>请选择试卷</option>
                    {papers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.questionCount}道题, {p.totalScore}分)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">考试时长（分钟）</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ExamStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">防作弊设置</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.shuffleQuestions}
                  onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  题目随机顺序（每个考生看到的题目顺序不同）
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.shuffleOptions}
                  onChange={(e) => setFormData({ ...formData, shuffleOptions: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  选项随机顺序（每个考生看到的选项顺序不同）
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.antiCheatEnabled}
                  onChange={(e) => setFormData({ ...formData, antiCheatEnabled: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  启用防作弊检测（检测切换标签页、复制粘贴等行为）
                </span>
              </label>

              {formData.antiCheatEnabled && (
                <div className="pl-7">
                  <label className="block text-sm text-gray-700 mb-1">最大允许切换标签页次数</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxTabSwitchCount}
                    onChange={(e) => setFormData({ ...formData, maxTabSwitchCount: parseInt(e.target.value) || 0 })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <span className="ml-2 text-sm text-gray-500">超过此次数将自动提交试卷</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">其他设置</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowLateSubmit}
                  onChange={(e) => setFormData({ ...formData, allowLateSubmit: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">允许迟到提交（考试结束后一段时间内仍可提交）</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.autoSubmit}
                  onChange={(e) => setFormData({ ...formData, autoSubmit: e.target.checked })}
                  className="mr-3 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">考试时间结束自动提交（否则需要手动提交）</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/exam/exams">
              <Button type="button" variant="secondary">取消</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : (editId ? '保存修改' : '创建考试')}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
