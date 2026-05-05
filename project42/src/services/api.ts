import type {
  User,
  Role,
  Permission,
  Activity,
  DashboardStats,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  SystemSettings,
  Problem,
  Contest,
  Submission,
  Solution,
  Discussion,
  ProblemTag,
  ContestParticipation,
  ContestTimelineEvent,
  ProblemContestStatus,
  UserRating,
  ModerationCase,
  PaginatedProblemsParams,
  PaginatedContestsParams,
  PaginatedSubmissionsParams,
  CreateProblemRequest,
  UpdateProblemRequest,
  SubmitCodeRequest,
  CreateSolutionRequest,
  CreateDiscussionRequest,
  ModerationActionRequest,
  RegisterContestRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/types';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

const mockData = {
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', roleId: 1, status: 'active' as const, phone: '13800138000', address: '北京市朝阳区', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T10:30:00Z' },
    { id: 2, username: 'editor', email: 'editor@example.com', password: 'editor123', roleId: 2, status: 'active' as const, phone: '13800138001', address: '上海市浦东新区', createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-02-20T14:20:00Z' },
    { id: 3, username: 'user1', email: 'user1@example.com', password: 'user123', roleId: 3, status: 'active' as const, phone: '13800138002', address: '广州市天河区', createdAt: '2024-03-05T11:00:00Z', updatedAt: '2024-03-10T16:45:00Z' },
    { id: 4, username: 'user2', email: 'user2@example.com', password: 'user123', roleId: 3, status: 'inactive' as const, phone: '13800138003', address: '深圳市南山区', createdAt: '2024-03-15T13:00:00Z', updatedAt: '2024-03-18T09:30:00Z' },
    { id: 5, username: 'user3', email: 'user3@example.com', password: 'user123', roleId: 2, status: 'pending' as const, phone: '13800138004', address: '杭州市西湖区', createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-04-05T11:15:00Z' },
    { id: 6, username: 'user4', email: 'user4@example.com', password: 'user123', roleId: 3, status: 'active' as const, phone: '13800138005', address: '南京市鼓楼区', createdAt: '2024-04-10T10:30:00Z', updatedAt: '2024-04-12T15:00:00Z' },
    { id: 7, username: 'user5', email: 'user5@example.com', password: 'user123', roleId: 2, status: 'active' as const, phone: '13800138006', address: '成都市武侯区', createdAt: '2024-04-15T14:00:00Z', updatedAt: '2024-04-18T09:20:00Z' },
    { id: 8, username: 'user6', email: 'user6@example.com', password: 'user123', roleId: 3, status: 'inactive' as const, phone: '13800138007', address: '武汉市江汉区', createdAt: '2024-04-20T16:00:00Z', updatedAt: '2024-04-22T13:30:00Z' },
  ],
  roles: [
    { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', userCount: 1, status: 'active' as const, permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: '内容编辑', code: 'editor', description: '可以管理内容和用户', userCount: 2, status: 'active' as const, permissions: [3, 4, 5, 6, 7, 8], createdAt: '2024-01-01T00:00:00Z' },
    { id: 3, name: '普通用户', code: 'user', description: '只能查看自己的信息', userCount: 5, status: 'active' as const, permissions: [9, 10], createdAt: '2024-01-01T00:00:00Z' },
    { id: 4, name: '访客', code: 'guest', description: '只读访问', userCount: 0, status: 'inactive' as const, permissions: [], createdAt: '2024-02-01T00:00:00Z' },
  ],
  permissions: [
    { id: 1, name: '用户管理-查看', code: 'user:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 2, name: '用户管理-创建', code: 'user:create', type: 'action' as const, parentId: 1, status: 'active' as const },
    { id: 3, name: '用户管理-编辑', code: 'user:edit', type: 'action' as const, parentId: 1, status: 'active' as const },
    { id: 4, name: '用户管理-删除', code: 'user:delete', type: 'action' as const, parentId: 1, status: 'active' as const },
    { id: 5, name: '角色管理-查看', code: 'role:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 6, name: '角色管理-创建', code: 'role:create', type: 'action' as const, parentId: 5, status: 'active' as const },
    { id: 7, name: '角色管理-编辑', code: 'role:edit', type: 'action' as const, parentId: 5, status: 'active' as const },
    { id: 8, name: '角色管理-删除', code: 'role:delete', type: 'action' as const, parentId: 5, status: 'active' as const },
    { id: 9, name: '个人信息-查看', code: 'profile:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 10, name: '个人信息-编辑', code: 'profile:edit', type: 'action' as const, parentId: 9, status: 'active' as const },
    { id: 11, name: '系统设置-查看', code: 'settings:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 12, name: '系统设置-编辑', code: 'settings:edit', type: 'action' as const, parentId: 11, status: 'active' as const },
  ],
  activities: [
    { id: 1, action: '用户登录', user: 'admin', time: '2024-04-30 10:30:00', status: 'success' as const },
    { id: 2, action: '创建用户 user1', user: 'admin', time: '2024-04-30 09:15:00', status: 'success' as const },
    { id: 3, action: '修改角色权限', user: 'admin', time: '2024-04-29 16:45:00', status: 'success' as const },
    { id: 4, action: '删除用户 user2', user: 'admin', time: '2024-04-29 14:20:00', status: 'success' as const },
    { id: 5, action: '用户登录失败', user: 'unknown', time: '2024-04-29 12:00:00', status: 'failed' as const },
  ],
  settings: {
    siteName: '用户管理系统',
    siteDescription: '这是一个功能强大的用户管理系统',
    defaultLanguage: 'zh-CN' as const,
    defaultTheme: 'light' as const,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireMFA: false,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'admin@example.com',
    smtpPassword: '',
    notifyUserCreated: true,
    notifyUserUpdated: false,
    notifyUserDeleted: true,
    notifySystemError: true,
  },
  problemTags: [
    { id: 1, name: '动态规划', code: 'dp', color: '#3b82f6' },
    { id: 2, name: '贪心算法', code: 'greedy', color: '#10b981' },
    { id: 3, name: '图论', code: 'graph', color: '#f59e0b' },
    { id: 4, name: '二分查找', code: 'binary-search', color: '#ef4444' },
    { id: 5, name: '数学', code: 'math', color: '#8b5cf6' },
    { id: 6, name: '字符串', code: 'string', color: '#ec4899' },
    { id: 7, name: '数组', code: 'array', color: '#06b6d4' },
    { id: 8, name: '树', code: 'tree', color: '#84cc16' },
    { id: 9, name: '深度优先搜索', code: 'dfs', color: '#f97316' },
    { id: 10, name: '广度优先搜索', code: 'bfs', color: '#0ea5e9' },
  ],
  problems: [
    {
      id: 1,
      title: 'A + B Problem',
      description: '计算两个整数 $a$ 和 $b$ 的和，其中 $-10^9 \\leq a, b \\leq 10^9$。\n\n这是一道经典的入门题目，用于测试你的编程环境是否配置正确。',
      inputFormat: '输入包含两个整数 $a$ 和 $b$，用空格分隔。',
      outputFormat: '输出一个整数，表示 $a + b$ 的结果。',
      sampleInput: '3 5',
      sampleOutput: '8',
      note: '注意数据范围，使用合适的数据类型。',
      difficulty: 'easy' as const,
      status: 'published' as const,
      tags: [7, 5],
      testCases: [
        { id: 1, problemId: 1, input: '3 5', output: '8', isSample: true, score: 10, order: 1 },
        { id: 2, problemId: 1, input: '-10 20', output: '10', isSample: false, score: 10, order: 2 },
        { id: 3, problemId: 1, input: '1000000000 1000000000', output: '2000000000', isSample: false, score: 10, order: 3 },
      ],
      hasSpecialJudge: false,
      languages: ['python', 'java', 'cpp', 'go', 'rust'] as const,
      languageConfigs: [
        { language: 'python' as const, timeLimit: 2000, memoryLimit: 256, runCommand: 'python3 solution.py' },
        { language: 'java' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'javac Solution.java', runCommand: 'java Solution' },
        { language: 'cpp' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'g++ -o solution solution.cpp -std=c++17', runCommand: './solution' },
        { language: 'go' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'go build -o solution solution.go', runCommand: './solution' },
        { language: 'rust' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'rustc -o solution solution.rs', runCommand: './solution' },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solvedCount: 156,
      attemptedCount: 203,
      authorId: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      title: '最长递增子序列',
      description: '给定一个整数数组 $nums$，找到其中最长严格递增子序列的长度。\n\n子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，$[3,6,2,7]$ 是数组 $[0,3,1,6,2,2,7]$ 的子序列。',
      inputFormat: '第一行一个整数 $n$，表示数组长度。\n第二行 $n$ 个整数，表示数组 $nums$。\n\n$1 \\leq n \\leq 2500$\n$-10^4 \\leq nums[i] \\leq 10^4$',
      outputFormat: '输出一个整数，表示最长递增子序列的长度。',
      sampleInput: '8\n10 9 2 5 3 7 101 18',
      sampleOutput: '4',
      note: '最长递增子序列是 $[2,3,7,101]$，因此长度为 4。\n\n请尝试使用动态规划或二分查找来解决。',
      difficulty: 'medium' as const,
      status: 'published' as const,
      tags: [1, 4, 7],
      testCases: [
        { id: 4, problemId: 2, input: '8\n10 9 2 5 3 7 101 18', output: '4', isSample: true, score: 20, order: 1 },
        { id: 5, problemId: 2, input: '1\n5', output: '1', isSample: false, score: 20, order: 2 },
        { id: 6, problemId: 2, input: '6\n7 7 7 7 7 7', output: '1', isSample: false, score: 20, order: 3 },
        { id: 7, problemId: 2, input: '5\n1 2 3 4 5', output: '5', isSample: false, score: 20, order: 4 },
        { id: 8, problemId: 2, input: '5\n5 4 3 2 1', output: '1', isSample: false, score: 20, order: 5 },
      ],
      hasSpecialJudge: false,
      languages: ['python', 'java', 'cpp', 'go', 'rust'] as const,
      languageConfigs: [
        { language: 'python' as const, timeLimit: 3000, memoryLimit: 256, runCommand: 'python3 solution.py' },
        { language: 'java' as const, timeLimit: 2000, memoryLimit: 256, compileCommand: 'javac Solution.java', runCommand: 'java Solution' },
        { language: 'cpp' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'g++ -o solution solution.cpp -std=c++17', runCommand: './solution' },
        { language: 'go' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'go build -o solution solution.go', runCommand: './solution' },
        { language: 'rust' as const, timeLimit: 1000, memoryLimit: 256, compileCommand: 'rustc -o solution solution.rs', runCommand: './solution' },
      ],
      timeLimit: 1000,
      memoryLimit: 256,
      solvedCount: 89,
      attemptedCount: 145,
      authorId: 1,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-10T10:30:00Z',
    },
    {
      id: 3,
      title: '网络最大流',
      description: '给定一个有向图，图中包含源点 $s$ 和汇点 $t$，每条边都有一个容量限制。请计算从 $s$ 到 $t$ 的最大流。\n\n使用 Dinic 算法可以在 $O(E \\sqrt{V})$ 的时间复杂度内解决这个问题。',
      inputFormat: '第一行四个整数 $n, m, s, t$，分别表示点数、边数、源点和汇点。\n接下来 $m$ 行，每行三个整数 $u, v, c$，表示一条从 $u$ 到 $v$ 容量为 $c$ 的有向边。\n\n$2 \\leq n \\leq 100$\n$1 \\leq m \\leq 1000$\n$1 \\leq c \\leq 10^9$',
      outputFormat: '输出一个整数，表示从 $s$ 到 $t$ 的最大流。',
      sampleInput: '4 5 1 4\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3',
      sampleOutput: '5',
      note: '最大流路径：\n$1 \\rightarrow 2 \\rightarrow 4$，流量为 2\n$1 \\rightarrow 3 \\rightarrow 4$，流量为 2\n$1 \\rightarrow 2 \\rightarrow 3 \\rightarrow 4$，流量为 1\n总流量为 5。',
      difficulty: 'hard' as const,
      status: 'published' as const,
      tags: [3, 9, 10],
      testCases: [
        { id: 9, problemId: 3, input: '4 5 1 4\n1 2 3\n1 3 2\n2 3 1\n2 4 2\n3 4 3', output: '5', isSample: true, score: 25, order: 1 },
        { id: 10, problemId: 3, input: '2 1 1 2\n1 2 100', output: '100', isSample: false, score: 25, order: 2 },
        { id: 11, problemId: 3, input: '3 3 1 3\n1 2 5\n2 3 3\n1 3 2', output: '5', isSample: false, score: 25, order: 3 },
        { id: 12, problemId: 3, input: '5 7 1 5\n1 2 10\n1 3 5\n2 3 15\n2 4 5\n3 5 10\n4 5 10\n3 4 5', output: '15', isSample: false, score: 25, order: 4 },
      ],
      hasSpecialJudge: false,
      languages: ['python', 'java', 'cpp', 'go', 'rust'] as const,
      languageConfigs: [
        { language: 'python' as const, timeLimit: 5000, memoryLimit: 512, runCommand: 'python3 solution.py' },
        { language: 'java' as const, timeLimit: 3000, memoryLimit: 512, compileCommand: 'javac Solution.java', runCommand: 'java Solution' },
        { language: 'cpp' as const, timeLimit: 2000, memoryLimit: 512, compileCommand: 'g++ -o solution solution.cpp -std=c++17', runCommand: './solution' },
        { language: 'go' as const, timeLimit: 2000, memoryLimit: 512, compileCommand: 'go build -o solution solution.go', runCommand: './solution' },
        { language: 'rust' as const, timeLimit: 2000, memoryLimit: 512, compileCommand: 'rustc -o solution solution.rs', runCommand: './solution' },
      ],
      timeLimit: 2000,
      memoryLimit: 512,
      solvedCount: 34,
      attemptedCount: 87,
      authorId: 1,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-15T10:30:00Z',
    },
    {
      id: 4,
      title: '四色问题',
      description: '四色定理是指：任何一张地图只用四种颜色就能使具有共同边界的国家着上不同的颜色。\n\n给定一个平面图的邻接矩阵，请判断该图是否可以用不超过 4 种颜色着色。',
      inputFormat: '第一行一个整数 $n$，表示图的顶点数。\n接下来 $n$ 行，每行 $n$ 个整数 $0$ 或 $1$，表示邻接矩阵。\n\n$1 \\leq n \\leq 50$',
      outputFormat: '如果可以用不超过 4 种颜色着色，输出 YES，否则输出 NO。\n如果输出 YES，请在下一行输出一种可行的着色方案，用空格分隔的 $n$ 个整数表示每个顶点的颜色（颜色编号从 1 到 4）。',
      sampleInput: '4\n0 1 1 1\n1 0 1 0\n1 1 0 1\n1 0 1 0',
      sampleOutput: 'YES\n1 2 3 2',
      note: '这是一道 Special Judge 题目，答案可能不唯一。\n\n本题需要你实现一个回溯或启发式搜索算法来找到可行的着色方案。',
      difficulty: 'expert' as const,
      status: 'published' as const,
      tags: [3, 9, 5],
      testCases: [
        { id: 13, problemId: 4, input: '4\n0 1 1 1\n1 0 1 0\n1 1 0 1\n1 0 1 0', output: 'YES', isSample: true, score: 30, order: 1 },
        { id: 14, problemId: 4, input: '3\n0 1 1\n1 0 1\n1 1 0', output: 'YES', isSample: false, score: 35, order: 2 },
        { id: 15, problemId: 4, input: '1\n0', output: 'YES', isSample: false, score: 35, order: 3 },
      ],
      hasSpecialJudge: true,
      specialJudgeCode: 'def check_solution(input_data, output_data, expected_data):\n    lines = output_data.strip().split("\\n")\n    if not lines:\n        return False, "Empty output"\n    \n    first_line = lines[0].strip().upper()\n    if first_line != "YES":\n        return first_line == "NO", ""\n    \n    if len(lines) < 2:\n        return False, "Missing coloring"\n    \n    colors = list(map(int, lines[1].strip().split()))\n    \n    n = len(colors)\n    if any(c < 1 or c > 4 for c in colors):\n        return False, "Invalid color"\n    \n    input_lines = input_data.strip().split("\\n")\n    adj_matrix = []\n    for i in range(1, n + 1):\n        adj_matrix.append(list(map(int, input_lines[i].strip().split())))\n    \n    for i in range(n):\n        for j in range(n):\n            if adj_matrix[i][j] == 1 and colors[i] == colors[j]:\n                return False, f"Adjacent vertices {i+1} and {j+1} have same color"\n    \n    return True, "Correct"',
      languages: ['python', 'java', 'cpp', 'go', 'rust'] as const,
      languageConfigs: [
        { language: 'python' as const, timeLimit: 10000, memoryLimit: 512, runCommand: 'python3 solution.py' },
        { language: 'java' as const, timeLimit: 5000, memoryLimit: 512, compileCommand: 'javac Solution.java', runCommand: 'java Solution' },
        { language: 'cpp' as const, timeLimit: 3000, memoryLimit: 512, compileCommand: 'g++ -o solution solution.cpp -std=c++17', runCommand: './solution' },
        { language: 'go' as const, timeLimit: 3000, memoryLimit: 512, compileCommand: 'go build -o solution solution.go', runCommand: './solution' },
        { language: 'rust' as const, timeLimit: 3000, memoryLimit: 512, compileCommand: 'rustc -o solution solution.rs', runCommand: './solution' },
      ],
      timeLimit: 3000,
      memoryLimit: 512,
      solvedCount: 12,
      attemptedCount: 45,
      authorId: 1,
      createdAt: '2024-04-01T00:00:00Z',
      updatedAt: '2024-04-20T10:30:00Z',
    },
  ],
  contests: [
    {
      id: 1,
      title: '2024 春季编程挑战赛 - 第一场',
      description: '这是一场编程竞赛，包含 4 道题目，难度从易到难。\n\n比赛时间：2 小时\n\n计分规则：ICPC 赛制',
      type: 'contest' as const,
      scoringSystem: 'icpc' as const,
      status: 'ended' as const,
      startTime: '2024-04-01T19:00:00Z',
      endTime: '2024-04-01T21:00:00Z',
      freezeTime: '2024-04-01T20:00:00Z',
      unfreezeTime: '2024-04-01T21:00:00Z',
      problemIds: [1, 2, 3, 4],
      participantCount: 45,
      isPublic: true,
      authorId: 1,
      createdAt: '2024-03-15T00:00:00Z',
      updatedAt: '2024-04-01T21:00:00Z',
    },
    {
      id: 2,
      title: '算法练习赛 - OI 赛制',
      description: '这是一场算法练习赛，包含 3 道题目。\n\n比赛时间：3 小时\n\n计分规则：OI 赛制（按测试点得分）',
      type: 'contest' as const,
      scoringSystem: 'oi' as const,
      status: 'running' as const,
      startTime: '2024-04-20T19:00:00Z',
      endTime: '2024-04-20T22:00:00Z',
      problemIds: [1, 2, 3],
      participantCount: 23,
      isPublic: true,
      authorId: 1,
      createdAt: '2024-04-10T00:00:00Z',
      updatedAt: '2024-04-20T19:00:00Z',
    },
    {
      id: 3,
      title: '入门题目练习场',
      description: '这是一个持续开放的练习场，包含各种难度的入门题目。\n\n你可以随时提交代码，没有时间限制。',
      type: 'practice' as const,
      scoringSystem: 'oi' as const,
      status: 'running' as const,
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2099-12-31T23:59:59Z',
      problemIds: [1, 2],
      participantCount: 156,
      isPublic: true,
      authorId: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  submissions: [
    {
      id: 1,
      problemId: 1,
      contestId: 1,
      userId: 3,
      username: 'user1',
      language: 'python' as const,
      code: 'a, b = map(int, input().split())\nprint(a + b)',
      status: 'accepted' as const,
      score: 100,
      runtime: 45,
      memory: 8,
      testCaseResults: [
        { testCaseId: 1, status: 'accepted' as const, runtime: 12, memory: 8 },
        { testCaseId: 2, status: 'accepted' as const, runtime: 15, memory: 8 },
        { testCaseId: 3, status: 'accepted' as const, runtime: 18, memory: 8 },
      ],
      submittedAt: '2024-04-01T19:05:30Z',
    },
    {
      id: 2,
      problemId: 1,
      contestId: 1,
      userId: 4,
      username: 'user2',
      language: 'cpp' as const,
      code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}',
      status: 'accepted' as const,
      score: 100,
      runtime: 15,
      memory: 4,
      testCaseResults: [
        { testCaseId: 1, status: 'accepted' as const, runtime: 3, memory: 4 },
        { testCaseId: 2, status: 'accepted' as const, runtime: 4, memory: 4 },
        { testCaseId: 3, status: 'accepted' as const, runtime: 8, memory: 4 },
      ],
      submittedAt: '2024-04-01T19:03:15Z',
    },
    {
      id: 3,
      problemId: 2,
      contestId: 1,
      userId: 3,
      username: 'user1',
      language: 'python' as const,
      code: 'def lengthOfLIS(nums):\n    dp = [1] * len(nums)\n    for i in range(len(nums)):\n        for j in range(i):\n            if nums[i] > nums[j]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)\n\nn = int(input())\nnums = list(map(int, input().split()))\nprint(lengthOfLIS(nums))',
      status: 'accepted' as const,
      score: 100,
      runtime: 120,
      memory: 16,
      testCaseResults: [
        { testCaseId: 4, status: 'accepted' as const, runtime: 30, memory: 16 },
        { testCaseId: 5, status: 'accepted' as const, runtime: 20, memory: 16 },
        { testCaseId: 6, status: 'accepted' as const, runtime: 25, memory: 16 },
        { testCaseId: 7, status: 'accepted' as const, runtime: 22, memory: 16 },
        { testCaseId: 8, status: 'accepted' as const, runtime: 23, memory: 16 },
      ],
      submittedAt: '2024-04-01T19:25:45Z',
    },
    {
      id: 4,
      problemId: 1,
      contestId: 1,
      userId: 5,
      username: 'user3',
      language: 'java' as const,
      code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}',
      status: 'wrong_answer' as const,
      score: 33,
      runtime: 80,
      memory: 32,
      testCaseResults: [
        { testCaseId: 1, status: 'accepted' as const, runtime: 20, memory: 32 },
        { testCaseId: 2, status: 'accepted' as const, runtime: 25, memory: 32 },
        { testCaseId: 3, status: 'wrong_answer' as const, runtime: 35, memory: 32, errorMessage: 'Output: 2147483647, Expected: 2000000000' },
      ],
      submittedAt: '2024-04-01T19:10:20Z',
    },
    {
      id: 5,
      problemId: 2,
      contestId: 3,
      userId: 6,
      username: 'user4',
      language: 'go' as const,
      code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    var n int\n    fmt.Scan(&n)\n    nums := make([]int, n)\n    for i := 0; i < n; i++ {\n        fmt.Scan(&nums[i])\n    }\n    \n    dp := make([]int, n)\n    for i := range dp {\n        dp[i] = 1\n    }\n    \n    maxLen := 1\n    for i := 1; i < n; i++ {\n        for j := 0; j < i; j++ {\n            if nums[i] > nums[j] && dp[j]+1 > dp[i] {\n                dp[i] = dp[j] + 1\n                if dp[i] > maxLen {\n                    maxLen = dp[i]\n                }\n            }\n        }\n    }\n    \n    fmt.Println(maxLen)\n}',
      status: 'accepted' as const,
      score: 100,
      runtime: 8,
      memory: 2,
      testCaseResults: [
        { testCaseId: 4, status: 'accepted' as const, runtime: 2, memory: 2 },
        { testCaseId: 5, status: 'accepted' as const, runtime: 1, memory: 2 },
        { testCaseId: 6, status: 'accepted' as const, runtime: 1, memory: 2 },
        { testCaseId: 7, status: 'accepted' as const, runtime: 2, memory: 2 },
        { testCaseId: 8, status: 'accepted' as const, runtime: 2, memory: 2 },
      ],
      submittedAt: '2024-04-15T14:30:00Z',
    },
  ],
  contestParticipations: [
    {
      id: 1,
      contestId: 1,
      userId: 3,
      username: 'user1',
      rank: 1,
      score: 2,
      penalty: 36,
      solvedCount: 2,
      problemStatuses: {
        1: { problemId: 1, solved: true, firstACTime: 5, wrongAttempts: 0, lastSubmissionId: 1 },
        2: { problemId: 2, solved: true, firstACTime: 25, wrongAttempts: 0, lastSubmissionId: 3 },
        3: { problemId: 3, solved: false, wrongAttempts: 2 },
        4: { problemId: 4, solved: false, wrongAttempts: 1 },
      },
      ratingChange: 45,
      registeredAt: '2024-03-20T10:00:00Z',
    },
    {
      id: 2,
      contestId: 1,
      userId: 4,
      username: 'user2',
      rank: 2,
      score: 1,
      penalty: 3,
      solvedCount: 1,
      problemStatuses: {
        1: { problemId: 1, solved: true, firstACTime: 3, wrongAttempts: 0, lastSubmissionId: 2 },
        2: { problemId: 2, solved: false, wrongAttempts: 3 },
        3: { problemId: 3, solved: false, wrongAttempts: 0 },
        4: { problemId: 4, solved: false, wrongAttempts: 0 },
      },
      ratingChange: 23,
      registeredAt: '2024-03-20T11:00:00Z',
    },
    {
      id: 3,
      contestId: 1,
      userId: 5,
      username: 'user3',
      rank: 10,
      score: 0,
      penalty: 0,
      solvedCount: 0,
      problemStatuses: {
        1: { problemId: 1, solved: false, wrongAttempts: 2, lastSubmissionId: 4 },
        2: { problemId: 2, solved: false, wrongAttempts: 1 },
        3: { problemId: 3, solved: false, wrongAttempts: 0 },
        4: { problemId: 4, solved: false, wrongAttempts: 0 },
      },
      ratingChange: -15,
      registeredAt: '2024-03-21T09:00:00Z',
    },
  ],
  contestTimeline: [
    { id: 1, contestId: 1, userId: 4, username: 'user2', problemId: 1, problemLetter: 'A', type: 'accept' as const, time: 3, submissionId: 2 },
    { id: 2, contestId: 1, userId: 3, username: 'user1', problemId: 1, problemLetter: 'A', type: 'accept' as const, time: 5, submissionId: 1 },
    { id: 3, contestId: 1, userId: 5, username: 'user3', problemId: 1, problemLetter: 'A', type: 'wrong_answer' as const, time: 10, submissionId: 4 },
    { id: 4, contestId: 1, userId: 3, username: 'user1', problemId: 2, problemLetter: 'B', type: 'accept' as const, time: 25, submissionId: 3 },
  ],
  solutions: [
    {
      id: 1,
      problemId: 2,
      userId: 3,
      username: 'user1',
      title: '动态规划解法 O(n²)',
      content: '## 思路分析\n\n这道题目是经典的最长递增子序列问题，可以使用动态规划来解决。\n\n### 动态规划定义\n\n定义 `dp[i]` 表示以第 `i` 个元素结尾的最长递增子序列的长度。\n\n### 转移方程\n\n$$dp[i] = \\max(dp[j] + 1) \\quad \\text{其中} \\quad 0 \\leq j < i \\quad \\text{且} \\quad nums[i] > nums[j]$$\n\n### 初始状态\n\n每个元素本身就是一个长度为 1 的子序列，所以 `dp[i] = 1`。\n\n### 答案\n\n答案是 `dp` 数组中的最大值。\n\n## 复杂度分析\n\n- 时间复杂度：$O(n^2)$\n- 空间复杂度：$O(n)$\n\n## 代码实现',
      language: 'python' as const,
      code: 'def lengthOfLIS(nums):\n    dp = [1] * len(nums)\n    for i in range(len(nums)):\n        for j in range(i):\n            if nums[i] > nums[j]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)',
      votes: 12,
      isAccepted: true,
      createdAt: '2024-04-02T10:00:00Z',
      updatedAt: '2024-04-02T10:00:00Z',
    },
    {
      id: 2,
      problemId: 2,
      userId: 6,
      username: 'user4',
      title: '二分查找优化 O(n log n)',
      content: '## 优化思路\n\n动态规划的时间复杂度是 $O(n^2)$，对于 $n=2500$ 来说可以通过，但我们可以使用二分查找将时间复杂度优化到 $O(n \\log n)$。\n\n### 核心思想\n\n维护一个数组 `tails`，其中 `tails[i]` 表示长度为 `i+1` 的递增子序列的最小结尾元素。\n\n### 算法步骤\n\n1. 遍历数组中的每个元素\n2. 对于当前元素，如果它大于 `tails` 的最后一个元素，则添加到 `tails` 末尾\n3. 否则，找到 `tails` 中第一个大于等于当前元素的位置，替换它\n4. 最终 `tails` 的长度就是最长递增子序列的长度\n\n## 复杂度分析\n\n- 时间复杂度：$O(n \\log n)$\n- 空间复杂度：$O(n)$',
      language: 'python' as const,
      code: 'import bisect\n\ndef lengthOfLIS(nums):\n    tails = []\n    for num in nums:\n        idx = bisect.bisect_left(tails, num)\n        if idx == len(tails):\n            tails.append(num)\n        else:\n            tails[idx] = num\n    return len(tails)',
      votes: 25,
      isAccepted: true,
      createdAt: '2024-04-05T14:30:00Z',
      updatedAt: '2024-04-05T14:30:00Z',
    },
  ],
  discussions: [
    {
      id: 1,
      problemId: 2,
      userId: 7,
      username: 'user5',
      title: '为什么使用 bisect_left 而不是 bisect_right？',
      content: '在二分查找优化的解法中，为什么要使用 `bisect_left` 而不是 `bisect_right`？\n\n我试了一下用 `bisect_right`，结果好像也是对的？有人能解释一下区别吗？',
      votes: 8,
      replyCount: 3,
      createdAt: '2024-04-10T09:15:00Z',
      updatedAt: '2024-04-10T09:15:00Z',
    },
    {
      id: 2,
      problemId: 2,
      userId: 6,
      username: 'user4',
      title: '回复：为什么使用 bisect_left',
      content: '`bisect_left` 和 `bisect_right` 的区别在于处理相等元素的位置。\n\n- `bisect_left` 返回第一个大于等于目标值的位置\n- `bisect_right` 返回第一个大于目标值的位置\n\n对于严格递增子序列，我们需要替换第一个大于等于当前元素的值，这样才能保证后续的元素有更大的机会形成更长的子序列。\n\n如果是非严格递增（允许相等），则使用 `bisect_right`。',
      parentId: 1,
      votes: 15,
      replyCount: 0,
      createdAt: '2024-04-10T10:30:00Z',
      updatedAt: '2024-04-10T10:30:00Z',
    },
    {
      id: 3,
      contestId: 1,
      userId: 3,
      username: 'user1',
      title: 'D题四色问题有什么好的启发式搜索策略吗？',
      content: '我在比赛中用了普通的回溯，但是对于 n=50 的数据会超时。\n\n有人知道有什么好的启发式搜索策略或者剪枝技巧吗？\n\n我听说可以用贪心算法按度数从高到低着色，但不太清楚具体怎么实现。',
      votes: 5,
      replyCount: 2,
      createdAt: '2024-04-02T16:00:00Z',
      updatedAt: '2024-04-02T16:00:00Z',
    },
  ],
  userRatings: [
    { id: 1, userId: 3, contestId: 1, contestTitle: '2024 春季编程挑战赛 - 第一场', rating: 1645, previousRating: 1600, change: 45, rank: 1, participants: 45, createdAt: '2024-04-01T21:00:00Z' },
    { id: 2, userId: 4, contestId: 1, contestTitle: '2024 春季编程挑战赛 - 第一场', rating: 1523, previousRating: 1500, change: 23, rank: 2, participants: 45, createdAt: '2024-04-01T21:00:00Z' },
    { id: 3, userId: 5, contestId: 1, contestTitle: '2024 春季编程挑战赛 - 第一场', rating: 1485, previousRating: 1500, change: -15, rank: 10, participants: 45, createdAt: '2024-04-01T21:00:00Z' },
  ],
  moderationCases: [
    {
      id: 1,
      type: 'plagiarism' as const,
      submissionId: 1,
      userId: 3,
      reporterId: 1,
      status: 'resolved' as const,
      evidence: '代码与 submission #5 相似度 95%',
      action: '警告',
      moderatorId: 1,
      createdAt: '2024-04-02T08:00:00Z',
      resolvedAt: '2024-04-02T09:30:00Z',
    },
    {
      id: 2,
      type: 'inappropriate_content' as const,
      discussionId: 1,
      userId: 7,
      status: 'pending' as const,
      createdAt: '2024-04-15T14:00:00Z',
    },
  ],
  nextProblemId: 5,
  nextContestId: 4,
  nextSubmissionId: 6,
  nextSolutionId: 3,
  nextDiscussionId: 4,
  nextRatingId: 4,
  nextModerationId: 3,
  nextActivityId: 6,
  nextUserId: 9,
  nextRoleId: 5,
  nextPermissionId: 13,
};

interface MockData {
  users: any[];
  roles: any[];
  permissions: any[];
  activities: any[];
  settings: any;
  problemTags: any[];
  problems: any[];
  contests: any[];
  submissions: any[];
  solutions: any[];
  discussions: any[];
  userRatings: any[];
  moderationCases: any[];
  contestParticipations: any[];
  contestTimeline: any[];
  nextProblemId: number;
  nextContestId: number;
  nextSubmissionId: number;
  nextSolutionId: number;
  nextDiscussionId: number;
  nextRatingId: number;
  nextModerationId: number;
  nextActivityId: number;
  nextUserId: number;
  nextRoleId: number;
  nextPermissionId: number;
}

let mutableMockData = JSON.parse(JSON.stringify(mockData)) as MockData;

const getToken = (): string | null => {
  return sessionStorage.getItem('token');
};

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getPermissionsByRoleId = (roleId: number): Permission[] => {
  const role = mutableMockData.roles.find((r) => r.id === roleId);
  if (!role) return [];
  return mutableMockData.permissions.filter((p) => role.permissions.includes(p.id));
};

const addActivity = (action: string) => {
  const auth = sessionStorage.getItem('auth');
  let username = 'system';
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      username = parsed.user?.username || 'system';
    } catch {
      username = 'system';
    }
  }

  mutableMockData.activities.unshift({
    id: mutableMockData.nextActivityId++,
    action,
    user: username,
    time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    status: 'success',
  });

  if (mutableMockData.activities.length > 50) {
    mutableMockData.activities = mutableMockData.activities.slice(0, 50);
  }
};

const mockApiCall = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: unknown
): Promise<T> => {
  await delay(300);

  if (url === `${API_BASE_URL}/auth/login` && method === 'POST') {
    const { username, password } = data as LoginRequest;
    const user = mutableMockData.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const role = mutableMockData.roles.find((r) => r.id === user.roleId);
      const permissions = getPermissionsByRoleId(user.roleId);

      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          ...user,
          role: role!,
          permissions,
        },
      } as T;
    }

    throw new ApiError('用户名或密码错误', 401);
  }

  if (url === `${API_BASE_URL}/auth/logout` && method === 'POST') {
    return { message: '登出成功' } as T;
  }

  if (url === `${API_BASE_URL}/users` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      roleId?: number;
    };

    let users = [...mutableMockData.users];

    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    if (params.status) {
      users = users.filter((u) => u.status === params.status);
    }

    if (params.roleId) {
      users = users.filter((u) => u.roleId === Number(params.roleId));
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = users.slice(startIndex, startIndex + pageSize);

    const usersWithRole = paginatedItems.map((u) => {
      const role = mutableMockData.roles.find((r) => r.id === u.roleId);
      return { ...u, role };
    });

    return {
      items: usersWithRole,
      total: users.length,
      page,
      pageSize,
      totalPages: Math.ceil(users.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/users` && method === 'POST') {
    const userData = data as CreateUserRequest;

    const exists = mutableMockData.users.find(
      (u) => u.username === userData.username || u.email === userData.email
    );

    if (exists) {
      throw new ApiError('用户名或邮箱已存在', 400);
    }

    const newUser: User = {
      id: mutableMockData.nextUserId++,
      username: userData.username,
      email: userData.email,
      roleId: Number(userData.roleId),
      status: userData.status,
      phone: userData.phone,
      address: userData.address,
      createdAt: new Date().toISOString(),
    };

    mutableMockData.users.push(newUser);

    const role = mutableMockData.roles.find((r) => r.id === newUser.roleId);
    if (role) {
      role.userCount++;
    }

    addActivity(`创建用户 ${newUser.username}`);

    return { ...newUser, role } as T;
  }

  const userMatch = url.match(/\/users\/(\d+)$/);
  if (userMatch) {
    const userId = parseInt(userMatch[1], 10);
    const userIndex = mutableMockData.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new ApiError('用户不存在', 404);
    }

    if (method === 'GET') {
      const user = mutableMockData.users[userIndex];
      const role = mutableMockData.roles.find((r) => r.id === user.roleId);
      return { ...user, role } as T;
    }

    if (method === 'PUT') {
      const updateData = data as UpdateUserRequest;
      const oldRoleId = mutableMockData.users[userIndex].roleId;

      mutableMockData.users[userIndex] = {
        ...mutableMockData.users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (updateData.roleId && oldRoleId !== Number(updateData.roleId)) {
        const oldRole = mutableMockData.roles.find((r) => r.id === oldRoleId);
        const newRole = mutableMockData.roles.find((r) => r.id === Number(updateData.roleId!));
        if (oldRole) oldRole.userCount--;
        if (newRole) newRole.userCount++;
      }

      const updatedUser = mutableMockData.users[userIndex];
      const updatedRole = mutableMockData.roles.find((r) => r.id === updatedUser.roleId);

      addActivity(`更新用户 ${updatedUser.username}`);

      return { ...updatedUser, role: updatedRole } as T;
    }

    if (method === 'DELETE') {
      const deletedUser = mutableMockData.users.splice(userIndex, 1)[0];
      const role = mutableMockData.roles.find((r) => r.id === deletedUser.roleId);
      if (role) {
        role.userCount--;
      }

      addActivity(`删除用户 ${deletedUser.username}`);

      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/roles` && method === 'GET') {
    return [...mutableMockData.roles] as T;
  }

  if (url === `${API_BASE_URL}/roles` && method === 'POST') {
    const roleData = data as CreateRoleRequest;

    const exists = mutableMockData.roles.find(
      (r) => r.code === roleData.code || r.name === roleData.name
    );

    if (exists) {
      throw new ApiError('角色代码或名称已存在', 400);
    }

    const newRole: Role = {
      id: mutableMockData.nextRoleId++,
      name: roleData.name,
      code: roleData.code,
      description: roleData.description,
      userCount: 0,
      status: 'active',
      permissions: roleData.permissions,
      createdAt: new Date().toISOString(),
    };

    mutableMockData.roles.push(newRole);
    addActivity(`创建角色 ${newRole.name}`);

    return newRole as T;
  }

  const roleMatch = url.match(/\/roles\/(\d+)$/);
  if (roleMatch) {
    const roleId = parseInt(roleMatch[1], 10);
    const roleIndex = mutableMockData.roles.findIndex((r) => r.id === roleId);

    if (roleIndex === -1) {
      throw new ApiError('角色不存在', 404);
    }

    if (method === 'GET') {
      return { ...mutableMockData.roles[roleIndex] } as T;
    }

    if (method === 'PUT') {
      const updateData = data as UpdateRoleRequest;
      mutableMockData.roles[roleIndex] = {
        ...mutableMockData.roles[roleIndex],
        ...updateData,
      };

      addActivity(`更新角色 ${mutableMockData.roles[roleIndex].name}`);

      return { ...mutableMockData.roles[roleIndex] } as T;
    }

    if (method === 'DELETE') {
      const roleToDelete = mutableMockData.roles[roleIndex];
      const usersWithRole = mutableMockData.users.filter((u) => u.roleId === roleId);

      if (usersWithRole.length > 0) {
        throw new ApiError('该角色下还有用户，无法删除', 400);
      }

      mutableMockData.roles.splice(roleIndex, 1);
      addActivity(`删除角色 ${roleToDelete.name}`);

      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/permissions` && method === 'GET') {
    return [...mutableMockData.permissions] as T;
  }

  if (url === `${API_BASE_URL}/permissions` && method === 'POST') {
    const permissionData = data as {
      name: string;
      code: string;
      type: string;
      parentId: number | null;
      status: string;
    };

    const exists = mutableMockData.permissions.find(
      (p) => p.code === permissionData.code
    );

    if (exists) {
      throw new ApiError('权限代码已存在', 400);
    }

    const newPermission: typeof mutableMockData.permissions[0] = {
      id: mutableMockData.nextPermissionId++,
      name: permissionData.name,
      code: permissionData.code,
      type: permissionData.type as 'menu' | 'action',
      parentId: permissionData.parentId,
      status: permissionData.status as 'active' | 'inactive',
    };

    mutableMockData.permissions.push(newPermission);
    addActivity(`创建权限 ${newPermission.name}`);

    return newPermission as T;
  }

  const permissionMatch = url.match(/\/permissions\/(\d+)$/);
  if (permissionMatch) {
    const permissionId = parseInt(permissionMatch[1], 10);
    const permissionIndex = mutableMockData.permissions.findIndex((p) => p.id === permissionId);

    if (permissionIndex === -1) {
      throw new ApiError('权限不存在', 404);
    }

    if (method === 'GET') {
      return { ...mutableMockData.permissions[permissionIndex] } as T;
    }

    if (method === 'PUT') {
      const updateData = data as Partial<typeof mutableMockData.permissions[0]>;
      mutableMockData.permissions[permissionIndex] = {
        ...mutableMockData.permissions[permissionIndex],
        ...updateData,
      };

      addActivity(`更新权限 ${mutableMockData.permissions[permissionIndex].name}`);
      return { ...mutableMockData.permissions[permissionIndex] } as T;
    }

    if (method === 'DELETE') {
      const hasChildren = mutableMockData.permissions.some((p) => p.parentId === permissionId);
      if (hasChildren) {
        throw new ApiError('该权限下有子权限，无法删除', 400);
      }

      const hasRoles = mutableMockData.roles.some((r) => r.permissions.includes(permissionId));
      if (hasRoles) {
        throw new ApiError('该权限已被角色使用，无法删除', 400);
      }

      const deletedPermission = mutableMockData.permissions.splice(permissionIndex, 1)[0];
      addActivity(`删除权限 ${deletedPermission.name}`);

      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/dashboard/stats` && method === 'GET') {
    return {
      totalUsers: mutableMockData.users.length,
      activeUsers: mutableMockData.users.filter((u) => u.status === 'active').length,
      totalRoles: mutableMockData.roles.length,
      pendingRequests: 0,
    } as T;
  }

  if (url === `${API_BASE_URL}/dashboard/activities` && method === 'GET') {
    return [...mutableMockData.activities] as T;
  }

  if (url === `${API_BASE_URL}/settings`) {
    if (method === 'GET') {
      return { ...mutableMockData.settings } as T;
    }

    if (method === 'PUT') {
      const updateData = data as Partial<SystemSettings>;
      mutableMockData.settings = { ...mutableMockData.settings, ...updateData };
      addActivity('更新系统设置');
      return { ...mutableMockData.settings } as T;
    }
  }

  if (url === `${API_BASE_URL}/problem-tags` && method === 'GET') {
    return [...mutableMockData.problemTags] as T;
  }

  if (url === `${API_BASE_URL}/problems` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      search?: string;
      difficulty?: string;
      tags?: number[];
      status?: string;
    };

    let problems = [...mutableMockData.problems];

    if (params.search) {
      const search = params.search.toLowerCase();
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    if (params.difficulty) {
      problems = problems.filter((p) => p.difficulty === params.difficulty);
    }

    if (params.tags && params.tags.length > 0) {
      problems = problems.filter((p) =>
        params.tags!.some((tagId) => p.tags.includes(tagId))
      );
    }

    if (params.status) {
      problems = problems.filter((p) => p.status === params.status);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = problems.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: problems.length,
      page,
      pageSize,
      totalPages: Math.ceil(problems.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/problems` && method === 'POST') {
    const problemData = data as CreateProblemRequest;
    const auth = sessionStorage.getItem('auth');
    let authorId = 1;
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        authorId = parsed.user?.id || 1;
      } catch {}
    }

    const newProblem = {
      id: mutableMockData.nextProblemId++,
      contestId: undefined,
      title: problemData.title,
      description: problemData.description,
      inputFormat: problemData.inputFormat,
      outputFormat: problemData.outputFormat,
      sampleInput: problemData.sampleInput,
      sampleOutput: problemData.sampleOutput,
      note: problemData.note,
      difficulty: problemData.difficulty,
      status: 'draft' as const,
      tags: problemData.tags,
      testCases: [],
      hasSpecialJudge: problemData.hasSpecialJudge,
      specialJudgeCode: problemData.specialJudgeCode,
      languages: problemData.languages,
      languageConfigs: problemData.languageConfigs || [],
      timeLimit: problemData.timeLimit,
      memoryLimit: problemData.memoryLimit,
      solvedCount: 0,
      attemptedCount: 0,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.problems.push(newProblem);
    addActivity(`创建题目 ${newProblem.title}`);

    return newProblem as T;
  }

  const problemMatch = url.match(/\/problems\/(\d+)$/);
  if (problemMatch) {
    const problemId = parseInt(problemMatch[1], 10);
    const problemIndex = mutableMockData.problems.findIndex((p) => p.id === problemId);

    if (problemIndex === -1) {
      throw new ApiError('题目不存在', 404);
    }

    if (method === 'GET') {
      return { ...mutableMockData.problems[problemIndex] } as T;
    }

    if (method === 'PUT') {
      const updateData = data as UpdateProblemRequest;
      mutableMockData.problems[problemIndex] = {
        ...mutableMockData.problems[problemIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      addActivity(`更新题目 ${mutableMockData.problems[problemIndex].title}`);
      return { ...mutableMockData.problems[problemIndex] } as T;
    }

    if (method === 'DELETE') {
      const deletedProblem = mutableMockData.problems.splice(problemIndex, 1)[0];
      addActivity(`删除题目 ${deletedProblem.title}`);
      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/contests` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      search?: string;
      type?: string;
      status?: string;
    };

    let contests = [...mutableMockData.contests];

    if (params.search) {
      const search = params.search.toLowerCase();
      contests = contests.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
      );
    }

    if (params.type) {
      contests = contests.filter((c) => c.type === params.type);
    }

    if (params.status) {
      contests = contests.filter((c) => c.status === params.status);
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = contests.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: contests.length,
      page,
      pageSize,
      totalPages: Math.ceil(contests.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/contests` && method === 'POST') {
    const contestData = data as {
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
    };

    const auth = sessionStorage.getItem('auth');
    let authorId = 1;
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        authorId = parsed.user?.id || 1;
      } catch {}
    }

    const newContest: typeof mutableMockData.contests[0] = {
      id: mutableMockData.nextContestId++,
      title: contestData.title,
      description: contestData.description,
      type: contestData.type as 'contest' | 'practice',
      scoringSystem: contestData.scoringSystem as 'icpc' | 'oi',
      status: contestData.status as 'upcoming' | 'running' | 'ended',
      startTime: contestData.startTime,
      endTime: contestData.endTime,
      freezeTime: contestData.freezeTime,
      unfreezeTime: contestData.endTime,
      problemIds: contestData.problemIds,
      participantCount: 0,
      isPublic: contestData.isPublic,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.contests.push(newContest);
    addActivity(`创建竞赛 ${newContest.title}`);

    return newContest as T;
  }

  const contestMatch = url.match(/\/contests\/(\d+)$/);
  if (contestMatch) {
    const contestId = parseInt(contestMatch[1], 10);
    const contestIndex = mutableMockData.contests.findIndex((c) => c.id === contestId);

    if (contestIndex === -1) {
      throw new ApiError('竞赛不存在', 404);
    }

    if (method === 'GET') {
      return { ...mutableMockData.contests[contestIndex] } as T;
    }

    if (method === 'PUT') {
      const updateData = data as Partial<typeof mutableMockData.contests[0]>;
      mutableMockData.contests[contestIndex] = {
        ...mutableMockData.contests[contestIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      addActivity(`更新竞赛 ${mutableMockData.contests[contestIndex].title}`);
      return { ...mutableMockData.contests[contestIndex] } as T;
    }

    if (method === 'DELETE') {
      const deletedContest = mutableMockData.contests.splice(contestIndex, 1)[0];
      addActivity(`删除竞赛 ${deletedContest.title}`);
      return { message: '删除成功' } as T;
    }
  }

  const contestProblemsMatch = url.match(/\/contests\/(\d+)\/problems$/);
  if (contestProblemsMatch && method === 'GET') {
    const contestId = parseInt(contestProblemsMatch[1], 10);
    const contest = mutableMockData.contests.find((c) => c.id === contestId);

    if (!contest) {
      throw new ApiError('竞赛不存在', 404);
    }

    const problems = contest.problemIds
      .map((id) => mutableMockData.problems.find((p) => p.id === id))
      .filter(Boolean);

    return problems as T;
  }

  const contestLeaderboardMatch = url.match(/\/contests\/(\d+)\/leaderboard$/);
  if (contestLeaderboardMatch && method === 'GET') {
    const contestId = parseInt(contestLeaderboardMatch[1], 10);
    const participations = mutableMockData.contestParticipations
      .filter((p) => p.contestId === contestId)
      .sort((a, b) => {
        if (a.solvedCount !== b.solvedCount) {
          return b.solvedCount - a.solvedCount;
        }
        return a.penalty - b.penalty;
      });

    return participations as T;
  }

  const contestTimelineMatch = url.match(/\/contests\/(\d+)\/timeline$/);
  if (contestTimelineMatch && method === 'GET') {
    const contestId = parseInt(contestTimelineMatch[1], 10);
    const timeline = mutableMockData.contestTimeline
      .filter((t) => t.contestId === contestId)
      .sort((a, b) => a.time - b.time);

    return timeline as T;
  }

  if (url === `${API_BASE_URL}/submissions` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      problemId?: number;
      contestId?: number;
      userId?: number;
      status?: string;
      language?: string;
    };

    let submissions = [...mutableMockData.submissions];

    if (params.problemId) {
      submissions = submissions.filter((s) => s.problemId === params.problemId);
    }

    if (params.contestId) {
      submissions = submissions.filter((s) => s.contestId === params.contestId);
    }

    if (params.userId) {
      submissions = submissions.filter((s) => s.userId === params.userId);
    }

    if (params.status) {
      submissions = submissions.filter((s) => s.status === params.status);
    }

    if (params.language) {
      submissions = submissions.filter((s) => s.language === params.language);
    }

    submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = submissions.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: submissions.length,
      page,
      pageSize,
      totalPages: Math.ceil(submissions.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/submissions` && method === 'POST') {
    const submissionData = data as SubmitCodeRequest;
    const auth = sessionStorage.getItem('auth');
    let userId = 1;
    let username = 'user';
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        userId = parsed.user?.id || 1;
        username = parsed.user?.username || 'user';
      } catch {}
    }

    const problem = mutableMockData.problems.find((p) => p.id === submissionData.problemId);
    if (!problem) {
      throw new ApiError('题目不存在', 404);
    }

    const testCaseResults = problem.testCases.map((tc) => {
      const isAccepted = Math.random() > 0.3;
      return {
        testCaseId: tc.id,
        status: isAccepted ? ('accepted' as const) : ('wrong_answer' as const),
        runtime: Math.floor(Math.random() * 100) + 1,
        memory: Math.floor(Math.random() * 10) + 1,
      };
    });

    const allAccepted = testCaseResults.every((r) => r.status === 'accepted');
    const status = allAccepted ? ('accepted' as const) : ('wrong_answer' as const);
    const score = allAccepted ? 100 : Math.floor((testCaseResults.filter((r) => r.status === 'accepted').length / testCaseResults.length) * 100);

    const newSubmission = {
      id: mutableMockData.nextSubmissionId++,
      problemId: submissionData.problemId,
      contestId: submissionData.contestId,
      userId,
      username,
      language: submissionData.language,
      code: submissionData.code,
      status,
      score,
      runtime: Math.floor(Math.random() * 100) + 1,
      memory: Math.floor(Math.random() * 10) + 1,
      testCaseResults,
      submittedAt: new Date().toISOString(),
    };

    mutableMockData.submissions.push(newSubmission);
    addActivity(`提交代码到题目 #${submissionData.problemId}`);

    return newSubmission as T;
  }

  const submissionMatch = url.match(/\/submissions\/(\d+)$/);
  if (submissionMatch && method === 'GET') {
    const submissionId = parseInt(submissionMatch[1], 10);
    const submission = mutableMockData.submissions.find((s) => s.id === submissionId);

    if (!submission) {
      throw new ApiError('提交不存在', 404);
    }

    return { ...submission } as T;
  }

  if (url === `${API_BASE_URL}/solutions` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      problemId?: number;
    };

    let solutions = [...mutableMockData.solutions];

    if (params.problemId) {
      solutions = solutions.filter((s) => s.problemId === params.problemId);
    }

    solutions.sort((a, b) => b.votes - a.votes);

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = solutions.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: solutions.length,
      page,
      pageSize,
      totalPages: Math.ceil(solutions.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/solutions` && method === 'POST') {
    const solutionData = data as CreateSolutionRequest;
    const auth = sessionStorage.getItem('auth');
    let userId = 1;
    let username = 'user';
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        userId = parsed.user?.id || 1;
        username = parsed.user?.username || 'user';
      } catch {}
    }

    const newSolution = {
      id: mutableMockData.nextSolutionId++,
      problemId: solutionData.problemId,
      userId,
      username,
      title: solutionData.title,
      content: solutionData.content,
      language: solutionData.language,
      code: solutionData.code,
      votes: 0,
      isAccepted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.solutions.push(newSolution);
    addActivity(`发布题解: ${newSolution.title}`);

    return newSolution as T;
  }

  const solutionMatch = url.match(/\/solutions\/(\d+)$/);
  if (solutionMatch) {
    const solutionId = parseInt(solutionMatch[1], 10);
    const solutionIndex = mutableMockData.solutions.findIndex((s) => s.id === solutionId);

    if (solutionIndex === -1) {
      throw new ApiError('题解不存在', 404);
    }

    if (method === 'GET') {
      return { ...mutableMockData.solutions[solutionIndex] } as T;
    }

    if (method === 'DELETE') {
      const deletedSolution = mutableMockData.solutions.splice(solutionIndex, 1)[0];
      addActivity(`删除题解: ${deletedSolution.title}`);
      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/discussions` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      problemId?: number;
      contestId?: number;
    };

    let discussions = [...mutableMockData.discussions];

    if (params.problemId) {
      discussions = discussions.filter((d) => d.problemId === params.problemId);
    }

    if (params.contestId) {
      discussions = discussions.filter((d) => d.contestId === params.contestId);
    }

    discussions = discussions.filter((d) => !d.parentId);
    discussions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = discussions.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: discussions.length,
      page,
      pageSize,
      totalPages: Math.ceil(discussions.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/discussions` && method === 'POST') {
    const discussionData = data as CreateDiscussionRequest;
    const auth = sessionStorage.getItem('auth');
    let userId = 1;
    let username = 'user';
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        userId = parsed.user?.id || 1;
        username = parsed.user?.username || 'user';
      } catch {}
    }

    const newDiscussion = {
      id: mutableMockData.nextDiscussionId++,
      problemId: discussionData.problemId,
      contestId: discussionData.contestId,
      userId,
      username,
      title: discussionData.title,
      content: discussionData.content,
      parentId: discussionData.parentId,
      votes: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mutableMockData.discussions.push(newDiscussion);
    addActivity(`发布讨论: ${newDiscussion.title}`);

    return newDiscussion as T;
  }

  const discussionMatch = url.match(/\/discussions\/(\d+)$/);
  if (discussionMatch) {
    const discussionId = parseInt(discussionMatch[1], 10);
    const discussionIndex = mutableMockData.discussions.findIndex((d) => d.id === discussionId);

    if (discussionIndex === -1) {
      throw new ApiError('讨论不存在', 404);
    }

    if (method === 'GET') {
      const replies = mutableMockData.discussions.filter((d) => d.parentId === discussionId);
      return {
        ...mutableMockData.discussions[discussionIndex],
        replies,
      } as T;
    }

    if (method === 'DELETE') {
      const deletedDiscussion = mutableMockData.discussions.splice(discussionIndex, 1)[0];
      addActivity(`删除讨论: ${deletedDiscussion.title}`);
      return { message: '删除成功' } as T;
    }
  }

  const userRatingsMatch = url.match(/\/users\/(\d+)\/ratings$/);
  if (userRatingsMatch && method === 'GET') {
    const userId = parseInt(userRatingsMatch[1], 10);
    const ratings = mutableMockData.userRatings
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return ratings as T;
  }

  if (url === `${API_BASE_URL}/ratings/leaderboard` && method === 'GET') {
    const userLatestRatings: Record<number, typeof mutableMockData.userRatings[0]> = {};
    for (const rating of mutableMockData.userRatings) {
      if (!userLatestRatings[rating.userId] || 
          new Date(rating.createdAt) > new Date(userLatestRatings[rating.userId].createdAt)) {
        userLatestRatings[rating.userId] = rating;
      }
    }

    const leaderboard = Object.values(userLatestRatings)
      .sort((a, b) => b.rating - a.rating);

    return leaderboard as T;
  }

  if (url === `${API_BASE_URL}/admin/moderation` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      status?: string;
    };

    let cases = [...mutableMockData.moderationCases];

    if (params.status) {
      cases = cases.filter((c) => c.status === params.status);
    }

    cases.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = cases.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total: cases.length,
      page,
      pageSize,
      totalPages: Math.ceil(cases.length / pageSize),
    } as T;
  }

  const moderationCaseMatch = url.match(/\/admin\/moderation\/(\d+)$/);
  if (moderationCaseMatch && method === 'PUT') {
    const caseId = parseInt(moderationCaseMatch[1], 10);
    const caseIndex = mutableMockData.moderationCases.findIndex((c) => c.id === caseId);

    if (caseIndex === -1) {
      throw new ApiError('审核案例不存在', 404);
    }

    const auth = sessionStorage.getItem('auth');
    let moderatorId: number | undefined;
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        moderatorId = parsed.user?.id;
      } catch {}
    }

    const updateData = data as ModerationActionRequest;
    mutableMockData.moderationCases[caseIndex] = {
      ...mutableMockData.moderationCases[caseIndex],
      status: 'resolved' as const,
      action: updateData.action,
      moderatorId,
      resolvedAt: new Date().toISOString(),
    };

    addActivity(`处理审核案例 #${caseId}`);
    return { ...mutableMockData.moderationCases[caseIndex] } as T;
  }

  if (url === `${API_BASE_URL}/contests/register` && method === 'POST') {
    const registerData = data as RegisterContestRequest;
    const auth = sessionStorage.getItem('auth');
    let userId = 1;
    let username = 'user';
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        userId = parsed.user?.id || 1;
        username = parsed.user?.username || 'user';
      } catch {}
    }

    const existing = mutableMockData.contestParticipations.find(
      (p) => p.contestId === registerData.contestId && p.userId === userId
    );

    if (existing) {
      throw new ApiError('已经注册过该竞赛', 400);
    }

    const contest = mutableMockData.contests.find((c) => c.id === registerData.contestId);
    if (!contest) {
      throw new ApiError('竞赛不存在', 404);
    }

    const problemStatuses: Record<number, ProblemContestStatus> = {};
    for (const problemId of contest.problemIds) {
      problemStatuses[problemId] = {
        problemId,
        solved: false,
        wrongAttempts: 0,
      };
    }

    const newParticipation = {
      id: mutableMockData.contestParticipations.length + 1,
      contestId: registerData.contestId,
      userId,
      username,
      rank: 0,
      score: 0,
      penalty: 0,
      solvedCount: 0,
      problemStatuses,
      registeredAt: new Date().toISOString(),
    };

    mutableMockData.contestParticipations.push(newParticipation);
    addActivity(`注册竞赛 #${registerData.contestId}`);

    return newParticipation as T;
  }

  throw new ApiError('API接口不存在', 404);
};

export const api = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return mockApiCall<LoginResponse>(`${API_BASE_URL}/auth/login`, 'POST', data);
  },

  async logout(): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/auth/logout`, 'POST');
  },

  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    roleId?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    return mockApiCall<PaginatedResponse<User>>(`${API_BASE_URL}/users`, 'GET', params);
  },

  async getUser(id: number): Promise<User> {
    return mockApiCall<User>(`${API_BASE_URL}/users/${id}`, 'GET');
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return mockApiCall<User>(`${API_BASE_URL}/users`, 'POST', data);
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return mockApiCall<User>(`${API_BASE_URL}/users/${id}`, 'PUT', data);
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/users/${id}`, 'DELETE');
  },

  async batchDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const id of ids) {
      try {
        await this.deleteUser(id);
        deleted++;
      } catch {
        // 忽略单个删除错误
      }
    }
    return { deleted };
  },

  async getRoles(): Promise<Role[]> {
    return mockApiCall<Role[]>(`${API_BASE_URL}/roles`, 'GET');
  },

  async getRole(id: number): Promise<Role> {
    return mockApiCall<Role>(`${API_BASE_URL}/roles/${id}`, 'GET');
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return mockApiCall<Role>(`${API_BASE_URL}/roles`, 'POST', data);
  },

  async updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
    return mockApiCall<Role>(`${API_BASE_URL}/roles/${id}`, 'PUT', data);
  },

  async deleteRole(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/roles/${id}`, 'DELETE');
  },

  async getPermissions(): Promise<Permission[]> {
    return mockApiCall<Permission[]>(`${API_BASE_URL}/permissions`, 'GET');
  },

  async getPermission(id: number): Promise<Permission> {
    return mockApiCall<Permission>(`${API_BASE_URL}/permissions/${id}`, 'GET');
  },

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    return mockApiCall<Permission>(`${API_BASE_URL}/permissions`, 'POST', data);
  },

  async updatePermission(id: number, data: UpdatePermissionRequest): Promise<Permission> {
    return mockApiCall<Permission>(`${API_BASE_URL}/permissions/${id}`, 'PUT', data);
  },

  async deletePermission(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/permissions/${id}`, 'DELETE');
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return mockApiCall<DashboardStats>(`${API_BASE_URL}/dashboard/stats`, 'GET');
  },

  async getActivities(): Promise<Activity[]> {
    return mockApiCall<Activity[]>(`${API_BASE_URL}/dashboard/activities`, 'GET');
  },

  async getSettings(): Promise<SystemSettings> {
    return mockApiCall<SystemSettings>(`${API_BASE_URL}/settings`, 'GET');
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return mockApiCall<SystemSettings>(`${API_BASE_URL}/settings`, 'PUT', data);
  },

  async getProblemTags(): Promise<ProblemTag[]> {
    return mockApiCall<ProblemTag[]>(`${API_BASE_URL}/problem-tags`, 'GET');
  },

  async getProblems(params: PaginatedProblemsParams = {}): Promise<PaginatedResponse<Problem>> {
    return mockApiCall<PaginatedResponse<Problem>>(`${API_BASE_URL}/problems`, 'GET', params);
  },

  async getProblem(id: number): Promise<Problem> {
    return mockApiCall<Problem>(`${API_BASE_URL}/problems/${id}`, 'GET');
  },

  async createProblem(data: CreateProblemRequest): Promise<Problem> {
    return mockApiCall<Problem>(`${API_BASE_URL}/problems`, 'POST', data);
  },

  async updateProblem(id: number, data: UpdateProblemRequest): Promise<Problem> {
    return mockApiCall<Problem>(`${API_BASE_URL}/problems/${id}`, 'PUT', data);
  },

  async deleteProblem(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/problems/${id}`, 'DELETE');
  },

  async getContests(params: PaginatedContestsParams = {}): Promise<PaginatedResponse<Contest>> {
    return mockApiCall<PaginatedResponse<Contest>>(`${API_BASE_URL}/contests`, 'GET', params);
  },

  async getContest(id: number): Promise<Contest> {
    return mockApiCall<Contest>(`${API_BASE_URL}/contests/${id}`, 'GET');
  },

  async getContestProblems(contestId: number): Promise<Problem[]> {
    return mockApiCall<Problem[]>(`${API_BASE_URL}/contests/${contestId}/problems`, 'GET');
  },

  async getContestLeaderboard(contestId: number): Promise<ContestParticipation[]> {
    return mockApiCall<ContestParticipation[]>(`${API_BASE_URL}/contests/${contestId}/leaderboard`, 'GET');
  },

  async getContestTimeline(contestId: number): Promise<ContestTimelineEvent[]> {
    return mockApiCall<ContestTimelineEvent[]>(`${API_BASE_URL}/contests/${contestId}/timeline`, 'GET');
  },

  async registerContest(contestId: number): Promise<ContestParticipation> {
    return mockApiCall<ContestParticipation>(`${API_BASE_URL}/contests/register`, 'POST', { contestId });
  },

  async createContest(data: {
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
  }): Promise<Contest> {
    return mockApiCall<Contest>(`${API_BASE_URL}/contests`, 'POST', data);
  },

  async updateContest(id: number, data: {
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
  }): Promise<Contest> {
    return mockApiCall<Contest>(`${API_BASE_URL}/contests/${id}`, 'PUT', data);
  },

  async deleteContest(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/contests/${id}`, 'DELETE');
  },

  async getSubmissions(params: PaginatedSubmissionsParams = {}): Promise<PaginatedResponse<Submission>> {
    return mockApiCall<PaginatedResponse<Submission>>(`${API_BASE_URL}/submissions`, 'GET', params);
  },

  async getSubmission(id: number): Promise<Submission> {
    return mockApiCall<Submission>(`${API_BASE_URL}/submissions/${id}`, 'GET');
  },

  async submitCode(data: SubmitCodeRequest): Promise<Submission> {
    return mockApiCall<Submission>(`${API_BASE_URL}/submissions`, 'POST', data);
  },

  async getSolutions(params: { page?: number; pageSize?: number; problemId?: number } = {}): Promise<PaginatedResponse<Solution>> {
    return mockApiCall<PaginatedResponse<Solution>>(`${API_BASE_URL}/solutions`, 'GET', params);
  },

  async getSolution(id: number): Promise<Solution> {
    return mockApiCall<Solution>(`${API_BASE_URL}/solutions/${id}`, 'GET');
  },

  async createSolution(data: CreateSolutionRequest): Promise<Solution> {
    return mockApiCall<Solution>(`${API_BASE_URL}/solutions`, 'POST', data);
  },

  async deleteSolution(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/solutions/${id}`, 'DELETE');
  },

  async getDiscussions(params: { page?: number; pageSize?: number; problemId?: number; contestId?: number } = {}): Promise<PaginatedResponse<Discussion>> {
    return mockApiCall<PaginatedResponse<Discussion>>(`${API_BASE_URL}/discussions`, 'GET', params);
  },

  async getDiscussion(id: number): Promise<Discussion & { replies: Discussion[] }> {
    return mockApiCall<Discussion & { replies: Discussion[] }>(`${API_BASE_URL}/discussions/${id}`, 'GET');
  },

  async createDiscussion(data: CreateDiscussionRequest): Promise<Discussion> {
    return mockApiCall<Discussion>(`${API_BASE_URL}/discussions`, 'POST', data);
  },

  async deleteDiscussion(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/discussions/${id}`, 'DELETE');
  },

  async getUserRatings(userId: number): Promise<UserRating[]> {
    return mockApiCall<UserRating[]>(`${API_BASE_URL}/users/${userId}/ratings`, 'GET');
  },

  async getRatingLeaderboard(): Promise<UserRating[]> {
    return mockApiCall<UserRating[]>(`${API_BASE_URL}/ratings/leaderboard`, 'GET');
  },

  async getModerationCases(params: { page?: number; pageSize?: number; status?: string } = {}): Promise<PaginatedResponse<ModerationCase>> {
    return mockApiCall<PaginatedResponse<ModerationCase>>(`${API_BASE_URL}/admin/moderation`, 'GET', params);
  },

  async handleModerationCase(caseId: number, data: ModerationActionRequest): Promise<ModerationCase> {
    return mockApiCall<ModerationCase>(`${API_BASE_URL}/admin/moderation/${caseId}`, 'PUT', data);
  },

  resetMockData(): void {
    mutableMockData = JSON.parse(JSON.stringify(mockData)) as typeof mockData;
  },
};

export { ApiError };
export type { ApiConfig };
