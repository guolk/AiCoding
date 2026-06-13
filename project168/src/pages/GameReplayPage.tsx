import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, AlertCircle, ThumbsUp, MessageSquare, ChevronDown, ChevronRight, Edit2, Save, X } from 'lucide-react';
import { useGoStore } from '@/store/useGoStore';
import GoBoard from '@/components/board/GoBoard';
import ReplayControls from '@/components/board/ReplayControls';
import Card from '@/components/ui/Card';
import { useGameReplay } from '@/hooks/useGameReplay';
import { MARK_TYPE_LABELS, MARK_TYPE_COLORS, CATEGORY_LABELS, CATEGORY_COLORS, MarkType } from '@/types';
import { cn } from '@/lib/utils';
import { getMainLineNodes } from '@/utils/sgfParser';
import type { MoveNode } from '@/types';

export default function GameReplayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { games, settings, addMoveMark, removeMoveMark, updateNodeComment } = useGoStore();
  
  const game = games.find(g => g.id === id) || games[0];
  const [showVariations, setShowVariations] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [editingComment, setEditingComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  const {
    currentNode,
    currentMoveNumber,
    totalMoves,
    stones,
    lastMove,
    canGoBack,
    canGoForward,
    goToFirst,
    goToPrevious,
    goToNext,
    goToLast,
    goToMove,
    isAutoPlay,
    toggleAutoPlay,
    playSpeed,
    setPlaySpeed,
  } = useGameReplay(game?.rootNode || { id: 'empty', moveNumber: 0, color: 'black', point: null, children: [], parentId: null, isMain: true }, settings.autoPlaySpeed);

  useEffect(() => {
    if (currentNode) {
      setCommentText(currentNode.comment || '');
    }
  }, [currentNode?.id]);

  const handleSaveComment = () => {
    if (game) {
      updateNodeComment(game.id, currentNode.id, commentText);
    }
    setEditingComment(false);
  };

  const handleAddMark = (type: MarkType) => {
    if (game) {
      addMoveMark(game.id, currentNode.id, { type, text: '' });
    }
  };

  const handleRemoveMark = (markId: string) => {
    if (game) {
      removeMoveMark(game.id, currentNode.id, markId);
    }
  };

  const variationTree = useMemo(() => {
    if (!game) return [];
    
    const mainLine = getMainLineNodes(game.rootNode);
    return mainLine.filter(node => node.children.length > 1);
  }, [game]);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-go-wood-500">未找到棋谱</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-go-wood-100 text-go-wood-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-go-wood-800">{game.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded-full', CATEGORY_COLORS[game.category])}>
                {CATEGORY_LABELS[game.category]}
              </span>
              <span className="text-sm text-go-wood-500">
                {game.blackPlayer} vs {game.whitePlayer}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* 棋盘区域 */}
        <div className="col-span-3">
          <Card hover={false}>
            <Card.Content className="flex flex-col items-center">
              <GoBoard
                size={settings.boardSize}
                stones={stones}
                lastMove={lastMove}
                currentMove={currentNode}
                showCoordinates={settings.showCoordinates}
                showMoveNumbers={settings.showMoveNumbers}
                marks={currentNode.marks || []}
                className="my-4"
              />

              <div className="w-full mt-4">
                <ReplayControls
                  currentMove={currentMoveNumber}
                  totalMoves={totalMoves}
                  canGoBack={canGoBack}
                  canGoForward={canGoForward}
                  isAutoPlay={isAutoPlay}
                  onFirst={goToFirst}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  onLast={goToLast}
                  onToggleAutoPlay={toggleAutoPlay}
                  onSliderChange={goToMove}
                />

                {/* 播放速度 */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="text-sm text-go-wood-500">播放速度:</span>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={100}
                    value={2200 - playSpeed}
                    onChange={(e) => setPlaySpeed(2200 - Number(e.target.value))}
                    className="w-32 accent-go-wood-600"
                  />
                  <span className="text-sm text-go-wood-600 w-16">{playSpeed}ms</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* 形势说明/注释 */}
          <Card hover={false} className="mt-6">
            <Card.Header className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-go-wood-600" />
                  <span className="font-medium text-go-wood-700">第 {currentMoveNumber} 手说明</span>
                </div>
                {!editingComment && (
                  <button
                    onClick={() => setEditingComment(true)}
                    className="text-go-wood-400 hover:text-go-wood-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card.Header>
            <Card.Content className="py-4">
              {editingComment ? (
                <div className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full h-24 p-3 border border-go-wood-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-go-wood-400"
                    placeholder="添加形势说明..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingComment(false);
                        setCommentText(currentNode.comment || '');
                      }}
                      className="px-3 py-1.5 text-sm text-go-wood-500 hover:text-go-wood-700"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveComment}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-go-wood-700 text-white rounded-lg hover:bg-go-wood-800"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-go-wood-600 leading-relaxed">
                  {currentNode.comment || '暂无形势说明，点击编辑按钮添加...'}
                </p>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* 右侧面板 */}
        <div className="space-y-6">
          {/* 手顺标注 */}
          <Card hover={false}>
            <Card.Header className="py-3">
              <span className="font-medium text-go-wood-700">手顺标注</span>
            </Card.Header>
            <Card.Content className="py-3">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => handleAddMark('key')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors group"
                >
                  <Star className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-amber-700">关键点</span>
                </button>
                <button
                  onClick={() => handleAddMark('doubt')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-red-700">疑问手</span>
                </button>
                <button
                  onClick={() => handleAddMark('good')}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
                >
                  <ThumbsUp className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-blue-700">好手</span>
                </button>
              </div>

              {/* 当前手已有的标注 */}
              {currentNode.marks && currentNode.marks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-go-wood-400">当前手标注:</p>
                  {currentNode.marks.map((mark) => (
                    <div
                      key={mark.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-go-wood-50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: MARK_TYPE_COLORS[mark.type] }}
                        />
                        <span className="text-sm text-go-wood-700">
                          {MARK_TYPE_LABELS[mark.type]}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMark(mark.id)}
                        className="text-go-wood-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-go-wood-400 text-center py-2">暂无标注</p>
              )}
            </Card.Content>
          </Card>

          {/* 变化图 */}
          <Card hover={false}>
            <Card.Header
              className="py-3 cursor-pointer"
              onClick={() => setShowVariations(!showVariations)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-go-wood-700">变化图</span>
                {showVariations ? (
                  <ChevronDown className="w-5 h-5 text-go-wood-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-go-wood-400" />
                )}
              </div>
            </Card.Header>
            {showVariations && (
              <Card.Content className="py-3">
                {variationTree.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {variationTree.map((node) => (
                      <div key={node.id} className="border-l-2 border-go-wood-200 pl-3 py-1">
                        <p className="text-sm text-go-wood-600">
                          第 {node.moveNumber} 手
                          <span className="ml-2 text-xs text-go-wood-400">
                            ({node.children.length} 个变化)
                          </span>
                        </p>
                        {node.children.map((child, idx) => (
                          <button
                            key={child.id}
                            onClick={() => goToMove(child.moveNumber)}
                            className={cn(
                              'block text-xs mt-1 pl-2 py-1 hover:bg-go-wood-100 rounded',
                              child.isMain ? 'text-go-bamboo font-medium' : 'text-go-wood-500'
                            )}
                          >
                            {child.isMain ? '●' : '○'} 变化 {idx + 1}
                            {child.isMain && ' (主)'}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-go-wood-400 text-center py-2">暂无变化分支</p>
                )}
              </Card.Content>
            )}
          </Card>

          {/* 棋谱信息 */}
          <Card hover={false}>
            <Card.Header className="py-3">
              <span className="font-medium text-go-wood-700">棋谱信息</span>
            </Card.Header>
            <Card.Content className="py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-go-wood-400">黑方</span>
                <span className="text-go-wood-700">{game.blackPlayer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-go-wood-400">白方</span>
                <span className="text-go-wood-700">{game.whitePlayer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-go-wood-400">结果</span>
                <span className="text-go-wood-700">{game.result || '未知'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-go-wood-400">日期</span>
                <span className="text-go-wood-700">{game.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-go-wood-400">手数</span>
                <span className="text-go-wood-700">{totalMoves} 手</span>
              </div>
              <div className="pt-2">
                <div className="flex flex-wrap gap-1">
                  {game.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-go-wood-100 text-go-wood-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}
