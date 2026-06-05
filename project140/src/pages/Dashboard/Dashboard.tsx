import { useAppStore } from '../../store/useAppStore';
import StatCard from '../../components/Cards/StatCard';
import { 
  Mic, Users, FileText, TrendingUp, Clock, CheckCircle, 
  AlertCircle, Calendar, ChevronRight, Star, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatDate, formatRelative, getStatusColor, getStatusLabel, cn } from '../../utils/helpers';

export default function Dashboard() {
  const { topics, guests, episodes, sessions, feedbacks, todos, publications, analytics } = useAppStore();

  const approvedTopics = topics.filter(t => t.status === 'approved').length;
  const confirmedGuests = guests.filter(g => g.status === 'confirmed').length;
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length;
  const pendingTodos = todos.filter(t => !t.completed).length;

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = formatDate(date.toISOString(), 'MM-dd');
    const dayPlays = analytics
      .filter(a => formatDate(a.date, 'MM-dd') === dateStr)
      .reduce((sum, a) => sum + a.plays, 0);
    return { date: dateStr, plays: dayPlays };
  });

  const recentActivity = [
    ...sessions.filter(s => s.status === 'scheduled').map(s => ({
      id: s.id,
      type: 'session' as const,
      title: '录制会话预约',
      subtitle: episodes.find(e => e.id === s.episodeId)?.title || '',
      time: s.scheduledAt,
      status: 'upcoming' as const,
    })),
    ...feedbacks.slice(0, 3).map(f => ({
      id: f.id,
      type: 'feedback' as const,
      title: '收到新反馈',
      subtitle: f.content.slice(0, 30) + '...',
      time: f.createdAt,
      status: f.sentiment,
    })),
    ...todos.filter(t => !t.completed).slice(0, 2).map(t => ({
      id: t.id,
      type: 'todo' as const,
      title: '待办任务',
      subtitle: t.title,
      time: t.dueDate || new Date().toISOString(),
      status: t.priority,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="待录制选题"
          value={approvedTopics}
          change={12}
          icon={<Lightbulb size={24} />}
          color="orange"
        />
        <StatCard
          title="已确认嘉宾"
          value={confirmedGuests}
          change={8}
          icon={<Users size={24} />}
          color="blue"
        />
        <StatCard
          title="即将录制"
          value={upcomingSessions}
          icon={<Calendar size={24} />}
          color="green"
        />
        <StatCard
          title="待处理任务"
          value={pendingTodos}
          change={-15}
          icon={<CheckCircle size={24} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold text-slate-800">播放量趋势</h3>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent-500">
              <option>最近7天</option>
              <option>最近30天</option>
              <option>最近90天</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2942',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="plays"
                  stroke="#ff6b35"
                  strokeWidth={3}
                  fill="url(#colorPlays)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-display text-lg font-semibold text-slate-800 mb-4">待办任务</h3>
          <div className="space-y-3">
            {todos.filter(t => !t.completed).slice(0, 5).map(todo => (
              <div key={todo.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <button
                  onClick={() => useAppStore.getState().toggleTodo(todo.id)}
                  className="w-5 h-5 rounded border-2 border-slate-300 hover:border-accent-500 mt-0.5 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{todo.title}</p>
                  {todo.dueDate && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {formatRelative(todo.dueDate)}
                    </p>
                  )}
                </div>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                  todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-600'
                )}>
                  {todo.priority === 'high' ? '紧急' : todo.priority === 'medium' ? '中等' : '普通'}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-accent-600 hover:text-accent-700 font-medium flex items-center justify-center gap-1">
            查看全部 <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-display text-lg font-semibold text-slate-800 mb-4">最近活动</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="relative">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    activity.type === 'session' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'feedback' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  )}>
                    {activity.type === 'session' ? <Mic size={18} /> :
                     activity.type === 'feedback' ? 
                       (activity.status === 'positive' ? <ThumbsUp size={18} /> : 
                        activity.status === 'negative' ? <ThumbsDown size={18} /> : <Star size={18} />) :
                     <AlertCircle size={18} />}
                  </div>
                  {index < recentActivity.length - 1 && (
                    <div className="absolute top-10 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{activity.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{activity.subtitle}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatRelative(activity.time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-display text-lg font-semibold text-slate-800 mb-4">节目进度</h3>
          <div className="space-y-4">
            {episodes.slice(0, 4).map(episode => (
              <div key={episode.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-slate-800 text-sm">{episode.title}</h4>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(episode.status))}>
                    {getStatusLabel(episode.status)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-500"
                    style={{
                      width: episode.status === 'published' ? '100%' :
                             episode.status === 'editing' ? '70%' :
                             episode.status === 'recording' ? '45%' :
                             episode.status === 'scheduled' ? '30%' : '15%'
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  {episode.guestId && (
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {guests.find(g => g.id === episode.guestId)?.name}
                    </span>
                  )}
                  {episode.publishDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(episode.publishDate)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbulb({ size }: { size: number }) {
  return <div style={{ width: size, height: size }}>💡</div>;
}
