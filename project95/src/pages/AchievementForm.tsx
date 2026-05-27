import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Achievement } from '../types';

export default function AchievementForm() {
  const navigate = useNavigate();
  const { addAchievement, showToast, currentUser, projects } = useStore();

  const [formData, setFormData] = useState<Omit<Achievement, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    type: 'paper',
    status: 'draft',
    details: '',
    project_id: 0,
    created_by: currentUser?.id || 1,
    versions: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('请输入成果标题', 'error');
      return;
    }

    addAchievement(formData);
    showToast('成果创建成功', 'success');
    navigate('/achievements');
  };

  const typeOptions = [
    { value: 'paper', label: '论文' },
    { value: 'patent', label: '专利' },
    { value: 'report', label: '报告' },
  ];

  const statusOptions = [
    { value: 'draft', label: '草稿' },
    { value: 'submitted', label: '已提交' },
    { value: 'reviewing', label: '评审中' },
    { value: 'accepted', label: '已录用' },
    { value: 'published', label: '已发表' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/achievements')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">新建成果</h1>
          <p className="text-sm text-neutral-500">记录论文、专利或学术报告</p>
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
            placeholder="请输入成果标题"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Achievement['type'] })}
              className="input-field"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Achievement['status'] })}
              className="input-field"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">关联项目</label>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) })}
            className="input-field"
          >
            <option value={0}>请选择项目</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">详细信息</label>
          <textarea
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="input-textarea"
            rows={3}
            placeholder="请输入详细信息，如期刊名称、专利号等"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
          <button type="button" onClick={() => navigate('/achievements')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            创建成果
          </button>
        </div>
      </form>
    </div>
  );
}
