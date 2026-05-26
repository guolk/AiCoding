import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { KnowledgeGap } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, AlertTriangle, BookOpen, CheckCircle, Clock, Filter, Search } from 'lucide-react';
import { generateId } from '../../utils/storage';

const KnowledgePage: React.FC = () => {
  const { state, updateKnowledgeGap, deleteKnowledgeGap } = useAppContext();
  const [selectedGap, setSelectedGap] = useState<KnowledgeGap | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGap, setEditingGap] = useState<KnowledgeGap | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allCategories = Array.from(new Set(state.knowledgeGaps.map(g => g.category)));

  const filteredGaps = state.knowledgeGaps.filter(g => {
    if (filterStatus !== 'all' && g.status !== filterStatus) return false;
    if (filterPriority !== 'all' && g.priority !== filterPriority) return false;
    if (searchQuery && !g.topic.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !g.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success'; icon: React.ReactNode }> = {
    identified: { label: '已发现', variant: 'default', icon: <AlertTriangle className="w-4 h-4" /> },
    learning: { label: '学习中', variant: 'warning', icon: <Clock className="w-4 h-4" /> },
    mastered: { label: '已掌握', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
  };

  const priorityConfig: Record<string, { label: string; variant: 'danger' | 'warning' | 'default' }> = {
    high: { label: '高优先级', variant: 'danger' },
    medium: { label: '中优先级', variant: 'warning' },
    low: { label: '低优先级', variant: 'default' },
  };

  const handleSaveGap = (gapData: Partial<KnowledgeGap>) => {
    if (editingGap) {
      updateKnowledgeGap({ ...editingGap, ...gapData } as KnowledgeGap);
    } else {
      const newGap: KnowledgeGap = {
        id: generateId(),
        topic: gapData.topic || '',
        category: gapData.category || '',
        description: gapData.description || '',
        status: gapData.status || 'identified',
        priority: gapData.priority || 'medium',
      };
      updateKnowledgeGap(newGap);
    }
    setIsModalOpen(false);
    setEditingGap(null);
  };

  const handleDeleteGap = (id: string) => {
    deleteKnowledgeGap(id);
    if (selectedGap?.id === id) {
      setSelectedGap(null);
    }
  };

  const handleStatusChange = (gap: KnowledgeGap, status: KnowledgeGap['status']) => {
    const updatedGap = { ...gap, status };
    updateKnowledgeGap(updatedGap);
    if (selectedGap?.id === gap.id) {
      setSelectedGap(updatedGap);
    }
  };

  const stats = {
    total: state.knowledgeGaps.length,
    identified: state.knowledgeGaps.filter(g => g.status === 'identified').length,
    learning: state.knowledgeGaps.filter(g => g.status === 'learning').length,
    mastered: state.knowledgeGaps.filter(g => g.status === 'mastered').length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">知识点清单</h1>
          <p className="text-slate-500 mt-1">查缺补漏，系统性提升技术能力</p>
        </div>
        <Button onClick={() => { setEditingGap(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          新增知识点
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">总计</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">待学习</p>
                <p className="text-2xl font-bold text-slate-600">{stats.identified}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">学习中</p>
                <p className="text-2xl font-bold text-amber-600">{stats.learning}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">已掌握</p>
                <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索知识点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="identified">已发现</option>
                <option value="learning">学习中</option>
                <option value="mastered">已掌握</option>
              </select>
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">知识点</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">分类</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">状态</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">优先级</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGaps.map(gap => (
                    <tr
                      key={gap.id}
                      onClick={() => setSelectedGap(gap)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedGap?.id === gap.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{gap.topic}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{gap.category}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusConfig[gap.status].variant}>
                          <span className="flex items-center gap-1">
                            {statusConfig[gap.status].icon}
                            {statusConfig[gap.status].label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={priorityConfig[gap.priority].variant}>
                          {priorityConfig[gap.priority].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingGap(gap);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个知识点吗？')) {
                                handleDeleteGap(gap.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGaps.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无知识点记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedGap ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedGap.topic}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="primary">{selectedGap.category}</Badge>
                      <Badge variant={statusConfig[selectedGap.status].variant}>
                        <span className="flex items-center gap-1">
                          {statusConfig[selectedGap.status].icon}
                          {statusConfig[selectedGap.status].label}
                        </span>
                      </Badge>
                      <Badge variant={priorityConfig[selectedGap.priority].variant}>
                        {priorityConfig[selectedGap.priority].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">描述</p>
                      <p className="text-slate-600 whitespace-pre-wrap">{selectedGap.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">更新状态</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={selectedGap.status === 'identified' ? 'primary' : 'secondary'}
                          onClick={() => handleStatusChange(selectedGap, 'identified')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          待学习
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedGap.status === 'learning' ? 'warning' : 'secondary'}
                          onClick={() => handleStatusChange(selectedGap, 'learning')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          学习中
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedGap.status === 'mastered' ? 'success' : 'secondary'}
                          onClick={() => handleStatusChange(selectedGap, 'mastered')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          已掌握
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一个知识点查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGap ? '编辑知识点' : '新增知识点'}
        size="lg"
      >
        <KnowledgeForm
          initialData={editingGap}
          categories={allCategories}
          onSave={handleSaveGap}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const KnowledgeForm: React.FC<{
  initialData: KnowledgeGap | null;
  categories: string[];
  onSave: (data: Partial<KnowledgeGap>) => void;
  onCancel: () => void;
}> = ({ initialData, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    topic: initialData?.topic || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    status: initialData?.status || 'identified' as KnowledgeGap['status'],
    priority: initialData?.priority || 'medium' as KnowledgeGap['priority'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">知识点</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：WebAssembly"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：前端进阶"
            list="category-list"
            required
          />
          <datalist id="category-list">
            {categories.map(cat => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as KnowledgeGap['status'] })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="identified">已发现</option>
            <option value="learning">学习中</option>
            <option value="mastered">已掌握</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">优先级</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as KnowledgeGap['priority'] })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="high">高优先级</option>
            <option value="medium">中优先级</option>
            <option value="low">低优先级</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          placeholder="描述这个知识点的内容和学习计划..."
          required
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

export default KnowledgePage;
