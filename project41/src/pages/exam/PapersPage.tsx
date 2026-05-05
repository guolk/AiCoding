import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { examApi } from '@/services/api';
import type { Paper, PaperMode } from '@/types';
import Button from '@/components/Button';

const modeLabels: Record<PaperMode, string> = {
  manual: '手动选题',
  random: '随机抽题',
};

export default function PapersPage() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    page: 1,
    pageSize: 10,
  });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    loadPapers();
  }, [filter]);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const params: any = { page: filter.page, pageSize: filter.pageSize };
      if (filter.search) params.search = filter.search;

      const result: any = await examApi.getPapers(params);
      setPapers(result.items || []);
      setPagination({
        total: result.total || 0,
        totalPages: result.totalPages || 1,
      });
    } catch (err) {
      console.error('加载试卷失败:', err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这份试卷吗？')) return;
    try {
      await examApi.deletePaper(id);
      loadPapers();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
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
              <h1 className="text-xl font-bold text-gray-900">试卷管理</h1>
            </div>
            <Link to="/exam/papers/new">
              <Button>+ 新建试卷</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索试卷名称..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : papers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-500 mb-4">暂无试卷</p>
            <Link to="/exam/papers/new">
              <Button>创建第一份试卷</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {papers.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{p.title}</h3>
                {p.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{p.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {modeLabels[p.mode]}
                  </span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {p.questionCount} 道题
                  </span>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {p.totalScore} 分
                  </span>
                </div>
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/exam/exams/new?paperId=${p.id}`)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    安排考试
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
