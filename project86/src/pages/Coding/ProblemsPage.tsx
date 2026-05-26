import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CodingProblem, Difficulty } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { Plus, Edit, Trash2, ExternalLink, Calendar, Hash, AlertCircle, RotateCcw, Filter, Search } from 'lucide-react';
import { generateId } from '../../utils/storage';

const ProblemsPage: React.FC = () => {
  const { state, updateCodingProblem, deleteCodingProblem } = useAppContext();
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allTags = Array.from(new Set(state.codingProblems.flatMap(p => p.tags)));

  const filteredProblems = state.codingProblems.filter(p => {
    if (filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false;
    if (filterTag !== 'all' && !p.tags.includes(filterTag)) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const difficultyConfig: Record<Difficulty, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
    easy: { label: '简单', variant: 'success' },
    medium: { label: '中等', variant: 'warning' },
    hard: { label: '困难', variant: 'danger' },
  };

  const platformConfig = {
    leetcode: { label: 'LeetCode', color: 'bg-orange-500' },
    nowcoder: { label: '牛客', color: 'bg-blue-500' },
    other: { label: '其他', color: 'bg-slate-500' },
  };

  const handleSaveProblem = (problemData: Partial<CodingProblem>) => {
    if (editingProblem) {
      updateCodingProblem({ ...editingProblem, ...problemData } as CodingProblem);
    } else {
      const newProblem: CodingProblem = {
        id: generateId(),
        platform: problemData.platform || 'leetcode',
        title: problemData.title || '',
        difficulty: problemData.difficulty || 'easy',
        url: problemData.url || '',
        solution: problemData.solution || '',
        timeComplexity: problemData.timeComplexity || '',
        spaceComplexity: problemData.spaceComplexity || '',
        completedDate: problemData.completedDate || new Date().toISOString().split('T')[0],
        isWrong: false,
        wrongNotes: '',
        retryCount: 1,
        tags: problemData.tags || [],
      };
      updateCodingProblem(newProblem);
    }
    setIsModalOpen(false);
    setEditingProblem(null);
  };

  const handleRetry = (problem: CodingProblem) => {
    updateCodingProblem({
      ...problem,
      retryCount: problem.retryCount + 1,
      completedDate: new Date().toISOString().split('T')[0],
    });
    if (selectedProblem?.id === problem.id) {
      setSelectedProblem({ ...problem, retryCount: problem.retryCount + 1, completedDate: new Date().toISOString().split('T')[0] });
    }
  };

  const handleToggleWrong = (problem: CodingProblem) => {
    const updatedProblem = { ...problem, isWrong: !problem.isWrong };
    updateCodingProblem(updatedProblem);
    if (selectedProblem?.id === problem.id) {
      setSelectedProblem(updatedProblem);
    }
  };

  const handleDeleteProblem = (id: string) => {
    deleteCodingProblem(id);
    if (selectedProblem?.id === id) {
      setSelectedProblem(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">刷题记录</h1>
          <p className="text-slate-500 mt-1">记录你的LeetCode/牛客刷题历程</p>
        </div>
        <Button onClick={() => { setEditingProblem(null); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4" />
          新增记录
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索题目..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">全部平台</option>
                <option value="leetcode">LeetCode</option>
                <option value="nowcoder">牛客</option>
                <option value="other">其他</option>
              </select>
            </div>
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
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">题目</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">平台</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">难度</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">标签</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">完成日期</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProblems.map(problem => (
                    <tr
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedProblem?.id === problem.id ? 'bg-primary-50' : ''
                      } ${problem.isWrong ? 'bg-red-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {problem.isWrong && <AlertCircle className="w-4 h-4 text-red-500" />}
                          <span className="font-medium text-slate-800">{problem.title}</span>
                          {problem.retryCount > 1 && (
                            <Badge variant="warning">{problem.retryCount}刷</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="default">{platformConfig[problem.platform].label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={difficultyConfig[problem.difficulty].variant}>
                          {difficultyConfig[problem.difficulty].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {problem.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="primary" className="text-xs">{tag}</Badge>
                          ))}
                          {problem.tags.length > 2 && (
                            <Badge variant="default" className="text-xs">+{problem.tags.length - 2}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {problem.completedDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetry(problem);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                            title="再次挑战"
                          >
                            <RotateCcw className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProblem(problem);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这条记录吗？')) {
                                handleDeleteProblem(problem.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProblems.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无刷题记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedProblem ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedProblem.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={difficultyConfig[selectedProblem.difficulty].variant}>
                        {difficultyConfig[selectedProblem.difficulty].label}
                      </Badge>
                      <Badge variant="default">{platformConfig[selectedProblem.platform].label}</Badge>
                      {selectedProblem.isWrong && (
                        <Badge variant="danger">错题</Badge>
                      )}
                      {selectedProblem.retryCount > 1 && (
                        <Badge variant="warning">第 {selectedProblem.retryCount} 刷</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={selectedProblem.isWrong ? 'danger' : 'secondary'}
                      onClick={() => handleToggleWrong(selectedProblem)}
                    >
                      <AlertCircle className="w-4 h-4" />
                      {selectedProblem.isWrong ? '取消错题' : '标记错题'}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleRetry(selectedProblem)}
                    >
                      <RotateCcw className="w-4 h-4" />
                      再刷一次
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      完成于 {selectedProblem.completedDate}
                    </span>
                    {selectedProblem.url && (
                      <a
                        href={selectedProblem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        题目链接
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">标签</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {selectedProblem.tags.map(tag => (
                        <Badge key={tag} variant="primary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
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
                  <CardTitle className="text-base">解题思路</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedProblem.solution || '暂无解题思路'}</p>
                </CardContent>
              </Card>

              {selectedProblem.isWrong && selectedProblem.wrongNotes && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <CardTitle className="text-base text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      错题笔记
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-700 whitespace-pre-wrap">{selectedProblem.wrongNotes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Hash className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">请选择一道题目查看详情</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProblem ? '编辑记录' : '新增记录'}
        size="xl"
      >
        <ProblemForm
          initialData={editingProblem}
          onSave={handleSaveProblem}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const ProblemForm: React.FC<{
  initialData: CodingProblem | null;
  onSave: (data: Partial<CodingProblem>) => void;
  onCancel: () => void;
}> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    platform: initialData?.platform || 'leetcode' as 'leetcode' | 'nowcoder' | 'other',
    title: initialData?.title || '',
    difficulty: initialData?.difficulty || 'easy' as Difficulty,
    url: initialData?.url || '',
    solution: initialData?.solution || '',
    timeComplexity: initialData?.timeComplexity || '',
    spaceComplexity: initialData?.spaceComplexity || '',
    completedDate: initialData?.completedDate || new Date().toISOString().split('T')[0],
    isWrong: initialData?.isWrong || false,
    wrongNotes: initialData?.wrongNotes || '',
    retryCount: initialData?.retryCount || 1,
    tags: initialData?.tags.join(', ') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">平台</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'leetcode' | 'nowcoder' | 'other' })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="leetcode">LeetCode</option>
            <option value="nowcoder">牛客</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">难度</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">题目标题</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">题目链接</label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">完成日期</label>
          <input
            type="date"
            value={formData.completedDate}
            onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">时间复杂度</label>
          <input
            type="text"
            value={formData.timeComplexity}
            onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="O(n), O(n²), O(log n)..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">空间复杂度</label>
          <input
            type="text"
            value={formData.spaceComplexity}
            onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="O(1), O(n)..."
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">标签（用逗号分隔）</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="数组, 哈希表, 双指针..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">解题思路</label>
        <textarea
          value={formData.solution}
          onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={5}
          placeholder="描述你的解题思路..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isWrong"
          checked={formData.isWrong}
          onChange={(e) => setFormData({ ...formData, isWrong: e.target.checked })}
          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
        />
        <label htmlFor="isWrong" className="text-sm text-slate-700">
          标记为错题
        </label>
      </div>
      {formData.isWrong && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">错题笔记</label>
          <textarea
            value={formData.wrongNotes}
            onChange={(e) => setFormData({ ...formData, wrongNotes: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="记录做错的原因和需要注意的点..."
          />
        </div>
      )}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          保存
        </Button>
      </div>
    </form>
  );
};

export default ProblemsPage;
