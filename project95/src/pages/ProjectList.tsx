import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects, users, deleteProject, showToast } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      showToast('项目删除成功', 'success');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const getProjectOwner = (userId: number) => {
    return users.find((u) => u.id === userId)?.name || '未知';
  };

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: 'proposed', label: '立项中' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'published', label: '已发表' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">项目管理</h1>
          <p className="text-sm text-neutral-500">管理研究项目的生命周期</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建项目
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-32"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">项目名称</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">创建人</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-500">创建时间</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-neutral-900">{project.name}</p>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{project.description}</p>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-700">{getProjectOwner(project.created_by)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-neutral-500">
                      {new Date(project.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="p-2 text-neutral-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                        className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToDelete(project.id);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProjects.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-neutral-500">没有找到匹配的项目</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        title="确认删除"
        footer={
          <>
            <button
              onClick={() => {
                setDeleteModalOpen(false);
                setProjectToDelete(null);
              }}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleDelete} className="btn-primary">
              确认删除
            </button>
          </>
        }
      >
        <p className="text-neutral-700">确定要删除这个项目吗？此操作无法撤销。</p>
      </Modal>
    </div>
  );
}
