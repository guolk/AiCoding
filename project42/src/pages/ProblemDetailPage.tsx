import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty, StatusBadge } from '@/components/Table';
import type { Problem, Language, JudgeStatus, Submission, Solution, Discussion, ProblemTag } from '@/types';

const judgeStatusColors: Record<JudgeStatus, string> = {
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

const judgeStatusLabels: Record<JudgeStatus, string> = {
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

const languageLabels: Record<Language, string> = {
  python: 'Python 3',
  java: 'Java',
  cpp: 'C++',
  go: 'Go',
  rust: 'Rust',
};

const defaultCodeTemplates: Record<Language, string> = {
  python: `# 请在这里编写你的代码
# 示例：A + B Problem
a, b = map(int, input().split())
print(a + b)`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // 示例：A + B Problem
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // 示例：A + B Problem
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    // 示例：A + B Problem
    var a, b int
    fmt.Scan(&a, &b)
    fmt.Println(a + b)
}`,
  rust: `use std::io;

fn main() {
    // 示例：A + B Problem
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let parts: Vec<i32> = input.split_whitespace()
        .map(|s| s.parse().unwrap())
        .collect();
    println!("{}", parts[0] + parts[1]);
}`,
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-orange-100 text-orange-700',
  expert: 'bg-red-100 text-red-700',
};

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
  expert: '专家',
};

function JudgeStatusBadge({ status }: { status: JudgeStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${judgeStatusColors[status]}`}
    >
      {judgeStatusLabels[status]}
    </span>
  );
}

function ProblemStatement({ problem, tags }: { problem: Problem; tags: ProblemTag[] }) {
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\$\$([\s\S]+?)\$\$/g, '<div class="block my-2 text-center">$1</div>')
      .replace(/\$([^$]+?)\$/g, '<span class="inline">$1</span>')
      .replace(/\n/g, '<br>');
  };

  const getTagName = (tagId: number) => {
    return tags.find((t) => t.id === tagId)?.name || tagId.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[problem.difficulty]}`}
              >
                {difficultyLabels[problem.difficulty]}
              </span>
              <span className="text-sm text-gray-500">
                时间限制: {problem.timeLimit}ms | 内存限制: {problem.memoryLimit}MB
              </span>
              {problem.hasSpecialJudge && (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                  Special Judge
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              通过/提交: <span className="font-medium text-gray-900">{problem.solvedCount}/{problem.attemptedCount}</span>
            </div>
            {problem.attemptedCount > 0 && (
              <div className="text-sm text-gray-500">
                通过率: <span className="font-medium text-green-600">
                  {Math.round((problem.solvedCount / problem.attemptedCount) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {problem.tags.map((tagId) => (
              <span
                key={tagId}
                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
              >
                {getTagName(tagId)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">题目描述</h2>
          <div
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.description) }}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">输入格式</h2>
          <div
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.inputFormat) }}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">输出格式</h2>
          <div
            className="text-gray-700 leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.outputFormat) }}
          />
        </section>

        {problem.sampleInput && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">样例输入</h2>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
              {problem.sampleInput}
            </pre>
          </section>
        )}

        {problem.sampleOutput && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">样例输出</h2>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto">
              {problem.sampleOutput}
            </pre>
          </section>
        )}

        {problem.note && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">提示/说明</h2>
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.note) }}
            />
          </section>
        )}
      </div>
    </div>
  );
}

function CodeEditor({
  problem,
  onSubmit,
  isSubmitting,
}: {
  problem: Problem;
  onSubmit: (language: Language, code: string) => void;
  isSubmitting: boolean;
}) {
  const [language, setLanguage] = useState<Language>(problem.languages[0] || 'python');
  const [code, setCode] = useState(defaultCodeTemplates[language]);

  useEffect(() => {
    setCode(defaultCodeTemplates[language]);
  }, [language]);

  const languageOptions = problem.languages.map((lang) => ({
    value: lang,
    label: languageLabels[lang],
  }));

  const handleSubmit = () => {
    if (!code.trim()) {
      return;
    }
    onSubmit(language, code);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">提交代码</h2>
        <div className="flex items-center gap-4">
          <Select
            options={languageOptions}
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-40"
          />
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            提交
          </Button>
        </div>
      </div>
      <div className="p-0">
        <textarea
          className="w-full h-96 p-4 font-mono text-sm border-none focus:ring-0 resize-none bg-gray-50"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="在此输入你的代码..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function SubmissionsTable({ submissions, onViewSubmission }: { submissions: Submission[]; onViewSubmission: (id: number) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">提交记录</h2>
      </div>
      <Table>
        <TableHeader>
          <TableHeaderCell>ID</TableHeaderCell>
          <TableHeaderCell>状态</TableHeaderCell>
          <TableHeaderCell>得分</TableHeaderCell>
          <TableHeaderCell>语言</TableHeaderCell>
          <TableHeaderCell>运行时间</TableHeaderCell>
          <TableHeaderCell>内存</TableHeaderCell>
          <TableHeaderCell>提交时间</TableHeaderCell>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableEmpty colSpan={7} message="暂无提交记录" />
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id} row={submission}>
                <TableCell>
                  <button
                    onClick={() => onViewSubmission(submission.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    #{submission.id}
                  </button>
                </TableCell>
                <TableCell>
                  <JudgeStatusBadge status={submission.status} />
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${submission.status === 'accepted' ? 'text-green-600' : 'text-gray-600'}`}>
                    {submission.score}
                  </span>
                </TableCell>
                <TableCell>{languageLabels[submission.language]}</TableCell>
                <TableCell>
                  {submission.status === 'accepted' || submission.status === 'wrong_answer' ? (
                    <span>{submission.runtime}ms</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {submission.status === 'accepted' || submission.status === 'wrong_answer' ? (
                    <span>{submission.memory}MB</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(submission.submittedAt).toLocaleString('zh-CN')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function SubmissionDetailModal({
  submission,
  isOpen,
  onClose,
}: {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!submission) return null;

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-4 bg-white rounded-xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              提交 #{submission.id}
            </h2>
            <JudgeStatusBadge status={submission.status} />
            <span className="text-sm text-gray-500">
              {languageLabels[submission.language]}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">得分</p>
              <p className="text-2xl font-bold text-gray-900">{submission.score}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">运行时间</p>
              <p className="text-2xl font-bold text-gray-900">{submission.runtime}ms</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">内存</p>
              <p className="text-2xl font-bold text-gray-900">{submission.memory}MB</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">提交时间</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(submission.submittedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          {submission.errorMessage && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">错误信息</h3>
              <pre className="bg-red-50 p-4 rounded-lg text-sm font-mono text-red-700 overflow-x-auto">
                {submission.errorMessage}
              </pre>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">测试用例详情</h3>
            <div className="space-y-2">
              {submission.testCaseResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">
                      测试用例 #{index + 1}
                    </span>
                    <JudgeStatusBadge status={result.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{result.runtime}ms</span>
                    <span>{result.memory}MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">提交代码</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 overflow-x-auto max-h-96 overflow-y-auto">
              {submission.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<'statement' | 'submit' | 'submissions' | 'solutions' | 'discussions'>('statement');
  const [viewingSubmission, setViewingSubmission] = useState<Submission | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);

  const problemId = id ? parseInt(id, 10) : 0;

  const { data: problem, isLoading: isLoadingProblem } = useQuery({
    queryKey: queryKeys.problems.detail(problemId),
    queryFn: () => api.getProblem(problemId),
    enabled: !!problemId,
  });

  const { data: tags } = useQuery({
    queryKey: queryKeys.problemTags.all,
    queryFn: api.getProblemTags,
  });

  const { data: submissionsData } = useQuery({
    queryKey: queryKeys.submissions.list({ problemId }),
    queryFn: () => api.getSubmissions({ problemId, pageSize: 50 }),
    enabled: !!problemId,
  });

  const { data: solutionsData } = useQuery({
    queryKey: queryKeys.solutions.list({ problemId }),
    queryFn: () => api.getSolutions({ problemId }),
    enabled: !!problemId,
  });

  const { data: discussionsData } = useQuery({
    queryKey: queryKeys.discussions.list({ problemId }),
    queryFn: () => api.getDiscussions({ problemId }),
    enabled: !!problemId,
  });

  const submitMutation = useMutation({
    mutationFn: (data: { problemId: number; language: Language; code: string }) =>
      api.submitCode(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.submissions.all });
      showSuccess('提交成功！');
      setActiveTab('submissions');
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (language: Language, code: string) => {
    if (!problemId) return;
    submitMutation.mutate({ problemId, language, code });
  };

  const handleViewSubmission = async (submissionId: number) => {
    try {
      const submission = await api.getSubmission(submissionId);
      setViewingSubmission(submission);
      setIsSubmissionModalOpen(true);
    } catch {
      showError('获取提交详情失败');
    }
  };

  const tabs = [
    { id: 'statement' as const, label: '题目' },
    { id: 'submit' as const, label: '提交' },
    { id: 'submissions' as const, label: '提交记录' },
    { id: 'solutions' as const, label: '题解' },
    { id: 'discussions' as const, label: '讨论' },
  ];

  if (isLoadingProblem || !problem) {
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
          <Button variant="ghost" onClick={() => navigate('/problems')}>
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回题目列表
          </Button>
        </div>

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
                  {tab.id === 'submissions' && submissionsData && submissionsData.total > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {submissionsData.total}
                    </span>
                  )}
                  {tab.id === 'solutions' && solutionsData && solutionsData.total > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {solutionsData.total}
                    </span>
                  )}
                  {tab.id === 'discussions' && discussionsData && discussionsData.total > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {discussionsData.total}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'statement' && (
          <ProblemStatement problem={problem} tags={tags || []} />
        )}

        {activeTab === 'submit' && (
          <CodeEditor
            problem={problem}
            onSubmit={handleSubmit}
            isSubmitting={submitMutation.isPending}
          />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsTable
            submissions={submissionsData?.items || []}
            onViewSubmission={handleViewSubmission}
          />
        )}

        {activeTab === 'solutions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">题解</h2>
              <Link to={`/problems/${problemId}/solutions/new`}>
                <Button variant="secondary">发布题解</Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {!solutionsData || solutionsData.items.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  暂无题解，快来发布第一篇题解吧！
                </div>
              ) : (
                solutionsData.items.map((solution) => (
                  <div key={solution.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link to={`/solutions/${solution.id}`}>
                          <h3 className="text-base font-medium text-indigo-600 hover:text-indigo-800">
                            {solution.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          由 {solution.username} 发布于{' '}
                          {new Date(solution.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {solution.votes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">讨论</h2>
              <Link to={`/problems/${problemId}/discussions/new`}>
                <Button variant="secondary">发起讨论</Button>
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {!discussionsData || discussionsData.items.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  暂无讨论，快来发起第一篇讨论吧！
                </div>
              ) : (
                discussionsData.items.map((discussion) => (
                  <div key={discussion.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link to={`/discussions/${discussion.id}`}>
                          <h3 className="text-base font-medium text-indigo-600 hover:text-indigo-800">
                            {discussion.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {discussion.content}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          {discussion.username} ·{' '}
                          {new Date(discussion.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {discussion.replyCount}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {discussion.votes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <SubmissionDetailModal
        submission={viewingSubmission}
        isOpen={isSubmissionModalOpen}
        onClose={() => {
          setIsSubmissionModalOpen(false);
          setViewingSubmission(null);
        }}
      />
    </Layout>
  );
}

export default ProblemDetailPage;
