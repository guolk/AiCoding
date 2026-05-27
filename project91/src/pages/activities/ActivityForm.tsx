import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Activity } from '@/types';

export default function ActivityForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, addActivity, updateActivity } = useStore();
  const isEditing = !!id;

  const activity = isEditing ? activities.find((a) => a.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    maxVolunteers: 10,
    requiredSkills: '' as string | string[],
    status: 'draft' as Activity['status'],
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name,
        description: activity.description,
        startTime: activity.startTime.slice(0, 16),
        endTime: activity.endTime.slice(0, 16),
        location: activity.location,
        maxVolunteers: activity.maxVolunteers,
        requiredSkills: activity.requiredSkills.join(', '),
        status: activity.status,
      });
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const skillsArray = Array.isArray(formData.requiredSkills)
      ? formData.requiredSkills
      : formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);

    const activityData = {
      name: formData.name,
      description: formData.description,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      location: formData.location,
      maxVolunteers: formData.maxVolunteers,
      requiredSkills: skillsArray,
      status: formData.status,
    };

    if (isEditing && id) {
      updateActivity(id, activityData);
    } else {
      addActivity(activityData);
    }

    navigate('/activities');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/activities" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '编辑活动' : '发布新活动'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? '修改活动信息' : '填写活动基本信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="label">活动名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入活动名称"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">活动简介 *</label>
            <textarea
              className="input min-h-[120px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请详细描述活动内容、目的和注意事项"
              required
            />
          </div>

          <div>
            <label className="label">开始时间 *</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">结束时间 *</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">活动地点 *</label>
            <input
              type="text"
              className="input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="请输入活动地点"
              required
            />
          </div>

          <div>
            <label className="label">招募人数 *</label>
            <input
              type="number"
              className="input"
              value={formData.maxVolunteers}
              onChange={(e) => setFormData({ ...formData, maxVolunteers: Number(e.target.value) })}
              min="1"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">技能要求</label>
            <input
              type="text"
              className="input"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
              placeholder="多个技能用逗号分隔，如：急救, 驾驶, 摄影"
            />
          </div>

          <div>
            <label className="label">活动状态</label>
            <select
              className="input"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Activity['status'] })}
            >
              <option value="draft">草稿</option>
              <option value="recruiting">招募中</option>
              <option value="ongoing">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/activities" className="btn btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn btn-primary">
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '发布活动'}
          </button>
        </div>
      </form>
    </div>
  );
}
