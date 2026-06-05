import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Calendar, Clock, AlertTriangle, CheckCircle, Bell, Mic, X, Check, Settings } from 'lucide-react';
import { formatDate, formatDateTime, hoursUntil, getStatusColor, getStatusLabel, cn } from '../../utils/helpers';
import { RecordingSession } from '../../types';

export default function RecordingSessions() {
  const { sessions, episodes, guests, addSession, updateSession } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RecordingSession>>({
    episodeId: '',
    scheduledAt: '',
    reminderSent: false,
    equipmentCheck: false,
    status: 'scheduled',
  });

  const now = new Date();
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled').sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  const pastSessions = sessions.filter(s => s.status !== 'scheduled').sort((a, b) => 
    new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );

  const handleSubmit = () => {
    if (!formData.episodeId || !formData.scheduledAt) return;
    addSession(formData as Omit<RecordingSession, 'id'>);
    setShowAddModal(false);
    setFormData({
      episodeId: '',
      scheduledAt: '',
      reminderSent: false,
      equipmentCheck: false,
      status: 'scheduled',
    });
  };

  const getTimeWarning = (date: string) => {
    const hours = hoursUntil(date);
    if (hours <= 0) return { type: 'overdue', text: '已到时间' };
    if (hours <= 24) return { type: 'urgent', text: `${hours} 小时后` };
    if (hours <= 72) return { type: 'soon', text: `${Math.ceil(hours / 24)} 天后` };
    return { type: 'normal', text: `${Math.ceil(hours / 24)} 天后` };
  };

  const getEpisodeTitle = (id: string) => episodes.find(e => e.id === id)?.title || '未知节目';
  const getGuestName = (episodeId: string) => {
    const ep = episodes.find(e => e.id === episodeId);
    return ep?.guestId ? guests.find(g => g.id === ep.guestId)?.name : undefined;
  };

  const equipmentChecklist = [
    { id: 'mic', label: '麦克风测试', icon: Mic },
    { id: 'internet', label: '网络稳定性', icon: Settings },
    { id: 'software', label: '录制软件', icon: Settings },
    { id: 'backup', label: '备份设备', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-accent-600">{upcomingSessions.length}</p>
            <p className="text-xs text-slate-500">即将录制</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-slate-700">{pastSessions.length}</p>
            <p className="text-xs text-slate-500">已完成</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
        >
          <Plus size={18} />
          预约录制
        </button>
      </div>

      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="text-accent-500" size={20} />
            即将录制
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingSessions.map((session, index) => {
              const warning = getTimeWarning(session.scheduledAt);
              const guestName = getGuestName(session.episodeId);
              return (
                <div
                  key={session.id}
                  className={cn(
                    'bg-white rounded-xl border p-5 transition-all animate-slide-up',
                    warning.type === 'urgent' ? 'border-red-300 shadow-lg shadow-red-100' : 'border-slate-200 hover:shadow-md'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        warning.type === 'urgent' ? 'bg-red-100 text-red-600' :
                        warning.type === 'soon' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-primary-100 text-primary-600'
                      )}>
                        {warning.type === 'urgent' ? <AlertTriangle size={24} /> : <Calendar size={24} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{getEpisodeTitle(session.episodeId)}</h4>
                        {guestName && (
                          <p className="text-sm text-slate-500">嘉宾: {guestName}</p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      warning.type === 'urgent' ? 'bg-red-100 text-red-700' :
                      warning.type === 'soon' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-primary-100 text-primary-700'
                    )}>
                      {warning.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      {formatDate(session.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock size={16} className="text-slate-400" />
                      {formatDate(session.scheduledAt, 'HH:mm')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {session.reminderSent ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        <CheckCircle size={14} /> 提醒已发送
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                        <Bell size={14} /> 等待提醒
                      </span>
                    )}
                    {hoursUntil(session.scheduledAt) <= 24 && !session.equipmentCheck && (
                      <button
                        onClick={() => setSelectedSession(session.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-accent-100 text-accent-700 rounded-lg text-xs font-medium hover:bg-accent-200 transition-colors"
                      >
                        <AlertTriangle size={14} /> 设备检查
                      </button>
                    )}
                    {session.equipmentCheck && (
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                        <CheckCircle size={14} /> 设备已检查
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSession(session.id, { status: 'completed', actualDuration: 3600 })}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      标记完成
                    </button>
                    <button
                      onClick={() => updateSession(session.id, { status: 'cancelled' })}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pastSessions.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            历史记录
          </h3>
          <div className="space-y-3">
            {pastSessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  session.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                )}>
                  {session.status === 'completed' ? <CheckCircle size={20} /> : <X size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800">{getEpisodeTitle(session.episodeId)}</h4>
                  <p className="text-sm text-slate-500">{formatDateTime(session.scheduledAt)}</p>
                </div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(session.status))}>
                  {getStatusLabel(session.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">预约录制</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选择节目</label>
                <select
                  value={formData.episodeId}
                  onChange={(e) => setFormData({ ...formData, episodeId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">请选择要录制的节目</option>
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">录制时间</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <Bell size={18} className="flex-shrink-0 mt-0.5" />
                  系统将在录制前24小时自动发送设备检查提醒
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                确认预约
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">录制前设备检查</h3>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">请逐项检查以下设备，确保录制顺利进行</p>
            <div className="space-y-3">
              {equipmentChecklist.map(item => (
                <label key={item.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" className="w-5 h-5 accent-accent-500 rounded" />
                  <item.icon size={20} className="text-slate-400" />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedSession(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                稍后再说
              </button>
              <button
                onClick={() => {
                  updateSession(selectedSession, { equipmentCheck: true });
                  setSelectedSession(null);
                }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                全部确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
