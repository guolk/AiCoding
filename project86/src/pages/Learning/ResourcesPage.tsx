import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LearningResource, ResourceType, RoadmapNode, TechStack } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, Star, BookOpen, Video, FileText, GraduationCap, Newspaper, Check, ExternalLink } from 'lucide-react';
import { generateId } from '../../utils/storage';

const ResourcesPage: React.FC = () => {
  const { state, updateTechStack } = useAppContext();
  const [selectedTechStack, setSelectedTechStack] = useState<TechStack | null>(state.techStacks[0] || null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  const resourceTypeConfig: Record<ResourceType, { label: string; icon: React.ReactNode; color: string }> = {
    book: { label: '书籍', icon: <BookOpen className="w-4 h-4" />, color: 'bg-amber-500' },
    video: { label: '视频', icon: <Video className="w-4 h-4" />, color: 'bg-red-500' },
    document: { label: '文档', icon: <FileText className="w-4 h-4" />, color: 'bg-blue-500' },
    course: { label: '课程', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-emerald-500' },
    article: { label: '文章', icon: <Newspaper className="w-4 h-4" />, color: 'bg-purple-500' },
  };

  const getFilteredResources = () => {
    if (!selectedNode) return [];
    return selectedNode.resources.filter(r => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterRating !== 'all' && r.rating !== filterRating) return false;
      return true;
    });
  };

  const handleSaveResource = (resourceData: Partial<LearningResource>) => {
    if (!selectedTechStack || !selectedNode) return;

    if (editingResource) {
      const updatedRoadmap = selectedTechStack.roadmap.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            resources: node.resources.map(r =>
              r.id === editingResource.id ? { ...r, ...resourceData } as LearningResource : r
            )
          };
        }
        return node;
      });
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
      setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
    } else {
      const newResource: LearningResource = {
        id: generateId(),
        name: resourceData.name || '',
        type: resourceData.type || 'document',
        url: resourceData.url || '',
        rating: resourceData.rating || 0,
        review: resourceData.review || '',
        completed: false,
      };
      const updatedRoadmap = selectedTechStack.roadmap.map(node => {
        if (node.id === selectedNode.id) {
          return { ...node, resources: [...node.resources, newResource] };
        }
        return node;
      });
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
      setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
    }
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!selectedTechStack || !selectedNode) return;
    const updatedRoadmap = selectedTechStack.roadmap.map(node => {
      if (node.id === selectedNode.id) {
        return { ...node, resources: node.resources.filter(r => r.id !== resourceId) };
      }
      return node;
    });
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
  };

  const handleToggleCompleted = (resourceId: string) => {
    if (!selectedTechStack || !selectedNode) return;
    const updatedRoadmap = selectedTechStack.roadmap.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          resources: node.resources.map(r =>
            r.id === resourceId ? { ...r, completed: !r.completed } : r
          )
        };
      }
      return node;
    });
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
  };

  const handleUpdateRating = (resourceId: string, rating: number) => {
    if (!selectedTechStack || !selectedNode) return;
    const updatedRoadmap = selectedTechStack.roadmap.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          resources: node.resources.map(r =>
            r.id === resourceId ? { ...r, rating } : r
          )
        };
      }
      return node;
    });
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    setSelectedNode(updatedRoadmap.find(n => n.id === selectedNode.id) || null);
  };

  const renderStars = (rating: number, interactive: boolean = false, resourceId?: string) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={interactive && resourceId ? () => handleUpdateRating(resourceId, star) : undefined}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            <Star
              className={`w-4 h-4 ${
                star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">学习资源评级推荐</h1>
          <p className="text-slate-500 mt-1">管理和评价你的学习资源</p>
        </div>
        {selectedNode && (
          <Button onClick={() => { setEditingResource(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4" />
            添加资源
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>技术栈</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {state.techStacks.map(techStack => (
                  <button
                    key={techStack.id}
                    onClick={() => {
                      setSelectedTechStack(techStack);
                      setSelectedNode(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedTechStack?.id === techStack.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xl">{techStack.icon}</span>
                    <span className="font-medium">{techStack.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedTechStack && (
            <Card>
              <CardHeader>
                <CardTitle>知识点</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {selectedTechStack.roadmap.map(node => (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedNode?.id === node.id
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{node.name}</span>
                        <Badge variant="default" className="text-xs">
                          {node.resources.length}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500">资源类型</p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filterType === 'all' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      全部
                    </button>
                    {(Object.keys(resourceTypeConfig) as ResourceType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${
                          filterType === type ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {resourceTypeConfig[type].icon}
                        {resourceTypeConfig[type].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500">评分筛选</p>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => setFilterRating('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filterRating === 'all' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    全部
                  </button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilterRating(rating)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        filterRating === rating ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
                <h2 className="text-xl font-bold">{selectedNode.name}</h2>
                <p className="text-primary-100 mt-1">{selectedNode.description}</p>
                <div className="flex items-center gap-6 mt-4">
                  <div>
                    <p className="text-3xl font-bold">{selectedNode.resources.length}</p>
                    <p className="text-sm text-primary-100">总资源数</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      {selectedNode.resources.filter(r => r.completed).length}
                    </p>
                    <p className="text-sm text-primary-100">已完成</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">
                      {selectedNode.resources.length > 0
                        ? (selectedNode.resources.reduce((sum, r) => sum + r.rating, 0) / selectedNode.resources.length).toFixed(1)
                        : 0}
                    </p>
                    <p className="text-sm text-primary-100">平均评分</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedNode.resources.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12 text-slate-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>暂无学习资源</p>
                      <p className="text-sm mt-1">点击右上角按钮添加第一个资源</p>
                    </CardContent>
                  </Card>
                ) : (
                  getFilteredResources().map(resource => (
                    <Card key={resource.id} hover>
                      <CardContent>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl ${resourceTypeConfig[resource.type].color} flex items-center justify-center text-white flex-shrink-0`}>
                              {resourceTypeConfig[resource.type].icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-slate-800">{resource.name}</h3>
                                <Badge variant={resource.completed ? 'success' : 'default'}>
                                  {resource.completed ? '已完成' : '学习中'}
                                </Badge>
                                <Badge variant="primary">
                                  {resourceTypeConfig[resource.type].label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                {renderStars(resource.rating, true, resource.id)}
                                {resource.url && (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm"
                                  >
                                    打开链接
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              {resource.review && (
                                <p className="text-sm text-slate-600 mt-3 bg-slate-50 rounded-lg p-3">
                                  💡 {resource.review}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCompleted(resource.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                resource.completed
                                  ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                              title={resource.completed ? '标记为未完成' : '标记为已完成'}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingResource(resource);
                                setIsModalOpen(true);
                              }}
                              className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定要删除这个资源吗？')) {
                                  handleDeleteResource(resource.id);
                                }
                              }}
                              className="p-2 bg-slate-100 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16 text-slate-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">请选择一个知识点查看资源</p>
                <p className="text-sm mt-2">或先创建技术栈和知识点</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingResource ? '编辑资源' : '添加资源'}
        size="lg"
      >
        <ResourceForm
          initialData={editingResource}
          onSave={handleSaveResource}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const ResourceForm: React.FC<{
  initialData: LearningResource | null;
  onSave: (data: Partial<LearningResource>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'document' as ResourceType,
    url: initialData?.url || '',
    rating: initialData?.rating || 0,
    review: initialData?.review || '',
    completed: initialData?.completed || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const resourceTypeConfig: Record<ResourceType, { label: string; icon: React.ReactNode }> = {
    book: { label: '书籍', icon: <BookOpen className="w-4 h-4" /> },
    video: { label: '视频', icon: <Video className="w-4 h-4" /> },
    document: { label: '文档', icon: <FileText className="w-4 h-4" /> },
    course: { label: '课程', icon: <GraduationCap className="w-4 h-4" /> },
    article: { label: '文章', icon: <Newspaper className="w-4 h-4" /> },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">资源名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">资源类型</label>
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(resourceTypeConfig) as ResourceType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData({ ...formData, type })}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                formData.type === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {resourceTypeConfig[type].icon}
              {resourceTypeConfig[type].label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">资源链接</label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">个人评分</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">个人评价</label>
        <textarea
          value={formData.review}
          onChange={(e) => setFormData({ ...formData, review: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
          placeholder="记录你对这个资源的评价和学习心得..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="completed"
          checked={formData.completed}
          onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
        />
        <label htmlFor="completed" className="text-sm text-slate-700">
          标记为已完成
        </label>
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

export default ResourcesPage;
