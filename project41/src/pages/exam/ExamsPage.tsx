import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { examApi } from '@/services/api';
import type { Exam, ExamStatus } from '@/types';
import Button from '@/components/Button';

const statusLabels: Record<ExamStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
  published: { label: '已发布', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: '进行中', color: 'bg-green-100 text-green-800' },
  ended: { label: '已结束', color: 'bg-yellow-100 text-yellow-800' },
  archived: { label: '已归档', color: 'bg-gray-200 text-gray-600' },
};

export default function ExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    loadExams();
  }, [filter]);

  const loadExams = async () => {
    setLoading(true);
    try {
      const params: any = { page: filter.page, pageSize: filter.pageSize };
      if (filter.status) params.status = filter.status;

      const result: any = await examApi.getExams(params);
      setExams(result.items || []);
    } catch (err) {
      console.error('加载考试失败:', err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link to="/exam/dashboard" className="text-gray-500 hover:text-gray-700">
                ← 返回
              </Link>
              <h1 className="text-xl font-bold text-gray-900">考试管理</h1>
            </div>
            <Link to="/exam/exams/new">
              <Button>+ 新建考试</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有状态</option>
              {Object.entries(statusLabels).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : exams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-gray-500 mb-4">暂无考试安排</p>
            <Link to="/exam/exams/new">
              <Button>创建第一场考试</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusLabels[exam.status].color}`}>
                        {statusLabels[exam.status].label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-500">开始时间:</span>
                        <div className="font-medium">{formatDateTime(exam.startTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">结束时间:</span>
                        <div className="font-medium">{formatDateTime(exam.endTime)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">考试时长:</span>
                        <div className="font-medium">{exam.duration} 分钟</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {exam.shuffleQuestions && (
                          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                            题目乱序
                          </span>
                        )}
                        {exam.shuffleOptions && (
                          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                            选项乱序
                          </span>
                        )}
                        {exam.antiCheatEnabled && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            防作弊
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => navigate(`/exam/analytics/${exam.id}`)}
                      className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
                    >
                      成绩分析
                    </button>
                    <button
                      onClick={() => navigate(`/exam/grading?examId=${exam.id}`)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      查看答卷
                    </button>
                    <button
                      onClick={() => navigate(`/exam/exams/new?editId=${exam.id}`)}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                    >
                      编辑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
