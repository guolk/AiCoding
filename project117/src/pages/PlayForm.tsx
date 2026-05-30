import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';
import { ChevronLeft, Save, Plus, X, Star } from 'lucide-react';

export default function PlayForm() {
  const navigate = useNavigate();
  const { games, addPlayRecord } = useGameStore();

  const [formData, setFormData] = useState({
    gameId: '',
    playDate: new Date().toISOString().split('T')[0],
    duration: 60,
    winner: '',
    rating: 7,
    notes: '',
  });

  const [players, setPlayers] = useState<{ name: string; isWinner: boolean; score?: number }[]>([
    { name: '', isWinner: false },
    { name: '', isWinner: false },
  ]);

  const addPlayer = () => {
    setPlayers([...players, { name: '', isWinner: false }]);
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: string, value: string | boolean | number) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validPlayers = players.filter((p) => p.name.trim());
    if (!formData.gameId || validPlayers.length === 0) {
      alert('请选择游戏并填写至少一位玩家');
      return;
    }

    addPlayRecord({
      gameId: formData.gameId,
      playDate: formData.playDate,
      duration: formData.duration,
      players: validPlayers,
      winner: formData.winner || undefined,
      rating: formData.rating,
      notes: formData.notes || undefined,
    });

    navigate('/plays');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </button>
        <h1 className="font-display text-3xl font-bold text-white">记录游玩</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            游戏信息
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">选择游戏 *</label>
              <select
                value={formData.gameId}
                onChange={(e) => setFormData((prev) => ({ ...prev, gameId: e.target.value }))}
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
              <label className="label">日期</label>
              <input
                type="date"
                value={formData.playDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, playDate: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">游戏时长 (分钟)</label>
              <input
                type="number"
                min={1}
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value) || 60,
                  }))
                }
                className="input-field"
              />
            </div>

            <div>
              <label className="label">获胜者 (可选)</label>
              <input
                type="text"
                value={formData.winner}
                onChange={(e) => setFormData((prev) => ({ ...prev, winner: e.target.value }))}
                className="input-field"
                placeholder="如：小明 或 蓝队"
              />
            </div>

            <div>
              <label className="label">评分 ({formData.rating}/10)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-accent-500"
                />
                <div className="flex">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < formData.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label">备注</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                className="input-field h-20 resize-none"
                placeholder="记录游戏中的精彩时刻..."
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-lg font-semibold text-white">
              参与玩家
            </h2>
            <button
              type="button"
              onClick={addPlayer}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              添加玩家
            </button>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-surface-200 rounded-lg"
              >
                <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                  className="input-field flex-1"
                  placeholder="玩家姓名"
                />
                <label className="flex items-center gap-2 text-sm text-gray-300 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={player.isWinner}
                    onChange={(e) => updatePlayer(index, 'isWinner', e.target.checked)}
                    className="w-4 h-4 rounded accent-accent-500"
                  />
                  获胜
                </label>
                <input
                  type="number"
                  value={player.score || ''}
                  onChange={(e) =>
                    updatePlayer(index, 'score', parseInt(e.target.value) || 0)
                  }
                  className="input-field w-20"
                  placeholder="分数"
                />
                {players.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
