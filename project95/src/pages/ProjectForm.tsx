import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Project } from '../types';

export default function ProjectForm() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addProject, updateProject, showToast, currentUser } = useStore();
  const isEdit = !!projectId;
  const existingProject = isEdit ? projects.find((p) => p.id === parseInt(projectId!)) : null;

  const [formData, setFormData] = useState<Omit<Project, 'id' | 'created_at' | 'updated_at'>>({
    name: existingProject?.name || '',
    description: existingProject?.description || '',
    status: existingProject?.status || 'proposed',
    created_by: existingProject?.created_by || currentUser?.id || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('请输入项目名称', 'error');
      return;
    }

    if (isEdit && existingProject) {
      updateProject(existingProject.id, formData);
      showToast('项目更新成功', 'success');
    } else {
      addProject(formData);
      showToast('项目创建成功', 'success');
    }
    navigate('/projects');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">
            {isEdit ? '编辑项目' : '新建项目'}
          </h1>
          <p className="text-sm text-neutral-500">
            {isEdit ? '修改项目信息' : '创建一个新的研究项目'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">项目名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="请输入项目名称"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">项目描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-textarea"
              rows={4}
              placeholder="请输入项目描述"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
              className="input-field"
            >
              <option value="proposed">立项中</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="published">已发表</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-100">
          <button type="button" onClick={() => navigate('/projects')} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '创建项目'}
          </button>
        </div>
      </form>
    </div>
  );
}
