import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Play,
  Pause,
  Shuffle,
  Plus,
  Trash2,
  Search,
  X,
  Filter,
  Music,
  Clock,
  Heart,
  Sparkles,
  ListMusic,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Info,
  Disc,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Recording } from '@/types';
import { formatDuration } from '@/utils/audio';
import { cn } from '@/lib/utils';

const CollectionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    collections,
    recordings,
    getRecordingById,
    updateCollection,
    removeRecordingFromCollection,
    addRecordingToCollection,
  } = useRecordingStore();
  const {
    currentRecording,
    isPlaying,
    playRecording,
    clearQueue,
    addToQueue,
    play,
    pause,
  } = usePlayerStore();

  const collection = id ? collections.find((c) => c.id === id) : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    theme: '',
    mood: '',
    description: '',
    coverImage: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const collectionRecordings = useMemo(() => {
    if (!collection) return [];
    return collection.recordingIds
      .map((rid) => getRecordingById(rid))
      .filter(Boolean) as Recording[];
  }, [collection, getRecordingById]);

  const totalDuration = useMemo(() => {
    return collectionRecordings.reduce((sum, r) => {
      return sum + (r.audioMetadata?.duration || 0);
    }, 0);
  }, [collectionRecordings]);

  const averageRating = useMemo(() => {
    const ratings = collectionRecordings
      .map((r) => r.qualityAssessment?.overallRating || 0)
      .filter((r) => r > 0);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }, [collectionRecordings]);

  const filteredRecordings = useMemo(() => {
    let filtered = [...collectionRecordings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(query) ||
        r.locationName.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tags.some((t) => t.name.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.recordTime).getTime() - new Date(b.recordTime).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = (a.qualityAssessment?.overallRating || 0) - (b.qualityAssessment?.overallRating || 0);
          break;
        case 'duration':
          comparison = (a.audioMetadata?.duration || 0) - (b.audioMetadata?.duration || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [collectionRecordings, searchQuery, sortBy, sortOrder]);

  const availableRecordings = useMemo(() => {
    const collectionRecordingIds = new Set(collection?.recordingIds || []);
    return recordings.filter((r) => !collectionRecordingIds.has(r.id));
  }, [recordings, collection]);

  const filteredAvailableRecordings = useMemo(() => {
    if (!searchQuery) return availableRecordings;
    const query = searchQuery.toLowerCase();
    return availableRecordings.filter((r) =>
      r.title.toLowerCase().includes(query) ||
      r.locationName.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.tags.some((t) => t.name.toLowerCase().includes(query))
    );
  }, [availableRecordings, searchQuery]);

  const relatedCollections = useMemo(() => {
    if (!collection) return [];
    return collections
      .filter((c) => c.id !== collection.id)
      .filter((c) => c.theme === collection.theme || c.mood === collection.mood)
      .slice(0, 4);
  }, [collection, collections]);

  const gradientColors = [
    'from-forest-400 to-emerald-600',
    'from-sky-400 to-blue-600',
    'from-sunset-400 to-orange-600',
    'from-purple-400 to-violet-600',
    'from-pink-400 to-rose-600',
    'from-teal-400 to-cyan-600',
  ];

  const getGradientColor = (id: string) => {
    const index = id.charCodeAt(id.length - 1) % gradientColors.length;
    return gradientColors[index];
  };

  const isCollectionPlaying = useMemo(() => {
    if (!currentRecording || !collection) return false;
    return collection.recordingIds.includes(currentRecording.id) && isPlaying;
  }, [currentRecording, collection, isPlaying]);

  const handlePlayCollection = (shuffle: boolean = false) => {
    if (collectionRecordings.length === 0) return;

    clearQueue();

    const playList = shuffle
      ? [...collectionRecordings].sort(() => Math.random() - 0.5)
      : [...filteredRecordings];

    playList.forEach((r) => addToQueue(r));

    const firstRecording = playList[0];
    if (firstRecording) {
      playRecording(firstRecording);
    }
  };

  const handleTogglePlay = () => {
    if (isCollectionPlaying) {
      pause();
    } else if (currentRecording && collection?.recordingIds.includes(currentRecording.id)) {
      play();
    } else {
      handlePlayCollection(false);
    }
  };

  const handleRemoveRecording = (recordingId: string) => {
    if (!collection) return;
    removeRecordingFromCollection(collection.id, recordingId);
    setRemoveConfirm(null);
  };

  const handleAddRecording = (recordingId: string) => {
    if (!collection) return;
    addRecordingToCollection(collection.id, recordingId);
  };

  const handleMoveRecording = (index: number, direction: 'up' | 'down') => {
    if (!collection) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= collection.recordingIds.length) return;

    const newRecordingIds = [...collection.recordingIds];
    [newRecordingIds[index], newRecordingIds[newIndex]] = [newRecordingIds[newIndex], newRecordingIds[index]];

    updateCollection(collection.id, { recordingIds: newRecordingIds });
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    if (!editFormData.name.trim()) {
      errors.name = '请输入收藏集名称';
    }
    if (!editFormData.theme.trim()) {
      errors.theme = '请输入主题';
    }
    if (!editFormData.mood.trim()) {
      errors.mood = '请输入情绪';
    }
    if (!editFormData.description.trim()) {
      errors.description = '请输入描述';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenEditDialog = () => {
    if (!collection) return;
    setEditFormData({
      name: collection.name,
      theme: collection.theme,
      mood: collection.mood,
      description: collection.description,
      coverImage: collection.coverImage || '',
    });
    setFormErrors({});
    setShowEditDialog(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEditForm() || !collection) return;
    updateCollection(collection.id, editFormData);
    setShowEditDialog(false);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (!collection) {
    return (
      <Layout>
        <div className="p-6 md:p-8">
          <Card glass>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                <Info size={24} className="text-earth-400" />
              </div>
              <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                收藏集不存在
              </h3>
              <p className="text-earth-500 dark:text-earth-400 mb-6">
                你访问的收藏集可能已被删除或不存在
              </p>
              <Button variant="primary" onClick={() => navigate('/collections')}>
                返回列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/collections')}
          >
            返回收藏集
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              leftIcon={<Edit size={18} />}
              onClick={handleOpenEditDialog}
            >
              编辑
            </Button>
          </div>
        </div>

        <Card glass className="overflow-hidden">
          <div className="relative h-64 md:h-80">
            {collection.coverImage ? (
              <img
                src={collection.coverImage}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={cn(
                  'w-full h-full bg-gradient-to-br',
                  getGradientColor(collection.id)
                )}
              >
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
                    <path
                      d="M0,200 Q100,50 200,200 T400,200 T600,200 T800,200 T1000,200 T1200,200 L1200,400 L0,400 Z"
                      fill="rgba(255,255,255,0.2)"
                    />
                    <path
                      d="M0,200 Q150,350 300,200 T600,200 T900,200 T1200,200"
                      fill="none"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-forest-500/80 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                      <Sparkles size={12} />
                      {collection.theme}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-sky-500/80 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                      <Heart size={12} />
                      {collection.mood}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-display">
                    {collection.name}
                  </h1>
                  <p className="text-white/80 mt-2 max-w-2xl">
                    {collection.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    leftIcon={isCollectionPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                    onClick={handleTogglePlay}
                    className="bg-white/90 hover:bg-white text-earth-800"
                  >
                    {isCollectionPlaying ? '暂停' : '播放全部'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => handlePlayCollection(true)}
                    className="bg-white/90 hover:bg-white text-earth-800"
                  >
                    <Shuffle size={20} />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="录音数量"
                value={collectionRecordings.length}
                icon={<Music size={20} />}
              />
              <StatCard
                title="总时长"
                value={formatDuration(totalDuration)}
                icon={<Clock size={20} />}
              />
              <StatCard
                title="平均评分"
                value={averageRating > 0 ? `${averageRating.toFixed(1)} / 5` : '暂无'}
                icon={<Heart size={20} />}
              />
              <StatCard
                title="播放队列"
                value={isCollectionPlaying ? '播放中' : '未播放'}
                icon={<ListMusic size={20} />}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card glass>
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <ListMusic size={20} className="text-forest-500" />
                  录音列表
                  <span className="text-sm font-normal text-earth-500 dark:text-earth-400 ml-2">
                    ({filteredRecordings.length} 条)
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus size={16} />}
                    onClick={() => setShowAddDialog(true)}
                  >
                    添加录音
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400"
                    />
                    <Input
                      placeholder="搜索录音..."
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
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-2.5 rounded-lg border border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 text-earth-900 dark:text-earth-100 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                    >
                      <option value="date">按日期</option>
                      <option value="title">按标题</option>
                      <option value="rating">按评分</option>
                      <option value="duration">按时长</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSortOrder}
                      title={sortOrder === 'asc' ? '升序' : '降序'}
                    >
                      {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={showFilters ? 'bg-forest-100 dark:bg-forest-900/50' : ''}
                    >
                      <Filter size={18} />
                    </Button>
                  </div>
                </div>

                {filteredRecordings.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                      <Disc size={24} className="text-earth-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                      暂无录音
                    </h3>
                    <p className="text-earth-500 dark:text-earth-400 mb-6">
                      {searchQuery ? '没有找到匹配的录音' : '点击上方按钮添加录音到此收藏集'}
                    </p>
                    {!searchQuery && (
                      <Button
                        variant="primary"
                        leftIcon={<Plus size={18} />}
                        onClick={() => setShowAddDialog(true)}
                      >
                        添加录音
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRecordings.map((recording, index) => {
                      const originalIndex = collection.recordingIds.indexOf(recording.id);
                      const isCurrent = currentRecording?.id === recording.id;
                      return (
                        <div
                          key={recording.id}
                          className={cn(
                            'group relative transition-all duration-300',
                            isCurrent && isPlaying && 'ring-2 ring-forest-500 rounded-xl'
                          )}
                        >
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                            <span className={cn(
                              'w-6 h-6 flex items-center justify-center text-sm font-medium rounded-full',
                              isCurrent
                                ? 'bg-forest-600 text-white'
                                : 'bg-earth-200 dark:bg-earth-700 text-earth-600 dark:text-earth-400'
                            )}>
                              {isCurrent && isPlaying ? (
                                <div className="flex items-center gap-0.5">
                                  <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '0ms' }} />
                                  <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                                  <div className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
                                </div>
                              ) : (
                                index + 1
                              )}
                            </span>
                          </div>

                          <div className="pl-14 pr-24">
                            <RecordingCard
                              recording={recording}
                              compact
                              onClick={() => navigate(`/archive/${recording.id}`)}
                            />
                          </div>

                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveRecording(originalIndex, 'up')}
                              disabled={originalIndex === 0}
                              className="w-8 h-8"
                            >
                              <ChevronUp size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveRecording(originalIndex, 'down')}
                              disabled={originalIndex === collection.recordingIds.length - 1}
                              className="w-8 h-8"
                            >
                              <ChevronDown size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRemoveConfirm(recording.id)}
                              className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {relatedCollections.length > 0 && (
              <Card glass>
                <CardHeader>
                  <CardTitle className="text-lg">相关收藏集</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {relatedCollections.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-earth-50 dark:bg-earth-900/30 hover:bg-earth-100 dark:hover:bg-earth-900/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/collections/${c.id}`)}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-lg bg-gradient-to-br flex-shrink-0 overflow-hidden',
                        getGradientColor(c.id)
                      )}>
                        <div className="w-full h-full flex items-center justify-center text-white/80">
                          <Music size={20} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-earth-900 dark:text-earth-100 truncate group-hover:text-forest-600 dark:group-hover:text-forest-400 transition-colors">
                          {c.name}
                        </h4>
                        <p className="text-xs text-earth-500 dark:text-earth-400 truncate">
                          {c.recordingIds.length} 条录音 · {c.theme}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card glass>
              <CardHeader>
                <CardTitle className="text-lg">排序说明</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm text-earth-600 dark:text-earth-400">
                  <div className="flex items-start gap-2">
                    <ArrowUpDown size={16} className="text-forest-500 mt-0.5 flex-shrink-0" />
                    <span>拖拽或使用上下箭头调整录音播放顺序</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Play size={16} className="text-forest-500 mt-0.5 flex-shrink-0" />
                    <span>点击播放按钮将按当前顺序播放整个收藏集</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shuffle size={16} className="text-forest-500 mt-0.5 flex-shrink-0" />
                    <span>随机播放会打乱顺序播放所有录音</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditDialog(false)}
          />
          <Card glass className="relative w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>编辑收藏集</CardTitle>
              <button
                onClick={() => setShowEditDialog(false)}
                className="p-1 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
              >
                <X size={20} className="text-earth-500" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="请输入收藏集名称"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className={formErrors.name ? 'border-red-500' : ''}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      主题 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="如：春天的声音"
                      value={editFormData.theme}
                      onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value })}
                      className={formErrors.theme ? 'border-red-500' : ''}
                    />
                    {formErrors.theme && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.theme}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                      情绪 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="如：欢快、宁静"
                      value={editFormData.mood}
                      onChange={(e) => setEditFormData({ ...editFormData, mood: e.target.value })}
                      className={formErrors.mood ? 'border-red-500' : ''}
                    />
                    {formErrors.mood && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.mood}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    描述 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="请输入收藏集描述"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className={formErrors.description ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-earth-100 dark:border-earth-800">
                  <Button variant="secondary" type="button" onClick={() => setShowEditDialog(false)}>
                    取消
                  </Button>
                  <Button variant="primary" type="submit">
                    保存修改
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddDialog(false)}
          />
          <Card glass className="relative w-full max-w-2xl z-10 max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
              <CardTitle>添加录音到收藏集</CardTitle>
              <button
                onClick={() => setShowAddDialog(false)}
                className="p-1 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
              >
                <X size={20} className="text-earth-500" />
              </button>
            </CardHeader>
            <CardContent className="pt-0 flex-1 overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-earth-400"
                  />
                  <Input
                    placeholder="搜索可添加的录音..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {filteredAvailableRecordings.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                    <Disc size={24} className="text-earth-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                    没有可添加的录音
                  </h3>
                  <p className="text-earth-500 dark:text-earth-400">
                    {searchQuery ? '没有找到匹配的录音' : '所有录音都已添加到此收藏集'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAvailableRecordings.map((recording) => (
                    <div
                      key={recording.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-earth-50 dark:bg-earth-900/30 hover:bg-earth-100 dark:hover:bg-earth-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-white flex-shrink-0">
                          <Music size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-earth-900 dark:text-earth-100 truncate">
                            {recording.title}
                          </h4>
                          <p className="text-xs text-earth-500 dark:text-earth-400 truncate">
                            {recording.locationName} · {formatDuration(recording.audioMetadata?.duration)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => handleAddRecording(recording.id)}
                      >
                        添加
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setRemoveConfirm(null)}
          />
          <Card glass className="relative w-full max-w-md z-10">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-earth-900 dark:text-earth-100 mb-2">
                  确认移除
                </h3>
                <p className="text-earth-600 dark:text-earth-400 mb-6">
                  确定要将此录音从收藏集中移除吗？录音文件不会被删除。
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => setRemoveConfirm(null)}>
                    取消
                  </Button>
                  <Button variant="danger" onClick={() => handleRemoveRecording(removeConfirm)}>
                    确认移除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default CollectionDetail;
