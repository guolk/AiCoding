import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, AlertTriangle, CheckCircle, 
  Circle, Calendar, X, Check 
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '../../utils/helpers';
import { Publication } from '../../types';

export default function ContentCalendar() {
  const { episodes, publications, platforms, addPublication, updatePublication } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState<Partial<Publication>>({
    episodeId: '',
    platformId: '',
    status: 'scheduled',
    scheduledAt: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const getPublicationsForDate = (date: Date) => {
    return publications.filter(p => {
      if (p.scheduledAt) {
        return isSameDay(new Date(p.scheduledAt), date);
      }
      if (p.publishedAt) {
        return isSameDay(new Date(p.publishedAt), date);
      }
      return false;
    });
  };

  const getEpisodeTitle = (episodeId: string) => {
    return episodes.find(e => e.id === episodeId)?.title || '未知节目';
  };

  const getPlatformName = (platformId: string) => {
    return platforms.find(p => p.id === platformId)?.name || '未知平台';
  };

  const handleSchedule = () => {
    if (!scheduleData.episodeId || !scheduleData.platformId || !scheduleData.scheduledAt) return;
    addPublication(scheduleData as Omit<Publication, 'id'>);
    setShowScheduleModal(false);
    setScheduleData({ episodeId: '', platformId: '', status: 'scheduled', scheduledAt: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-slate-400';
      case 'failed': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const hasConflict = (date: Date) => {
    const pubs = getPublicationsForDate(date);
    return pubs.length > 3;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-display text-2xl font-semibold text-slate-800">
            {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>已发布</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>已排期</span>
          </div>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
          >
            <Plus size={18} />
            安排发布
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {weekDays.map(day => (
            <div key={day} className="px-4 py-3 text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, dayIndex) => {
            const dayPubs = getPublicationsForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const conflict = hasConflict(day);

            return (
              <div
                key={dayIndex}
                className={cn(
                  'min-h-[120px] border-b border-r border-slate-100 p-2 transition-all cursor-pointer hover:bg-slate-50',
                  !isSameMonth(day, currentMonth) && 'bg-slate-50/50 opacity-40',
                  isToday && 'bg-accent-50/50',
                  isSelected && 'ring-2 ring-inset ring-accent-500',
                  conflict && 'bg-red-50'
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                    isToday && 'bg-accent-500 text-white font-medium',
                    !isToday && 'text-slate-600'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {conflict && (
                    <AlertTriangle size={14} className="text-red-500" />
                  )}
                </div>
                <div className="space-y-1">
                  {dayPubs.slice(0, 2).map(pub => (
                    <div
                      key={pub.id}
                      className="text-xs px-2 py-1 rounded truncate text-white"
                      style={{ backgroundColor: getStatusColor(pub.status) }}
                    >
                      {getEpisodeTitle(pub.episodeId).slice(0, 8)}...
                    </div>
                  ))}
                  {dayPubs.length > 2 && (
                    <div className="text-xs text-slate-400 text-center">
                      +{dayPubs.length - 2} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="text-accent-500" size={20} />
              {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })} 的发布安排
            </h3>
            <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {getPublicationsForDate(selectedDate).length === 0 ? (
              <p className="text-slate-400 text-center py-6">当天暂无发布安排</p>
            ) : (
              getPublicationsForDate(selectedDate).map(pub => (
                <div
                  key={pub.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  <div className={cn('w-3 h-3 rounded-full', getStatusColor(pub.status))} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{getEpisodeTitle(pub.episodeId)}</p>
                    <p className="text-sm text-slate-500">{getPlatformName(pub.platformId)}</p>
                  </div>
                  {pub.scheduledAt && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Clock size={14} />
                      {format(new Date(pub.scheduledAt), 'HH:mm')}
                    </div>
                  )}
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    pub.status === 'published' ? 'bg-green-100 text-green-700' :
                    pub.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  )}>
                    {pub.status === 'published' ? '已发布' :
                     pub.status === 'scheduled' ? '已排期' : '草稿'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">安排发布</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择节目</label>
                <select
                  value={scheduleData.episodeId}
                  onChange={(e) => setScheduleData({ ...scheduleData, episodeId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">请选择要发布的节目</option>
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">发布平台</label>
                <div className="grid grid-cols-2 gap-2">
                  {platforms.filter(p => p.enabled).map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => setScheduleData({ ...scheduleData, platformId: platform.id })}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2',
                        scheduleData.platformId === platform.id
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-slate-200 text-slate-600 hover:border-accent-300'
                      )}
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">发布时间</label>
                <input
                  type="datetime-local"
                  value={scheduleData.scheduledAt}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                  系统将在指定时间自动发布到所选平台，请确保内容已准备就绪。
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSchedule}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                确认排期
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
