import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function VolunteerForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { volunteers, addVolunteer, updateVolunteer } = useStore();
  const isEditing = !!id;

  const volunteer = isEditing ? volunteers.find((v) => v.id === id) : null;

  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    phone: '',
    email: '',
    skills: '',
    availableTime: '',
    joinDate: '',
    totalHours: 0,
  });

  useEffect(() => {
    if (volunteer) {
      setFormData({
        name: volunteer.name,
        avatar: volunteer.avatar,
        phone: volunteer.phone,
        email: volunteer.email,
        skills: volunteer.skills.join(', '),
        availableTime: volunteer.availableTime,
        joinDate: volunteer.joinDate,
        totalHours: volunteer.totalHours,
      });
    }
  }, [volunteer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);

    const volunteerData = {
      name: formData.name,
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      phone: formData.phone,
      email: formData.email,
      skills: skillsArray,
      availableTime: formData.availableTime,
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      totalHours: formData.totalHours,
      activities: [],
      certifications: [],
      awards: [],
    };

    if (isEditing && id) {
      updateVolunteer(id, volunteerData);
    } else {
      addVolunteer(volunteerData);
    }

    navigate('/volunteers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/volunteers" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '编辑志愿者' : '添加志愿者'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? '修改志愿者信息' : '填写志愿者基本信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">姓名 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入姓名"
              required
            />
          </div>

          <div>
            <label className="label">手机号码 *</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="请输入手机号码"
              required
            />
          </div>

          <div>
            <label className="label">邮箱</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label className="label">加入日期</label>
            <input
              type="date"
              className="input"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>

          <div>
            <label className="label">累计服务时长（小时）</label>
            <input
              type="number"
              className="input"
              value={formData.totalHours}
              onChange={(e) => setFormData({ ...formData, totalHours: Number(e.target.value) })}
              min="0"
            />
          </div>

          <div>
            <label className="label">可参与时间</label>
            <input
              type="text"
              className="input"
              value={formData.availableTime}
              onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
              placeholder="如：周末全天、工作日晚上"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">技能特长</label>
            <input
              type="text"
              className="input"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="多个技能用逗号分隔，如：急救, 驾驶, 摄影"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/volunteers" className="btn btn-secondary">
            取消
          </Link>
          <button type="submit" className="btn btn-primary">
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '添加志愿者'}
          </button>
        </div>
      </form>
    </div>
  );
}
