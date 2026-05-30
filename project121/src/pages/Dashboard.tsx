import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Music,
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Play,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { formatDate, formatRating } from '../utils/formatters';

export function Dashboard() {
  const { works, composers, notes, concerts, fetchAllData } = useAppStore();

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalListenCount = works.reduce((sum, w) => sum + w.listenCount, 0);
  const plannedConcerts = concerts.filter(c => c.type === 'planned').length;
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const upcomingConcerts = concerts
    .filter(c => c.type === 'planned' && new Date(c.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-burgundy-800 mb-2">
            欢迎回来
          </h1>
          <p className="text-gray-600">您的古典音乐收藏之旅</p>
        </div>
        <Link to="/works/new" className="btn-primary flex items-center gap-2">
          <Music className="w-4 h-4" />
          添加新作品
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">收藏作品</p>
              <p className="text-4xl font-display font-semibold">{works.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-burgundy-100">
            <Play className="w-4 h-4" />
            <span>共聆听 {totalListenCount} 次</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">作曲家研究</p>
              <p className="text-4xl font-display font-semibold">{composers.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-burgundy-100">
            <TrendingUp className="w-4 h-4" />
            <span>贝多芬、莫扎特、巴赫、肖邦</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">欣赏笔记</p>
              <p className="text-4xl font-display font-semibold">{notes.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-burgundy-100">
            <Clock className="w-4 h-4" />
            <span>{recentNotes.length} 条最近笔记</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-burgundy-100 text-sm mb-1">计划音乐会</p>
              <p className="text-4xl font-display font-semibold">{plannedConcerts}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-burgundy-100">
            <ArrowRight className="w-4 h-4" />
            <span>{upcomingConcerts.length} 场即将到来</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-xl font-medium">最近的聆听笔记</h2>
            <Link
              to="/notes"
              className="text-sm text-gold-200 hover:text-white transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {recentNotes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无聆听笔记</p>
            ) : (
              recentNotes.map((note) => {
                const work = works.find(w => w.id === note.workId);
                return (
                  <Link
                    key={note.id}
                    to={`/notes/${note.id}`}
                    className="block p-4 bg-parchment-50 rounded-lg hover:bg-parchment-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-burgundy-800">
                        {work?.composer}: {work?.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(note.listenDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {note.overallImpression || '点击查看详情...'}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-display text-xl font-medium">即将到来的音乐会</h2>
            <Link
              to="/concerts"
              className="text-sm text-gold-200 hover:text-white transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {upcomingConcerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无计划中的音乐会</p>
            ) : (
              upcomingConcerts.map((concert) => (
                <div
                  key={concert.id}
                  className="p-4 bg-parchment-50 rounded-lg border-l-4 border-gold-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-burgundy-800">{concert.title}</h3>
                    <span className="text-sm bg-gold-100 text-gold-800 px-2 py-1 rounded">
                      已计划
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDate(concert.date)}</span>
                    <span>•</span>
                    <span>{concert.venue}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-xl font-medium">收藏精选</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {works.slice(0, 4).map((work) => (
              <Link
                key={work.id}
                to={`/works/${work.id}`}
                className="group p-4 bg-parchment-50 rounded-lg hover:shadow-gold transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-burgundy-100 rounded-lg flex items-center justify-center group-hover:bg-burgundy-200 transition-colors">
                    <Music className="w-5 h-5 text-burgundy-700" />
                  </div>
                  <span className="text-sm">
                    {formatRating(work.personalRating)}
                  </span>
                </div>
                <h3 className="font-medium text-burgundy-800 mb-1 line-clamp-1">
                  {work.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{work.composer}</p>
                <p className="text-xs text-gray-500">
                  已聆听 {work.listenCount} 次
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
