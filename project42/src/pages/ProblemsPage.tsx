import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Modal, { ConfirmModal } from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty } from '@/components/Table';
import type { Problem, ProblemTag, DifficultyLevel, ProblemStatus, Language, TestCase, LanguageConfig } from '@/types';

interface ProblemsFilter {
  search: string;
  difficulty: string;
  tagId: number | '';
  status: string;
}

const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-orange-100 text-orange-700',
  expert: 'bg-red-100 text-red-700',
};

const difficultyLabels: Record<DifficultyLevel, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家',
};

const statusLabels: Record<ProblemStatus, string> = {
  draft: '草稿',
  published: '已发布',
  hidden: '已隐藏',
};

const languageLabels: Record<Language, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  go: 'Go',
  rust: 'Rust',
};

function ProblemFormModal({
  isOpen,
  onClose,
  editingProblem,
  tags,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingProblem?: Problem | null;
  tags: ProblemTag[];
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const isEdit = !!editingProblem;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    note: '',
    difficulty: 'easy' as DifficultyLevel,
    tags: [] as number[],
    hasSpecialJudge: false,
    specialJudgeCode: '',
    languages: ['python', 'java', 'cpp', 'go', 'rust'] as Language[],
    timeLimit: 1000,
    memoryLimit: 256,
  });

  const [testCases, setTestCases] = useState<{ input: string; output: string; isSample: boolean; score: number }[]>([]);

  useState(() => {
    if (editingProblem) {
      setFormData({
        title: editingProblem.title,
        description: editingProblem.description,
        inputFormat: editingProblem.inputFormat,
        outputFormat: editingProblem.outputFormat,
        sampleInput: editingProblem.sampleInput,
        sampleOutput: editingProblem.sampleOutput,
        note: editingProblem.note || '',
        difficulty: editingProblem.difficulty,
        tags: editingProblem.tags,
        hasSpecialJudge: editingProblem.hasSpecialJudge,
        specialJudgeCode: editingProblem.specialJudgeCode || '',
        languages: editingProblem.languages,
        timeLimit: editingProblem.timeLimit,
        memoryLimit: editingProblem.memoryLimit,
      });
      setTestCases(
        editingProblem.testCases.map((tc) => ({
          input: tc.input,
          output: tc.output,
          isSample: tc.isSample,
          score: tc.score,
        }))
      );
    } else {
      setFormData({
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        sampleInput: '',
        sampleOutput: '',
        note: '',
        difficulty: 'easy',
        tags: [],
        hasSpecialJudge: false,
        specialJudgeCode: '',
        languages: ['python', 'java', 'cpp', 'go', 'rust'],
        timeLimit: 1000,
        memoryLimit: 256,
      });
      setTestCases([]);
    }
  });

  const createMutation = useMutation({
    mutationFn: api.createProblem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
      showSuccess('题目创建成功');
      onClose();
      navigate(`/problems/${data.id}`);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof formData> & { testCases?: TestCase[]; languageConfigs?: LanguageConfig[] } }) =>
      api.updateProblem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
      showSuccess('题目更新成功');
      onClose();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      showError('请输入题目标题');
      return;
    }
    if (!formData.description.trim()) {
      showError('请输入题目描述');
      return;
    }

    const languageConfigs: LanguageConfig[] = formData.languages.map((lang) => ({
      language: lang,
      timeLimit: formData.timeLimit,
      memoryLimit: formData.memoryLimit,
      runCommand: lang === 'python' ? 'python3 solution.py' : lang === 'java' ? 'java Solution' : './solution',
      compileCommand: lang === 'python' ? undefined : lang === 'java' ? 'javac Solution.java' : lang === 'cpp' ? 'g++ -o solution solution.cpp -std=c++17' : lang === 'go' ? 'go build -o solution solution.go' : 'rustc -o solution solution.rs',
    }));

    if (isEdit && editingProblem) {
      updateMutation.mutate({
        id: editingProblem.id,
        data: {
          ...formData,
          languageConfigs,
        },
      });
    } else {
      createMutation.mutate({
        ...formData,
        languageConfigs,
      });
    }
  };

  const toggleLanguage = (lang: Language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const toggleTag = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { input: '', output: '', isSample: false, score: 10 },
    ]);
  };

  const removeTestCase = (index: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTestCase = (index: number, field: string, value: string | boolean | number) => {
    setTestCases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑题目' : '创建题目'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="题目标题"
            placeholder="请输入题目标题"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            isRequired
          />
          <Select
            label="难度级别"
            value={formData.difficulty}
            onChange={(e) => setFormData((prev) => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
            options={[
              { value: 'easy', label: '简单' },
              { value: 'medium', label: '中等' },
              { value: 'hard', label: '困难' },
              { value: 'expert', label: '专家' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            题目描述 <span className="text-red-500">*</span> (支持 LaTeX 公式)
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] font-mono text-sm"
            placeholder="题目描述，支持 $a + b$ 行内公式和 $$a^2 + b^2$$ 块级公式"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入格式
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] font-mono text-sm"
              placeholder="描述输入格式"
              value={formData.inputFormat}
              onChange={(e) => setFormData((prev) => ({ ...prev, inputFormat: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输出格式
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] font-mono text-sm"
              placeholder="描述输出格式"
              value={formData.outputFormat}
              onChange={(e) => setFormData((prev) => ({ ...prev, outputFormat: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              样例输入
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] font-mono text-sm bg-gray-50"
              placeholder="样例输入"
              value={formData.sampleInput}
              onChange={(e) => setFormData((prev) => ({ ...prev, sampleInput: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              样例输出
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] font-mono text-sm bg-gray-50"
              placeholder="样例输出"
              value={formData.sampleOutput}
              onChange={(e) => setFormData((prev) => ({ ...prev, sampleOutput: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            提示/说明
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[60px]"
            placeholder="额外的提示或说明"
            value={formData.note}
            onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            题目标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  formData.tags.includes(tag.id)
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={formData.tags.includes(tag.id) ? { backgroundColor: tag.color } : {}}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="时间限制 (ms)"
            type="number"
            value={formData.timeLimit}
            onChange={(e) => setFormData((prev) => ({ ...prev, timeLimit: Number(e.target.value) }))}
          />
          <Input
            label="内存限制 (MB)"
            type="number"
            value={formData.memoryLimit}
            onChange={(e) => setFormData((prev) => ({ ...prev, memoryLimit: Number(e.target.value) }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            支持语言
          </label>
          <div className="flex flex-wrap gap-2">
            {(['python', 'java', 'cpp', 'go', 'rust'] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.languages.includes(lang)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasSpecialJudge}
              onChange={(e) => setFormData((prev) => ({ ...prev, hasSpecialJudge: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">启用 Special Judge</span>
          </label>
          {formData.hasSpecialJudge && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Judge 代码 (Python)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] font-mono text-sm"
                placeholder="def check_solution(input_data, output_data, expected_data):\n    # 返回 (是否正确, 错误信息)\n    return output_data.strip() == expected_data.strip(), ''"
                value={formData.specialJudgeCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialJudgeCode: e.target.value }))}
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              测试用例
            </label>
            <Button variant="secondary" size="sm" onClick={addTestCase}>
              + 添加测试用例
            </Button>
          </div>
          {testCases.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 rounded-md">
              暂无测试用例，点击上方按钮添加
            </p>
          ) : (
            <div className="space-y-4">
              {testCases.map((tc, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      测试用例 #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={tc.isSample}
                          onChange={(e) => updateTestCase(index, 'isSample', e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        样例
                      </label>
                      <Input
                        type="number"
                        placeholder="分值"
                        value={tc.score}
                        onChange={(e) => updateTestCase(index, 'score', Number(e.target.value))}
                        className="w-20"
                      />
                      <Button variant="danger" size="sm" onClick={() => removeTestCase(index)}>
                        删除
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">输入</label>
                      <textarea
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono min-h-[60px]"
                        placeholder="输入数据"
                        value={tc.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">预期输出</label>
                      <textarea
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono min-h-[60px]"
                        placeholder="预期输出"
                        value={tc.output}
                        onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function ProblemsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProblemsFilter>({
    search: '',
    difficulty: '',
    tagId: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProblemId, setDeletingProblemId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const debouncedSearch = useDebounce(filter.search, 300);

  const { data: problemsData, isLoading: isLoadingProblems } = useQuery({
    queryKey: queryKeys.problems.list({
      page,
      pageSize,
      search: debouncedSearch,
      difficulty: filter.difficulty || undefined,
      tags: filter.tagId ? [Number(filter.tagId)] : undefined,
      status: filter.status || undefined,
    }),
    queryFn: () =>
      api.getProblems({
        page,
        pageSize,
        search: debouncedSearch,
        difficulty: filter.difficulty as DifficultyLevel | undefined,
        tags: filter.tagId ? [Number(filter.tagId)] : undefined,
        status: filter.status as ProblemStatus | undefined,
      }),
  });

  const { data: tags, isLoading: isLoadingTags } = useQuery({
    queryKey: queryKeys.problemTags.all,
    queryFn: api.getProblemTags,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
      showSuccess('题目删除成功');
      setIsDeleteModalOpen(false);
      setDeletingProblemId(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleAddProblem = () => {
    setEditingProblem(null);
    setIsModalOpen(true);
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleViewProblem = (problemId: number) => {
    navigate(`/problems/${problemId}`);
  };

  const handleDeleteProblem = (problemId: number) => {
    setDeletingProblemId(problemId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProblemId) {
      deleteMutation.mutate(deletingProblemId);
    }
  };

  const handleFilterChange = (key: keyof ProblemsFilter, value: string | number) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const isLoading = isLoadingProblems || isLoadingTags;

  const tagOptions = useMemo(
    () => [
      { value: '', label: '全部标签' },
      ...(tags?.map((t) => ({ value: t.id, label: t.name })) || []),
    ],
    [tags]
  );

  const getTagName = (tagId: number) => {
    return tags?.find((t) => t.id === tagId)?.name || tagId.toString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">题目管理</h1>
            <p className="text-gray-500 mt-1">管理所有编程题目</p>
          </div>
          <Button onClick={handleAddProblem}>创建题目</Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="搜索题目标题..."
              value={filter.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
            />
            <Select
              options={[
                { value: '', label: '全部难度' },
                { value: 'easy', label: '简单' },
                { value: 'medium', label: '中等' },
                { value: 'hard', label: '困难' },
                { value: 'expert', label: '专家' },
              ]}
              value={filter.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="sm:w-36"
            />
            <Select
              options={tagOptions}
              value={filter.tagId}
              onChange={(e) =>
                handleFilterChange('tagId', e.target.value ? Number(e.target.value) : '')
              }
              className="sm:w-36"
            />
            <Select
              options={[
                { value: '', label: '全部状态' },
                { value: 'draft', label: '草稿' },
                { value: 'published', label: '已发布' },
                { value: 'hidden', label: '已隐藏' },
              ]}
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="sm:w-36"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <Loading text="加载中..." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>标题</TableHeaderCell>
                  <TableHeaderCell>难度</TableHeaderCell>
                  <TableHeaderCell>标签</TableHeaderCell>
                  <TableHeaderCell>状态</TableHeaderCell>
                  <TableHeaderCell>通过率</TableHeaderCell>
                  <TableHeaderCell>Special Judge</TableHeaderCell>
                  <TableHeaderCell className="text-right">操作</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {!problemsData || problemsData.items.length === 0 ? (
                    <TableEmpty colSpan={8} message="暂无题目数据" />
                  ) : (
                    problemsData.items.map((problem) => (
                      <TableRow key={problem.id} row={problem}>
                        <TableCell className="font-medium">{problem.id}</TableCell>
                        <TableCell className="max-w-xs">
                          <button
                            onClick={() => handleViewProblem(problem.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-left"
                          >
                            {problem.title}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              difficultyColors[problem.difficulty]
                            }`}
                          >
                            {difficultyLabels[problem.difficulty]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.slice(0, 3).map((tagId) => (
                              <span
                                key={tagId}
                                className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {getTagName(tagId)}
                              </span>
                            ))}
                            {problem.tags.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{problem.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              problem.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : problem.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {statusLabels[problem.status]}
                          </span>
                        </TableCell>
                        <TableCell>
                          {problem.attemptedCount > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {Math.round((problem.solvedCount / problem.attemptedCount) * 100)}%
                              </span>
                              <span className="text-xs text-gray-400">
                                ({problem.solvedCount}/{problem.attemptedCount})
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {problem.hasSpecialJudge ? (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                              是
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">否</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProblem(problem.id)}
                            >
                              查看
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProblem(problem)}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteProblem(problem.id)}
                            >
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {problemsData && problemsData.total > 0 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={problemsData.total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ProblemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProblem={editingProblem}
        tags={tags || []}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProblemId(null);
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除该题目吗？此操作无法撤销。"
        confirmText="删除"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

export default ProblemsPage;
