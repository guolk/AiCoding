import { useState } from 'react';
import { Plus, Search, BookOpen, User, Calendar, CheckCircle, BookMarked, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';

export default function LiteratureList() {
  const navigate = useNavigate();
  const { literature, users, readingProgress, readingReports, currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLiterature = literature.filter((lit) => {
    return lit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lit.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lit.journal.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getUserReadingProgress = (literatureId: number) => {
    return readingProgress.find((rp) => rp.literature_id === literatureId && rp.user_id === currentUser?.id);
  };

  const getReaders = (literatureId: number) => {
    return readingProgress.filter((rp) => rp.literature_id === literatureId && rp.status === 'finished');
  };

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">文献共享</h1>
          <p className="text-sm text-neutral-500">管理和共享课题组文献库</p>
        </div>
        <button
          onClick={() => navigate('/literature/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加文献
        </button>
      </div>

      <div className="card">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索文献标题、作者或期刊..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLiterature.map((lit) => {
            const userProgress = getUserReadingProgress(lit.id);
            const readers = getReaders(lit.id);
            const report = readingReports.find((r) => r.literature_id === lit.id);

            return (
              <div
                key={lit.id}
                className="p-4 border border-neutral-100 rounded-xl hover:border-accent-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/literature/${lit.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent-600" />
                    <span className="font-medium text-neutral-900 line-clamp-1">{lit.title}</span>
                  </div>
                  {userProgress && userProgress.recommended && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <BookMarked className="w-3 h-3" />
                      推荐
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-500 mb-1">{lit.authors}</p>
                <p className="text-xs text-neutral-400 mb-3">{lit.journal}, {lit.year}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {getUserName(lit.added_by)}
                    </span>
                    <span className="text-neutral-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(lit.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {userProgress ? (
                    <StatusBadge status={userProgress.status} />
                  ) : (
                    <span className="text-xs text-neutral-400">未开始阅读</span>
                  )}
                </div>

                {readers.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-neutral-500">
                        {readers.length} 人已阅读
                        {readers.slice(0, 3).map((r) => getUserName(r.user_id)).join('、')}
                        {readers.length > 3 && `等${readers.length}人`}
                      </span>
                    </div>
                  </div>
                )}

                {report && (
                  <div className="mt-2 pt-2 border-t border-neutral-100">
                    <p className="text-xs text-accent-600 flex items-center gap-1">
                      <BookMarked className="w-3 h-3" />
                      {getUserName(report.user_id)} 已分享阅读报告
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredLiterature.length === 0 && (
          <div className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">没有找到匹配的文献</p>
          </div>
        )}
      </div>
    </div>
  );
}
