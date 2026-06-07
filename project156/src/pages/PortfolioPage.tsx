import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Palette, BookOpen, Calculator, FlaskConical, Star, Trash2, 
  Eye, Plus, X, Filter, Clock, Award, Image as ImageIcon
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { cn } from '@/lib/utils';
import type { Portfolio } from 'shared/types';

const categories = [
  { value: undefined, label: '全部', icon: Filter, color: 'text-slate-600 bg-slate-100' },
  { value: 'art', label: '绘画', icon: Palette, color: 'text-rose-600 bg-rose-100' },
  { value: 'writing', label: '写作', icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
  { value: 'math', label: '数学', icon: Calculator, color: 'text-amber-600 bg-amber-100' },
  { value: 'science', label: '科学', icon: FlaskConical, color: 'text-teal-600 bg-teal-100' },
];

const gradeOptions = [
  { value: undefined, label: '全部年级' },
  { value: 1, label: '一年级' },
  { value: 2, label: '二年级' },
  { value: 3, label: '三年级' },
  { value: 4, label: '四年级' },
  { value: 5, label: '五年级' },
  { value: 6, label: '六年级' },
];

const viewModes = [
  { value: 'grid', label: '网格' },
  { value: 'timeline', label: '时间轴' },
];

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const {
    portfolios, portfolioTimeline, featuredPortfolios,
    fetchPortfolios, fetchPortfolioTimeline, fetchFeaturedPortfolios,
    toggleFeatured, deletePortfolio
  } = useStudentStore();

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectedWork, setSelectedWork] = useState<Portfolio | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    category: 'art' as Portfolio['category'],
    description: '',
    fileUrl: '',
    thumbnail: '',
    grade: 3,
    semester: 1,
  });

  useEffect(() => {
    if (studentId) {
      fetchPortfolios(studentId, selectedCategory, selectedGrade);
      fetchPortfolioTimeline(studentId);
      fetchFeaturedPortfolios(studentId);
    }
  }, [studentId, selectedCategory, selectedGrade, fetchPortfolios, fetchPortfolioTimeline, fetchFeaturedPortfolios]);

  const handleToggleFeatured = (portfolioId: number) => {
    toggleFeatured(portfolioId);
  };

  const handleDelete = (portfolioId: number) => {
    if (confirm('确定要删除这个作品吗？')) {
      deletePortfolio(portfolioId);
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  return (
    <div className="space-y-6">
      {/* Featured Works */}
      {featuredPortfolios.length > 0 && (
        <div className="card p-6 gradient-amber">
          <div className="flex items-center gap-2 mb-4 text-white">
            <Award className="w-5 h-5" />
            <h3 className="font-display text-lg font-semibold">优秀作品</h3>
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              共 {featuredPortfolios.length} 件
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {featuredPortfolios.map((work, index) => (
              <div
                key={work.id}
                className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedWork(work)}
              >
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                  <p className="text-sm font-medium truncate">{work.title}</p>
                  <p className="text-xs opacity-80">{work.grade}年级</p>
                </div>
                <Star className="absolute top-2 right-2 w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  selectedCategory === cat.value
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedGrade ?? ''}
              onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {gradeOptions.map((g) => (
                <option key={g.label} value={g.value ?? ''}>{g.label}</option>
              ))}
            </select>
            <div className="flex bg-slate-100 rounded-xl p-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value as 'grid' | 'timeline')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    viewMode === mode.value
                      ? "bg-white text-primary-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加作品
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {portfolios.map((work, index) => {
            const catInfo = getCategoryInfo(work.category);
            return (
              <div
                key={work.id}
                className="card overflow-hidden card-hover group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-video cursor-pointer" onClick={() => setSelectedWork(work)}>
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  {work.isFeatured && (
                    <Star className="absolute top-3 right-3 w-5 h-5 text-amber-400 fill-amber-400" />
                  )}
                  <div className={cn(
                    "absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium",
                    catInfo.color
                  )}>
                    {catInfo.label}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-slate-900 mb-1">{work.title}</h4>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{work.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {work.grade}年级第{work.semester}学期
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFeatured(work.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          work.isFeatured
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        )}
                        title={work.isFeatured ? '取消优秀' : '标记优秀'}
                      >
                        <Star className={cn("w-4 h-4", work.isFeatured && "fill-current")} />
                      </button>
                      <button
                        onClick={() => handleDelete(work.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {portfolioTimeline.map((item, gradeIndex) => (
            <div key={item.grade} className="relative animate-slide-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-white font-display text-lg font-bold">
                  {item.grade}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-slate-800">{item.grade}年级</h3>
                  <p className="text-sm text-slate-500">{item.portfolios.length} 件作品</p>
                </div>
              </div>
              <div className="relative pl-6 ml-6 border-l-2 border-slate-200 space-y-6">
                {item.portfolios.map((work, workIndex) => {
                  const catInfo = getCategoryInfo(work.category);
                  return (
                    <div
                      key={work.id}
                      className="relative card p-4 flex gap-4 animate-slide-up"
                      style={{ animationDelay: `${(gradeIndex * 100) + (workIndex * 50)}ms` }}
                    >
                      <div className="absolute -left-[30px] top-6 w-4 h-4 rounded-full border-4 border-white bg-primary-500 shadow" />
                      <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setSelectedWork(work)}>
                        <img src={work.thumbnail} alt={work.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{work.title}</h4>
                          <div className={cn(
                            "px-2 py-0.5 rounded-lg text-xs font-medium flex-shrink-0",
                            catInfo.color
                          )}>
                            {catInfo.label}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{work.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            第{work.semester}学期 · {new Date(work.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                          <div className="flex items-center gap-1">
                            {work.isFeatured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {portfolios.length === 0 && (
        <div className="card p-12 text-center">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-lg font-medium text-slate-700 mb-2">暂无作品</h3>
          <p className="text-slate-500">点击右上角按钮添加第一件作品</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedWork(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <img src={selectedWork.fileUrl} alt={selectedWork.title} className="w-full max-h-[60vh] object-contain bg-slate-100" />
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleToggleFeatured(selectedWork.id)}
                className={cn(
                  "absolute top-4 left-4 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg",
                  selectedWork.isFeatured
                    ? "bg-amber-500 text-white"
                    : "bg-white/90 text-slate-600 hover:bg-white"
                )}
              >
                <Star className={cn("w-4 h-4", selectedWork.isFeatured && "fill-current")} />
                {selectedWork.isFeatured ? '已标记优秀' : '标记优秀'}
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">{selectedWork.title}</h2>
                  <p className="text-slate-500">{selectedWork.grade}年级第{selectedWork.semester}学期 · {getCategoryInfo(selectedWork.category).label}</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{selectedWork.description}</p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  上传于 {new Date(selectedWork.createdAt).toLocaleDateString('zh-CN')}
                </span>
                <button
                  onClick={() => handleDelete(selectedWork.id)}
                  className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  删除作品
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-slate-800">添加新作品</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">作品名称</label>
                <input
                  type="text"
                  value={newPortfolio.title}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                  className="input-field"
                  placeholder="请输入作品名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                  <select
                    value={newPortfolio.category}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, category: e.target.value as Portfolio['category'] })}
                    className="input-field"
                  >
                    {categories.filter(c => c.value).map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
                  <select
                    value={newPortfolio.grade}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, grade: Number(e.target.value) })}
                    className="input-field"
                  >
                    {[1,2,3,4,5,6].map(g => (
                      <option key={g} value={g}>{g}年级</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">学期</label>
                  <select
                    value={newPortfolio.semester}
                    onChange={(e) => setNewPortfolio({ ...newPortfolio, semester: Number(e.target.value) })}
                    className="input-field"
                  >
                    <option value={1}>第一学期</option>
                    <option value={2}>第二学期</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">作品描述</label>
                <textarea
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                  className="input-field h-24 resize-none"
                  placeholder="请描述作品内容..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">作品图片链接</label>
                <input
                  type="url"
                  value={newPortfolio.fileUrl}
                  onChange={(e) => {
                    setNewPortfolio({
                      ...newPortfolio,
                      fileUrl: e.target.value,
                      thumbnail: e.target.value
                    });
                  }}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (newPortfolio.title && newPortfolio.fileUrl) {
                    useStudentStore.getState().addPortfolio(studentId, newPortfolio);
                    setShowAddModal(false);
                    setNewPortfolio({
                      title: '',
                      category: 'art',
                      description: '',
                      fileUrl: '',
                      thumbnail: '',
                      grade: 3,
                      semester: 1,
                    });
                  }
                }}
                className="btn-primary"
              >
                保存作品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
