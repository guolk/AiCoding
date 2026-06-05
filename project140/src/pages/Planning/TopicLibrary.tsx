import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Search, Filter, Trash2, Edit3, Check, X, Gauge, Target } from 'lucide-react';
import { formatDate, getStatusColor, getStatusLabel, cn } from '../../utils/helpers';
import { Topic } from '../../types';

export default function TopicLibrary() {
  const { topics, addTopic, updateTopic, deleteTopic } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Topic>>({
    title: '',
    description: '',
    tags: [],
    heatScore: 50,
    feasibilityScore: 50,
    status: 'idea',
  });
  const [tagInput, setTagInput] = useState('');

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || topic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tag) });
  };

  const handleSubmit = () => {
    if (!formData.title?.trim()) return;
    
    if (editingId) {
      updateTopic(editingId, formData);
    } else {
      addTopic(formData as Omit<Topic, 'id' | 'createdAt'>);
    }
    resetForm();
  };

  const handleEdit = (topic: Topic) => {
    setFormData(topic);
    setEditingId(topic.id);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      heatScore: 50,
      feasibilityScore: 50,
      status: 'idea',
    });
    setEditingId(null);
    setShowAddModal(false);
    setTagInput('');
  };

  const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="24" cy="24" r="20" fill="none"
            stroke={color} strokeWidth="4"
            strokeDasharray={`${score * 1.256} 125.6`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
          {score}
        </span>
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索选题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">全部状态</option>
              <option value="idea">创意阶段</option>
              <option value="evaluating">评估中</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
        >
          <Plus size={18} />
          新建选题
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTopics.map((topic, index) => (
          <div
            key={topic.id}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 animate-slide-up group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(topic.status))}>
                {getStatusLabel(topic.status)}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(topic)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-display font-semibold text-slate-800 mb-2 text-lg">{topic.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{topic.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {topic.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <ScoreRing score={topic.heatScore} label="热度" color="#ff6b35" />
                <ScoreRing score={topic.feasibilityScore} label="可行性" color="#10b981" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">创建于 {formatDate(topic.createdAt)}</p>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-500">没有找到匹配的选题</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">
                {editingId ? '编辑选题' : '新建选题'}
              </h3>
              <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选题标题</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="输入选题标题..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">选题描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  rows={3}
                  placeholder="详细描述这个选题..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">标签</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags?.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      #{tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary-900">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="输入标签后按回车添加"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                    <Gauge size={16} className="text-accent-500" />
                    热度评分: {formData.heatScore}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.heatScore}
                    onChange={(e) => setFormData({ ...formData, heatScore: Number(e.target.value) })}
                    className="w-full accent-accent-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                    <Target size={16} className="text-success" />
                    可行性评分: {formData.feasibilityScore}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.feasibilityScore}
                    onChange={(e) => setFormData({ ...formData, feasibilityScore: Number(e.target.value) })}
                    className="w-full accent-success"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Topic['status'] })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="idea">创意阶段</option>
                  <option value="evaluating">评估中</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {editingId ? '保存修改' : '创建立项'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
