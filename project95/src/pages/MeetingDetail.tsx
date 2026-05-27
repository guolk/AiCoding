import { useState } from 'react';
import { ArrowLeft, Calendar, User, MapPin, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';

export default function MeetingDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { meetings, users, addActionItem, updateActionItem, showToast, currentUser } = useStore();
  const [showActionModal, setShowActionModal] = useState(false);
  const [newActionItem, setNewActionItem] = useState({ description: '', assignee_id: 0, due_date: '', status: 'pending' as const });

  const meeting = meetings.find((m) => m.id === parseInt(id || '0'));

  if (!meeting) {
    return (
      <div className="p-6">
        <p className="text-neutral-500">组会不存在</p>
        <button onClick={() => navigate('/meetings')} className="mt-4 btn-secondary">
          返回组会列表
        </button>
      </div>
    );
  }

  const getUserName = (userId: number) => users.find((u) => u.id === userId)?.name || '未知';

  const handleAddAction = () => {
    if (!newActionItem.description.trim()) {
      showToast('请输入行动项描述', 'error');
      return;
    }
    addActionItem(meeting.id, newActionItem);
    showToast('行动项添加成功', 'success');
    setShowActionModal(false);
    setNewActionItem({ description: '', assignee_id: 0, due_date: '', status: 'pending' });
  };

  const toggleActionItem = (itemId: number) => {
    const item = meeting.action_items.find((ai) => ai.id === itemId);
    if (item) {
      updateActionItem(meeting.id, itemId, { status: item.status === 'completed' ? 'pending' : 'completed' });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/meetings')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">{meeting.title}</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm text-neutral-500">
              <Calendar className="w-4 h-4 inline mr-1" />
              {meeting.date} {meeting.time}
            </span>
            <span className="text-sm text-neutral-500">
              <MapPin className="w-4 h-4 inline mr-1" />
              {meeting.location}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="font-medium text-neutral-900">{getUserName(meeting.hosted_by)}</p>
              <p className="text-sm text-neutral-500">主持人</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-4">会议纪要</h3>
          <pre className="whitespace-pre-wrap text-neutral-700 font-sans text-sm">{meeting.minutes}</pre>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900">行动项</h3>
            <button onClick={() => setShowActionModal(true)} className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              添加行动项
            </button>
          </div>

          {meeting.action_items.length > 0 ? (
            <div className="space-y-3">
              {meeting.action_items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    item.status === 'completed'
                      ? 'bg-green-50 border border-green-100'
                      : 'bg-neutral-50 border border-neutral-100'
                  }`}
                  onClick={() => toggleActionItem(item.id)}
                >
                  {item.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-neutral-300 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${item.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {getUserName(item.assignee_id)}
                      </span>
                      {item.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.due_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">暂无行动项</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate('/meetings')} className="btn-primary">
            返回列表
          </button>
        </div>
      </div>

      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="添加行动项"
        footer={
          <>
            <button onClick={() => setShowActionModal(false)} className="btn-secondary">
              取消
            </button>
            <button onClick={handleAddAction} className="btn-primary">
              添加
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">描述 *</label>
            <textarea
              value={newActionItem.description}
              onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
              className="input-textarea"
              rows={2}
              placeholder="请输入行动项描述"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">负责人</label>
              <select
                value={newActionItem.assignee_id}
                onChange={(e) => setNewActionItem({ ...newActionItem, assignee_id: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value={0}>请选择负责人</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">截止日期</label>
              <input
                type="date"
                value={newActionItem.due_date}
                onChange={(e) => setNewActionItem({ ...newActionItem, due_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
