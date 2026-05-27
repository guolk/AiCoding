import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Meeting } from '../types';

export default function MeetingForm() {
  const navigate = useNavigate();
  const { addMeeting, showToast, currentUser } = useStore();

  const [formData, setFormData] = useState<Omit<Meeting, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    date: '',
    time: '14:00',
    location: '',
    hosted_by: currentUser?.id || 1,
    minutes: '',
    action_items: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('请输入组会标题', 'error');
      return;
    }
    if (!formData.date) {
      showToast('请选择日期', 'error');
      return;
    }

    addMeeting(formData);
    showToast('组会创建成功', 'success');
    navigate('/meetings');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/meetings')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">新建组会</h1>
          <p className="text-sm text-neutral-500">记录组会信息和纪要</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">标题 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            placeholder="请输入组会标题"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">日期 *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">时间</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">地点</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
              placeholder="例如：会议室A"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">会议纪要</label>
          <textarea
            value={formData.minutes}
            onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
            className="input-textarea"
            rows={6}
            placeholder="记录本次会议的主要内容..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <button type="button" onClick={() => navigate('/meetings')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            创建组会
          </button>
        </div>
      </form>
    </div>
  );
}
