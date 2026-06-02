import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Heart, X, BookOpen, ChevronRight, Star, CheckCircle2, Clock, BookMarked } from 'lucide-react';
import { useAppStore } from '@/store';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { KNOWLEDGE_CATEGORIES } from '@/data/knowledge';
import type { KnowledgeArticle } from '@/types';
import { cn } from '@/lib/utils';

function ArticleReader({
  article,
  isFavorite,
  onClose,
  onToggleFavorite,
  onProgress,
  onMarkRead,
}: {
  article: KnowledgeArticle;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onProgress: (id: string, progress: number) => void;
  onMarkRead: (id: string) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(article.readProgress || 0);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      setScrollProgress(progress);
      if (progress >= 90) {
        onMarkRead(article.id);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onProgress(article.id, scrollProgress);
    }, 500);
    return () => clearTimeout(timer);
  }, [scrollProgress, article.id, onProgress]);

  const paragraphs = article.content.split('\n\n').filter(p => p.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden bg-white rounded-3xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 z-10 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <BookOpen className="w-4 h-4" />
                <span>{article.category}</span>
              </div>
              <h3 className="text-2xl font-bold">{article.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(article.id)}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  isFavorite
                    ? 'bg-white/20 text-red-300'
                    : 'bg-white/10 text-white/70 hover:text-red-300'
                )}
              >
                <Heart className={cn('w-5 h-5', isFavorite && 'fill-current')} />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={scrollProgress} showLabel height="sm" />
          </div>
        </div>

        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 md:p-8"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {paragraphs.map((paragraph, index) => {
              const isHeading = paragraph.length < 30 && !paragraph.includes('。');
              const isList = paragraph.startsWith('- ');
              
              if (isHeading && index > 0) {
                return (
                  <h4 key={index} className="text-xl font-bold text-primary mt-8 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    {paragraph}
                  </h4>
                );
              }
              
              if (isList) {
                const items = paragraph.split('\n').filter(item => item.trim());
                return (
                  <ul key={index} className="space-y-2 ml-4">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                        <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{item.replace(/^-\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              
              return (
                <p key={index} className="text-gray-700 leading-relaxed text-lg">
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto mt-12 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  {scrollProgress >= 90 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {scrollProgress >= 90 ? '阅读完成！' : '继续阅读'}
                  </p>
                  <p className="text-sm text-gray-500">
                    已阅读 {scrollProgress}%
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium transition-colors"
              >
                返回列表
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const {
    knowledgeArticles,
    favoriteArticles,
    readArticles,
    toggleArticleFavorite,
    updateReadProgress,
    markArticleRead,
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(KNOWLEDGE_CATEGORIES[0].id);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    let articles = knowledgeArticles;

    if (selectedCategory !== 'all') {
      articles = articles.filter(a => a.categoryId === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query)
      );
    }

    return articles;
  }, [knowledgeArticles, selectedCategory, searchQuery]);

  const learningProgress = useMemo(() => {
    const total = knowledgeArticles.length;
    const read = readArticles.length;
    return total > 0 ? Math.round((read / total) * 100) : 0;
  }, [knowledgeArticles, readArticles]);

  const categoryProgress = useMemo(() => {
    return KNOWLEDGE_CATEGORIES.map(category => {
      const categoryArticles = knowledgeArticles.filter(a => a.categoryId === category.id);
      const readCount = categoryArticles.filter(a => readArticles.includes(a.id)).length;
      return {
        ...category,
        total: categoryArticles.length,
        read: readCount,
        progress: categoryArticles.length > 0 ? Math.round((readCount / categoryArticles.length) * 100) : 0,
      };
    });
  }, [knowledgeArticles, readArticles]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">中医知识库</h2>
            <p className="text-gray-500">
              系统学习中医理论，传承中医药文化精髓
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{learningProgress}%</p>
              <p className="text-sm text-gray-500">学习进度</p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{readArticles.length}/{knowledgeArticles.length}</p>
              <p className="text-sm text-gray-500">已读文章</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文章内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              />
            </div>

            <Card className="p-3">
              <h3 className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                分类导航
              </h3>
              <nav className="space-y-1">
                {categoryProgress.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors',
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        selectedCategory === category.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-500'
                      )}>
                        {category.read}/{category.total}
                      </span>
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform',
                        selectedCategory === category.id && 'rotate-90'
                      )} />
                    </div>
                  </button>
                ))}
              </nav>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex items-center gap-3 mb-3">
                <BookMarked className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-800">我的收藏</h3>
              </div>
              <p className="text-3xl font-bold text-primary mb-2">{favoriteArticles.length}</p>
              <p className="text-sm text-gray-500">篇收藏文章</p>
            </Card>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          {filteredArticles.map((article) => {
            const isRead = readArticles.includes(article.id);
            const isFavorite = favoriteArticles.includes(article.id);
            const isExpanded = expandedArticle === article.id;
            const progress = article.readProgress || 0;

            return (
              <Card
                key={article.id}
                hoverable
                className={cn(
                  'transition-all',
                  isRead && 'border-green-200 bg-green-50/30'
                )}
                onClick={() => {
                  setSelectedArticle(article);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
                        {article.category}
                      </span>
                      {isRead && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          已读
                        </span>
                      )}
                      {isFavorite && (
                        <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-md text-xs font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          已收藏
                        </span>
                      )}
                    </div>

                    <h3 className={cn(
                      'text-lg font-bold mb-2 transition-colors',
                      isRead ? 'text-gray-600' : 'text-gray-800 group-hover:text-primary'
                    )}>
                      {article.title}
                    </h3>

                    <div className={cn(
                      'text-sm text-gray-600 leading-relaxed overflow-hidden transition-all duration-300',
                      isExpanded ? 'max-h-none' : 'line-clamp-2'
                    )}>
                      {article.content.substring(0, 150)}...
                    </div>

                    {!isRead && progress > 0 && (
                      <div className="mt-3">
                        <ProgressBar value={progress} showLabel height="sm" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleArticleFavorite(article.id);
                      }}
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                        isFavorite
                          ? 'bg-red-50 text-red-500'
                          : 'bg-gray-100 text-gray-400 hover:text-red-500'
                      )}
                    >
                      <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedArticle(isExpanded ? null : article.id);
                      }}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      {isExpanded ? '收起' : '展开预览'}
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform',
                        isExpanded && 'rotate-90'
                      )} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredArticles.length === 0 && (
            <Card className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">未找到匹配的文章</h4>
              <p className="text-gray-500">请尝试其他搜索关键词或选择其他分类</p>
            </Card>
          )}
        </div>
      </div>

      {selectedArticle && (
        <ArticleReader
          article={selectedArticle}
          isFavorite={favoriteArticles.includes(selectedArticle.id)}
          onClose={() => setSelectedArticle(null)}
          onToggleFavorite={toggleArticleFavorite}
          onProgress={updateReadProgress}
          onMarkRead={markArticleRead}
        />
      )}
    </div>
  );
}
