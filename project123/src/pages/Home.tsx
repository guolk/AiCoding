import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderPlus,
  Calendar,
  Clock,
  Users,
  Trash2,
  Edit3,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { Card, CardHeader, CardContent, EmptyState } from '@/components/common/Card';
import { Modal, ModalFooter } from '@/components/layout/Modal';
import { Input, Button } from '@/components/common/Form';
import { formatDate, exportJSON, importJSON } from '@/utils';
import type { ProjectData } from '@/types';

export function Home() {
  const navigate = useNavigate();
  const { projects, loadProjects, createProject, deleteProject, renameProject, importProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    const projectId = createProject(projectName.trim());
    setLoading(false);
    setShowCreateModal(false);
    setProjectName('');
    navigate(`/project/${projectId}/script`);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}/script`);
  };

  const handleRenameClick = (e: React.MouseEvent, projectId: string, currentName: string) => {
    e.stopPropagation();
    setSelectedProjectId(projectId);
    setNewName(currentName);
    setShowRenameModal(true);
  };

  const handleRename = () => {
    if (selectedProjectId && newName.trim()) {
      renameProject(selectedProjectId, newName.trim());
      setShowRenameModal(false);
      setSelectedProjectId(null);
      setNewName('');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setSelectedProjectId(projectId);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setShowDeleteModal(false);
      setSelectedProjectId(null);
    }
  };

  const handleExport = (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.stopPropagation();
    const { exportAllProjects } = require('@/utils/storage');
    const { projectDataMap } = exportAllProjects();
    const data = projectDataMap[projectId];
    if (data) {
      exportJSON(data, projectName);
    }
  };

  const handleImport = async () => {
    try {
      const data = await importJSON<ProjectData>();
      if (data && data.id) {
        importProject(data);
      }
    } catch (err) {
      console.error('导入失败:', err);
    }
  };

  const getProjectInfo = (project: any) => {
    return {
      characters: 0,
      clues: 0,
      playtests: 0
    };
  };

  return (
    <div className="min-h-screen bg-dark-bg bg-texture-dark">
      <header className="border-b border-dark-border bg-dark-surface/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold gradient-text text-shadow-glow">
                剧本杀创作工坊
              </h1>
              <p className="text-xs text-dark-muted">在线剧本创作与测试管理工具</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              导入项目
            </Button>
            <Button variant="gold" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建剧本
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <EmptyState
            icon={<FolderPlus className="w-16 h-16" />}
            title="还没有剧本项目"
            description="创建您的第一个剧本杀项目，开始创作之旅"
            action={
              <Button variant="gold" onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                创建新项目
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => {
              const info = getProjectInfo(project);
              return (
                <Card
                  key={project.id}
                  hover
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` } as React.CSSProperties}
                  onClick={() => handleOpenProject(project.id)}
                >
                  <CardHeader
                    title={project.name}
                    subtitle={`版本: ${project.currentVersion}`}
                    actions={
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => handleRenameClick(e, project.id, project.name)}
                          className="p-2 rounded hover:bg-dark-card transition-colors"
                          title="重命名"
                        >
                          <Edit3 className="w-4 h-4 text-dark-muted" />
                        </button>
                        <button
                          onClick={(e) => handleExport(e, project.id, project.name)}
                          className="p-2 rounded hover:bg-dark-card transition-colors"
                          title="导出"
                        >
                          <Download className="w-4 h-4 text-dark-muted" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, project.id)}
                          className="p-2 rounded hover:bg-red-500/20 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-dark-muted hover:text-red-400" />
                        </button>
                      </div>
                    }
                  />
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-dark-surface rounded">
                        <Users className="w-5 h-5 mx-auto text-primary-400" />
                        <p className="text-sm text-dark-muted mt-1">角色</p>
                        <p className="text-lg font-bold text-white">{info.characters}</p>
                      </div>
                      <div className="p-2 bg-dark-surface rounded">
                        <Clock className="w-5 h-5 mx-auto text-accent-gold" />
                        <p className="text-sm text-dark-muted mt-1">线索</p>
                        <p className="text-lg font-bold text-white">{info.clues}</p>
                      </div>
                      <div className="p-2 bg-dark-surface rounded">
                        <Calendar className="w-5 h-5 mx-auto text-green-400" />
                        <p className="text-sm text-dark-muted mt-1">测试</p>
                        <p className="text-lg font-bold text-white">{info.playtests}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-dark-muted">
                      <span>创建: {formatDate(project.createdAt)}</span>
                      <span>更新: {formatDate(project.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card
              hover
              className="border-dashed flex items-center justify-center min-h-[200px] cursor-pointer group"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary-600/20 flex items-center justify-center mb-3 group-hover:bg-primary-600/40 transition-colors">
                  <Plus className="w-6 h-6 text-primary-400" />
                </div>
                <p className="text-dark-muted group-hover:text-dark-text transition-colors">
                  创建新剧本
                </p>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建新剧本项目"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="剧本名称"
            value={projectName}
            onChange={setProjectName}
            placeholder="输入剧本名称..."
            required
          />
          <div className="p-4 bg-dark-surface rounded-lg">
            <h4 className="text-sm font-medium text-dark-text mb-2">提示</h4>
            <ul className="text-xs text-dark-muted space-y-1 list-disc list-inside">
              <li>您可以随时修改剧本名称</li>
              <li>建议使用简洁明了的名称</li>
              <li>支持中英文混合命名</li>
            </ul>
          </div>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            取消
          </Button>
          <Button variant="gold" onClick={handleCreateProject} disabled={!projectName.trim() || loading}>
            {loading ? '创建中...' : '创建项目'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="重命名项目"
        size="md"
      >
        <Input
          label="新名称"
          value={newName}
          onChange={setNewName}
          placeholder="输入新的项目名称..."
          required
        />
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowRenameModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleRename} disabled={!newName.trim()}>
            保存
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
        size="sm"
      >
        <p className="text-dark-muted">
          确定要删除此项目吗？此操作不可撤销，所有数据将被永久删除。
        </p>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            删除
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
