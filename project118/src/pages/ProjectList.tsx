import { useState } from 'react';
import { Plus, FolderKanban, Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { usePatternStore } from '@/stores/patternStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import SearchBar from '@/components/common/SearchBar';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ProgressBar from '@/components/common/ProgressBar';
import type { ProjectType, ProjectStatus } from '@/types';

const typeLabels: Record<ProjectType, string> = {
  knitting: '针织',
  crochet: '钩针',
  embroidery: '刺绣',
  weaving: '编织'
};

const statusLabels: Record<ProjectStatus, string> = {
  planning: '计划中',
  in_progress: '进行中',
  completed: '已完成'
};

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-emerald-100 text-emerald-700'
};

export default function ProjectList() {
  const navigate = useNavigate();
  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const patterns = usePatternStore((s) => s.patterns);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
    }
    setDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const getPatternName = (patternId?: string) => {
    if (!patternId) return null;
    return patterns.find((p) => p.id === patternId)?.name;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
          <p className="text-gray-500 mt-1">追踪你的编织项目进度</p>
        </div>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索项目..."
          className="flex-1 max-w-md"
        />
        <div className="flex gap-2">
          {(['all', 'planning', 'in_progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status === 'all' ? '全部' : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FolderKanban className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? '没有找到匹配的项目' : '还没有创建项目'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' ? '尝试其他筛选条件' : '开始你的第一个编织项目'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => navigate('/projects/new')}>
                <Plus className="w-4 h-4 mr-2" />
                新建项目
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-600">
                        {typeLabels[project.type]}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-md ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        setProjectToDelete(project.id);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                
                {getPatternName(project.patternId) && (
                  <p className="text-sm text-gray-500 truncate">
                    图案：{getPatternName(project.patternId)}
                  </p>
                )}
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">进度</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <ProgressBar
                    progress={project.progress}
                    color={project.status === 'completed' ? 'green' : 'orange'}
                  />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.createdAt)}
                  </span>
                  {project.photos.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {project.photos.length} 张照片
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-gray-600 mb-6">确定要删除这个项目吗？此操作无法撤销。</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </Modal>
    </div>
  );
}
