import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Grid, List, Upload, FileText, Tag, Filter, Trash2, Edit3 } from 'lucide-react';
import { useGoStore, importSGFGame } from '@/store/useGoStore';
import Card from '@/components/ui/Card';
import GoBoard from '@/components/board/GoBoard';
import { CATEGORY_LABELS, CATEGORY_COLORS, GameCategory } from '@/types';
import { cn } from '@/lib/utils';
import { getMainLineNodes } from '@/utils/sgfParser';
import type { Point } from '@/types';

const categories: (GameCategory | 'all')[] = ['all', 'joseki', 'problem', 'famous', 'self', 'teaching', 'custom'];

export default function GamesPage() {
  const { games, deleteGame, updateGame } = useGoStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GameCategory | 'all'>('all');
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.blackPlayer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.whitePlayer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importSGFGame(content, 'custom', []);
        setShowImportModal(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.sgf')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importSGFGame(content, 'custom', []);
          setShowImportModal(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const getGameStones = (game: typeof games[0]) => {
    const mainLine = getMainLineNodes(game.rootNode);
    return mainLine
      .slice(1, Math.min(mainLine.length, 51))
      .filter(node => node.point !== null)
      .map(node => ({
        point: node.point as Point,
        color: node.color,
        moveNumber: node.moveNumber,
      }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-go-wood-800">棋谱管理</h1>
          <p className="text-go-wood-500 mt-1">共 {filteredGames.length} 个棋谱</p>
        </div>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-go-wood-700 text-white rounded-lg hover:bg-go-wood-800 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          导入棋谱
        </button>
      </div>

      {/* 筛选和搜索 */}
      <Card hover={false}>
        <Card.Content className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-go-wood-400" />
              <input
                type="text"
                placeholder="搜索棋谱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-go-wood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-go-wood-400 focus:border-transparent bg-go-wood-50"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* 视图切换 */}
              <div className="flex items-center bg-go-wood-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid' ? 'bg-white shadow text-go-wood-700' : 'text-go-wood-500 hover:text-go-wood-700'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-white shadow text-go-wood-700' : 'text-go-wood-500 hover:text-go-wood-700'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 分类标签 */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <Filter className="w-4 h-4 text-go-wood-400" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  activeCategory === cat
                    ? 'bg-go-wood-700 text-white shadow-md'
                    : 'bg-go-wood-100 text-go-wood-600 hover:bg-go-wood-200'
                )}
              >
                {cat === 'all' ? '全部' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* 棋谱列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-5">
          {filteredGames.map((game, index) => (
            <Card key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <Link to={`/games/${game.id}`}>
                <div className="aspect-square bg-wood-texture p-4 flex items-center justify-center">
                  <div className="scale-75">
                    <GoBoard
                      size={19}
                      stones={getGameStones(game)}
                      showCoordinates={false}
                      showMoveNumbers={false}
                      className="scale-75"
                    />
                  </div>
                </div>
              </Link>
              <Card.Content className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif font-semibold text-go-wood-800 truncate flex-1">
                    {game.title}
                  </h3>
                  <span className={cn('text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0', CATEGORY_COLORS[game.category])}>
                    {CATEGORY_LABELS[game.category]}
                  </span>
                </div>
                <p className="text-sm text-go-wood-500 text-sm mb-3">
                  {game.blackPlayer} vs {game.whitePlayer}
                </p>
                {game.result && (
                  <p className="text-xs text-go-wood-400">结果：{game.result}</p>
                )}
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                  {game.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-go-wood-100 text-go-wood-600 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card.Content>
              <Card.Footer className="p-3 flex justify-between">
                <span className="text-xs text-go-wood-400">{game.date}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1.5 text-go-wood-400 hover:text-go-wood-600 rounded hover:bg-go-wood-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定要删除这个棋谱吗？')) {
                        deleteGame(game.id);
                      }
                    }}
                    className="p-1.5 text-go-wood-400 hover:text-red-500 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      ) : (
        <Card hover={false}>
          <div className="divide-y divide-go-wood-100">
            {filteredGames.map((game, index) => (
              <Link
                key={game.id}
                to={`/games/${game.id}`}
                className="flex items-center gap-4 p-4 hover:bg-go-wood-50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="w-12 h-12 bg-wood-texture rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-go-wood-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-go-wood-800 truncate">{game.title}</h3>
                  <p className="text-sm text-go-wood-500">
                    {game.blackPlayer} vs {game.whitePlayer}
                  </p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-full', CATEGORY_COLORS[game.category])}>
                  {CATEGORY_LABELS[game.category]}
                </span>
                <span className="text-sm text-go-wood-400">{game.date}</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* 导入模态框 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-scale-in">
            <h2 className="text-xl font-serif font-bold text-go-wood-800 mb-4">导入棋谱</h2>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-go-wood-300 rounded-xl p-8 text-center cursor-pointer hover:border-go-bamboo hover:bg-go-bamboo/5 transition-colors mb-4"
            >
              <Upload className="w-12 h-12 text-go-wood-400 mx-auto mb-3" />
              <p className="text-go-wood-600 font-medium">点击或拖拽上传SGF文件</p>
              <p className="text-sm text-go-wood-400 mt-1">支持 .sgf 格式文件</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sgf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 border border-go-wood-200 rounded-lg text-go-wood-600 hover:bg-go-wood-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-go-wood-700 text-white rounded-lg hover:bg-go-wood-800 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
