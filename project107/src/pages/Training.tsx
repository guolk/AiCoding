import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  BookX,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useTrainingStore } from '@/store/useTrainingStore';
import { openings } from '@/data/openings';
import type { GameResult, PieceColor, NoteCategory } from '@/types';
import ChessBoard from '@/components/ChessBoard';

type TabType = 'memory' | 'tactics' | 'statistics';

interface MemoryTestState {
  openingName: string;
  variationName: string;
  moves: string[];
  currentStep: number;
  userAnswer: string;
  isCorrect: boolean | null;
  showExplanation: boolean;
  strategy: string;
  goals: string;
}

const COLORS = ['#059669', '#DC2626', '#6B7280'];

function getAllVariations() {
  const result: { openingName: string; variationName: string; moves: string; strategy: string; goals: string }[] = [];
  openings.forEach((opening) => {
    opening.variations.forEach((variation) => {
      result.push({
        openingName: opening.name,
        variationName: variation.name,
        moves: variation.moves,
        strategy: variation.strategy,
        goals: variation.goals,
      });
    });
  });
  return result;
}

function parseMoves(moveString: string): string[] {
  return moveString.split(' ').filter((m) => /^[a-zA-Z0-9#+=-]/.test(m));
}

export default function Training() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('memory');

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-500 via-ivory-400 to-ivory-300">
      <header className="bg-gradient-to-r from-wood-brown-700 to-wood-brown-900">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-ivory-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>返回首页</span>
              </button>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">训练管理</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-wood-brown-200 overflow-hidden">
          <div className="flex border-b border-wood-brown-200">
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 px-6 py-4 font-medium transition-colors',
                activeTab === 'memory'
                  ? 'text-wood-brown-800 border-b-2 border-wood-brown-600 bg-wood-brown-50'
                  : 'text-wood-brown-500 hover:text-wood-brown-700 hover:bg-wood-brown-50/50'
              )}
              onClick={() => setActiveTab('memory')}
            >
              <Brain size={20} />
              <span>记忆测试</span>
            </button>
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 px-6 py-4 font-medium transition-colors',
                activeTab === 'tactics'
                  ? 'text-wood-brown-800 border-b-2 border-wood-brown-600 bg-wood-brown-50'
                  : 'text-wood-brown-500 hover:text-wood-brown-700 hover:bg-wood-brown-50/50'
              )}
              onClick={() => setActiveTab('tactics')}
            >
              <BookX size={20} />
              <span>战术错题本</span>
            </button>
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 px-6 py-4 font-medium transition-colors',
                activeTab === 'statistics'
                  ? 'text-wood-brown-800 border-b-2 border-wood-brown-600 bg-wood-brown-50'
                  : 'text-wood-brown-500 hover:text-wood-brown-700 hover:bg-wood-brown-50/50'
              )}
              onClick={() => setActiveTab('statistics')}
            >
              <BarChart3 size={20} />
              <span>对局统计</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'memory' && <MemoryTestTab />}
            {activeTab === 'tactics' && <TacticsTab />}
            {activeTab === 'statistics' && <StatisticsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoryTestTab() {
  const [testState, setTestState] = useState<MemoryTestState | null>(null);

  const generateNewTest = () => {
    console.log('generateNewTest called');
    const allVariations = getAllVariations();
    if (allVariations.length === 0) {
      alert('没有可用的开局变例');
      return;
    }

    const randomIndex = Math.floor(Math.random() * allVariations.length);
    const variation = allVariations[randomIndex];
    const moves = parseMoves(variation.moves);

    if (moves.length < 2) {
      alert('该变例步数不足');
      return;
    }

    const maxSteps = Math.min(moves.length - 1, 8);
    const randomStep = Math.floor(Math.random() * maxSteps) + 1;

    setTestState({
      openingName: variation.openingName,
      variationName: variation.variationName,
      moves,
      currentStep: randomStep,
      userAnswer: '',
      isCorrect: null,
      showExplanation: false,
      strategy: variation.strategy,
      goals: variation.goals,
    });
  };

  const handleSubmit = () => {
    if (!testState) return;

    const correctAnswer = testState.moves[testState.currentStep];
    const userAnswer = testState.userAnswer.trim();
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

    setTestState((prev) => (prev ? { ...prev, isCorrect, showExplanation: true } : null));
  };

  const displayedMoves = useMemo(() => {
    if (!testState) return '';
    return testState.moves.slice(0, testState.currentStep).join(' ');
  }, [testState]);

  const correctAnswer = useMemo(() => {
    if (!testState) return '';
    return testState.moves[testState.currentStep];
  }, [testState]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-wood-brown-800 mb-1">记忆测试</h2>
          <p className="text-wood-brown-600">从开局库随机选择变例，测试你的记忆</p>
        </div>
        <button
          type="button"
          onClick={generateNewTest}
          className="flex items-center gap-2 px-4 py-2 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors active:scale-95"
        >
          <RefreshCw size={18} />
          <span>新题目</span>
        </button>
      </div>

      {!testState ? (
        <div className="flex flex-col items-center justify-center h-64 bg-ivory-100 rounded-xl border border-wood-brown-200">
          <Brain className="text-wood-brown-400 mb-3" size={48} />
          <h3 className="text-lg font-display font-semibold text-wood-brown-800 mb-2">开始记忆测试</h3>
          <p className="text-wood-brown-600 mb-4">点击"新题目"按钮开始测试</p>
          <button
            type="button"
            onClick={generateNewTest}
            className="flex items-center gap-2 px-6 py-3 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors active:scale-95"
          >
            <RefreshCw size={18} />
            <span>开始测试</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-ivory-100 rounded-xl p-4 border border-wood-brown-200">
              <h3 className="font-semibold text-wood-brown-800 mb-2">{testState.openingName}</h3>
              <p className="text-wood-brown-600 text-sm mb-1">变例: {testState.variationName}</p>
              <p className="text-wood-brown-500 text-sm">
                第 {testState.currentStep + 1} 步 (共 {testState.moves.length} 步)
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-wood-brown-200">
              <ChessBoard moves={displayedMoves} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-ivory-100 rounded-xl p-4 border border-wood-brown-200">
              <h4 className="font-semibold text-wood-brown-800 mb-2">问题</h4>
              <p className="text-wood-brown-700">
                以下是前 <strong>{testState.currentStep}</strong> 步走法：
              </p>
              <div className="mt-3 p-3 bg-white rounded-lg border border-wood-brown-200 font-mono text-sm">
                {displayedMoves || '（初始局面）'}
              </div>
              <p className="mt-3 text-wood-brown-700">
                请输入第 <strong>{testState.currentStep + 1}</strong> 步的正确走法：
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-wood-brown-200">
              <label className="block text-sm font-medium text-wood-brown-700 mb-2">你的答案</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testState.userAnswer}
                  onChange={(e) =>
                    setTestState((prev) => (prev ? { ...prev, userAnswer: e.target.value } : null))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="例如: Nf6 或 e5"
                  className={cn(
                    'flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                    testState.isCorrect === null
                      ? 'border-wood-brown-300 focus:ring-wood-brown-400'
                      : testState.isCorrect
                        ? 'border-emerald-500 focus:ring-emerald-400'
                        : 'border-red-500 focus:ring-red-400'
                  )}
                  disabled={testState.showExplanation}
                />
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={testState.showExplanation || !testState.userAnswer.trim()}
                  className="px-6 py-2 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交
                </button>
              </div>
            </div>

            {testState.showExplanation && (
              <div
                className={cn(
                  'rounded-xl p-4 border',
                  testState.isCorrect
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  {testState.isCorrect ? (
                    <CheckCircle className="text-emerald-600" size={24} />
                  ) : (
                    <XCircle className="text-red-600" size={24} />
                  )}
                  <h4
                    className={cn(
                      'font-semibold',
                      testState.isCorrect ? 'text-emerald-800' : 'text-red-800'
                    )}
                  >
                    {testState.isCorrect ? '回答正确！' : '回答错误'}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-wood-brown-800">正确答案: </span>
                    <span className="font-mono bg-white px-2 py-1 rounded border border-wood-brown-200">
                      {correctAnswer}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-wood-brown-800">战略说明: </span>
                    <p className="text-wood-brown-700 mt-1">{testState.strategy}</p>
                  </div>
                  <div>
                    <span className="font-medium text-wood-brown-800">战略目标: </span>
                    <p className="text-wood-brown-700 mt-1">{testState.goals}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TacticsTab() {
  const { wrongTactics, addWrongTactic, removeWrongTactic } = useTrainingStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fen: '',
    wrongMove: '',
    correctMove: '',
    explanation: '',
    category: 'tactic' as NoteCategory,
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fen.trim() || !formData.correctMove.trim()) {
      alert('请填写 FEN 串和正确走法');
      return;
    }

    addWrongTactic({
      position: formData.fen,
      fen: formData.fen,
      wrongMove: formData.wrongMove,
      correctMove: formData.correctMove,
      explanation: formData.explanation,
      category: formData.category,
      difficulty: formData.difficulty,
    });

    setFormData({
      fen: '',
      wrongMove: '',
      correctMove: '',
      explanation: '',
      category: 'tactic',
      difficulty: 'beginner',
    });
    setShowAddForm(false);
  };

  const categoryLabels: Record<NoteCategory, string> = {
    opening: '开局',
    tactic: '战术',
    endgame: '残局',
  };

  const difficultyLabels: Record<'beginner' | 'intermediate' | 'advanced', string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };

  const difficultyColors: Record<'beginner' | 'intermediate' | 'advanced', string> = {
    beginner: 'bg-emerald-100 text-emerald-800',
    intermediate: 'bg-amber-100 text-amber-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-wood-brown-800 mb-1">战术错题本</h2>
          <p className="text-wood-brown-600">记录你的战术错题，反复练习</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors"
        >
          <Plus size={18} />
          <span>{showAddForm ? '取消' : '添加错题'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-ivory-100 rounded-xl p-6 border border-wood-brown-200">
          <h3 className="font-display font-semibold text-lg text-wood-brown-800 mb-4">添加新错题</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                  FEN 串 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fen}
                  onChange={(e) => setFormData({ ...formData, fen: e.target.value })}
                  placeholder="例如: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                  正确走法 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.correctMove}
                  onChange={(e) => setFormData({ ...formData, correctMove: e.target.value })}
                  placeholder="例如: Nf3"
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">错误走法</label>
                <input
                  type="text"
                  value={formData.wrongMove}
                  onChange={(e) => setFormData({ ...formData, wrongMove: e.target.value })}
                  placeholder="例如: e5"
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as NoteCategory })}
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                >
                  <option value="opening">开局</option>
                  <option value="tactic">战术</option>
                  <option value="endgame">残局</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">难度</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                    })
                  }
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                >
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">解释</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="描述这道题的关键要点..."
                  rows={3}
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors"
              >
                保存错题
              </button>
            </div>
          </form>
        </div>
      )}

      {wrongTactics.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-ivory-100 rounded-xl border border-wood-brown-200">
          <BookX className="text-wood-brown-400 mb-3" size={48} />
          <h3 className="text-lg font-display font-semibold text-wood-brown-800 mb-2">暂无错题</h3>
          <p className="text-wood-brown-600">点击"添加错题"按钮记录你的错题</p>
        </div>
      ) : (
        <div className="space-y-4">
          {wrongTactics.map((tactic) => (
            <div
              key={tactic.id}
              className="bg-white rounded-xl p-4 border border-wood-brown-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', difficultyColors[tactic.difficulty])}>
                      {difficultyLabels[tactic.difficulty]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-wood-brown-100 text-wood-brown-700">
                      {categoryLabels[tactic.category]}
                    </span>
                    <span className="text-xs text-wood-brown-500">
                      复习次数: {tactic.reviewCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-wood-brown-500 mb-1">FEN 串</p>
                      <p className="font-mono text-xs text-wood-brown-700 bg-ivory-100 p-2 rounded break-all">
                        {tactic.fen}
                      </p>
                    </div>
                    <div>
                      <div className="flex gap-4 mb-2">
                        {tactic.wrongMove && (
                          <div>
                            <p className="text-xs text-red-500 mb-1">错误走法</p>
                            <p className="font-mono text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                              {tactic.wrongMove}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-emerald-500 mb-1">正确走法</p>
                          <p className="font-mono text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                            {tactic.correctMove}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {tactic.explanation && (
                    <div className="mt-3">
                      <p className="text-xs text-wood-brown-500 mb-1">解释</p>
                      <p className="text-wood-brown-700 text-sm">{tactic.explanation}</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('确定要删除这条错题吗？')) {
                      removeWrongTactic(tactic.id);
                    }
                  }}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除错题"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatisticsTab() {
  const { gameStatistics, openingStats, updateStatistics } = useTrainingStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    result: 'win' as GameResult,
    color: 'white' as PieceColor,
    openingId: '',
    openingName: '',
    eco: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatistics(
      formData.result,
      formData.color,
      formData.openingId || undefined,
      formData.openingName || undefined,
      formData.eco || undefined
    );

    setFormData({
      result: 'win',
      color: 'white',
      openingId: '',
      openingName: '',
      eco: '',
    });
    setShowAddForm(false);
  };

  const pieData = [
    { name: '胜', value: gameStatistics.wins, color: '#059669' },
    { name: '负', value: gameStatistics.losses, color: '#DC2626' },
    { name: '和', value: gameStatistics.draws, color: '#6B7280' },
  ].filter((d) => d.value > 0);

  const barData = openingStats
    .slice()
    .sort((a, b) => b.totalGames - a.totalGames)
    .slice(0, 8)
    .map((stat) => ({
      name: stat.openingName.length > 8 ? stat.openingName.slice(0, 8) + '...' : stat.openingName,
      fullName: stat.openingName,
      场次: stat.totalGames,
      胜: stat.wins,
      负: stat.losses,
    }));

  const resultLabels: Record<GameResult, string> = {
    win: '胜利',
    loss: '失败',
    draw: '平局',
  };

  const colorLabels: Record<PieceColor, string> = {
    white: '执白',
    black: '执黑',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold text-wood-brown-800 mb-1">对局统计</h2>
          <p className="text-wood-brown-600">查看你的对局数据和规律分析</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors"
        >
          <Plus size={18} />
          <span>{showAddForm ? '取消' : '添加对局'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-ivory-100 rounded-xl p-6 border border-wood-brown-200">
          <h3 className="font-display font-semibold text-lg text-wood-brown-800 mb-4">添加对局记录</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                  对局结果 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value as GameResult })}
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                >
                  <option value="win">胜利</option>
                  <option value="loss">失败</option>
                  <option value="draw">平局</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">
                  执子颜色 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value as PieceColor })}
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                >
                  <option value="white">执白</option>
                  <option value="black">执黑</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">开局</label>
                <select
                  value={formData.openingId}
                  onChange={(e) => {
                    const opening = openings.find((o) => o.id === e.target.value);
                    setFormData({
                      ...formData,
                      openingId: e.target.value,
                      openingName: opening?.name || '',
                      eco: '',
                    });
                  }}
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                >
                  <option value="">-- 选择开局 --</option>
                  {openings.map((opening) => (
                    <option key={opening.id} value={opening.id}>
                      {opening.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wood-brown-700 mb-2">ECO 代码</label>
                <input
                  type="text"
                  value={formData.eco}
                  onChange={(e) => setFormData({ ...formData, eco: e.target.value })}
                  placeholder="例如: C60"
                  className="w-full px-4 py-2 border border-wood-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-brown-400"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-wood-brown-600 text-white rounded-lg hover:bg-wood-brown-700 transition-colors"
              >
                保存对局
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">总对局数</p>
              <p className="text-3xl font-display font-bold">{gameStatistics.totalGames}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-wood-brown-500 to-wood-brown-700 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target size={24} />
            </div>
            <div>
              <p className="text-wood-brown-100 text-sm">总胜率</p>
              <p className="text-3xl font-display font-bold">{gameStatistics.winRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-amber-100 text-sm">常用开局数</p>
              <p className="text-3xl font-display font-bold">{openingStats.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-wood-brown-200">
          <h3 className="font-display font-semibold text-lg text-wood-brown-800 mb-4">胜率分布</h3>
          {gameStatistics.totalGames === 0 ? (
            <div className="flex items-center justify-center h-64 text-wood-brown-500">
              暂无数据，添加对局记录后显示
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-wood-brown-200">
          <h3 className="font-display font-semibold text-lg text-wood-brown-800 mb-4">执子颜色统计</h3>
          {gameStatistics.totalGames === 0 ? (
            <div className="flex items-center justify-center h-64 text-wood-brown-500">
              暂无数据，添加对局记录后显示
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-wood-brown-800">执白</span>
                  <span className="text-wood-brown-600">
                    {gameStatistics.asWhite.total} 局，胜率 {gameStatistics.asWhite.winRate}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-4 rounded-full bg-emerald-500"
                    style={{
                      width: `${gameStatistics.asWhite.total > 0 ? (gameStatistics.asWhite.wins / gameStatistics.asWhite.total) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="h-4 rounded-full bg-red-500"
                    style={{
                      width: `${gameStatistics.asWhite.total > 0 ? (gameStatistics.asWhite.losses / gameStatistics.asWhite.total) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="h-4 rounded-full bg-gray-400"
                    style={{
                      width: `${gameStatistics.asWhite.total > 0 ? (gameStatistics.asWhite.draws / gameStatistics.asWhite.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex gap-2 text-xs text-wood-brown-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    胜 {gameStatistics.asWhite.wins}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    负 {gameStatistics.asWhite.losses}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    和 {gameStatistics.asWhite.draws}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-wood-brown-800">执黑</span>
                  <span className="text-wood-brown-600">
                    {gameStatistics.asBlack.total} 局，胜率 {gameStatistics.asBlack.winRate}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <div
                    className="h-4 rounded-full bg-emerald-500"
                    style={{
                      width: `${gameStatistics.asBlack.total > 0 ? (gameStatistics.asBlack.wins / gameStatistics.asBlack.total) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="h-4 rounded-full bg-red-500"
                    style={{
                      width: `${gameStatistics.asBlack.total > 0 ? (gameStatistics.asBlack.losses / gameStatistics.asBlack.total) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="h-4 rounded-full bg-gray-400"
                    style={{
                      width: `${gameStatistics.asBlack.total > 0 ? (gameStatistics.asBlack.draws / gameStatistics.asBlack.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex gap-2 text-xs text-wood-brown-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    胜 {gameStatistics.asBlack.wins}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    负 {gameStatistics.asBlack.losses}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    和 {gameStatistics.asBlack.draws}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-wood-brown-200">
          <h3 className="font-display font-semibold text-lg text-wood-brown-800 mb-4">常用开局统计</h3>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-wood-brown-500">
              暂无数据，添加带开局信息的对局记录后显示
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#78350f', fontSize: 12 }} />
                <YAxis tick={{ fill: '#78350f', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #d6d3d1',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={(label) => label}
                />
                <Legend />
                <Bar dataKey="胜" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="负" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
