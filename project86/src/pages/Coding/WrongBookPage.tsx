import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CodingProblem, Difficulty } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { AlertCircle, RotateCcw, CheckCircle2, Calendar, ExternalLink, Hash, Filter, Search, Lightbulb } from 'lucide-react';

const WrongBookPage: React.FC = () => {
  const { state, updateCodingProblem } = useAppContext();
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [retryAnswer, setRetryAnswer] = useState('');

  const wrongProblems = state.codingProblems.filter(p => p.isWrong);

  const filteredProblems = wrongProblems.filter(p => {
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const difficultyConfig: Record<Difficulty, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
    easy: { label: '简单', variant: 'success' },
    medium: { label: '中等', variant: 'warning' },
    hard: { label: '困难', variant: 'danger' },
  };

  const handleRetry = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    setRetryAnswer('');
    setIsRetryModalOpen(true);
  };

  const handleSubmitRetry = () => {
    if (!selectedProblem) return;
    
    updateCodingProblem({
      ...selectedProblem,
      retryCount: selectedProblem.retryCount + 1,
      completedDate: new Date().toISOString().split('T')[0],
    });
    
    setIsRetryModalOpen(false);
    setSelectedProblem(null);
    setRetryAnswer('');
  };

  const handleMarkAsMastered = (problem: CodingProblem) => {
    if (confirm('确定要将这道题从错题本中移除吗？')) {
      updateCodingProblem({ ...problem, isWrong: false, wrongNotes: '' });
      if (selectedProblem?.id === problem.id) {
        setSelectedProblem(null);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">错题本</h1>
          <p className="text-slate-500 mt-1">重点标记错题，方便再次挑战</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="danger" className="text-base px-3 py-1">
            <AlertCircle className="w-4 h-4 mr-1" />
            共 {wrongProblems.length} 道错题
          </Badge>
        </div>
      </div>

      <Card className="mb-6 border-red-200 bg-red-50/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索错题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value as Difficulty | 'all')}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部难度</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-400" />
                  <p className="text-lg text-emerald-600 font-medium">太棒了！没有错题</p>
                  <p className="text-sm mt-2">继续保持，祝你刷题顺利！</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredProblems.map(problem => (
                    <div
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className={`p-4 cursor-pointer hover:bg-red-50/50 transition-colors ${
                        selectedProblem?.id === problem.id ? 'bg-red-50/70' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-slate-800">{problem.title}</span>
                            <Badge variant={difficultyConfig[problem.difficulty].variant}>
                              {difficultyConfig[problem.difficulty].label}
                            </Badge>
                            <Badge variant="warning">第 {problem.retryCount} 刷</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {problem.completedDate}
                            </span>
                            <div className="flex gap-1">
                              {problem.tags.map(tag => (
                                <Badge key={tag} variant="primary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetry(problem);
                            }}
                            className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                            title="再次挑战"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsMastered(problem);
                            }}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            title="标记为已掌握"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedProblem ? (
            <div className="space-y-4">
              <Card className="border-red-200">
                <CardHeader className="bg-red-50 border-b border-red-200">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {selectedProblem.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={difficultyConfig[selectedProblem.difficulty].variant}>
                      {difficultyConfig[selectedProblem.difficulty].label}
                    </Badge>
                    <Badge variant="warning">挑战次数: {selectedProblem.retryCount}</Badge>
                    {selectedProblem.url && (
                      <a
                        href={selectedProblem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        题目链接
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">时间复杂度</p>
                      <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                        {selectedProblem.timeComplexity || '-'}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-1">空间复杂度</p>
                      <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                        {selectedProblem.spaceComplexity || '-'}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    正确解法
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap text-sm">{selectedProblem.solution}</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/30">
                <CardHeader className="border-b border-red-200">
                  <CardTitle className="text-base text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    错误原因笔记
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700 whitespace-pre-wrap text-sm">{selectedProblem.wrongNotes || '暂无笔记'}</p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => handleRetry(selectedProblem)}
                >
                  <RotateCcw className="w-4 h-4" />
                  再次挑战
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => handleMarkAsMastered(selectedProblem)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  已掌握
                </Button>
              </div>
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Hash className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一道错题查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isRetryModalOpen}
        onClose={() => setIsRetryModalOpen(false)}
        title={`再次挑战: ${selectedProblem?.title}`}
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700 mb-2">题目标签</p>
            <div className="flex gap-1.5">
              {selectedProblem?.tags.map(tag => (
                <Badge key={tag} variant="primary">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-700 mb-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              之前的错误笔记
            </p>
            <p className="text-amber-700 text-sm">{selectedProblem?.wrongNotes}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">本次解题思路/答案</label>
            <textarea
              value={retryAnswer}
              onChange={(e) => setRetryAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={10}
              placeholder="写下你的解题思路..."
            />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm font-medium text-emerald-700 mb-1 flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              参考答案
            </p>
            <p className="text-emerald-700 text-sm whitespace-pre-wrap">{selectedProblem?.solution}</p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setIsRetryModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitRetry}>
              完成挑战
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WrongBookPage;
