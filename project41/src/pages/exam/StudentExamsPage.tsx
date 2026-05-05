import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { examApi } from '@/services/api';
import type { ExamForStudent, ExamStatus } from '@/types';
import Button from '@/components/Button';

const statusLabels: Record<ExamStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: '未开始', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  published: { label: '待开始', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  in_progress: { label: '进行中', color: 'text-green-600', bgColor: 'bg-green-100' },
  ended: { label: '已结束', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  archived: { label: '已归档', color: 'text-gray-400', bgColor: 'bg-gray-50' },
};

export default function StudentExamsPage() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<ExamForStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const result: any = await examApi.getMyExams();
      setExams(result || []);
    } catch (err) {
      console.error('加载考试列表失败:', err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    switch (activeTab) {
      case 'upcoming':
        return exam.status === 'published' || exam.status === 'draft';
      case 'in_progress':
        return exam.status === 'in_progress';
      case 'completed':
        return exam.status === 'ended' || exam.status === 'archived';
      default:
        return true;
    }
  });

  const canTakeExam = (exam: ExamForStudent) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.endTime);
    
    return exam.status === 'in_progress' || 
           (exam.status === 'published' && now >= startTime && now <= endTime);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
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
              <h1 className="text-xl font-bold text-gray-900">我的考试</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'upcoming', label: '待开始' },
            { key: 'in_progress', label: '进行中' },
            { key: 'completed', label: '已完成' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500 mb-2">暂无可用的考试</p>
            <p className="text-gray-400 text-sm">请联系您的老师获取更多信息</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
            const canTake = canTakeExam(exam);
            const statusInfo = statusLabels[exam.status];
            
            return (
              <div
                key={exam.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${
                  exam.status === 'in_progress' ? 'border-green-300' : 'border-gray-200'
                }`}
              >
                {exam.status === 'in_progress' && (
                  <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
                    🔔 考试进行中
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {exam.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.bgColor} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    试卷: {exam.paperTitle}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📅</span>
                      <span>开始: {formatDateTime(exam.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">⏰</span>
                      <span>时长: {exam.duration} 分钟</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📊</span>
                      <span>总分: {exam.totalScore} 分</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    {canTake ? (
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/exam/take/${exam.id}`)}
                      >
                        进入考试
                      </Button>
                    ) : exam.status === 'ended' || exam.status === 'archived' ? (
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate(`/exam/result/${exam.id}`)}
                      >
                        查看成绩
                      </Button>
                    ) : (
                      <div className="text-center text-sm text-gray-500">
                        考试未开始，请等待
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </main>
    </div>
  );
}
