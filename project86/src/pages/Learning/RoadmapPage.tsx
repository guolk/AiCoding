import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LearningStatus, RoadmapNode, TechStack } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, CheckCircle2, Clock, Circle, Award, ChevronRight } from 'lucide-react';
import { generateId } from '../../utils/storage';

const RoadmapPage: React.FC = () => {
  const { state, updateTechStack, deleteTechStack } = useAppContext();
  const [selectedTechStack, setSelectedTechStack] = useState<TechStack | null>(state.techStacks[0] || null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isTechStackModalOpen, setIsTechStackModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<RoadmapNode | null>(null);
  const [editingTechStack, setEditingTechStack] = useState<TechStack | null>(null);

  const statusConfig: Record<LearningStatus, { label: string; color: string; icon: React.ReactNode }> = {
    not_started: { label: '未开始', color: 'bg-slate-400', icon: <Circle className="w-4 h-4" /> },
    in_progress: { label: '进行中', color: 'bg-amber-500', icon: <Clock className="w-4 h-4" /> },
    completed: { label: '已完成', color: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> },
    mastered: { label: '已掌握', color: 'bg-primary-500', icon: <Award className="w-4 h-4" /> },
  };

  const getStatusColor = (status: LearningStatus) => statusConfig[status].color;

  const handleNodeClick = (node: RoadmapNode) => {
    setSelectedNode(node);
  };

  const handleUpdateNodeStatus = (nodeId: string, status: LearningStatus) => {
    if (!selectedTechStack) return;
    const updatedRoadmap = selectedTechStack.roadmap.map(node =>
      node.id === nodeId ? { ...node, status } : node
    );
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, status });
    }
  };

  const handleSaveNode = (nodeData: Partial<RoadmapNode>) => {
    if (!selectedTechStack) return;
    
    if (editingNode) {
      const updatedRoadmap = selectedTechStack.roadmap.map(node =>
        node.id === editingNode.id ? { ...node, ...nodeData } as RoadmapNode : node
      );
      const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
    } else {
      const newNode: RoadmapNode = {
        id: generateId(),
        name: nodeData.name || '',
        description: nodeData.description || '',
        status: 'not_started',
        level: nodeData.level || 1,
        position: nodeData.position || { x: 100, y: 100 },
        resources: [],
        notes: [],
        prerequisites: [],
      };
      const updatedTechStack = { ...selectedTechStack, roadmap: [...selectedTechStack.roadmap, newNode] };
      updateTechStack(updatedTechStack);
      setSelectedTechStack(updatedTechStack);
    }
    setIsNodeModalOpen(false);
    setEditingNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!selectedTechStack) return;
    const updatedRoadmap = selectedTechStack.roadmap.filter(node => node.id !== nodeId);
    const updatedTechStack = { ...selectedTechStack, roadmap: updatedRoadmap };
    updateTechStack(updatedTechStack);
    setSelectedTechStack(updatedTechStack);
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleSaveTechStack = (techStackData: Partial<TechStack>) => {
    if (editingTechStack) {
      const updatedTechStack = { ...editingTechStack, ...techStackData } as TechStack;
      updateTechStack(updatedTechStack);
      if (selectedTechStack?.id === editingTechStack.id) {
        setSelectedTechStack(updatedTechStack);
      }
    } else {
      const newTechStack: TechStack = {
        id: generateId(),
        name: techStackData.name || '',
        icon: techStackData.icon || '📚',
        description: techStackData.description || '',
        roadmap: [],
      };
      updateTechStack(newTechStack);
      setSelectedTechStack(newTechStack);
    }
    setIsTechStackModalOpen(false);
    setEditingTechStack(null);
  };

  const handleDeleteTechStack = (id: string) => {
    deleteTechStack(id);
    if (selectedTechStack?.id === id) {
      setSelectedTechStack(state.techStacks.find(ts => ts.id !== id) || null);
    }
  };

  const renderConnections = () => {
    if (!selectedTechStack) return null;
    const lines: JSX.Element[] = [];
    
    selectedTechStack.roadmap.forEach(node => {
      node.prerequisites.forEach(prereqId => {
        const prereqNode = selectedTechStack.roadmap.find(n => n.id === prereqId);
        if (prereqNode) {
          const x1 = prereqNode.position.x + 80;
          const y1 = prereqNode.position.y + 30;
          const x2 = node.position.x + 80;
          const y2 = node.position.y + 30;
          
          const isCompleted = prereqNode.status === 'completed' || prereqNode.status === 'mastered';
          const color = isCompleted ? '#10b981' : '#cbd5e1';
          
          lines.push(
            <line
              key={`${prereqId}-${node.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth="2"
              strokeDasharray={isCompleted ? '' : '5,5'}
            />
          );
        }
      });
    });
    
    return lines;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">技术学习路线图</h1>
          <p className="text-slate-500 mt-1">可视化规划你的技术学习路径</p>
        </div>
        <Button onClick={() => { setEditingTechStack(null); setIsTechStackModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          新增技术栈
        </Button>
      </div>

      <div className="flex gap-6">
        <div className="w-72 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle>技术栈列表</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                {state.techStacks.map(techStack => (
                  <div
                    key={techStack.id}
                    onClick={() => setSelectedTechStack(techStack)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTechStack?.id === techStack.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{techStack.icon}</span>
                        <div>
                          <p className="font-medium text-slate-800">{techStack.name}</p>
                          <p className="text-xs text-slate-500">
                            {techStack.roadmap.length} 个知识点
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTechStack(techStack);
                            setIsTechStackModalOpen(true);
                          }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Edit className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('确定要删除这个技术栈吗？')) {
                              handleDeleteTechStack(techStack.id);
                            }
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex gap-1 mt-1">
                        {techStack.roadmap.map(node => (
                          <div
                            key={node.id}
                            className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`}
                            title={node.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">{selectedNode.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">学习状态</p>
                    <div className="flex gap-2 flex-wrap">
                      {(Object.keys(statusConfig) as LearningStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateNodeStatus(selectedNode.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
                            selectedNode.status === status
                              ? `${statusConfig[status].color} text-white`
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {statusConfig[status].icon}
                          {statusConfig[status].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">描述</p>
                    <p className="text-sm text-slate-700">{selectedNode.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">级别</p>
                    <Badge variant="info">Level {selectedNode.level}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">学习资源</p>
                    <p className="text-sm text-slate-700">{selectedNode.resources.length} 个资源</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">学习笔记</p>
                    <p className="text-sm text-slate-700">{selectedNode.notes.length} 篇笔记</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingNode(selectedNode);
                        setIsNodeModalOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (confirm('确定要删除这个知识点吗？')) {
                          handleDeleteNode(selectedNode.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex-1">
          <Card className="h-full">
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTechStack?.icon}</span>
                <div>
                  <CardTitle>{selectedTechStack?.name || '请选择技术栈'}</CardTitle>
                  <p className="text-sm text-slate-500">{selectedTechStack?.description}</p>
                </div>
              </div>
              {selectedTechStack && (
                <Button onClick={() => { setEditingNode(null); setIsNodeModalOpen(true); }}>
                  <Plus className="w-4 h-4" />
                  新增知识点
                </Button>
              )}
            </CardHeader>
            <CardContent className="h-[calc(100vh-220px)] overflow-auto">
              {selectedTechStack ? (
                <div className="relative bg-slate-50 rounded-lg" style={{ minHeight: '500px', minWidth: '600px' }}>
                  <svg className="absolute inset-0 w-full h-full" style={{ minHeight: '500px', minWidth: '600px' }}>
                    {renderConnections()}
                  </svg>
                  
                  {selectedTechStack.roadmap.map(node => (
                    <div
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      className={`absolute roadmap-node cursor-pointer rounded-xl p-4 shadow-lg border-2 transition-all ${
                        selectedNode?.id === node.id
                          ? 'border-primary-500 ring-4 ring-primary-100'
                          : 'border-transparent hover:border-slate-300'
                      } ${
                        node.status === 'mastered'
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                          : node.status === 'completed'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                          : node.status === 'in_progress'
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                          : 'bg-white text-slate-800'
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        width: '160px',
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {statusConfig[node.status].icon}
                          <span className="text-xs opacity-80">Level {node.level}</span>
                        </div>
                        {node.prerequisites.length > 0 && (
                          <div className="flex items-center gap-0.5">
                            {node.prerequisites.map(p => (
                              <ChevronRight key={p} className="w-3 h-3 opacity-60" />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-sm mb-1">{node.name}</p>
                      <p className="text-xs opacity-70 line-clamp-2">{node.description}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <span>📚 {node.resources.length}</span>
                        <span>📝 {node.notes.length}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <p className="text-lg">请从左侧选择或创建一个技术栈</p>
                    <p className="text-sm mt-2">开始规划你的学习路线图</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        title={editingNode ? '编辑知识点' : '新增知识点'}
      >
        <NodeForm
          initialData={editingNode}
          onSave={handleSaveNode}
          onCancel={() => setIsNodeModalOpen(false)}
          existingNodes={selectedTechStack?.roadmap || []}
        />
      </Modal>

      <Modal
        isOpen={isTechStackModalOpen}
        onClose={() => setIsTechStackModalOpen(false)}
        title={editingTechStack ? '编辑技术栈' : '新增技术栈'}
        size="md"
      >
        <TechStackForm
          initialData={editingTechStack}
          onSave={handleSaveTechStack}
          onCancel={() => setIsTechStackModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const NodeForm: React.FC<{
  initialData: RoadmapNode | null;
  onSave: (data: Partial<RoadmapNode>) => void;
  onCancel: () => void;
  existingNodes: RoadmapNode[];
}> = ({ initialData, onSave, onCancel, existingNodes }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    level: initialData?.level || 1,
    positionX: initialData?.position.x || 100,
    positionY: initialData?.position.y || 100,
    prerequisites: initialData?.prerequisites || [],
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入知识点名称');
      return;
    }
    onSave({
      ...formData,
      position: { x: formData.positionX, y: formData.positionY },
    });
  };

  const togglePrerequisite = (nodeId: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.includes(nodeId)
        ? prev.prerequisites.filter(id => id !== nodeId)
        : [...prev.prerequisites, nodeId]
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">知识点名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">级别</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={1}>Level 1 - 入门</option>
            <option value={2}>Level 2 - 进阶</option>
            <option value={3}>Level 3 - 高级</option>
            <option value={4}>Level 4 - 专家</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">X 坐标</label>
          <input
            type="number"
            value={formData.positionX}
            onChange={(e) => setFormData({ ...formData, positionX: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Y 坐标</label>
        <input
          type="number"
          value={formData.positionY}
          onChange={(e) => setFormData({ ...formData, positionY: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">前置知识点</label>
        <div className="flex flex-wrap gap-2">
          {existingNodes
            .filter(n => n.id !== initialData?.id)
            .map(node => (
              <button
                key={node.id}
                type="button"
                onClick={() => togglePrerequisite(node.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  formData.prerequisites.includes(node.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {node.name}
              </button>
            ))}
        </div>
      </div>
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

const TechStackForm: React.FC<{
  initialData: TechStack | null;
  onSave: (data: Partial<TechStack>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    icon: initialData?.icon || '📚',
    description: initialData?.description || '',
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('请输入技术栈名称');
      return;
    }
    onSave(formData);
  };

  const emojis = ['📚', '💻', '🌐', '🎨', '⚡', '🔧', '📊', '🎯', '🚀', '💡', '🔬', '🎮'];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">技术栈名称</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">图标</label>
        <div className="flex flex-wrap gap-2">
          {emojis.map(emoji => (
            <button
              key={emoji}
            type="button"
            onClick={() => setFormData({ ...formData, icon: emoji })}
            className={`w-10 h-10 rounded-lg text-xl transition-colors ${
                formData.icon === emoji
                  ? 'bg-primary-600 ring-2 ring-primary-300'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={3}
        />
      </div>
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

export default RoadmapPage;
