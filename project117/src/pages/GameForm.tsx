import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { CollectionStatus } from '@/types';
import { ChevronLeft, Save, Upload, X } from 'lucide-react';

const allTags = [
  '策略', '经济', '卡牌', '合作', '主题', '家庭', '区域控制',
  '文明', '引擎构筑', '派对', '推理', '社交', '文字', '战棋',
  '不对称', '轮抽', '轻松局', '游戏夜', '朋友聚会', '家庭游戏',
];

const occasionTags = [
  '游戏夜', '朋友聚会', '家庭游戏', '轻松局', '派对', '二人局',
  '深度策略', '新人入门',
];

const statusOptions: { value: CollectionStatus; label: string }[] = [
  { value: 'owned', label: '已拥有' },
  { value: 'wishlist', label: '愿望清单' },
  { value: 'lent', label: '已借出' },
  { value: 'sold', label: '已出售' },
];

export default function GameForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { games, collectionItems, addGame, updateGame, addCollectionItem, updateCollectionItem } =
    useGameStore();

  const existingGame = games.find((g) => g.id === id);
  const existingCollection = collectionItems.find((c) => c.gameId === id);

  const [formData, setFormData] = useState({
    name: '',
    publisher: '',
    minPlayers: 2,
    maxPlayers: 4,
    minPlayTime: 30,
    maxPlayTime: 60,
    complexity: 2.5,
    yearPublished: new Date().getFullYear(),
    coverImage: '',
    description: '',
    tags: [] as string[],
    bggId: '',
  });

  const [collectionData, setCollectionData] = useState({
    status: 'owned' as CollectionStatus,
    cabinet: '',
    shelf: '',
    locationNotes: '',
    occasionTags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (existingGame) {
      setFormData({
        name: existingGame.name,
        publisher: existingGame.publisher,
        minPlayers: existingGame.minPlayers,
        maxPlayers: existingGame.maxPlayers,
        minPlayTime: existingGame.minPlayTime,
        maxPlayTime: existingGame.maxPlayTime,
        complexity: existingGame.complexity,
        yearPublished: existingGame.yearPublished,
        coverImage: existingGame.coverImage,
        description: existingGame.description || '',
        tags: existingGame.tags,
        bggId: existingGame.bggId || '',
      });
    }
    if (existingCollection) {
      setCollectionData({
        status: existingCollection.status,
        cabinet: existingCollection.cabinet,
        shelf: existingCollection.shelf,
        locationNotes: existingCollection.locationNotes || '',
        occasionTags: existingCollection.occasionTags,
      });
    }
  }, [existingGame, existingCollection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const gameData = {
      name: formData.name,
      publisher: formData.publisher,
      minPlayers: formData.minPlayers,
      maxPlayers: formData.maxPlayers,
      minPlayTime: formData.minPlayTime,
      maxPlayTime: formData.maxPlayTime,
      complexity: formData.complexity,
      yearPublished: formData.yearPublished,
      coverImage:
        formData.coverImage ||
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=board%20game%20${encodeURIComponent(formData.name)}%20cover&image_size=square`,
      description: formData.description,
      tags: formData.tags,
      bggId: formData.bggId || undefined,
    };

    if (isEdit && id) {
      updateGame(id, gameData);
      if (existingCollection) {
        updateCollectionItem(existingCollection.id, collectionData);
      } else {
        addCollectionItem({
          ...collectionData,
          gameId: id,
          dateAdded: new Date().toISOString().split('T')[0],
        });
      }
      navigate(`/collection/${id}`);
    } else {
      const newGameId = addGame({ ...gameData });
      addCollectionItem({
        ...collectionData,
        gameId: newGameId,
        dateAdded: new Date().toISOString().split('T')[0],
      });
      navigate('/collection');
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleOccasionTag = (tag: string) => {
    setCollectionData((prev) => ({
      ...prev,
      occasionTags: prev.occasionTags.includes(tag)
        ? prev.occasionTags.filter((t) => t !== tag)
        : [...prev.occasionTags, tag],
    }));
  };

  const addCustomTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </button>
        <h1 className="font-display text-3xl font-bold text-white">
          {isEdit ? '编辑游戏' : '添加新游戏'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            游戏信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">游戏名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">出版社 *</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, publisher: e.target.value }))
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">发布年份</label>
              <input
                type="number"
                value={formData.yearPublished}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    yearPublished: parseInt(e.target.value) || 0,
                  }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">最少玩家数</label>
              <input
                type="number"
                min={1}
                value={formData.minPlayers}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minPlayers: parseInt(e.target.value) || 1,
                  }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">最多玩家数</label>
              <input
                type="number"
                min={1}
                value={formData.maxPlayers}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPlayers: parseInt(e.target.value) || 1,
                  }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">最短时长 (分钟)</label>
              <input
                type="number"
                min={1}
                value={formData.minPlayTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minPlayTime: parseInt(e.target.value) || 1,
                  }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">最长时长 (分钟)</label>
              <input
                type="number"
                min={1}
                value={formData.maxPlayTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPlayTime: parseInt(e.target.value) || 1,
                  }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">
                复杂度 ({formData.complexity.toFixed(1)})
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.1}
                value={formData.complexity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    complexity: parseFloat(e.target.value),
                  }))
                }
                className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-accent-500"
              />
            </div>

            <div>
              <label className="label">BGG ID (可选)</label>
              <input
                type="text"
                value={formData.bggId}
                onChange={(e) => setFormData((prev) => ({ ...prev, bggId: e.target.value }))}
                className="input-field"
                placeholder="BoardGameGeek 游戏ID"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">封面图 URL (可选)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, coverImage: e.target.value }))
                  }
                  className="input-field flex-1"
                  placeholder="输入图片URL，留空将自动生成"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label">游戏描述</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="input-field h-24 resize-none"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">游戏标签</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`tag cursor-pointer transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-accent-500 text-surface-900'
                        : 'bg-surface-200 text-gray-300 hover:bg-surface-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  className="input-field flex-1"
                  placeholder="添加自定义标签"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="btn-secondary"
                >
                  添加
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-sm text-gray-400">已选:</span>
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag bg-accent-500/20 text-accent-400 flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            收藏信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">收藏状态</label>
              <select
                value={collectionData.status}
                onChange={(e) =>
                  setCollectionData((prev) => ({
                    ...prev,
                    status: e.target.value as CollectionStatus,
                  }))
                }
                className="input-field"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">书柜</label>
              <input
                type="text"
                value={collectionData.cabinet}
                onChange={(e) =>
                  setCollectionData((prev) => ({ ...prev, cabinet: e.target.value }))
                }
                className="input-field"
                placeholder="如：主书柜"
              />
            </div>

            <div>
              <label className="label">层级</label>
              <input
                type="text"
                value={collectionData.shelf}
                onChange={(e) =>
                  setCollectionData((prev) => ({ ...prev, shelf: e.target.value }))
                }
                className="input-field"
                placeholder="如：第二层"
              />
            </div>

            <div>
              <label className="label">位置备注</label>
              <input
                type="text"
                value={collectionData.locationNotes}
                onChange={(e) =>
                  setCollectionData((prev) => ({
                    ...prev,
                    locationNotes: e.target.value,
                  }))
                }
                className="input-field"
                placeholder="如：盒子有压痕"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">适合场合</label>
              <div className="flex flex-wrap gap-2">
                {occasionTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleOccasionTag(tag)}
                    className={`tag cursor-pointer transition-colors ${
                      collectionData.occasionTags.includes(tag)
                        ? 'bg-accent-500 text-surface-900'
                        : 'bg-surface-200 text-gray-300 hover:bg-surface-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {isEdit ? '保存更改' : '添加游戏'}
          </button>
        </div>
      </form>
    </div>
  );
}
