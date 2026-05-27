import { useState } from 'react';
import { Plus, Search, Calendar, User, MapPin, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function MeetingsList() {
  const navigate = useNavigate();
  const { meetings, users } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeetings = meetings.filter((meeting) => {
    return meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const upcomingMeetings = filteredMeetings.filter((m) => {
    const meetingDate = new Date(`${m.date}T${m.time}`);
    return meetingDate >= new Date();
  }).sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const pastMeetings = filteredMeetings.filter((m) => {
    const meetingDate = new Date(`${m.date}T${m.time}`);
    return meetingDate < new Date();
  }).sort((a, b) => {
    return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">组会管理</h1>
          <p className="text-sm text-neutral-500">记录和追踪组会纪要与行动项</p>
        </div>
        <button
          onClick={() => navigate('/meetings/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建组会
        </button>
      </div>

      <div className="card">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="搜索组会..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>

        {upcomingMeetings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-600" />
              即将进行的组会
            </h3>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border border-accent-100 bg-accent-50/30 rounded-xl hover:border-accent-200 cursor-pointer transition-all"
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {meeting.date} {meeting.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {getUserName(meeting.hosted_by)}
                        </span>
                      </div>
                    </div>
                    <span className="status-badge bg-accent-100 text-accent-700">即将开始</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            历史组会
          </h3>
          <div className="space-y-4">
            {pastMeetings.length > 0 ? (
              pastMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border border-neutral-100 rounded-xl hover:border-neutral-200 cursor-pointer transition-all"
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {meeting.date} {meeting.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {meeting.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {getUserName(meeting.hosted_by)}
                        </span>
                      </div>
                    </div>
                    {meeting.action_items && meeting.action_items.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-neutral-500">
                        <CheckCircle className="w-4 h-4" />
                        {meeting.action_items.filter((a) => a.status === 'completed').length}/{meeting.action_items.length} 已完成
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">暂无组会记录</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
