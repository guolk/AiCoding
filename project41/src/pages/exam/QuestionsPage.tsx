import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { examApi } from '@/services/api';
import type { Question, QuestionType, DifficultyLevel } from '@/types';
import Button from '@/components/Button';

const typeLabels: Record<QuestionType, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  short_answer: '简答题',
  programming: '编程题',
};

const difficultyLabels: Record<DifficultyLevel, { label: string; color: string }> = {
  easy: { label: '简单', color: 'bg-green-100 text-green-800' },
  medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  hard: { label: '困难', color: 'bg-red-100 text-red-800' },
};

export default function QuestionsPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    difficulty: '',
    search: '',
    page: 1,
    pageSize: 10,
  });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const params: any = { page: filter.page, pageSize: filter.pageSize };
      if (filter.type) params.type = filter.type;
      if (filter.difficulty) params.difficulty = filter.difficulty;
      if (filter.search) params.search = filter.search;

      const result: any = await examApi.getQuestions(params);
      setQuestions(result.items || []);
      setPagination({
        total: result.total || 0,
        totalPages: result.totalPages || 1,
      });
    } catch (err) {
      console.error('加载题目失败:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这道题目吗？')) return;
    try {
      await examApi.deleteQuestion(id);
      loadQuestions();
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
              <h1 className="text-xl font-bold text-gray-900">题目管理</h1>
            </div>
            <Link to="/exam/questions/new">
              <Button>+ 新建题目</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索题目内容..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有题型</option>
              <option value="single_choice">单选题</option>
              <option value="multiple_choice">多选题</option>
              <option value="true_false">判断题</option>
              <option value="fill_blank">填空题</option>
              <option value="short_answer">简答题</option>
              <option value="programming">编程题</option>
            </select>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value, page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有难度</option>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">暂无题目</p>
            <Link to="/exam/questions/new">
              <Button>创建第一道题目</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {typeLabels[q.type]}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${difficultyLabels[q.difficulty].color}`}>
                          {difficultyLabels[q.difficulty].label}
                        </span>
                        <span className="text-sm text-gray-500">分值: {q.score}分</span>
                      </div>
                      <p className="text-gray-900 mb-3" dangerouslySetInnerHTML={{ __html: q.title }} />
                      {q.tags.length > 0 && (
                        <div className="flex gap-2">
                          {q.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link
                        to={`/exam/questions/${q.id}/edit`}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  disabled={filter.page <= 1}
                  onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  上一页
                </button>
                <span className="text-gray-600">
                  第 {filter.page} 页 / 共 {pagination.totalPages} 页
                </span>
                <button
                  disabled={filter.page >= pagination.totalPages}
                  onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                  className="px-3 py-2 border rounded disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
