import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Sparkles,
  Users,
  Clock,
  Brain,
  Filter,
  X,
  Plus,
  Star,
} from 'lucide-react';
import {
  matchGameForRecommendation,
  getComplexityLabel,
  getComplexityColor,
  formatDuration,
} from '@/utils/helpers';

const occasionOptions = [
  '家庭聚会',
  '朋友派对',
  '策略深度',
  '轻松休闲',
  '新手入门',
  '桌游之夜',
  '二人游戏',
];

export default function Recommend() {
  const { games, collectionItems, reviews, addReview } = useGameStore();
  const [playerCount, setPlayerCount] = useState<number | ''>('');
  const [maxDuration, setMaxDuration] = useState<number | ''>('');
  const [maxComplexity, setMaxComplexity] = useState<number | ''>('');
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [showRecommend, setShowRecommend] = useState(false);

  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    gameId: '',
    type: 'firstImpression' as const,
    content: '',
    rating: 5,
  });

  const toggleOccasion = (occasion: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasion)
        ? prev.filter((o) => o !== occasion)
        : [...prev, occasion]
    );
  };

  const getCollectionByGameId = (gameId: string) =>
    collectionItems.find((c) => c.gameId === gameId);

  const getReviewsByGameId = (gameId: string) =>
    reviews.filter((r) => r.gameId === gameId);

  const recommendations = games
    .map((game) => {
      const result = matchGameForRecommendation(game, {
        players: playerCount !== '' ? playerCount : undefined,
        maxDuration: maxDuration !== '' ? maxDuration : undefined,
        maxComplexity: maxComplexity !== '' ? maxComplexity : undefined,
        tags: selectedOccasions.length > 0 ? selectedOccasions : undefined,
      });

      const collection = getCollectionByGameId(game.id);
      if (collection) {
        const occasionMatch = selectedOccasions.filter((o) =>
          collection.occasionTags.includes(o)
        );
        if (occasionMatch.length > 0) {
          result.score += occasionMatch.length * 5;
          result.reasons.push(`场合匹配：${occasionMatch.join('、')}`);
        }
      }

      return { game, ...result, collection };
    })
    .filter((item) => item.match)
    .sort((a, b) => b.score - a.score);

  const allReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getGameById = (id: string) => games.find((g) => g.id === id);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.gameId || !newReview.content) {
      alert('请填写完整信息');
      return;
    }

    addReview({
      gameId: newReview.gameId,
      type: newReview.type,
      content: newReview.content,
      rating: newReview.rating,
    });

    setNewReview({
      gameId: '',
      type: 'firstImpression',
      content: '',
      rating: 5,
    });
    setShowAddReview(false);
  };

  const resetFilters = () => {
    setPlayerCount('');
    setMaxDuration('');
    setMaxComplexity('');
    setSelectedOccasions([]);
    setShowRecommend(false);
  };

  const getReviewTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      firstImpression: '第一印象',
      secondPlay: '第二次感受',
      longTerm: '长期评价',
    };
    return labels[type] || type;
  };

  const getReviewTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      firstImpression: 'bg-pink-500/20 text-pink-400',
      secondPlay: 'bg-blue-500/20 text-blue-400',
      longTerm: 'bg-green-500/20 text-green-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">游戏推荐</h1>
          <p className="text-gray-400 mt-1">根据今晚的情况，找到最适合的桌游</p>
        </div>
        <button
          onClick={() => setShowAddReview(!showAddReview)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">添加评测</span>
        </button>
      </div>

      {showAddReview && (
        <div className="card p-6 animate-slide-up">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            添加游戏评测
          </h2>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">选择游戏</label>
                <select
                  value={newReview.gameId}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, gameId: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">请选择游戏</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">评测类型</label>
                <select
                  value={newReview.type}
                  onChange={(e) => setNewReview((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="firstImpression">第一印象</option>
                  <option value="secondPlay">第二次感受</option>
                  <option value="longTerm">长期评价</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">评分 ({newReview.rating}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={newReview.rating}
                onChange={(e) => setNewReview((prev) => ({ ...prev, rating: parseInt(e.target.value) }))}
                className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-accent-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div>
              <label className="label">评测内容</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview((prev) => ({ ...prev, content: e.target.value }))}
                className="input-field h-32 resize-none"
                placeholder="分享您的游戏感受..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button type="submit" className="btn-primary">
                保存评测
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-accent-500" />
            今晚的游戏条件
          </h2>
          {showRecommend && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              重置
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-500" />
              玩家人数
            </label>
            <select
              value={playerCount}
              onChange={(e) =>
                setPlayerCount(e.target.value === '' ? '' : parseInt(e.target.value))
              }
              className="input-field"
            >
              <option value="">不限</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} 人
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-500" />
              最长时长
            </label>
            <select
              value={maxDuration}
              onChange={(e) =>
                setMaxDuration(e.target.value === '' ? '' : parseInt(e.target.value))
              }
              className="input-field"
            >
              <option value="">不限</option>
              <option value="30">30分钟内</option>
              <option value="60">60分钟内</option>
              <option value="90">90分钟内</option>
              <option value="120">120分钟内</option>
              <option value="180">180分钟内</option>
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Brain className="w-4 h-4 text-accent-500" />
              最高复杂度
            </label>
            <select
              value={maxComplexity}
              onChange={(e) =>
                setMaxComplexity(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              className="input-field"
            >
              <option value="">不限</option>
              <option value="1.5">入门级 (1.5)</option>
              <option value="2.5">轻策 (2.5)</option>
              <option value="3.5">中策 (3.5)</option>
              <option value="5">重策 (5)</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="label">适合场合</label>
          <div className="flex flex-wrap gap-2">
            {occasionOptions.map((occasion) => (
              <button
                key={occasion}
                type="button"
                onClick={() => toggleOccasion(occasion)}
                className={`tag cursor-pointer transition-all ${
                  selectedOccasions.includes(occasion)
                    ? 'bg-accent-500 text-surface-900'
                    : 'bg-surface-200 text-gray-300 hover:bg-surface-100'
                }`}
              >
                {occasion}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowRecommend(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          为我推荐游戏
        </button>
      </div>

      {showRecommend && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-500" />
            推荐结果
          </h2>

          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>没有找到匹配条件的游戏</p>
              <p className="text-sm mt-2">尝试调整筛选条件</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((item, index) => {
                const gameReviews = getReviewsByGameId(item.game.id);
                const avgRating =
                  gameReviews.length > 0
                    ? (gameReviews.reduce((sum, r) => sum + r.rating, 0) / gameReviews.length).toFixed(1)
                    : '-';

                return (
                  <div
                    key={item.game.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-200 rounded-xl hover:bg-surface-100 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.game.coverImage}
                        alt={item.game.name}
                        className="w-24 h-32 object-cover rounded-lg"
                      />
                      {index < 3 && (
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-surface-900 font-bold text-sm">
                          #{index + 1}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          to={`/collection/${item.game.id}`}
                          className="text-white font-medium hover:text-accent-500"
                        >
                          {item.game.name}
                        </Link>
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-white text-sm">{avgRating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2 text-xs text-gray-400">
                        <span>{item.game.minPlayers}-{item.game.maxPlayers}人</span>
                        <span>·</span>
                        <span>{formatDuration(item.game.minPlayTime)}-{formatDuration(item.game.maxPlayTime)}</span>
                        <span>·</span>
                        <span className={getComplexityColor(item.game.complexity)}>
                          {getComplexityLabel(item.game.complexity)} ({item.game.complexity.toFixed(1)})
                        </span>
                      </div>

                      {item.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.reasons.map((reason, i) => (
                            <span key={i} className="tag bg-green-500/20 text-green-400 text-xs">
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.game.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.game.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="tag bg-surface-100 text-gray-300 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-accent-500" />
          最近评测
        </h2>

        {allReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>暂无评测记录</p>
            <p className="text-sm mt-2">点击上方按钮添加您的第一条评测</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allReviews.slice(0, 5).map((review) => {
              const game = getGameById(review.gameId);
              return (
                <div key={review.id} className="p-4 bg-surface-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {game && (
                        <img
                          src={game.coverImage}
                          alt={game.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <Link
                          to={`/collection/${review.gameId}`}
                          className="text-white font-medium hover:text-accent-500 text-sm"
                        >
                          {game?.name || '未知游戏'}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`tag ${getReviewTypeColor(review.type)}`}>
                            {getReviewTypeLabel(review.type)}
                          </span>
                          <span className="text-xs text-gray-500">{review.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3">{review.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
