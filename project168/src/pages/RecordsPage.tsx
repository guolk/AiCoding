import { useState, useMemo, useEffect } from 'react';
import { Plus, Trophy, TrendingUp, Calendar, Edit2, Trash2, ChevronRight, Star, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGoStore } from '@/store/useGoStore';
import Card from '@/components/ui/Card';
import {
  RESULT_LABELS,
  RESULT_COLORS,
  GameResult,
  StoneColor,
} from '@/types';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/utils/dateUtils';

export default function RecordsPage() {
  const { matches, ranks, deleteMatch, addMatch, updateMatch } = useGoStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<GameResult | 'all'>('all');
  const [editingReview, setEditingReview] = useState(false);
  const [reviewText, setReviewText] = useState('');

  const [newMatch, setNewMatch] = useState({
    opponentName: '',
    opponentRank: '',
    result: 'win' as GameResult,
    myColor: 'black' as StoneColor,
    handicap: 0,
    playedAt: Date.now(),
    reviewNotes: '',
    keyMoments: [] as { id: string; moveNumber: number; description: string; reflection?: string }[],
  });

  const filteredMatches = useMemo(() => {
    let result = [...matches];
    if (resultFilter !== 'all') {
      result = result.filter(m => m.result === resultFilter);
    }
    return result.sort((a, b) => b.playedAt - a.playedAt);
  }, [matches, resultFilter]);

  const stats = useMemo(() => {
    const total = matches.length;
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = matches.filter(m => m.result === 'loss').length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    return { total, wins, losses, winRate };
  }, [matches]);

  const rankData = useMemo(() => {
    return ranks.map(r => ({
      name: r.rank,
      段位: ranks.indexOf(r) + 1,
      date: formatDate(r.date, 'yy/MM'),
    }));
  }, [ranks]);

  const monthlyData = useMemo(() => {
    const months: { [key: string]: { wins: number; total: number } } = {};
    
    matches.forEach(match => {
      const month = formatDate(match.playedAt, 'yyyy-MM');
      if (!months[month]) {
        months[month] = { wins: 0, total: 0 };
      }
      months[month].total++;
      if (match.result === 'win') {
        months[month].wins++;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        name: month.slice(5),
        胜局: data.wins,
        总局: data.total,
      }))
      .slice(-6);
  }, [matches]);

  const currentRank = ranks.length > 0 ? ranks[ranks.length - 1] : null;

  const selectedMatchData = selectedMatch ? matches.find(m => m.id === selectedMatch) : null;

  const handleAddMatch = () => {
    if (!newMatch.opponentName.trim()) return;
    
    addMatch({
      ...newMatch,
      keyMoments: [],
    });
    
    setNewMatch({
      opponentName: '',
      opponentRank: '',
      result: 'win',
      myColor: 'black',
      handicap: 0,
      playedAt: Date.now(),
      reviewNotes: '',
      keyMoments: [],
    });
    setShowAddModal(false);
  };

  const handleSaveReview = () => {
    if (selectedMatch) {
      updateMatch(selectedMatch, { reviewNotes: reviewText });
    }
    setEditingReview(false);
  };

  useEffect(() => {
    if (selectedMatchData) {
      setReviewText(selectedMatchData.reviewNotes || '');
    }
  }, [selectedMatchData?.id]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-go-wood-800">对局记录</h1>
          <p className="text-go-wood-500 mt-1">记录你的每一盘棋</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-go-wood-700 text-white rounded-lg hover:bg-go-wood-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          记录对局
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="animate-fade-in-up animation-delay-100">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{stats.total}</p>
              <p className="text-sm text-go-wood-500">总对局数</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-200">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-2xl">⚫</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.wins}</p>
              <p className="text-sm text-go-wood-500">胜局</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-300">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚪</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
              <p className="text-sm text-go-wood-500">败局</p>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in-up animation-delay-400">
          <Card.Content className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-go-wood-800">{stats.winRate}%</p>
              <p className="text-sm text-go-wood-500">胜率</p>
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 左侧：对局列表 */}
        <div className="col-span-2">
          <Card hover={false}>
            <Card.Header>
              <div className="flex items-center justify-between">
                <Card.Title>对局列表</Card.Title>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-go-wood-400" />
                  {(['all', 'win', 'loss', 'draw'] as const).map((result) => (
                    <button
                      key={result}
                      onClick={() => setResultFilter(result)}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm transition-colors',
                        resultFilter === result
                          ? 'bg-go-wood-700 text-white'
                          : 'bg-go-wood-100 text-go-wood-600 hover:bg-go-wood-200'
                      )}
                    >
                      {result === 'all' ? '全部' : RESULT_LABELS[result]}
                    </button>
                  ))}
                </div>
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              <div className="divide-y divide-go-wood-100 max-h-[500px] overflow-y-auto">
                {filteredMatches.map((match, index) => (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match.id)}
                    className={cn(
                      'flex items-center gap-4 p-4 cursor-pointer transition-colors animate-fade-in',
                      selectedMatch === match.id
                        ? 'bg-go-wood-100'
                        : 'hover:bg-go-wood-50'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                      match.myColor === 'black' ? 'bg-gray-900' : 'bg-gray-100 border-2 border-gray-200'
                    )}>
                      {match.myColor === 'black' ? '⚫' : '⚪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-go-wood-800 truncate">
                          vs {match.opponentName}
                        </h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          RESULT_COLORS[match.result]
                        )}>
                          {RESULT_LABELS[match.result]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-go-wood-400">
                        <span>{match.opponentRank}</span>
                        <span>·</span>
                        <span>{match.handicap > 0 ? `让${match.handicap}子` : '分先'}</span>
                        <span>·</span>
                        <span>{formatDate(match.playedAt, 'MM月dd日')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这条对局记录吗？')) {
                            deleteMatch(match.id);
                            if (selectedMatch === match.id) setSelectedMatch(null);
                          }
                        }}
                        className="p-2 text-go-wood-300 hover:text-red-500 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-go-wood-300" />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* 右侧：详情和图表 */}
        <div className="space-y-6">
          {/* 对局详情 */}
          {selectedMatchData ? (
            <Card hover={false}>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title>对局详情</Card.Title>
                </div>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="text-center pb-4 border-b border-go-wood-100">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <span className="text-3xl">
                      {selectedMatchData.myColor === 'black' ? '⚫' : '⚪'}
                    </span>
                    <span className="text-lg font-semibold text-go-wood-800">
                      vs {selectedMatchData.opponentName}
                    </span>
                  </div>
                  <span className={cn(
                    'text-lg font-bold px-4 py-1 rounded-full',
                    RESULT_COLORS[selectedMatchData.result]
                  )}>
                    {RESULT_LABELS[selectedMatchData.result]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-go-wood-50 rounded-lg p-3">
                    <p className="text-go-wood-400 text-xs">对手等级</p>
                    <p className="font-medium text-go-wood-700">{selectedMatchData.opponentRank}</p>
                  </div>
                  <div className="bg-go-wood-50 rounded-lg p-3">
                    <p className="text-go-wood-400 text-xs">执子</p>
                    <p className="font-medium text-go-wood-700">
                      {selectedMatchData.myColor === 'black' ? '黑方' : '白方'}
                    </p>
                  </div>
                  <div className="bg-go-wood-50 rounded-lg p-3">
                    <p className="text-go-wood-400 text-xs">让子数</p>
                    <p className="font-medium text-go-wood-700">{selectedMatchData.handicap} 子</p>
                  </div>
                  <div className="bg-go-wood-50 rounded-lg p-3">
                    <p className="text-go-wood-400 text-xs">对局时间</p>
                    <p className="font-medium text-go-wood-700 text-xs">
                      {formatDateTime(selectedMatchData.playedAt)}
                    </p>
                  </div>
                </div>

                {/* 复盘笔记 */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-go-wood-700 text-sm">复盘笔记</span>
                    {!editingReview && (
                      <button
                        onClick={() => setEditingReview(true)}
                        className="text-go-wood-400 hover:text-go-wood-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingReview ? (
                    <div className="space-y-2">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full h-24 p-3 border border-go-wood-200 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-go-wood-400"
                        placeholder="写下你的复盘心得..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingReview(false);
                            setReviewText(selectedMatchData.reviewNotes || '');
                          }}
                          className="px-3 py-1.5 text-sm text-go-wood-500 hover:text-go-wood-700"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSaveReview}
                          className="px-3 py-1.5 text-sm bg-go-wood-700 text-white rounded-lg hover:bg-go-wood-800"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-go-wood-600 leading-relaxed bg-go-wood-50 rounded-lg p-3">
                      {selectedMatchData.reviewNotes || '暂无复盘笔记'}
                    </p>
                  )}
                </div>
              </Card.Content>
            </Card>
          ) : (
            <Card hover={false}>
              <Card.Content className="py-12 text-center">
                <Calendar className="w-12 h-12 text-go-wood-300 mx-auto mb-3" />
                <p className="text-go-wood-400">选择一条对局记录查看详情</p>
              </Card.Content>
            </Card>
          )}

          {/* 段位历史 */}
          <Card hover={false}>
            <Card.Header>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <Card.Title>段位历史</Card.Title>
              </div>
            </Card.Header>
            <Card.Content>
              {currentRank && (
                <div className="text-center mb-4 pb-4 border-b border-go-wood-100">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full font-bold">
                    <Star className="w-5 h-5 fill-white" />
                    {currentRank.rank}
                  </div>
                  <p className="text-xs text-go-wood-400 mt-2">
                    获得于 {formatDate(currentRank.date, 'yyyy年MM月')}
                  </p>
                </div>
              )}
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {[...ranks].reverse().map((rank, index) => (
                  <div
                    key={rank.id}
                    className="flex items-center gap-3 pl-2 border-l-2 border-go-wood-200"
                  >
                    <div className="w-3 h-3 rounded-full bg-go-bamboo -ml-[22px]" />
                    <div>
                      <p className="font-medium text-go-wood-700 text-sm">{rank.rank}</p>
                      <p className="text-xs text-go-wood-400">{formatDate(rank.date, 'yyyy.MM.dd')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* 月度趋势 */}
          <Card hover={false}>
            <Card.Header>
              <Card.Title>对局趋势</Card.Title>
            </Card.Header>
            <Card.Content>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D5A3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6D552C' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6D552C' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF8E7',
                      border: '1px solid #D4BE7E',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="总局"
                    stroke="#5D4037"
                    strokeWidth={2}
                    dot={{ fill: '#5D4037', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="胜局"
                    stroke="#7CB342"
                    strokeWidth={2}
                    dot={{ fill: '#7CB342', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* 添加对局模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <h2 className="text-xl font-serif font-bold text-go-wood-800 mb-6">记录新对局</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-go-wood-700 mb-1.5">对手名称</label>
                <input
                  type="text"
                  value={newMatch.opponentName}
                  onChange={(e) => setNewMatch({ ...newMatch, opponentName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 bg-go-wood-50"
                  placeholder="输入对手名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-go-wood-700 mb-1.5">对手等级</label>
                <input
                  type="text"
                  value={newMatch.opponentRank}
                  onChange={(e) => setNewMatch({ ...newMatch, opponentRank: e.target.value })}
                  className="w-full px-4 py-2.5 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 bg-go-wood-50"
                  placeholder="例如：业余3段"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-go-wood-700 mb-1.5">对局结果</label>
                  <select
                    value={newMatch.result}
                    onChange={(e) => setNewMatch({ ...newMatch, result: e.target.value as GameResult })}
                    className="w-full px-4 py-2.5 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 bg-go-wood-50"
                  >
                    <option value="win">胜</option>
                    <option value="loss">负</option>
                    <option value="draw">和</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-go-wood-700 mb-1.5">执子</label>
                  <select
                    value={newMatch.myColor}
                    onChange={(e) => setNewMatch({ ...newMatch, myColor: e.target.value as StoneColor })}
                    className="w-full px-4 py-2.5 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 bg-go-wood-50"
                  >
                    <option value="black">黑方</option>
                    <option value="white">白方</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-go-wood-700 mb-1.5">让子数</label>
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={newMatch.handicap}
                  onChange={(e) => setNewMatch({ ...newMatch, handicap: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 bg-go-wood-50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border border-go-wood-200 rounded-lg text-go-wood-600 hover:bg-go-wood-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddMatch}
                className="flex-1 px-4 py-2.5 bg-go-wood-700 text-white rounded-lg hover:bg-go-wood-800 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
