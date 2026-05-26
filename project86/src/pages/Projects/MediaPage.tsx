import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ProjectMedia, Project } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Image, Video } from 'lucide-react';
import { generateId } from '../../utils/storage';

const MediaPage: React.FC = () => {
  const { state, updateProject } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<Project | null>(state.projects[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ProjectMedia | null>(null);
  const [previewMedia, setPreviewMedia] = useState<ProjectMedia | null>(null);

  const handleSaveMedia = (mediaData: Partial<ProjectMedia>) => {
    if (!selectedProject) return;

    if (editingMedia) {
      const updatedProject: Project = {
        ...selectedProject,
        media: selectedProject.media.map(m =>
          m.id === editingMedia.id ? { ...m, ...mediaData } as ProjectMedia : m
        )
      };
      updateProject(updatedProject);
      setSelectedProject(updatedProject);
    } else {
      const newMedia: ProjectMedia = {
        id: generateId(),
        type: mediaData.type || 'screenshot',
        url: mediaData.url || '',
        description: mediaData.description || '',
      };
      const updatedProject: Project = {
        ...selectedProject,
        media: [...selectedProject.media, newMedia]
      };
      updateProject(updatedProject);
      setSelectedProject(updatedProject);
    }
    setIsModalOpen(false);
    setEditingMedia(null);
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (!selectedProject) return;
    const updatedProject: Project = {
      ...selectedProject,
      media: selectedProject.media.filter(m => m.id !== mediaId)
    };
    updateProject(updatedProject);
    setSelectedProject(updatedProject);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">项目素材管理</h1>
          <p className="text-slate-500 mt-1">管理项目截图和演示视频</p>
        </div>
        {selectedProject && (
          <Button onClick={() => { setEditingMedia(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            添加素材
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>选择项目</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {state.projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedProject?.id === project.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {project.media.length} 个素材
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          {selectedProject ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject.name} - 素材库</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedProject.media.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">暂无素材</p>
                    <p className="text-sm mt-2">点击右上角添加项目截图或演示视频</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {selectedProject.media.map(media => (
                      <div
                        key={media.id}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setPreviewMedia(media)}
                      >
                        {media.type === 'screenshot' ? (
                          <img
                            src={media.url}
                            alt={media.description}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                            <Video className="w-16 h-16 text-white opacity-80" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center justify-between">
                            <Badge variant={media.type === 'screenshot' ? 'info' : 'warning'}>
                              {media.type === 'screenshot' ? '截图' : '视频'}
                            </Badge>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingMedia(media);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 bg-white/90 rounded hover:bg-white transition-colors"
                              >
                                <Edit className="w-4 h-4 text-slate-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('确定要删除这个素材吗？')) {
                                    handleDeleteMedia(media.id);
                                  }
                                }}
                                className="p-1.5 bg-white/90 rounded hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <p className="text-white text-sm mt-2 line-clamp-2">{media.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一个项目</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedia ? '编辑素材' : '添加素材'}
        size="lg"
      >
        <MediaForm
          initialData={editingMedia}
          onSave={handleSaveMedia}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {previewMedia && (
        <Modal
          isOpen={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
          title={previewMedia.description}
          size="xl"
        >
          <div className="space-y-4">
            {previewMedia.type === 'screenshot' ? (
              <img
                src={previewMedia.url}
                alt={previewMedia.description}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">视频播放器占位</p>
                  <p className="text-sm text-slate-400 mt-2">{previewMedia.url}</p>
                </div>
              </div>
            )}
            <p className="text-slate-600">{previewMedia.description}</p>
            <div className="flex justify-end">
              <Button onClick={() => setPreviewMedia(null)}>关闭</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const MediaForm: React.FC<{
  initialData: ProjectMedia | null;
  onSave: (data: Partial<ProjectMedia>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'screenshot' as 'screenshot' | 'video',
    url: initialData?.url || '',
    description: initialData?.description || '',
  });

  const handleSave = () => {
    if (!formData.url.trim()) {
      alert('请输入素材URL');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">素材类型</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'screenshot' })}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
              formData.type === 'screenshot'
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Image className="w-8 h-8 text-slate-600" />
            <span className="font-medium">截图</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'video' })}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
              formData.type === 'video'
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Video className="w-8 h-8 text-slate-600" />
            <span className="font-medium">视频</span>
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">素材URL</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="描述这个素材的内容..."
        />
      </div>
      {formData.url && formData.type === 'screenshot' && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">预览</p>
          <img
            src={formData.url}
            alt="预览"
            className="w-full max-h-64 object-contain border border-slate-200 rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="button" onClick={handleSave}>
          保存
        </Button>
      </div>
    </div>
  );
};

export default MediaPage;
