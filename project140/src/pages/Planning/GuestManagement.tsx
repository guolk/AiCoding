import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Mail, Phone, MessageSquare, Calendar, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { formatDate, formatRelative, getStatusColor, getStatusLabel, cn } from '../../utils/helpers';
import { Guest, CommunicationEntry } from '../../types';

export default function GuestManagement() {
  const { guests, addGuest, updateGuest, addGuestCommunication } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCommModal, setShowCommModal] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Guest>>({
    name: '',
    contact: '',
    company: '',
    title: '',
    status: 'invited',
  });
  const [commData, setCommData] = useState({
    content: '',
    type: 'email' as CommunicationEntry['type'],
  });

  const handleSubmit = () => {
    if (!formData.name?.trim() || !formData.contact?.trim()) return;
    addGuest(formData as Omit<Guest, 'id' | 'communicationLog'>);
    setShowAddModal(false);
    setFormData({ name: '', contact: '', company: '', title: '', status: 'invited' });
  };

  const handleAddComm = () => {
    if (!showCommModal || !commData.content.trim()) return;
    addGuestCommunication(showCommModal, commData);
    setShowCommModal(null);
    setCommData({ content: '', type: 'email' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const statusProgress: Record<Guest['status'], number> = {
    'invited': 25,
    'negotiating': 50,
    'confirmed': 100,
    'declined': 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {(['invited', 'negotiating', 'confirmed', 'declined'] as const).map(status => (
            <div key={status} className="text-center">
              <p className="font-display text-2xl font-bold text-slate-800">
                {guests.filter(g => g.status === status).length}
              </p>
              <p className="text-xs text-slate-500">{getStatusLabel(status)}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
        >
          <Plus size={18} />
          添加嘉宾
        </button>
      </div>

      <div className="space-y-3">
        {guests.map((guest, index) => (
          <div
            key={guest.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === guest.id ? null : guest.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                  {getInitials(guest.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-800">{guest.name}</h3>
                    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(guest.status))}>
                      {getStatusLabel(guest.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {guest.title} · {guest.company}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">上次联系</p>
                    <p className="text-sm text-slate-600">{formatRelative(guest.lastContact)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`mailto:${guest.contact}`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail size={18} />
                    </a>
                    <a
                      href={`tel:${guest.contact}`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-green-600 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={18} />
                    </a>
                    <button
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-accent-500 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setShowCommModal(guest.id); }}
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    {expandedId === guest.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>邀请进度</span>
                  <span>{statusProgress[guest.status]}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      guest.status === 'confirmed' ? 'bg-success' :
                      guest.status === 'declined' ? 'bg-danger' :
                      'bg-gradient-to-r from-accent-400 to-accent-500'
                    )}
                    style={{ width: `${statusProgress[guest.status]}%` }}
                  />
                </div>
              </div>
            </div>

            {expandedId === guest.id && (
              <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50 animate-slide-down">
                <div className="pt-4">
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} className="text-accent-500" />
                    沟通记录
                  </h4>
                  <div className="space-y-3">
                    {guest.communicationLog.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">暂无沟通记录</p>
                    ) : (
                      guest.communicationLog.map((entry, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="relative">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                              entry.type === 'email' ? 'bg-blue-100 text-blue-600' :
                              entry.type === 'phone' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            )}>
                              {entry.type === 'email' ? <Mail size={14} /> :
                               entry.type === 'phone' ? <Phone size={14} /> :
                               <MessageSquare size={14} />}
                            </div>
                            {idx < guest.communicationLog.length - 1 && (
                              <div className="absolute top-8 left-1/2 w-px h-8 bg-slate-200 -translate-x-1/2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                              <span>{getStatusLabel(entry.type)}</span>
                              <span>·</span>
                              <span>{formatDateTime(entry.date)}</span>
                            </div>
                            <p className="text-sm text-slate-700">{entry.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCommModal(guest.id); }}
                    className="mt-3 w-full py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-accent-500 hover:text-accent-500 transition-colors"
                  >
                    + 添加沟通记录
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="font-medium text-slate-700 mb-3">更新状态</h4>
                  <div className="flex flex-wrap gap-2">
                    {(['invited', 'negotiating', 'confirmed', 'declined'] as const).map(status => (
                      <button
                        key={status}
                        onClick={(e) => { e.stopPropagation(); updateGuest(guest.id, { status }); }}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          guest.status === status
                            ? 'bg-accent-500 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:border-accent-500 hover:text-accent-500'
                        )}
                      >
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">添加新嘉宾</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="嘉宾姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">联系方式</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="邮箱或电话"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">公司</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="所在公司"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">职位</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="职位头衔"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">初始状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Guest['status'] })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="invited">已邀请</option>
                  <option value="negotiating">沟通中</option>
                  <option value="confirmed">已确认</option>
                </select>
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
                添加嘉宾
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">添加沟通记录</h3>
              <button onClick={() => setShowCommModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">沟通方式</label>
                <div className="flex gap-2">
                  {(['email', 'phone', 'meeting'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setCommData({ ...commData, type })}
                      className={cn(
                        'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all',
                        commData.type === type
                          ? 'bg-accent-500 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {type === 'email' ? <Mail size={16} /> : type === 'phone' ? <Phone size={16} /> : <MessageSquare size={16} />}
                      {getStatusLabel(type)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">沟通内容</label>
                <textarea
                  value={commData.content}
                  onChange={(e) => setCommData({ ...commData, content: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  rows={4}
                  placeholder="记录本次沟通的主要内容..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCommModal(null)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddComm}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateTime(date: string) {
  return formatDate(date, 'MM-dd HH:mm');
}
