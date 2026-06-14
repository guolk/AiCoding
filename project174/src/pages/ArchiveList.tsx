import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { TagFilter, CategoryFilter } from '@/components/ui/Tag';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const ArchiveList: React.FC = () => {
  const navigate = useNavigate();
  const {
    recordings,
    tags,
    selectedTags,
    searchQuery,
    sortBy,
    sortOrder,
    setSelectedTags,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    getFilteredRecordings,
    deleteRecording,
  } = useRecordingStore();
  const { playRecording } = usePlayerStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecordings = useMemo(() => {
    return getFilteredRecordings();
  }, [getFilteredRecordings]);

  const handleTagClick = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newSelectedTags);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这条录音吗？')) {
      deleteRecording(id);
    }
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedTags.length > 0 || searchQuery.length > 0;

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-earth-900 dark:text-earth-100 font-display">
              录音档案
            </h1>
            <p className="text-earth-600 dark:text-earth-400 mt-2">
              共 {filteredRecordings.length} 条录音 · 管理你收藏的所有自然声音
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => navigate('/archive/new')}
            >
              新建录音
            </Button>
          </div>
        </div>

        <Card glass>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400"
                />
                <Input
                  placeholder="搜索录音标题、地点、描述或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as 'date' | 'title' | 'rating' | 'duration'
                    )
                  }
                  className="px-3 py-2 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-700 dark:text-earth-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="date">按日期</option>
                  <option value="title">按标题</option>
                  <option value="rating">按评分</option>
                  <option value="duration">按时长</option>
                </select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc size={18} />
                  ) : (
                    <SortDesc size={18} />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? 'bg-forest-100 dark:bg-forest-900/50' : ''}
                >
                  <Filter size={18} />
                </Button>

                <div className="flex items-center bg-earth-100 dark:bg-earth-900/50 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-earth-800 shadow-sm text-forest-600'
                        : 'text-earth-500 hover:text-earth-700'
                    }`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-earth-800 shadow-sm text-forest-600'
                        : 'text-earth-500 hover:text-earth-700'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between p-3 bg-earth-50 dark:bg-earth-900/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400">
                  <span>已应用筛选条件</span>
                  {selectedTags.length > 0 && (
                    <span className="px-2 py-0.5 bg-forest-100 dark:bg-forest-900/50 text-forest-700 dark:text-forest-400 rounded-full text-xs">
                      {selectedTags.length} 个标签
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded-full text-xs">
                      搜索: {searchQuery}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-earth-500 hover:text-earth-700"
                >
                  清除全部
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {showFilters && (
          <Card glass>
            <CardHeader>
              <CardTitle className="text-lg">筛选条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  声音分类
                </h4>
                <CategoryFilter
                  selectedCategory={null}
                  onCategoryChange={() => {}}
                />
              </div>
              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  标签筛选
                </h4>
                <TagFilter
                  tags={tags}
                  selectedTags={selectedTags}
                  onTagClick={handleTagClick}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {filteredRecordings.length === 0 ? (
          <Card glass>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                <Search size={24} className="text-earth-400" />
              </div>
              <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                没有找到匹配的录音
              </h3>
              <p className="text-earth-500 dark:text-earth-400 mb-6">
                尝试调整搜索关键词或筛选条件
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={clearAllFilters}>
                  清除筛选条件
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              'gap-6',
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col'
            )}
          >
            {filteredRecordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                compact={viewMode === 'list'}
                onClick={() => navigate(`/archive/${recording.id}`)}
                onPlay={() => playRecording(recording)}
                onEdit={() => navigate(`/archive/${recording.id}/edit`)}
                onDelete={() => handleDelete(recording.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArchiveList;
