import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  CalendarDays,
  MapPin,
  Clock,
  Music,
  Star,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { formatDate, formatRating } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';
import { RatingStars } from '../components/RatingStars';
import type { Concert } from '../../shared/types';

export function ConcertsList() {
  const { concerts, fetchConcerts } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'attended' | 'planned'>('all');

  useEffect(() => {
    fetchConcerts();
  }, []);

  const attendedConcerts = concerts
    .filter(c => c.type === 'attended')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const plannedConcerts = concerts
    .filter(c => c.type === 'planned')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingConcerts = plannedConcerts.filter(c => new Date(c.date) >= new Date());
  const pastPlannedConcerts = plannedConcerts.filter(c => new Date(c.date) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-burgundy-800 mb-2">
            音乐会追踪
          </h1>
          <p className="text-gray-600">
            已观看 {attendedConcerts.length} 场音乐会，计划观看 {upcomingConcerts.length} 场
          </p>
        </div>
        <Link to="/concerts/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          记录音乐会
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'all'
              ? 'bg-burgundy-700 text-white'
              : 'bg-white text-gray-600 hover:bg-parchment-100'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => setFilterType('attended')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'attended'
              ? 'bg-burgundy-700 text-white'
              : 'bg-white text-gray-600 hover:bg-parchment-100'
          }`}
        >
          已观看
        </button>
        <button
          onClick={() => setFilterType('planned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'planned'
              ? 'bg-burgundy-700 text-white'
              : 'bg-white text-gray-600 hover:bg-parchment-100'
          }`}
        >
          计划中
        </button>
      </div>

      {concerts.length === 0 ? (
        <EmptyState
          title="暂无音乐会记录"
          description="开始记录您的音乐会经历，包括已观看的和计划观看的演出。"
          action={{
            label: '添加第一场音乐会',
            onClick: () => window.location.href = '/concerts/new'
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(filterType === 'all' || filterType === 'planned') && upcomingConcerts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold-600" />
                <h2 className="font-display text-xl font-medium text-burgundy-800">即将到来</h2>
                <span className="text-sm text-gray-500">({upcomingConcerts.length} 场)</span>
              </div>
              {upcomingConcerts.map(concert => (
                <ConcertCard key={concert.id} concert={concert} />
              ))}
            </div>
          )}

          {(filterType === 'all' || filterType === 'attended') && attendedConcerts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="font-display text-xl font-medium text-burgundy-800">已观看</h2>
                <span className="text-sm text-gray-500">({attendedConcerts.length} 场)</span>
              </div>
              {attendedConcerts.map(concert => (
                <ConcertCard key={concert.id} concert={concert} />
              ))}
            </div>
          )}

          {(filterType === 'all' || filterType === 'planned') && pastPlannedConcerts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-gray-400" />
                <h2 className="font-display text-xl font-medium text-gray-600">已过期的计划</h2>
              </div>
              {pastPlannedConcerts.map(concert => (
                <ConcertCard key={concert.id} concert={concert} faded />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ConcertCardProps {
  concert: Concert;
  faded?: boolean;
}

function ConcertCard({ concert, faded }: ConcertCardProps) {
  const isAttended = concert.type === 'attended';

  return (
    <div
      className={`card transition-opacity ${faded ? 'opacity-60' : ''}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            {isAttended ? (
              <div className="w-full h-full bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-full h-full bg-gold-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gold-600" />
              </div>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            isAttended
              ? 'bg-green-100 text-green-700'
              : 'bg-gold-100 text-gold-700'
          }`}>
            {isAttended ? '已观看' : '计划中'}
          </span>
        </div>

        <h3 className="font-display text-lg font-semibold text-burgundy-800 mb-2">
          {concert.title}
        </h3>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4" />
            <span>{formatDate(concert.date)}</span>
          </div>
          {concert.time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{concert.time}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{concert.venue}{concert.city ? `, ${concert.city}` : ''}</span>
          </div>
        </div>

        {concert.performers && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <Music className="w-4 h-4" />
            <span>{concert.performers}</span>
          </div>
        )}

        <div className="bg-parchment-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-500 mb-1">演出曲目</p>
          <div className="space-y-1">
            {concert.programItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-sm text-gold-600 font-medium">{item.order}.</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.workTitle}</p>
                  <p className="text-xs text-gray-500">{item.composer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAttended && (
          <div className="flex items-center justify-between pt-3 border-t border-parchment-200">
            {concert.rating ? (
              <div className="flex items-center gap-2">
                <RatingStars rating={concert.rating || 0} readonly size="sm" />
                <span className="text-sm text-gray-600">{formatRating(concert.rating)}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">未评分</span>
            )}
            {concert.notes && (
              <p className="text-sm text-gray-500 line-clamp-1 max-w-[50%] text-right">
                {concert.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
