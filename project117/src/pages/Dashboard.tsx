import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Gamepad2,
  Users,
  Clock,
  Star,
  Plus,
  History,
  BookOpen,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  formatDate,
  formatDuration,
  calculateGameStats,
  calculatePlayerStats,
} from '@/utils/helpers';
import { useEffect } from 'react';

export default function Dashboard() {
  const {
    games,
    collectionItems,
    playRecords,
    ruleNotes,
    initData,
  } = useGameStore();

  useEffect(() => {
    initData();
  }, [initData]);

  const ownedCount = collectionItems.filter((c) => c.status === 'owned').length;
  const wishlistCount = collectionItems.filter((c) => c.status === 'wishlist').length;
  const totalPlayMinutes = playRecords.reduce((sum, r) => sum + r.duration, 0);
  const uniquePlayers = new Set(
    playRecords.flatMap((r) => r.players.map((p) => p.name).filter((n) => n !== '全员'))
  ).size;

  const recentPlays = [...playRecords]
    .sort((a, b) => new Date(b.playDate).getTime() - new Date(a.playDate).getTime())
    .slice(0, 5);

  const playerStats = calculatePlayerStats(playRecords).slice(0, 5);

  const statusData = [
    { name: '已拥有', value: collectionItems.filter((c) => c.status === 'owned').length },
    { name: '愿望清单', value: collectionItems.filter((c) => c.status === 'wishlist').length },
    { name: '已借出', value: collectionItems.filter((c) => c.status === 'lent').length },
    { name: '已出售', value: collectionItems.filter((c) => c.status === 'sold').length },
  ].filter((d) => d.value > 0);

  const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];

  const topGames = games
    .map((game) => ({
      game,
      stats: calculateGameStats(game.id, playRecords),
    }))
    .filter((item) => item.stats.playCount > 0)
    .sort((a, b) => b.stats.playCount - a.stats.playCount)
    .slice(0, 5)
    .map((item) => ({
      name: item.game.name.length > 8 ? item.game.name.slice(0, 8) + '...' : item.game.name,
      游玩次数: item.stats.playCount,
    }));

  const getGameById = (id: string) => games.find((g) => g.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">仪表盘</h1>
          <p className="text-gray-400 mt-1">欢迎回来，查看您的桌游收藏概览</p>
        </div>
        <Link to="/collection/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">添加游戏</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{ownedCount}</p>
              <p className="text-sm text-gray-400">已拥有</p>
            </div>
          </div>
        </div>

        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{wishlistCount}</p>
              <p className="text-sm text-gray-400">愿望清单</p>
            </div>
          </div>
        </div>

        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{Math.floor(totalPlayMinutes / 60)}</p>
              <p className="text-sm text-gray-400">游戏小时数</p>
            </div>
          </div>
        </div>

        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{uniquePlayers}</p>
              <p className="text-sm text-gray-400">游戏搭子</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">收藏分布</h2>
          <div className="h-64">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1f1f',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无数据
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-400">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">游玩最多的游戏</h2>
          <div className="h-64">
            {topGames.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topGames} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f1f1f',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="游玩次数" fill="#d4a574" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无游玩记录
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-500" />
              游戏搭子
            </h2>
          </div>
          {playerStats.length > 0 ? (
            <div className="space-y-3">
              {playerStats.map((player, index) => {
                const favoriteGame = player.favoriteGame
                  ? getGameById(player.favoriteGame)
                  : null;
                return (
                  <div
                    key={player.name}
                    className="flex items-center justify-between p-3 bg-surface-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : index === 1
                            ? 'bg-gray-400/20 text-gray-300'
                            : index === 2
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-surface-100 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{player.name}</p>
                        <p className="text-xs text-gray-500">
                          {favoriteGame ? `最爱: ${favoriteGame.name}` : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{player.playCount}局</p>
                      <p className="text-xs text-gray-500">胜率 {player.winRate}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              暂无游戏搭子记录
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-accent-500" />
              最近游玩
            </h2>
            <Link to="/plays" className="text-sm text-accent-500 hover:text-accent-400">
              查看全部
            </Link>
          </div>
          {recentPlays.length > 0 ? (
            <div className="space-y-3">
              {recentPlays.map((play) => {
                const game = getGameById(play.gameId);
                return (
                  <div
                    key={play.id}
                    className="flex items-center gap-4 p-3 bg-surface-200 rounded-lg hover:bg-surface-100 transition-colors"
                  >
                    {game && (
                      <img
                        src={game.coverImage}
                        alt={game.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {game?.name || '未知游戏'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDate(play.playDate)}</span>
                        <span>{formatDuration(play.duration)}</span>
                        <span>{play.players.length}人</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-white font-medium">{play.rating}</span>
                      </div>
                      {play.winner && (
                        <p className="text-xs text-green-400">胜: {play.winner}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              暂无游玩记录
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent-500" />
              规则笔记
            </h2>
            <Link to="/rules" className="text-sm text-accent-500 hover:text-accent-400">
              查看全部
            </Link>
          </div>
          {ruleNotes.length > 0 ? (
            <div className="space-y-3">
              {ruleNotes.slice(0, 5).map((note) => {
                const game = getGameById(note.gameId);
                return (
                  <div
                    key={note.id}
                    className="p-3 bg-surface-200 rounded-lg hover:bg-surface-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium">{note.title}</p>
                      <span className="text-xs text-gray-500">
                        {game?.name || '未知游戏'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{note.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500">
              暂无规则笔记
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/collection/add"
          className="card p-5 card-hover flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-accent-500" />
          </div>
          <p className="text-white font-medium">添加新游戏</p>
        </Link>
        <Link
          to="/plays/add"
          className="card p-5 card-hover flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <History className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-white font-medium">记录游玩</p>
        </Link>
        <Link
          to="/rules"
          className="card p-5 card-hover flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-white font-medium">规则速查</p>
        </Link>
        <Link
          to="/recommend"
          className="card p-5 card-hover flex flex-col items-center justify-center gap-3 text-center"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-white font-medium">游戏推荐</p>
        </Link>
      </div>
    </div>
  );
}
