import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  X,
  Play,
  Edit3,
  Trash2,
  Disc,
  Music,
  Heart,
  Sparkles,
  Image,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useRecordingStore } from '@/store/useRecordingStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Collection } from '@/types';
import { cn } from '@/lib/utils';

const Collections: React.FC = () => {
  const navigate = useNavigate();
  const {
    collections,
    addCollection,
    updateCollection,
    deleteCollection,
    getRecordingById,
  } = useRecordingStore();
  const { playRecording } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    mood: '',
    description: '',
    coverImage: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allThemes = useMemo(() => {
    const themes = new Set(collections.map((c) => c.theme));
    return Array.from(themes);
  }, [collections]);

  const allMoods = useMemo(() => {
    const moods = new Set(collections.map((c) => c.mood));
    return Array.from(moods);
  }, [collections]);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          collection.name.toLowerCase().includes(query) ||
          collection.description.toLowerCase().includes(query) ||
          collection.theme.toLowerCase().includes(query) ||
          collection.mood.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (selectedTheme && collection.theme !== selectedTheme) return false;
      if (selectedMood && collection.mood !== selectedMood) return false;

      return true;
    });
  }, [collections, searchQuery, selectedTheme, selectedMood]);

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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = '请输入收藏集名称';
    }
    if (!formData.theme.trim()) {
      errors.theme = '请输入主题';
    }
    if (!formData.mood.trim()) {
      errors.mood = '请输入情绪';
    }
    if (!formData.description.trim()) {
      errors.description = '请输入描述';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name,
        theme: collection.theme,
        mood: collection.mood,
        description: collection.description,
        coverImage: collection.coverImage || '',
      });
    } else {
      setEditingCollection(null);
      setFormData({
        name: '',
        theme: '',
        mood: '',
        description: '',
        coverImage: '',
      });
    }
    setFormErrors({});
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCollection(null);
    setFormErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCollection) {
      updateCollection(editingCollection.id, formData);
    } else {
      const newCollection: Collection = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        recordingIds: [],
        createdAt: new Date(),
      };
      addCollection(newCollection);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteCollection(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handlePlayCollection = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    const collectionRecordings = collection.recordingIds
      .map((id) => getRecordingById(id))
      .filter(Boolean);
    if (collectionRecordings.length > 0) {
      const randomIndex = Math.floor(Math.random() * collectionRecordings.length);
      const randomRecording = collectionRecordings[randomIndex];
      if (randomRecording) {
        playRecording(randomRecording);
      }
    }
  };

  const handleEdit = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenDialog(collection);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTheme(null);
    setSelectedMood(null);
  };

  const hasActiveFilters =
    searchQuery.length > 0 || selectedTheme !== null || selectedMood !== null;

  return (
    <Layout>
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-earth-900 dark:text-earth-100 font-display">
              收藏集
            </h1>
            <p className="text-earth-600 dark:text-earth-400 mt-2">
              共 {filteredCollections.length} 个收藏集 · 管理你精心整理的声音合集
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => handleOpenDialog()}
            >
              新建收藏集
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
                  placeholder="搜索收藏集名称、描述、主题或情绪..."
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

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between p-3 bg-earth-50 dark:bg-earth-900/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-earth-600 dark:text-earth-400 flex-wrap">
                  <span>已应用筛选条件</span>
                  {selectedTheme && (
                    <span className="px-2 py-0.5 bg-forest-100 dark:bg-forest-900/50 text-forest-700 dark:text-forest-400 rounded-full text-xs">
                      主题: {selectedTheme}
                    </span>
                  )}
                  {selectedMood && (
                    <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded-full text-xs">
                      情绪: {selectedMood}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="px-2 py-0.5 bg-sunset-100 dark:bg-sunset-900/50 text-sunset-700 dark:text-sunset-400 rounded-full text-xs">
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
                  按主题筛选
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                      selectedTheme === null
                        ? 'bg-forest-600 text-white'
                        : 'bg-earth-100 text-earth-700 hover:bg-earth-200 dark:bg-earth-900/50 dark:text-earth-300'
                    )}
                    onClick={() => setSelectedTheme(null)}
                  >
                    全部
                  </button>
                  {allThemes.map((theme) => (
                    <button
                      key={theme}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                        selectedTheme === theme
                          ? 'bg-forest-600 text-white border-transparent'
                          : 'border-earth-200 hover:border-earth-300 dark:border-earth-700 text-forest-600 dark:text-forest-400'
                      )}
                      onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3">
                  按情绪筛选
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                      selectedMood === null
                        ? 'bg-forest-600 text-white'
                        : 'bg-earth-100 text-earth-700 hover:bg-earth-200 dark:bg-earth-900/50 dark:text-earth-300'
                    )}
                    onClick={() => setSelectedMood(null)}
                  >
                    全部
                  </button>
                  {allMoods.map((mood) => (
                    <button
                      key={mood}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                        selectedMood === mood
                          ? 'bg-sky-600 text-white border-transparent'
                          : 'border-earth-200 hover:border-earth-300 dark:border-earth-700 text-sky-600 dark:text-sky-400'
                      )}
                      onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredCollections.length === 0 ? (
          <Card glass>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-earth-100 dark:bg-earth-900/50 flex items-center justify-center">
                <Disc size={24} className="text-earth-400" />
              </div>
              <h3 className="text-lg font-semibold text-earth-700 dark:text-earth-300 mb-2">
                没有找到匹配的收藏集
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                glass
                hover
                className="group cursor-pointer overflow-hidden"
                onClick={() => navigate(`/collections/${collection.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  {collection.coverImage ? (
                    <img
                      src={collection.coverImage}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className={cn(
                        'w-full h-full bg-gradient-to-br',
                        getGradientColor(collection.id)
                      )}
                    >
                      <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                          <path
                            d="M0,100 Q50,20 100,100 T200,100 T300,100 T400,100 L400,200 L0,200 Z"
                            fill="rgba(255,255,255,0.3)"
                          />
                          <path
                            d="M0,100 Q50,180 100,100 T200,100 T300,100 T400,100"
                            fill="none"
                            stroke="rgba(255,255,255,0.5)"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className="px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1">
                      <Music size={12} />
                      {collection.recordingIds.length} 条录音
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 bg-white/90 hover:bg-white text-earth-700"
                      onClick={(e) => handlePlayCollection(collection, e)}
                    >
                      <Play size={14} fill="currentColor" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 bg-white/90 hover:bg-white text-earth-700"
                      onClick={(e) => handleEdit(collection, e)}
                    >
                      <Edit3 size={14} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 bg-white/90 hover:bg-white text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(collection.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-xl font-bold text-white font-display truncate">
                      {collection.name}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-forest-100 dark:bg-forest-900/50 text-forest-700 dark:text-forest-400 rounded-full text-xs font-medium">
                      <Sparkles size={12} />
                      {collection.theme}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-400 rounded-full text-xs font-medium">
                      <Heart size={12} />
                      {collection.mood}
                    </span>
                  </div>
                  <p className="text-sm text-earth-600 dark:text-earth-400 line-clamp-2">
                    {collection.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseDialog}
          />
          <Card glass className="relative w-full max-w-lg z-10 max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingCollection ? '编辑收藏集' : '新建收藏集'}
              </CardTitle>
              <button
                onClick={handleCloseDialog}
                className="p-1 rounded-lg hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
              >
                <X size={20} className="text-earth-500" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="请输入收藏集名称"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
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
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
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
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={formErrors.description ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                    封面图片 URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      leftIcon={<Image size={16} />}
                    />
                  </div>
                  {formData.coverImage && (
                    <div className="mt-2 rounded-lg overflow-hidden h-32">
                      <img
                        src={formData.coverImage}
                        alt="预览"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-earth-500">
                    留空将使用自动生成的渐变色封面
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-earth-100 dark:border-earth-800">
                  <Button variant="secondary" type="button" onClick={handleCloseDialog}>
                    取消
                  </Button>
                  <Button variant="primary" type="submit">
                    {editingCollection ? '保存修改' : '创建收藏集'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <Card glass className="relative w-full max-w-md z-10">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-earth-900 dark:text-earth-100 mb-2">
                  确认删除
                </h3>
                <p className="text-earth-600 dark:text-earth-400 mb-6">
                  你确定要删除这个收藏集吗？此操作不可撤销，收藏集中的录音不会被删除。
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                    取消
                  </Button>
                  <Button variant="danger" onClick={confirmDelete}>
                    确认删除
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

export default Collections;
