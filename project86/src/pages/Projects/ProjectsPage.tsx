import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Project } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, ExternalLink, Github, Calendar, Tag, Lightbulb, AlertTriangle, CheckCircle2, FolderGit2 } from 'lucide-react';
import { generateId } from '../../utils/storage';

const ProjectsPage: React.FC = () => {
  const { state, updateProject, deleteProject } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      updateProject({ ...editingProject, ...projectData } as Project);
    } else {
      const newProject: Project = {
        id: generateId(),
        name: projectData.name || '',
        techStack: projectData.techStack || [],
        description: projectData.description || '',
        features: projectData.features || [],
        challenges: projectData.challenges || '',
        solutions: projectData.solutions || '',
        sourceCodeUrl: projectData.sourceCodeUrl || '',
        demoUrl: projectData.demoUrl || '',
        media: projectData.media || [],
        highlights: projectData.highlights || [],
        startDate: projectData.startDate || '',
        endDate: projectData.endDate || '',
      };
      updateProject(newProject);
    }
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">项目作品集</h1>
          <p className="text-slate-500 mt-1">管理你的项目档案，提炼项目亮点</p>
        </div>
        <Button onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          新增项目
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-4">
          {state.projects.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16 text-slate-400">
                <FolderGit2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">暂无项目</p>
                <p className="text-sm mt-2">点击右上角添加第一个项目</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {state.projects.map(project => (
                <Card
                  key={project.id}
                  hover
                  className={`cursor-pointer transition-all ${
                    selectedProject?.id === project.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  {project.media.length > 0 && project.media[0].type === 'screenshot' && (
                    <div className="h-40 overflow-hidden rounded-t-xl">
                      <img
                        src={project.media[0].url}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent>
                    <h3 className="font-semibold text-lg text-slate-800">{project.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.slice(0, 4).map(tech => (
                        <Badge key={tech} variant="primary">{tech}</Badge>
                      ))}
                      {project.techStack.length > 4 && (
                        <Badge variant="default">+{project.techStack.length - 4}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {project.startDate} ~ {project.endDate}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        {project.highlights.length} 个亮点
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-3">
          {selectedProject ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {selectedProject.startDate} ~ {selectedProject.endDate}
                      </span>
                      {selectedProject.sourceCodeUrl && (
                        <a
                          href={selectedProject.sourceCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-600 hover:text-primary-600 flex items-center gap-1"
                        >
                          <Github className="w-4 h-4" />
                          源码
                        </a>
                      )}
                      {selectedProject.demoUrl && (
                        <a
                          href={selectedProject.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          在线演示
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingProject(selectedProject);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('确定要删除这个项目吗？')) {
                          handleDeleteProject(selectedProject.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{selectedProject.description}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                      <Tag className="w-4 h-4 text-primary-600" />
                      技术栈
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map(tech => (
                        <Badge key={tech} variant="primary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">主要功能</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedProject.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      遇到的挑战
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 text-sm">{selectedProject.challenges}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-primary-500" />
                      解决方案
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 text-sm">{selectedProject.solutions}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    项目亮点（简历可用）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedProject.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-slate-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {selectedProject.media.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">项目截图与演示</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProject.media.map(media => (
                        <div key={media.id} className="group relative rounded-lg overflow-hidden border border-slate-200">
                          {media.type === 'screenshot' ? (
                            <img
                              src={media.url}
                              alt={media.description}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                              <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm text-center px-2">
                              {media.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FolderGit2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择或创建一个项目</p>
                  <p className="text-sm mt-2">在左侧点击项目卡片查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? '编辑项目' : '新增项目'}
        size="2xl"
      >
        <ProjectForm
          initialData={editingProject}
          onSave={handleSaveProject}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const ProjectForm: React.FC<{
  initialData: Project | null;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    techStack: initialData?.techStack.join(', ') || '',
    features: initialData?.features.join('\n') || '',
    challenges: initialData?.challenges || '',
    solutions: initialData?.solutions || '',
    sourceCodeUrl: initialData?.sourceCodeUrl || '',
    demoUrl: initialData?.demoUrl || '',
    highlights: initialData?.highlights.join('\n') || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
      features: formData.features.split('\n').map(s => s.trim()).filter(Boolean),
      highlights: formData.highlights.split('\n').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">项目名称</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">开始日期</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">结束日期</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">项目描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">技术栈（用逗号分隔）</label>
        <input
          type="text"
          value={formData.techStack}
          onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="React, TypeScript, Node.js"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">主要功能（每行一个）</label>
        <textarea
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          placeholder="功能1&#10;功能2&#10;功能3"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">遇到的挑战</label>
          <textarea
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">解决方案</label>
          <textarea
            value={formData.solutions}
            onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">源码链接</label>
          <input
            type="url"
            value={formData.sourceCodeUrl}
            onChange={(e) => setFormData({ ...formData, sourceCodeUrl: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">演示链接</label>
          <input
            type="url"
            value={formData.demoUrl}
            onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://demo.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">项目亮点（每行一个，简历可用）</label>
        <textarea
          value={formData.highlights}
          onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          placeholder="亮点1（建议用数据量化成果）&#10;亮点2&#10;亮点3"
        />
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

export default ProjectsPage;
