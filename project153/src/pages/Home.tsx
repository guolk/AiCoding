import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  BookOpen,
  GitCompare,
  FolderOpen,
  FileText,
  Plus,
  Clock,
  TrendingUp
} from 'lucide-react';
import { api } from '@/utils/api';
import { useAppStore } from '@/store/index';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

const statCards = [
  { key: 'totalRelics', label: '文物档案', icon: Archive, color: 'from-amber-500 to-yellow-600' },
  { key: 'totalNotes', label: '研究笔记', icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
  { key: 'totalAnalysis', label: '类型分析', icon: GitCompare, color: 'from-blue-500 to-indigo-600' },
  { key: 'totalMaterials', label: '图像资料', icon: FolderOpen, color: 'from-rose-500 to-pink-600' },
];

export default function Home() {
  const navigate = useNavigate();
  const { dashboard, setDashboard, setLoading, loading, error, setError } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.dashboard.getStats();
        setDashboard(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setDashboard, setLoading, setError]);

  if (loading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error) {
    return (
      <EmptyState
        title="加载失败"
        description={error}
        action={<button className="btn-primary" onClick={() => window.location.reload()}>重新加载</button>}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">欢迎使用文物研究平台</h1>
          <p className="text-ink-light">系统化管理您的文物研究资料</p>
        </div>
        <button
          onClick={() => navigate('/relics/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建文物档案
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.key}
            className="card-border-gold p-5 cursor-pointer hover:-translate-y-1 transition-transform duration-300"
            onClick={() => navigate('/' + stat.key.replace('total', '').toLowerCase())}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-ink-light text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-ink">
                  {dashboard?.[stat.key as keyof typeof dashboard] as number || 0}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-ink-light">
              <TrendingUp className="w-3 h-3 text-accent-jade" />
              <span>持续积累中</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-border-gold p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <Archive className="w-5 h-5 text-accent-gold" />
              最近文物
            </h2>
            <button
              onClick={() => navigate('/relics')}
              className="text-sm text-accent-teal hover:underline"
            >
              查看全部
            </button>
          </div>
          <div className="divider-gold mb-4" />
          {dashboard?.recentRelics.length ? (
            <div className="space-y-3">
              {dashboard.recentRelics.map((relic, index) => (
                <div
                  key={relic.id}
                  onClick={() => navigate(`/relics/${relic.id}`)}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent-gold/5 cursor-pointer transition-colors animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-primary-100 flex-shrink-0">
                    {relic.photos[0] ? (
                      <img
                        src={relic.photos[0].url}
                        alt={relic.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Archive className="w-6 h-6 text-ink-light" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink truncate">{relic.name}</h3>
                    <p className="text-sm text-ink-light truncate">{relic.era} · {relic.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-ink-light flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(relic.updatedAt).toLocaleDateString('zh-CN')}
                    </p>
                    {relic.relicNumber && (
                      <p className="text-xs text-accent-gold font-mono mt-1">{relic.relicNumber}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="暂无文物档案" description="点击右上角按钮创建您的第一份文物档案" />
          )}
        </div>

        <div className="card-border-gold p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-gold" />
              最近笔记
            </h2>
            <button
              onClick={() => navigate('/notes')}
              className="text-sm text-accent-teal hover:underline"
            >
              查看全部
            </button>
          </div>
          <div className="divider-gold mb-4" />
          {dashboard?.recentNotes.length ? (
            <div className="space-y-3">
              {dashboard.recentNotes.map((note, index) => (
                <div
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="p-4 rounded-lg hover:bg-accent-gold/5 cursor-pointer transition-colors animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <h3 className="font-medium text-ink mb-1">{note.title}</h3>
                  <p className="text-sm text-ink-light line-clamp-2 mb-2">
                    {note.content || note.personalInsights}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-ink-light flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="暂无研究笔记" description="开始记录您的研究心得和学术见解" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/relics/new')}
          className="card p-6 text-center hover:-translate-y-1 transition-transform"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
            <Archive className="w-6 h-6 text-amber-700" />
          </div>
          <p className="font-medium text-ink">新建文物档案</p>
          <p className="text-xs text-ink-light mt-1">录入文物详细信息</p>
        </button>
        <button
          onClick={() => navigate('/notes/new')}
          className="card p-6 text-center hover:-translate-y-1 transition-transform"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-emerald-700" />
          </div>
          <p className="font-medium text-ink">撰写研究笔记</p>
          <p className="text-xs text-ink-light mt-1">整理文献与观点</p>
        </button>
        <button
          onClick={() => navigate('/analysis')}
          className="card p-6 text-center hover:-translate-y-1 transition-transform"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
            <GitCompare className="w-6 h-6 text-blue-700" />
          </div>
          <p className="font-medium text-ink">类型分析</p>
          <p className="text-xs text-ink-light mt-1">对比与演变研究</p>
        </button>
        <button
          onClick={() => navigate('/output')}
          className="card p-6 text-center hover:-translate-y-1 transition-transform"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-rose-700" />
          </div>
          <p className="font-medium text-ink">整理研究成果</p>
          <p className="text-xs text-ink-light mt-1">论文提纲与论点</p>
        </button>
      </div>
    </div>
  );
}
