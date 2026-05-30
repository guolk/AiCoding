import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  FileText,
  Calendar,
  BookOpen,
  Link,
  Quote,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { Paper } from '../../shared/types';

interface PaperFormData {
  title: string;
  journal: string;
  publicationDate: string;
  doi: string;
  authors: string;
  field: string;
  currentCitations: number;
}

const initialFormData: PaperFormData = {
  title: '',
  journal: '',
  publicationDate: '',
  doi: '',
  authors: '',
  field: '',
  currentCitations: 0
};

type Notification = 'idle' | 'loading' | 'success' | 'error';

export function Papers() {
  const { 
    papers, 
    citationHistory,
    fetchPapers, 
    addPaper, 
    updatePaper, 
    deletePaper, 
    syncPaperCitations,
    fetchCitationHistory,
    loading
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [formData, setFormData] = useState<PaperFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: Notification; message: string } | null>(null);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  useEffect(() => {
    if (expandedPaperId) {
      fetchCitationHistory(expandedPaperId);
    }
  }, [expandedPaperId, fetchCitationHistory]);

  const showNotification = useCallback((type: Notification, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.field.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showNotification('error', '请输入论文标题');
      return;
    }

    try {
      if (editingPaper) {
        await updatePaper(editingPaper.id, formData);
        showNotification('success', '论文更新成功！');
      } else {
        await addPaper(formData);
        showNotification('success', '论文添加成功！');
      }
      setShowForm(false);
      setEditingPaper(null);
      setFormData(initialFormData);
    } catch {
      showNotification('error', '操作失败，请重试');
    }
  };

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setFormData({
      title: paper.title,
      journal: paper.journal,
      publicationDate: paper.publicationDate,
      doi: paper.doi,
      authors: paper.authors,
      field: paper.field,
      currentCitations: paper.currentCitations
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这篇论文吗？所有相关数据也将被删除。')) {
      try {
        await deletePaper(id);
        showNotification('success', '论文删除成功！');
        if (expandedPaperId === id) {
          setExpandedPaperId(null);
        }
      } catch {
        showNotification('error', '删除失败，请重试');
      }
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncPaperCitations(id);
      showNotification('success', '引用数据同步成功！');
    } catch {
      showNotification('error', '同步失败，请重试');
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleExpand = (paperId: string) => {
    if (expandedPaperId === paperId) {
      setExpandedPaperId(null);
    } else {
      setExpandedPaperId(paperId);
    }
  };

  const chartData = citationHistory.map(h => ({
    name: `${h.year}-${String(h.month).padStart(2, '0')}`,
    citations: h.citations
  }));

  return (
    <div className="space-y-6 relative">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-up ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-display">论文档案管理</h2>
          <p className="text-gray-500 mt-1">管理您的学术论文档案</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingPaper(null);
            setFormData(initialFormData);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium transition-all duration-200 hover:bg-primary-800 hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          添加论文
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 font-display">
                {editingPaper ? '编辑论文' : '添加新论文'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPaper(null);
                  setFormData(initialFormData);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  论文标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="请输入论文标题"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期刊/会议</label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={e => setFormData({ ...formData, journal: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="期刊或会议名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">发表日期</label>
                  <input
                    type="date"
                    value={formData.publicationDate}
                    onChange={e => setFormData({ ...formData, publicationDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={e => setFormData({ ...formData, doi: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="10.1000/example"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                  <input
                    type="text"
                    value={formData.authors}
                    onChange={e => setFormData({ ...formData, authors: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    placeholder="作者1; 作者2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">研究领域</label>
                  <select
                    value={formData.field}
                    onChange={e => setFormData({ ...formData, field: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="">请选择领域</option>
                    <option value="Computer Science">计算机科学</option>
                    <option value="AI/Robotics">人工智能/机器人</option>
                    <option value="Bioinformatics">生物信息学</option>
                    <option value="Data Science">数据科学</option>
                    <option value="Physics">物理学</option>
                    <option value="Chemistry">化学</option>
                    <option value="Medicine">医学</option>
                    <option value="Economics">经济学</option>
                    <option value="Other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前被引次数</label>
                  <input
                    type="number"
                    value={formData.currentCitations}
                    onChange={e => setFormData({ ...formData, currentCitations: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPaper(null);
                    setFormData(initialFormData);
                  }}
                  className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 hover:bg-gray-200 active:scale-95"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-5 py-2.5 bg-primary-900 text-white rounded-lg font-medium transition-all duration-200 hover:bg-primary-800 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '处理中...' : editingPaper ? '保存修改' : '添加论文'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索论文标题、作者或领域..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="text-sm text-gray-500">
            共 {filteredPapers.length} 篇论文
          </div>
        </div>

        <div className="space-y-4">
          {filteredPapers.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无论文</p>
              <button
                type="button"
                onClick={() => {
                  setShowForm(true);
                  setEditingPaper(null);
                  setFormData(initialFormData);
                }}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-lg font-medium transition-all duration-200 hover:bg-accent-600 hover:shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                添加第一篇论文
              </button>
            </div>
          ) : (
            filteredPapers.map(paper => (
              <div
                key={paper.id}
                className={`border border-gray-100 rounded-xl overflow-hidden transition-all duration-300 ${
                  expandedPaperId === paper.id ? 'bg-primary-50 bg-opacity-30' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => handleToggleExpand(paper.id)}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {paper.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {paper.journal || '未标注期刊'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {paper.publicationDate || '未知日期'}
                      </span>
                      {paper.doi && (
                        <span className="flex items-center gap-1">
                          <Link className="w-4 h-4" />
                          {paper.doi}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-accent-600 font-semibold">
                        <Quote className="w-4 h-4" />
                        {paper.currentCitations.toLocaleString()}
                      </div>
                      <span className="text-xs text-gray-400">被引用</span>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleSync(paper.id);
                      }}
                      disabled={syncingId === paper.id}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                      title="同步引用数据"
                    >
                      <RefreshCw className={`w-5 h-5 text-gray-500 ${syncingId === paper.id ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(paper);
                      }}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5 text-blue-500" />
                    </button>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(paper.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>

                    {expandedPaperId === paper.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedPaperId === paper.id && (
                  <div className="px-4 pb-4 animate-slide-up">
                    <div className="bg-white rounded-xl p-4 ml-16">
                      <h5 className="font-medium text-gray-700 mb-4">引用增长趋势</h5>
                      <div className="h-48">
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                              <YAxis stroke="#9CA3AF" fontSize={10} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="citations"
                                stroke="#1E3A5F"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            暂无引用历史数据
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
