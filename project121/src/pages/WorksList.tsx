import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Music,
  Play,
  Star,
  Disc3
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { formatDuration, formatRating } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';
import type { Work } from '../../shared/types';

export function WorksList() {
  const { works, fetchWorks } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    fetchWorks();
  }, []);

  const filteredWorks = works
    .filter((work) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          work.title.toLowerCase().includes(query) ||
          work.composer.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'composer':
          return a.composer.localeCompare(b.composer);
        case 'rating':
          return (b.personalRating || 0) - (a.personalRating || 0);
        case 'listenCount':
          return b.listenCount - a.listenCount;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-burgundy-800 mb-2">
            作品收藏
          </h1>
          <p className="text-gray-600">
            您收藏了 {works.length} 部古典音乐作品
          </p>
        </div>
        <Link to="/works/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加作品
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索作品或作曲家..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="title">按标题排序</option>
              <option value="composer">按作曲家排序</option>
              <option value="rating">按评分排序</option>
              <option value="listenCount">按聆听次数排序</option>
            </select>
          </div>
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <EmptyState
          title="暂无收藏作品"
          description="开始添加您喜欢的古典音乐作品，建立您的个人收藏库。"
          action={{
            label: '添加第一个作品',
            onClick: () => window.location.href = '/works/new'
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkCardProps {
  work: Work;
}

function WorkCard({ work }: WorkCardProps) {
  return (
    <Link
      to={`/works/${work.id}`}
      className="card group cursor-pointer hover:translate-y-[-2px] transition-transform"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-burgundy-600 to-gold-500 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm">
            {formatRating(work.personalRating)}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-burgundy-800 mb-1 line-clamp-2">
          {work.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{work.composer}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {work.opus && (
            <span className="text-xs bg-parchment-100 text-burgundy-700 px-2 py-1 rounded">
              {work.opus}
            </span>
          )}
          {work.catalogNumber && (
            <span className="text-xs bg-parchment-100 text-burgundy-700 px-2 py-1 rounded">
              {work.catalogNumber}
            </span>
          )}
          {work.form && (
            <span className="text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded">
              {work.form}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-parchment-100">
          <div className="flex items-center gap-1">
            <Play className="w-4 h-4" />
            <span>{work.listenCount} 次聆听</span>
          </div>
          <div className="flex items-center gap-1">
            <Disc3 className="w-4 h-4" />
            <span>{formatDuration(work.duration)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
