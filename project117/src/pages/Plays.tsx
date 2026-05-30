import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import {
  Plus,
  Calendar,
  Clock,
  Star,
  Trophy,
  Users,
  TrendingUp,
} from 'lucide-react';
import {
  formatDate,
  formatDuration,
  calculatePlayerStats,
  getCollectionStatusLabel,
  getCollectionStatusColor,
} from '@/utils/helpers';
import { Player, PlayRecord, Game } from '@/types';

export default function Plays() {
  const { games, playRecords } = useGameStore();
  const [selectedGameId, setSelectedGameId] = useState<string | 'all'>('all');

  const playerStats = calculatePlayerStats(playRecords);

  const filteredRecords = [...playRecords]
    .filter((r) => selectedGameId === 'all' || r.gameId === selectedGameId)
    .sort((a, b) => new Date(b.playDate).getTime() - new Date(a.playDate).getTime());

  const getGameById = (id: string) => games.find((g) => g.id === id);

  const totalPlays = playRecords.length;
  const totalHours = Math.floor(playRecords.reduce((sum, r) => sum + r.duration, 0) / 60);

  const topGames = games
    .map((game) => ({
      game,
      count: playRecords.filter((r) => r.gameId === game.id).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">游玩记录</h1>
          <p className="text-gray-400 mt-1">记录每一次精彩的游戏时刻</p>
        </div>
        <Link to="/plays/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">记录游玩</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalPlays}</p>
              <p className="text-sm text-gray-400">总游戏次数</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalHours}</p>
              <p className="text-sm text-gray-400">游戏小时</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{playerStats.length}</p>
              <p className="text-sm text-gray-400">游戏搭子</p>
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {playRecords.length > 0
                  ? (
                      playRecords.reduce((sum, r) => sum + r.rating, 0) / playRecords.length
                    ).toFixed(1)
                  : '-'}
              </p>
              <p className="text-sm text-gray-400">平均评分</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-500" />
                游玩历史
              </h2>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="input-field w-full sm:w-auto"
              >
                <option value="all">全部游戏</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>暂无游玩记录</p>
                <Link
                  to="/plays/add"
                  className="inline-block mt-4 text-accent-500 hover:text-accent-400"
                >
                  记录第一次游戏
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {filteredRecords.map((play) => {
                  const game = getGameById(play.gameId);
                  return (
                    <Link
                      key={play.id}
                      to={`/collection/${play.gameId}`}
                      className="flex items-center gap-4 p-4 bg-surface-200 rounded-lg hover:bg-surface-100 transition-colors"
                    >
                      {game && (
                        <img
                          src={game.coverImage}
                          alt={game.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {game?.name || '未知游戏'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{formatDate(play.playDate)}</span>
                          <span>{formatDuration(play.duration)}</span>
                          <span>{play.players.length}人</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {play.players.slice(0, 4).map((player) => (
                            <span
                              key={player.name}
                              className={`tag text-xs ${
                                player.isWinner
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-surface-100 text-gray-400'
                              }`}
                            >
                              {player.name}
                              {player.isWinner && ' 🏆'}
                            </span>
                          ))}
                          {play.players.length > 4 && (
                            <span className="tag text-xs bg-surface-100 text-gray-400">
                              +{play.players.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-white font-medium">{play.rating}</span>
                        </div>
                        {play.winner && (
                          <p className="text-xs text-green-400 mt-1">
                            胜: {play.winner}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-accent-500" />
              游戏搭子排行
            </h2>
            {playerStats.length === 0 ? (
              <p className="text-center py-8 text-gray-500">暂无记录</p>
            ) : (
              <div className="space-y-3">
                {playerStats.slice(0, 5).map((player, index) => (
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
                      <span className="text-white font-medium">{player.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{player.playCount}局</p>
                      <p className="text-xs text-gray-500">{player.winRate}%胜率</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent-500" />
              常玩游戏
            </h2>
            {topGames.length === 0 ? (
              <p className="text-center py-8 text-gray-500">暂无记录</p>
            ) : (
              <div className="space-y-3">
                {topGames.map((item, index) => (
                  <Link
                    key={item.game.id}
                    to={`/collection/${item.game.id}`}
                    className="flex items-center gap-3 p-2 bg-surface-200 rounded-lg hover:bg-surface-100 transition-colors"
                  >
                    <img
                      src={item.game.coverImage}
                      alt={item.game.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {item.game.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.count} 次游玩
                      </p>
                    </div>
                    <span className="text-accent-500 font-bold">#{index + 1}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
