import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty } from '@/components/Table';
import type {
  Contest,
  ContestParticipation,
  ContestTimelineEvent,
  Problem,
  ProblemContestStatus,
  JudgeStatus,
} from '@/types';

const judgeStatusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  queued: 'bg-blue-100 text-blue-700',
  running: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  wrong_answer: 'bg-red-100 text-red-700',
  time_limit: 'bg-orange-100 text-orange-700',
  memory_limit: 'bg-purple-100 text-purple-700',
  runtime_error: 'bg-pink-100 text-pink-700',
  compile_error: 'bg-cyan-100 text-cyan-700',
  system_error: 'bg-gray-100 text-gray-700',
};

const judgeStatusLabels: Record<string, string> = {
  pending: '等待中',
  queued: '排队中',
  running: '运行中',
  accepted: '通过',
  wrong_answer: '答案错误',
  time_limit: '超时',
  memory_limit: '内存超限',
  runtime_error: '运行时错误',
  compile_error: '编译错误',
  system_error: '系统错误',
};

function JudgeStatusBadge({ status }: { status: JudgeStatus | string }) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${judgeStatusColors[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {judgeStatusLabels[status] || status}
    </span>
  );
}

function ContestHeader({ contest }: { contest: Contest }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(contest.endTime).getTime();
      const startTime = new Date(contest.startTime).getTime();

      if (now < startTime) {
        const diff = startTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`开始前: ${days > 0 ? days + '天 ' : ''}${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else if (now < endTime) {
        const diff = endTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`剩余: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeLeft('已结束');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    running: 'bg-green-100 text-green-700',
    frozen: 'bg-yellow-100 text-yellow-700',
    ended: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    upcoming: '即将开始',
    running: '进行中',
    frozen: '已封榜',
    ended: '已结束',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{contest.title}</h1>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${statusColors[contest.status]}`}
              >
                {statusLabels[contest.status]}
              </span>
            </div>
            <p className="text-gray-600 mt-2 max-w-3xl">{contest.description}</p>
          </div>
          {(contest.status === 'running' || contest.status === 'frozen') && (
            <div className="text-right">
              <p className="text-3xl font-mono font-bold text-indigo-600">{timeLeft}</p>
              {contest.status === 'frozen' && (
                <p className="text-sm text-yellow-600 mt-1 font-medium">
                  ⚠️ 排行榜已冻结
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
            <p className="font-medium text-gray-900">
              {contest.scoringSystem === 'icpc' ? 'ICPC 赛制' : 'OI 赛制'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">题目数量</p>
            <p className="font-medium text-gray-900">{contest.problemIds.length} 道</p>
          </div>
          <div>
            <p className="text-gray-500">参与人数</p>
            <p className="font-medium text-gray-900">{contest.participantCount} 人</p>
          </div>
        </div>
        {contest.freezeTime && contest.status !== 'ended' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">封榜时间:</span> {formatDateTime(contest.freezeTime)}
              <span className="ml-2">(最后 {Math.round((new Date(contest.endTime).getTime() - new Date(contest.freezeTime).getTime()) / (1000 * 60))} 分钟)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemList({
  contestId,
  problems,
  participant,
}: {
  contestId: number;
  problems: Problem[];
  participant?: ContestParticipation;
}) {
  const navigate = useNavigate();

  const problemLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  const getProblemStatus = (problemId: number): ProblemContestStatus | undefined => {
    return participant?.problemStatuses[problemId];
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins} 分钟`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">题目列表</h2>
      </div>
      <Table>
        <TableHeader>
          <TableHeaderCell className="w-16">编号</TableHeaderCell>
          <TableHeaderCell>题目名称</TableHeaderCell>
          <TableHeaderCell>难度</TableHeaderCell>
          {participant && (
            <>
              <TableHeaderCell>状态</TableHeaderCell>
              <TableHeaderCell>首次通过时间</TableHeaderCell>
              <TableHeaderCell>错误尝试</TableHeaderCell>
            </>
          )}
        </TableHeader>
        <TableBody>
          {problems.length === 0 ? (
            <TableEmpty colSpan={participant ? 6 : 3} message="暂无题目" />
          ) : (
            problems.map((problem, index) => {
              const status = getProblemStatus(problem.id);
              const letter = problemLetters[index] || `P${index + 1}`;
              
              return (
                <TableRow key={problem.id} row={problem}>
                  <TableCell className="font-mono font-bold text-lg text-indigo-600">
                    {letter}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => navigate(`/contests/${contestId}/problems/${problem.id}`)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                    >
                      {problem.title}
                    </button>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        problem.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : problem.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : problem.difficulty === 'hard'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {problem.difficulty === 'easy'
                        ? '简单'
                        : problem.difficulty === 'medium'
                        ? '中等'
                        : problem.difficulty === 'hard'
                        ? '困难'
                        : '专家'}
                    </span>
                  </TableCell>
                  {participant && (
                    <>
                      <TableCell>
                        {status?.solved ? (
                          <JudgeStatusBadge status="accepted" />
                        ) : status?.wrongAttempts && status.wrongAttempts > 0 ? (
                          <JudgeStatusBadge status="wrong_answer" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {status?.solved && status.firstACTime ? (
                          <span className="font-mono text-sm">
                            {formatTime(status.firstACTime)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {status?.wrongAttempts && status.wrongAttempts > 0 ? (
                          <span className="text-red-600 font-medium">
                            {status.wrongAttempts}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function Leaderboard({
  contest,
  participations,
}: {
  contest: Contest;
  participations: ContestParticipation[];
}) {
  const problemLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  const formatPenalty = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}`;
  };

  const getProblemDisplay = (status?: ProblemContestStatus) => {
    if (!status) return { text: '-', className: 'text-gray-400' };
    if (status.solved) {
      return {
        text: `+${status.wrongAttempts > 0 ? status.wrongAttempts : ''}`,
        className: 'bg-green-100 text-green-700',
        time: status.firstACTime,
      };
    }
    if (status.wrongAttempts > 0) {
      return {
        text: `-${status.wrongAttempts}`,
        className: 'bg-red-100 text-red-700',
      };
    }
    return { text: '-', className: 'text-gray-400' };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">排行榜</h2>
        {contest.status === 'frozen' && (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            排行榜已冻结
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableHeaderCell className="w-16">#</TableHeaderCell>
            <TableHeaderCell>用户</TableHeaderCell>
            <TableHeaderCell>=</TableHeaderCell>
            <TableHeaderCell>罚时</TableHeaderCell>
            {contest.problemIds.slice(0, 12).map((_, idx) => (
              <TableHeaderCell key={idx} className="w-20 text-center">
                {problemLetters[idx]}
              </TableHeaderCell>
            ))}
          </TableHeader>
          <TableBody>
            {participations.length === 0 ? (
              <TableEmpty colSpan={4 + Math.min(contest.problemIds.length, 12)} message="暂无排行榜数据" />
            ) : (
              participations.map((participation, index) => {
                const isHighlight = index < 3;
                return (
                  <TableRow
                    key={participation.id}
                    row={participation}
                    className={isHighlight ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}
                  >
                    <TableCell className="font-mono font-bold">
                      {isHighlight ? (
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs ${
                            index === 0
                              ? 'bg-yellow-500'
                              : index === 1
                              ? 'bg-gray-400'
                              : 'bg-amber-600'
                          }`}
                        >
                          {participation.rank}
                        </span>
                      ) : (
                        participation.rank
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{participation.username}</TableCell>
                    <TableCell className="font-mono font-bold text-lg text-green-600">
                      {participation.solvedCount}
                    </TableCell>
                    <TableCell className="font-mono text-gray-600">
                      {formatPenalty(participation.penalty)}
                    </TableCell>
                    {contest.problemIds.slice(0, 12).map((problemId) => {
                      const display = getProblemDisplay(participation.problemStatuses[problemId]);
                      return (
                        <TableCell key={problemId} className="text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${display.className}`}
                            >
                              {display.text}
                            </span>
                            {'time' in display && display.time && (
                              <span className="text-xs text-gray-400 mt-0.5">
                                {display.time}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ContestTimeline({ events }: { events: ContestTimelineEvent[] }) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins} 分钟`;
  };

  const eventTypeColors = {
    accept: 'bg-green-500',
    wrong_answer: 'bg-red-500',
    submission: 'bg-blue-500',
  };

  const eventTypeLabels = {
    accept: '通过',
    wrong_answer: '答案错误',
    submission: '提交',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">提交时间线</h2>
      </div>
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            暂无提交记录
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="px-6 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-mono text-gray-500">
                    {formatTime(event.time)}
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full mt-1 ${eventTypeColors[event.type]}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{event.username}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        event.type === 'accept'
                          ? 'bg-green-100 text-green-700'
                          : event.type === 'wrong_answer'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {eventTypeLabels[event.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    题目 {event.problemLetter}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ContestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard' | 'timeline' | 'submissions'>('problems');

  const contestId = id ? parseInt(id, 10) : 0;

  const { data: contest, isLoading: isLoadingContest } = useQuery({
    queryKey: queryKeys.contests.detail(contestId),
    queryFn: () => api.getContest(contestId),
    enabled: !!contestId,
  });

  const { data: problems } = useQuery({
    queryKey: queryKeys.contests.problems(contestId),
    queryFn: () => api.getContestProblems(contestId),
    enabled: !!contestId,
  });

  const { data: leaderboard } = useQuery({
    queryKey: queryKeys.contests.leaderboard(contestId),
    queryFn: () => api.getContestLeaderboard(contestId),
    enabled: !!contestId,
    refetchInterval: (contest?.status === 'running' || contest?.status === 'frozen') ? 5000 : false,
  });

  const { data: timeline } = useQuery({
    queryKey: queryKeys.contests.timeline(contestId),
    queryFn: () => api.getContestTimeline(contestId),
    enabled: !!contestId,
  });

  const registerMutation = useMutation({
    mutationFn: api.registerContest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.contests.detail(contestId) });
      showSuccess('注册成功！');
    },
  });

  const tabs = [
    { id: 'problems' as const, label: '题目' },
    { id: 'leaderboard' as const, label: '排行榜' },
    { id: 'timeline' as const, label: '时间线' },
    { id: 'submissions' as const, label: '提交记录' },
  ];

  if (isLoadingContest || !contest) {
    return (
      <Layout>
        <Loading text="加载中..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/contests')}>
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回竞赛列表
          </Button>
          
          {contest.status === 'upcoming' && (
            <Button onClick={() => registerMutation.mutate(contestId)} isLoading={registerMutation.isPending}>
              注册参加
            </Button>
          )}
        </div>

        <ContestHeader contest={contest} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-1 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'problems' && (
          <ProblemList
            contestId={contestId}
            problems={problems || []}
            participant={leaderboard?.[0]}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard contest={contest} participations={leaderboard || []} />
        )}

        {activeTab === 'timeline' && (
          <ContestTimeline events={timeline || []} />
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">提交记录</h2>
            </div>
            <div className="px-6 py-12 text-center text-gray-500">
              请选择具体题目查看提交记录
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ContestDetailPage;
