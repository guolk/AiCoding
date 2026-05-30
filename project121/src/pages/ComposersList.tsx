import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  Music,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { EmptyState } from '../components/EmptyState';
import type { Composer } from '../../shared/types';

export function ComposersList() {
  const { composers, fetchComposers } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');

  useEffect(() => {
    fetchComposers();
  }, []);

  const periods = ['all', ...Array.from(new Set(composers.map(c => c.period).filter(Boolean)))];

  const filteredComposers = composers
    .filter((composer) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return composer.name.toLowerCase().includes(query);
      }
      return true;
    })
    .filter((composer) => {
      if (filterPeriod === 'all') return true;
      return composer.period === filterPeriod;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-burgundy-800 mb-2">
            作曲家研究
          </h1>
          <p className="text-gray-600">
            您正在研究 {composers.length} 位作曲家
          </p>
        </div>
        <Link to="/composers/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          添加作曲家
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索作曲家..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="input-field min-w-[150px]"
          >
            {periods.map((period) => (
              <option key={period} value={period}>
                {period === 'all' ? '全部时期' : period}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredComposers.length === 0 ? (
        <EmptyState
          title="暂无作曲家"
          description="开始添加您感兴趣的作曲家，建立您的作曲家研究库。"
          action={{
            label: '添加第一个作曲家',
            onClick: () => window.location.href = '/composers/new'
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredComposers.map((composer) => (
            <ComposerCard key={composer.id} composer={composer} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ComposerCardProps {
  composer: Composer;
}

function ComposerCard({ composer }: ComposerCardProps) {
  const lifespan = composer.birthYear && composer.deathYear
    ? `${composer.birthYear} - ${composer.deathYear}`
    : composer.birthYear
    ? `生于 ${composer.birthYear}`
    : '';

  return (
    <Link
      to={`/composers/${composer.id}`}
      className="card group cursor-pointer hover:translate-y-[-2px] transition-transform"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-burgundy-600 to-burgundy-800 rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
          {composer.period && (
            <span className="text-xs bg-gold-100 text-gold-800 px-2 py-1 rounded">
              {composer.period}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-semibold text-burgundy-800 mb-1">
          {composer.name}
        </h3>

        {lifespan && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4" />
            <span>{lifespan}</span>
          </div>
        )}

        {composer.nationality && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{composer.nationality}</span>
          </div>
        )}

        {composer.biography && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {composer.biography}
          </p>
        )}

        {composer.representativeWorks.length > 0 && (
          <div className="pt-4 border-t border-parchment-100">
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
              <Music className="w-4 h-4" />
              <span>代表作品</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {composer.representativeWorks.slice(0, 3).map((work, index) => (
                <span
                  key={index}
                  className="text-xs bg-parchment-100 text-burgundy-700 px-2 py-1 rounded"
                >
                  {work.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
