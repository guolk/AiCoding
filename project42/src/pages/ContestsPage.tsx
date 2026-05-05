import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import type { Contest, ContestType, ContestStatus, ScoringSystem, Problem } from '@/types';

interface ContestsFilter {
  search: string;
  type: ContestType | '';
  status: ContestStatus | '';
}

const statusColors: Record<ContestStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  running: 'bg-green-100 text-green-700',
  frozen: 'bg-yellow-100 text-yellow-700',
  ended: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<ContestStatus, string> = {
  upcoming: '即将开始',
  running: '进行中',
  frozen: '已封榜',
  ended: '已结束',
};

const typeLabels: Record<ContestType, string> = {
  contest: '正式竞赛',
  practice: '练习场',
};

const scoringSystemLabels: Record<ScoringSystem, string> = {
  icpc: 'ICPC 赛制',
  oi: 'OI 赛制',
};

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家',
};

function ContestCard({
  contest,
  onView,
  onEdit,
  onRegister,
  isRegistered,
}: {
  contest: Contest;
  onView: () => void;
  onEdit: () => void;
  onRegister: () => void;
  isRegistered: boolean;
}) {
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    if (hours >= 24) {
      return `${Math.floor(hours / 24)} 天 ${Math.floor(hours % 24)} 小时`;
    }
    return `${hours} 小时`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                <button onClick={onView} className="hover:text-indigo-600">
                  {contest.title}
                </button>
              </h3>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[contest.status]}`}
              >
                {statusLabels[contest.status]}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                {typeLabels[contest.type]}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {contest.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" onClick={onView}>
              查看
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              编辑
            </Button>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">开始时间</p>
            <p className="font-medium text-gray-900">{formatDateTime(contest.startTime)}</p>
          </div>
          <div>
            <p className="text-gray-500">结束时间</p>
            <p className="font-medium text-gray-900">{formatDateTime(contest.endTime)}</p>
          </div>
          <div>
            <p className="text-gray-500">赛制</p>
            <p className="font-medium text-gray-900">{scoringSystemLabels[contest.scoringSystem]}</p>
          </div>
          <div>
            <p className="text-gray-500">参与人数</p>
            <p className="font-medium text-gray-900">{contest.participantCount} 人</p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              题目数: <span className="font-medium text-gray-900">{contest.problemIds.length}</span>
            </span>
            <span className="text-gray-500">
              时长: <span className="font-medium text-gray-900">
                {getDuration(contest.startTime, contest.endTime)}
              </span>
            </span>
            {contest.freezeTime && (
              <span className="text-gray-500">
                封榜: <span className="font-medium text-gray-900">
                  最后 {Math.round((new Date(contest.endTime).getTime() - new Date(contest.freezeTime).getTime()) / (1000 * 60))} 分钟
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {contest.status === 'upcoming' && !isRegistered && (
              <Button onClick={onRegister}>
                注册参加
              </Button>
            )}
            {contest.status === 'upcoming' && isRegistered && (
              <span className="text-sm text-green-600 font-medium">
                ✓ 已注册
              </span>
            )}
            {(contest.status === 'running' || contest.status === 'frozen') && (
              <Button onClick={onView} variant="primary">
                进入竞赛
              </Button>
            )}
            {contest.status === 'ended' && (
              <Link to={`/contests/${contest.id}/editorial`}>
                <Button variant="secondary">
                  查看题解
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContestFormModal({
  isOpen,
  onClose,
  editingContest,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingContest?: Contest | null;
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const isEdit = !!editingContest;

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      type: string;
      scoringSystem: string;
      status: string;
      startTime: string;
      endTime: string;
      freezeTime?: string;
      problemIds: number[];
      isPublic: boolean;
    }) => api.createContest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contests.all });
      showSuccess('竞赛创建成功');
      onClose();
    },
    onError: (error: Error) => {
      showError(error.message || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: {
        title?: string;
        description?: string;
        type?: string;
        scoringSystem?: string;
        status?: string;
        startTime?: string;
        endTime?: string;
        freezeTime?: string;
        problemIds?: number[];
        isPublic?: boolean;
      };
    }) => api.updateContest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contests.all });
      showSuccess('竞赛更新成功');
      onClose();
    },
    onError: (error: Error) => {
      showError(error.message || '更新失败');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'contest' as ContestType,
    scoringSystem: 'icpc' as ScoringSystem,
    startTime: '',
    endTime: '',
    freezeTime: '',
    problemIds: [] as number[],
    isPublic: true,
  });

  const [selectedProblems, setSelectedProblems] = useState<number[]>([]);

  const { data: problems } = useQuery({
    queryKey: queryKeys.problems.list({ status: 'published' }),
    queryFn: () => api.getProblems({ status: 'published', pageSize: 100 }),
    enabled: isOpen,
  });

  useEffect(() => {
    if (editingContest) {
      setFormData({
        title: editingContest.title,
        description: editingContest.description,
        type: editingContest.type,
        scoringSystem: editingContest.scoringSystem,
        startTime: editingContest.startTime.slice(0, 16),
        endTime: editingContest.endTime.slice(0, 16),
        freezeTime: editingContest.freezeTime ? editingContest.freezeTime.slice(0, 16) : '',
        problemIds: editingContest.problemIds,
        isPublic: editingContest.isPublic,
      });
      setSelectedProblems(editingContest.problemIds);
    } else {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(now.getTime() + 26 * 60 * 60 * 1000);
      const freezeTime = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      setFormData({
        title: '',
        description: '',
        type: 'contest',
        scoringSystem: 'icpc',
        startTime: tomorrow.toISOString().slice(0, 16).replace('T', ' '),
        endTime: dayAfter.toISOString().slice(0, 16).replace('T', ' '),
        freezeTime: freezeTime.toISOString().slice(0, 16).replace('T', ' '),
        problemIds: [],
        isPublic: true,
      });
      setSelectedProblems([]);
    }
  }, [editingContest, isOpen]);

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      showError('请输入竞赛标题');
      return;
    }
    if (!formData.startTime) {
      showError('请选择开始时间');
      return;
    }
    if (!formData.endTime) {
      showError('请选择结束时间');
      return;
    }
    if (selectedProblems.length === 0) {
      showError('请至少选择一道题目');
      return;
    }

    const now = new Date();
    const startTime = new Date(formData.startTime.replace(' ', 'T') + ':00Z');
    const endTime = new Date(formData.endTime.replace(' ', 'T') + ':00Z');
    
    let status: string;
    if (endTime <= now) {
      status = 'ended';
    } else if (startTime <= now && endTime > now) {
      status = 'running';
    } else {
      status = 'upcoming';
    }

    const contestData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      scoringSystem: formData.scoringSystem,
      status,
      problemIds: selectedProblems,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      freezeTime: formData.freezeTime ? new Date(formData.freezeTime.replace(' ', 'T') + ':00Z').toISOString() : undefined,
      isPublic: formData.isPublic,
    };

    if (isEdit && editingContest) {
      updateMutation.mutate({ id: editingContest.id, data: contestData });
    } else {
      createMutation.mutate(contestData);
    }
  };

  const toggleProblem = (problemId: number) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId)
        ? prev.filter((id) => id !== problemId)
        : [...prev, problemId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑竞赛' : '创建竞赛'}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="竞赛标题"
              placeholder="请输入竞赛标题"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              isRequired
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            竞赛描述
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
            placeholder="请输入竞赛描述"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="竞赛类型"
            value={formData.type}
            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as ContestType }))}
            options={[
              { value: 'contest', label: '正式竞赛' },
              { value: 'practice', label: '练习场' },
            ]}
          />
          <Select
            label="计分规则"
            value={formData.scoringSystem}
            onChange={(e) => setFormData((prev) => ({ ...prev, scoringSystem: e.target.value as ScoringSystem }))}
            options={[
              { value: 'icpc', label: 'ICPC 赛制 (AC数/罚时)' },
              { value: 'oi', label: 'OI 赛制 (按测试点得分)' },
            ]}
          />
          <label className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">公开竞赛</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="开始时间"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
            isRequired
          />
          <Input
            label="结束时间"
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
            isRequired
          />
          <Input
            label="封榜时间 (可选)"
            type="datetime-local"
            value={formData.freezeTime}
            onChange={(e) => setFormData((prev) => ({ ...prev, freezeTime: e.target.value }))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              选择题目 <span className="text-red-500">*</span>
              <span className="ml-2 text-gray-500">
                (已选择 {selectedProblems.length} 道)
              </span>
            </label>
          </div>
          {!problems || problems.items.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 rounded-md">
              暂无可用题目
            </p>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
              {problems.items.map((problem) => (
                <label
                  key={problem.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProblems.includes(problem.id)}
                    onChange={() => toggleProblem(problem.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {problem.id}. {problem.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      难度: {difficultyLabels[problem.difficulty]} | 通过: {problem.solvedCount}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function ContestsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ContestsFilter>({
    search: '',
    type: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingContestId, setDeletingContestId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const debouncedSearch = useDebounce(filter.search, 300);

  const { data: contestsData, isLoading: isLoadingContests } = useQuery({
    queryKey: queryKeys.contests.list({
      page,
      pageSize,
      search: debouncedSearch,
      type: filter.type || undefined,
      status: filter.status || undefined,
    }),
    queryFn: () =>
      api.getContests({
        page,
        pageSize,
        search: debouncedSearch,
        type: filter.type || undefined,
        status: filter.status || undefined,
      }),
  });

  const registerMutation = useMutation({
    mutationFn: api.registerContest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contests.all });
      showSuccess('注册成功！');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contests.all });
      showSuccess('竞赛删除成功');
      setIsDeleteModalOpen(false);
      setDeletingContestId(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleAddContest = () => {
    setEditingContest(null);
    setIsModalOpen(true);
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    setIsModalOpen(true);
  };

  const handleViewContest = (contestId: number) => {
    navigate(`/contests/${contestId}`);
  };

  const handleRegisterContest = (contestId: number) => {
    registerMutation.mutate(contestId);
  };

  const handleFilterChange = (key: keyof ContestsFilter, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const isLoading = isLoadingContests;

  const upcomingContests = useMemo(
    () => contestsData?.items.filter((c) => c.status === 'upcoming') || [],
    [contestsData]
  );

  const runningContests = useMemo(
    () => contestsData?.items.filter((c) => c.status === 'running' || c.status === 'frozen') || [],
    [contestsData]
  );

  const endedContests = useMemo(
    () => contestsData?.items.filter((c) => c.status === 'ended') || [],
    [contestsData]
  );

  const ContestSection = ({
    title,
    contests,
    icon,
  }: {
    title: string;
    contests: Contest[];
    icon: React.ReactNode;
  }) => {
    if (contests.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">({contests.length})</span>
        </div>
        <div className="space-y-4">
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              onView={() => handleViewContest(contest.id)}
              onEdit={() => handleEditContest(contest)}
              onRegister={() => handleRegisterContest(contest.id)}
              isRegistered={false}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">竞赛列表</h1>
            <p className="text-gray-500 mt-1">查看和管理所有竞赛</p>
          </div>
          <Button onClick={handleAddContest}>创建竞赛</Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="搜索竞赛标题..."
              value={filter.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
            />
            <Select
              options={[
                { value: '', label: '全部类型' },
                { value: 'contest', label: '正式竞赛' },
                { value: 'practice', label: '练习场' },
              ]}
              value={filter.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="sm:w-40"
            />
            <Select
              options={[
                { value: '', label: '全部状态' },
                { value: 'upcoming', label: '即将开始' },
                { value: 'running', label: '进行中' },
                { value: 'frozen', label: '已封榜' },
                { value: 'ended', label: '已结束' },
              ]}
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="sm:w-40"
            />
          </div>
        </div>

        {isLoading ? (
          <Loading text="加载中..." />
        ) : (
          <div className="space-y-8">
            <ContestSection
              title="进行中的竞赛"
              contests={runningContests}
              icon={
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />

            <ContestSection
              title="即将开始的竞赛"
              contests={upcomingContests}
              icon={
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <ContestSection
              title="已结束的竞赛"
              contests={endedContests}
              icon={
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            {!contestsData || contestsData.items.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-500 text-lg">暂无竞赛</p>
                <p className="text-gray-400 mt-2">点击上方按钮创建第一个竞赛</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ContestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingContest={editingContest}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingContestId(null);
        }}
        onConfirm={() => {
          if (deletingContestId) {
            deleteMutation.mutate(deletingContestId);
          }
        }}
        title="确认删除"
        message="确定要删除该竞赛吗？此操作无法撤销。"
        confirmText="删除"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

export default ContestsPage;
