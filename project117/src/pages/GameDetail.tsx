import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Users,
  Clock,
  MapPin,
  Edit2,
  Trash2,
  Plus,
  Star,
  Calendar,
  ChevronLeft,
} from 'lucide-react';
import {
  formatDate,
  formatDuration,
  getCollectionStatusLabel,
  getCollectionStatusColor,
  getComplexityLabel,
  getComplexityColor,
  getRuleNoteTypeLabel,
  getRuleNoteTypeColor,
  getReviewTypeLabel,
  calculateGameStats,
} from '@/utils/helpers';

type TabType = 'overview' | 'plays' | 'rules' | 'reviews';

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const {
    games,
    collectionItems,
    playRecords,
    ruleNotes,
    reviews,
    expansions,
    deleteGame,
  } = useGameStore();

  const game = games.find((g) => g.id === id);
  const collectionItem = collectionItems.find((c) => c.gameId === id);
  const gamePlayRecords = playRecords.filter((r) => r.gameId === id);
  const gameRuleNotes = ruleNotes.filter((r) => r.gameId === id);
  const gameReviews = reviews.filter((r) => r.gameId === id);
  const gameExpansions = expansions.filter((e) => e.baseGameId === id);
  const stats = calculateGameStats(id || '', playRecords);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: '概览' },
    { id: 'plays', label: `游玩记录 (${gamePlayRecords.length})` },
    { id: 'rules', label: `规则笔记 (${gameRuleNotes.length})` },
    { id: 'reviews', label: `评测 (${gameReviews.length})` },
  ];

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <p className="text-gray-400 text-lg">游戏不存在</p>
        <Link to="/collection" className="mt-4 text-accent-500 hover:text-accent-400">
          返回收藏列表
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个游戏吗？这将删除所有相关数据。')) {
      deleteGame(id!);
      navigate('/collection');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 flex-shrink-0">
            <img
              src={game.coverImage}
              alt={game.name}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-white">
                  {game.name}
                </h1>
                <p className="text-gray-400 mt-1">
                  {game.publisher} · {game.yearPublished}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/collection/${game.id}/edit`}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  编辑
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {collectionItem && (
              <div className="mt-4">
                <span className={`tag ${getCollectionStatusColor(collectionItem.status)}`}>
                  {getCollectionStatusLabel(collectionItem.status)}
                </span>
              </div>
            )}

            {game.description && (
              <p className="mt-4 text-gray-300">{game.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">玩家人数</p>
                  <p className="text-white font-medium">
                    {game.minPlayers}-{game.maxPlayers}人
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">游戏时长</p>
                  <p className="text-white font-medium">
                    {game.minPlayTime}-{game.maxPlayTime}分钟
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">复杂度</p>
                  <p className={`font-medium ${getComplexityColor(game.complexity)}`}>
                    {getComplexityLabel(game.complexity)} ({game.complexity.toFixed(1)})
                  </p>
                </div>
              </div>
              {collectionItem && collectionItem.cabinet && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">存放位置</p>
                    <p className="text-white font-medium">
                      {collectionItem.cabinet} · {collectionItem.shelf}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {game.tags.map((tag) => (
                <span key={tag} className="tag bg-surface-200 text-gray-300">
                  {tag}
                </span>
              ))}
            </div>

            {collectionItem?.locationNotes && (
              <p className="mt-4 text-sm text-gray-500">
                备注: {collectionItem.locationNotes}
              </p>
            )}
          </div>
        </div>
      </div>

      {stats.playCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-white">{stats.playCount}</p>
            <p className="text-sm text-gray-400">游玩次数</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.winRate}%</p>
            <p className="text-sm text-gray-400">胜率</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-white">
              {formatDuration(stats.avgDuration)}
            </p>
            <p className="text-sm text-gray-400">平均时长</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.avgRating}</p>
            <p className="text-sm text-gray-400">平均评分</p>
          </div>
          <div className="card p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-xl font-bold text-white">
              {stats.lastPlayed ? formatDate(stats.lastPlayed) : '-'}
            </p>
            <p className="text-sm text-gray-400">最近游玩</p>
          </div>
        </div>
      )}

      {gameExpansions.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            相关扩展
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gameExpansions.map((exp) => (
              <div key={exp.id} className="bg-surface-200 rounded-lg p-3">
                <img
                  src={exp.coverImage}
                  alt={exp.name}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <p className="text-white font-medium text-sm truncate">{exp.name}</p>
                <span className={`tag text-xs ${getCollectionStatusColor(exp.status)}`}>
                  {getCollectionStatusLabel(exp.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="border-b border-surface-100">
          <div className="flex gap-1 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-accent-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="font-display text-lg font-semibold text-white">游戏信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">出版社</p>
                  <p className="text-white">{game.publisher}</p>
                </div>
                <div className="bg-surface-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">发布年份</p>
                  <p className="text-white">{game.yearPublished}</p>
                </div>
                <div className="bg-surface-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">BGG ID</p>
                  <p className="text-white">{game.bggId || '未关联BGG'}</p>
                </div>
                <div className="bg-surface-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">复杂度</p>
                  <p className={getComplexityColor(game.complexity)}>
                    {getComplexityLabel(game.complexity)} ({game.complexity.toFixed(1)})
                  </p>
                </div>
              </div>
              {game.description && (
                <div className="bg-surface-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500">游戏描述</p>
                  <p className="text-white mt-2">{game.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plays' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-semibold text-white">游玩历史</h3>
                <Link
                  to="/plays/add"
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  记录游玩
                </Link>
              </div>
              {gamePlayRecords.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无游玩记录</p>
              ) : (
                <div className="space-y-3">
                  {gamePlayRecords.map((play) => (
                    <div key={play.id} className="bg-surface-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-white font-medium">
                              {formatDate(play.playDate)}
                            </p>
                            <p className="text-sm text-gray-400">
                              {play.players.length}人 · {formatDuration(play.duration)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {play.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-white">{play.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {play.players.map((player) => (
                          <span
                            key={player.name}
                            className={`tag ${
                              player.isWinner
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-surface-100 text-gray-300'
                            }`}
                          >
                            {player.name}
                            {player.score !== undefined && ` (${player.score})`}
                            {player.isWinner && ' 🏆'}
                          </span>
                        ))}
                      </div>
                      {play.notes && (
                        <p className="text-sm text-gray-400 mt-2">{play.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-lg font-semibold text-white">规则笔记</h3>
                <Link to="/rules" className="btn-secondary flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" />
                  添加笔记
                </Link>
              </div>
              {gameRuleNotes.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无规则笔记</p>
              ) : (
                <div className="space-y-3">
                  {gameRuleNotes.map((note) => (
                    <div key={note.id} className="bg-surface-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`tag ${getRuleNoteTypeColor(note.type)}`}>
                          {getRuleNoteTypeLabel(note.type)}
                        </span>
                        <p className="text-white font-medium">{note.title}</p>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {note.tags.map((tag) => (
                          <span key={tag} className="tag bg-surface-100 text-gray-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-white">评测记录</h3>
              {gameReviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">暂无评测</p>
              ) : (
                <div className="space-y-4">
                  {gameReviews.map((review) => (
                    <div key={review.id} className="bg-surface-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-accent-500 font-medium">
                          {getReviewTypeLabel(review.type)}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(review.rating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{review.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
