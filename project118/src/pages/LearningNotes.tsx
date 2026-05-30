import { useState } from 'react';
import { Plus, BookOpen, Lightbulb, Search, Edit2, Trash2 } from 'lucide-react';
import { useLearningStore } from '@/stores/learningStore';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import { Input, Textarea, Select } from '@/components/common/Input';
import type { StitchNote, ProblemSolution } from '@/types';

const stitchTypes = [
  { value: 'knitting', label: '棒针' },
  { value: 'crochet', label: '钩针' },
  { value: 'embroidery', label: '刺绣' },
  { value: 'weaving', label: '编织' },
  { value: 'other', label: '其他' }
];

type TabType = 'stitches' | 'problems';

export default function LearningNotes() {
  const stitchNotes = useLearningStore((s) => s.stitchNotes);
  const problemSolutions = useLearningStore((s) => s.problemSolutions);
  const addStitchNote = useLearningStore((s) => s.addStitchNote);
  const updateStitchNote = useLearningStore((s) => s.updateStitchNote);
  const deleteStitchNote = useLearningStore((s) => s.deleteStitchNote);
  const addProblemSolution = useLearningStore((s) => s.addProblemSolution);
  const updateProblemSolution = useLearningStore((s) => s.updateProblemSolution);
  const deleteProblemSolution = useLearningStore((s) => s.deleteProblemSolution);

  const [activeTab, setActiveTab] = useState<TabType>('stitches');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStitch, setEditingStitch] = useState<StitchNote | null>(null);
  const [editingSolution, setEditingSolution] = useState<ProblemSolution | null>(null);
  const [showDetail, setShowDetail] = useState<{ type: TabType; data: StitchNote | ProblemSolution | null }>({ type: 'stitches', data: null });

  const [newStitch, setNewStitch] = useState({
    name: '',
    type: 'knitting',
    instructions: '',
    tips: ''
  });

  const [newSolution, setNewSolution] = useState({
    title: '',
    problem: '',
    solution: '',
    tags: ''
  });

  const filteredStitches = stitchNotes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || s.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredSolutions = problemSolutions.filter((s) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(lowerQuery) ||
      s.problem.toLowerCase().includes(lowerQuery) ||
      s.solution.toLowerCase().includes(lowerQuery) ||
      s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  });

  const handleSaveStitch = () => {
    if (!newStitch.name || !newStitch.instructions) return;

    if (editingStitch) {
      updateStitchNote(editingStitch.id, {
        name: newStitch.name,
        type: newStitch.type,
        instructions: newStitch.instructions,
        tips: newStitch.tips
      });
    } else {
      addStitchNote({
        name: newStitch.name,
        type: newStitch.type,
        instructions: newStitch.instructions,
        tips: newStitch.tips
      });
    }

    setShowAddModal(false);
    setEditingStitch(null);
    setNewStitch({ name: '', type: 'knitting', instructions: '', tips: '' });
  };

  const handleSaveSolution = () => {
    if (!newSolution.title || !newSolution.problem || !newSolution.solution) return;

    const tags = newSolution.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t);

    if (editingSolution) {
      updateProblemSolution(editingSolution.id, {
        title: newSolution.title,
        problem: newSolution.problem,
        solution: newSolution.solution,
        tags
      });
    } else {
      addProblemSolution({
        title: newSolution.title,
        problem: newSolution.problem,
        solution: newSolution.solution,
        tags
      });
    }

    setShowAddModal(false);
    setEditingSolution(null);
    setNewSolution({ title: '', problem: '', solution: '', tags: '' });
  };

  const handleEditStitch = (stitch: StitchNote) => {
    setEditingStitch(stitch);
    setNewStitch({
      name: stitch.name,
      type: stitch.type,
      instructions: stitch.instructions,
      tips: stitch.tips
    });
    setShowAddModal(true);
  };

  const handleEditSolution = (solution: ProblemSolution) => {
    setEditingSolution(solution);
    setNewSolution({
      title: solution.title,
      problem: solution.problem,
      solution: solution.solution,
      tags: solution.tags.join(', ')
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    if (activeTab === 'stitches') {
      setEditingStitch(null);
      setNewStitch({ name: '', type: 'knitting', instructions: '', tips: '' });
    } else {
      setEditingSolution(null);
      setNewSolution({ title: '', problem: '', solution: '', tags: '' });
    }
    setShowAddModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const getStitchTypeLabel = (type: string) => {
    const found = stitchTypes.find((t) => t.value === type);
    return found?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学习笔记</h1>
          <p className="text-gray-500 mt-1">记录针法技巧和问题解决方案</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          添加笔记
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stitchNotes.length}</p>
              <p className="text-sm text-gray-500">针法笔记</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{problemSolutions.length}</p>
              <p className="text-sm text-gray-500">问题解决方案</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab('stitches');
              setSelectedType('');
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'stitches' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            针法笔记
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'problems' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            问题解决
          </button>
          <div className="flex-1" />
        </div>

        {activeTab === 'stitches' ? (
          <div className="flex gap-2 flex-1">
            <div className="w-40">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: '', label: '全部类型' },
                  ...stitchTypes
                ]}
              />
            </div>
            <div className="flex-1 max-w-md">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索针法名称或说明..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索问题或解决方案..."
            />
          </div>
        )}
      </div>

      {activeTab === 'stitches' ? (
        filteredStitches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有针法笔记</h3>
              <p className="text-gray-500 mb-4">记录你学习的各种针法技巧</p>
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                添加第一条笔记
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStitches.map((stitch) => (
              <Card key={stitch.id} className="hover:shadow-md transition-shadow">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{stitch.name}</h3>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
                          {getStitchTypeLabel(stitch.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        更新于 {formatDate(stitch.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditStitch(stitch)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这条笔记吗？')) {
                            deleteStitchNote(stitch.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {stitch.tips && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {stitch.tips}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => setShowDetail({ type: 'stitches', data: stitch })}
                  >
                    查看详情
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : filteredSolutions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Lightbulb className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">还没有问题解决方案</h3>
            <p className="text-gray-500 mb-4">记录你遇到的问题和解决方法</p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              添加第一条记录
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSolutions.map((solution) => (
            <Card key={solution.id} className="hover:shadow-md transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{solution.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      更新于 {formatDate(solution.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditSolution(solution)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定要删除这条记录吗？')) {
                          deleteProblemSolution(solution.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{solution.problem}</p>
                {solution.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {solution.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={() => setShowDetail({ type: 'problems', data: solution })}
                >
                  查看详情
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingStitch(null);
          setEditingSolution(null);
        }}
        title={
          activeTab === 'stitches'
            ? editingStitch
              ? '编辑针法笔记'
              : '添加针法笔记'
            : editingSolution
            ? '编辑问题解决方案'
            : '添加问题解决方案'
        }
        size="lg"
      >
        {activeTab === 'stitches' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="针法名称"
                value={newStitch.name}
                onChange={(e) => setNewStitch({ ...newStitch, name: e.target.value })}
                placeholder="例如：平针"
              />
              <Select
                label="类型"
                value={newStitch.type}
                onChange={(e) => setNewStitch({ ...newStitch, type: e.target.value })}
                options={stitchTypes}
              />
            </div>
            <Textarea
              label="针法说明"
              value={newStitch.instructions}
              onChange={(e) => setNewStitch({ ...newStitch, instructions: e.target.value })}
              placeholder="详细描述针法步骤..."
              rows={4}
            />
            <Textarea
              label="技巧心得（可选）"
              value={newStitch.tips}
              onChange={(e) => setNewStitch({ ...newStitch, tips: e.target.value })}
              placeholder="记录你的练习心得和技巧..."
              rows={3}
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStitch(null);
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveStitch}
                disabled={!newStitch.name || !newStitch.instructions}
              >
                {editingStitch ? '保存' : '添加'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="标题"
              value={newSolution.title}
              onChange={(e) => setNewSolution({ ...newSolution, title: e.target.value })}
              placeholder="例如：针数总是松"
            />
            <Textarea
              label="问题描述"
              value={newSolution.problem}
              onChange={(e) => setNewSolution({ ...newSolution, problem: e.target.value })}
              placeholder="描述你遇到的问题..."
              rows={3}
            />
            <Textarea
              label="解决方案"
              value={newSolution.solution}
              onChange={(e) => setNewSolution({ ...newSolution, solution: e.target.value })}
              placeholder="详细描述解决方法..."
              rows={4}
            />
            <Input
              label="标签（用逗号分隔）"
              value={newSolution.tags}
              onChange={(e) => setNewSolution({ ...newSolution, tags: e.target.value })}
              placeholder="例如：新手, 针数, 边缘"
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSolution(null);
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleSaveSolution}
                disabled={!newSolution.title || !newSolution.problem || !newSolution.solution}
              >
                {editingSolution ? '保存' : '添加'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showDetail.data !== null}
        onClose={() => setShowDetail({ type: 'stitches', data: null })}
        title={
          showDetail.type === 'stitches'
            ? (showDetail.data as StitchNote)?.name || '针法详情'
            : (showDetail.data as ProblemSolution)?.title || '解决方案详情'
        }
        size="lg"
      >
        {showDetail.data ? (
          showDetail.type === 'stitches' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
                  {getStitchTypeLabel((showDetail.data as StitchNote).type)}
                </span>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">针法说明</h4>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700">
                  {(showDetail.data as StitchNote).instructions}
                </div>
              </div>
              {(showDetail.data as StitchNote).tips && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">技巧心得</h4>
                  <div className="p-4 bg-orange-50 rounded-lg whitespace-pre-wrap text-orange-700">
                    {(showDetail.data as StitchNote).tips}
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 pt-2">
                创建于 {formatDate((showDetail.data as StitchNote).createdAt)}
                {' · '}
                更新于 {formatDate((showDetail.data as StitchNote).updatedAt)}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(showDetail.data as ProblemSolution).tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(showDetail.data as ProblemSolution).tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">问题描述</h4>
                <div className="p-4 bg-red-50 rounded-lg whitespace-pre-wrap text-red-700">
                  {(showDetail.data as ProblemSolution).problem}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">解决方案</h4>
                <div className="p-4 bg-emerald-50 rounded-lg whitespace-pre-wrap text-emerald-700">
                  {(showDetail.data as ProblemSolution).solution}
                </div>
              </div>
              <p className="text-xs text-gray-400 pt-2">
                创建于 {formatDate((showDetail.data as ProblemSolution).createdAt)}
                {' · '}
                更新于 {formatDate((showDetail.data as ProblemSolution).updatedAt)}
              </p>
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}
