import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { 
  Star, ThumbsUp, ThumbsDown, Minus, Search, Filter, MessageSquare,
  Plus, Save, X, Check, ChevronDown, Trash2, Mail
} from 'lucide-react';
import { formatRelative, getStatusLabel, cn } from '../../utils/helpers';
import { Feedback } from '../../types';

export default function FeedbackManagement() {
  const { feedbacks, episodes, toggleFeedbackHighlight, addFeedback } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [highlightFilter, setHighlightFilter] = useState<'all' | 'highlighted'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newFeedback, setNewFeedback] = useState<Partial<Feedback>>({
    episodeId: '',
    content: '',
    source: '',
    highlighted: false,
    sentiment: 'neutral',
    author: '',
  });

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (f.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesSentiment = sentimentFilter === 'all' || f.sentiment === sentimentFilter;
    const matchesHighlight = highlightFilter === 'all' || f.highlighted;
    return matchesSearch && matchesSentiment && matchesHighlight;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: feedbacks.length,
    positive: feedbacks.filter(f => f.sentiment === 'positive').length,
    neutral: feedbacks.filter(f => f.sentiment === 'neutral').length,
    negative: feedbacks.filter(f => f.sentiment === 'negative').length,
    highlighted: feedbacks.filter(f => f.highlighted).length,
  };

  const getEpisodeTitle = (episodeId: string) => {
    return episodes.find(e => e.id === episodeId)?.title || '未知节目';
  };

  const handleSubmit = () => {
    if (!newFeedback.episodeId || !newFeedback.content?.trim() || !newFeedback.source?.trim()) return;
    addFeedback(newFeedback as Omit<Feedback, 'id' | 'createdAt'>);
    setShowAddModal(false);
    setNewFeedback({
      episodeId: '',
      content: '',
      source: '',
      highlighted: false,
      sentiment: 'neutral',
      author: '',
    });
  };

  const sentimentConfig = {
    positive: { icon: ThumbsUp, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    neutral: { icon: Minus, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    negative: { icon: ThumbsDown, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="font-display text-3xl font-bold text-slate-800">{stats.total}</p>
          <p className="text-sm text-slate-500">总反馈</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
          <p className="font-display text-3xl font-bold text-green-600">{stats.positive}</p>
          <p className="text-sm text-slate-500">正面反馈</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-4 text-center">
          <p className="font-display text-3xl font-bold text-yellow-600">{stats.neutral}</p>
          <p className="text-sm text-slate-500">中性反馈</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 text-center">
          <p className="font-display text-3xl font-bold text-red-600">{stats.negative}</p>
          <p className="text-sm text-slate-500">负面反馈</p>
        </div>
        <div className="bg-white rounded-xl border border-accent-200 p-4 text-center">
          <p className="font-display text-3xl font-bold text-accent-600">{stats.highlighted}</p>
          <p className="text-sm text-slate-500">已高亮</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="搜索反馈内容或用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">全部情绪</option>
              <option value="positive">正面</option>
              <option value="neutral">中性</option>
              <option value="negative">负面</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Star size={18} className="text-slate-400" />
            <select
              value={highlightFilter}
              onChange={(e) => setHighlightFilter(e.target.value as 'all' | 'highlighted')}
              className="border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="all">全部</option>
              <option value="highlighted">仅高亮</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-accent-500/30 transition-all"
        >
          <Plus size={18} />
          记录反馈
        </button>
      </div>

      <div className="space-y-3">
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <MessageSquare size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">暂无匹配的反馈</p>
            <p className="text-slate-400 text-sm mt-1">尝试调整筛选条件或记录新的反馈</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback, index) => {
            const config = sentimentConfig[feedback.sentiment];
            const SentimentIcon = config.icon;
            const isExpanded = expandedId === feedback.id;

            return (
              <div
                key={feedback.id}
                className={cn(
                  'bg-white rounded-xl border-2 overflow-hidden transition-all animate-slide-up',
                  feedback.highlighted ? 'border-accent-400 shadow-lg shadow-accent-100' : 'border-slate-200 hover:border-slate-300',
                  isExpanded ? 'shadow-md' : ''
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : feedback.id)}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFeedbackHighlight(feedback.id);
                      }}
                      className={cn(
                        'p-2 rounded-xl transition-all flex-shrink-0',
                        feedback.highlighted
                          ? 'bg-accent-100 text-accent-600'
                          : 'bg-slate-100 text-slate-400 hover:bg-accent-50 hover:text-accent-500'
                      )}
                    >
                      <Star size={20} fill={feedback.highlighted ? 'currentColor' : 'none'} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          config.bg,
                          config.color
                        )}>
                          <SentimentIcon size={12} />
                          {getStatusLabel(feedback.sentiment)}
                        </span>
                        <span className="text-xs text-slate-400">{feedback.source}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">{formatRelative(feedback.createdAt)}</span>
                      </div>
                      <p className={cn(
                        'text-slate-700',
                        !isExpanded && 'line-clamp-2'
                      )}>
                        {feedback.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {getEpisodeTitle(feedback.episodeId)}
                          </span>
                          {feedback.author && (
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {feedback.author}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          size={20}
                          className={cn(
                            'text-slate-400 transition-transform',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50 animate-slide-down">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Mail size={16} />
                        回复用户
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFeedbackHighlight(feedback.id);
                        }}
                        className={cn(
                          'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2',
                          feedback.highlighted
                            ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        <Star size={16} fill={feedback.highlighted ? 'currentColor' : 'none'} />
                        {feedback.highlighted ? '取消高亮' : '标记高亮'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold">记录听众反馈</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">相关节目</label>
                <select
                  value={newFeedback.episodeId}
                  onChange={(e) => setNewFeedback({ ...newFeedback, episodeId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">请选择相关节目</option>
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>{ep.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">反馈来源</label>
                <input
                  type="text"
                  value={newFeedback.source}
                  onChange={(e) => setNewFeedback({ ...newFeedback, source: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="如：苹果播客、小宇宙、喜马拉雅、邮件等"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">用户昵称 (可选)</label>
                <input
                  type="text"
                  value={newFeedback.author}
                  onChange={(e) => setNewFeedback({ ...newFeedback, author: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="用户昵称或联系方式"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">情绪倾向</label>
                <div className="flex gap-2">
                  {(['positive', 'neutral', 'negative'] as const).map(sentiment => {
                    const conf = sentimentConfig[sentiment];
                    const Icon = conf.icon;
                    return (
                      <button
                        key={sentiment}
                        onClick={() => setNewFeedback({ ...newFeedback, sentiment })}
                        className={cn(
                          'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border-2',
                          newFeedback.sentiment === sentiment
                            ? conf.border + ' ' + conf.bg + ' ' + conf.color
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        )}
                      >
                        <Icon size={16} />
                        {getStatusLabel(sentiment)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">反馈内容</label>
                <textarea
                  value={newFeedback.content}
                  onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                  rows={4}
                  placeholder="记录听众的具体反馈内容..."
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFeedback.highlighted}
                  onChange={(e) => setNewFeedback({ ...newFeedback, highlighted: e.target.checked })}
                  className="w-5 h-5 accent-accent-500 rounded"
                />
                <span className="text-sm text-slate-700">标记为重要反馈</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                保存反馈
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
