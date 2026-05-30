import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import type { ApplicationCase } from '../../shared/types';
import {
  Rocket,
  Building2,
  Landmark,
  Factory,
  GraduationCap,
  MoreHorizontal,
  Plus,
  X,
  Trash2,
  ExternalLink,
  FileText,
  Calendar,
  TrendingUp,
  PieChart
} from 'lucide-react';

type CaseType = ApplicationCase['type'];

const TYPE_CONFIG: Record<CaseType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  product: { icon: <Building2 className="w-4 h-4" />, label: '产品应用', color: 'text-blue-600', bgColor: 'from-blue-500' },
  policy: { icon: <Landmark className="w-4 h-4" />, label: '政策影响', color: 'text-purple-600', bgColor: 'from-purple-500' },
  patent: { icon: <FileText className="w-4 h-4" />, label: '专利引用', color: 'text-amber-600', bgColor: 'from-amber-500' },
  industry: { icon: <Factory className="w-4 h-4" />, label: '工业应用', color: 'text-green-600', bgColor: 'from-green-500' },
  education: { icon: <GraduationCap className="w-4 h-4" />, label: '教育应用', color: 'text-cyan-600', bgColor: 'from-cyan-500' },
  other: { icon: <MoreHorizontal className="w-4 h-4" />, label: '其他', color: 'text-gray-600', bgColor: 'from-gray-500' }
};

export function Applications() {
  const { 
    papers, 
    applicationCases, 
    fetchPapers, 
    fetchApplicationCases,
    addApplicationCase,
    deleteApplicationCase
  } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [formData, setFormData] = useState<{
    paperId: string;
    title: string;
    description: string;
    type: CaseType;
    url: string;
    source: string;
    date: string;
  }>({
    paperId: '',
    title: '',
    description: '',
    type: 'product',
    url: '',
    source: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPapers();
    fetchApplicationCases();
  }, [fetchPapers, fetchApplicationCases]);

  const typeStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    applicationCases.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      label: TYPE_CONFIG[type]?.label || type,
      count
    }));
  }, [applicationCases]);

  const filteredCases = useMemo(() => {
    if (selectedType === 'all') return applicationCases;
    return applicationCases.filter(c => c.type === selectedType);
  }, [applicationCases, selectedType]);

  const getPaperTitle = (paperId: string) => {
    const paper = papers.find(p => p.id === paperId);
    return paper?.title || '未知论文';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addApplicationCase({
      paperId: formData.paperId,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      url: formData.url,
      source: formData.source,
      date: formData.date
    });
    setShowAddForm(false);
    setFormData({
      paperId: '',
      title: '',
      description: '',
      type: 'product',
      url: '',
      source: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这条应用案例吗？')) {
      await deleteApplicationCase(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-display">研究影响评估</h2>
          <p className="text-gray-500 mt-1">追踪您的研究成果在实际应用中的影响力</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加应用案例
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-value">{applicationCases.length}</div>
              <div className="stat-label">应用案例总数</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>本季度 +3</span>
          </div>
        </div>

        {typeStats.slice(0, 3).map((stat, idx) => {
          const config = TYPE_CONFIG[stat.type];
          return (
            <div key={stat.type} className="stat-card animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="stat-value">{stat.count}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.bgColor} bg-opacity-20 flex items-center justify-center`}>
                  {config.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-header mb-0">应用类型分布</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {typeStats.map((stat, idx) => {
              const config = TYPE_CONFIG[stat.type];
              const maxCount = Math.max(...typeStats.map(s => s.count));
              const percentage = (stat.count / maxCount) * 100;
              return (
                <div key={stat.type} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${config.bgColor} flex items-center justify-center text-white`}>
                        {config.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    </div>
                    <span className="text-sm text-gray-500">{stat.count} 个</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${config.bgColor} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="card-header mb-0">应用案例列表</h3>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="all">全部类型</option>
                {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Rocket className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无应用案例</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 text-accent-600 hover:text-accent-700 text-sm"
              >
                + 添加第一条记录
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {filteredCases.map((item, idx) => {
                const config = TYPE_CONFIG[item.type];
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-slide-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.color} bg-opacity-10`}
                            style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
                          >
                            {config.icon}
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-800 truncate">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {getPaperTitle(item.paperId)}
                          </span>
                          {item.source && <span>来源：{item.source}</span>}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-accent-600 hover:text-accent-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                              查看详情
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 font-display">添加应用案例</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关联论文 *</label>
                <select
                  value={formData.paperId}
                  onChange={e => setFormData({ ...formData, paperId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  required
                >
                  <option value="">请选择论文</option>
                  {papers.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案例标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="例如：被某公司产品采用"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">案例类型 *</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: key as CaseType })}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors ${
                        formData.type === key
                          ? 'border-accent-500 bg-accent-50 text-accent-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {config.icon}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  rows={3}
                  placeholder="详细描述这个应用案例..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">来源</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                    placeholder="例如：公司官网"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">链接</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
