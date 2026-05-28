import { Question, Competition, User, TrainingCourse, Notification, Honor, Certificate } from '../types';
import dayjs from 'dayjs';

export const mockQuestions: Question[] = [
  {
    id: '1',
    category: 'product',
    difficulty: 'basic',
    type: 'single',
    content: '公司核心产品的主要功能不包括以下哪项？',
    options: ['数据分析', '用户管理', '游戏娱乐', '报表生成'],
    correctAnswers: [2],
    validityStart: '2024-01-01',
    validityEnd: '2025-12-31',
    isActive: true,
    stats: { totalAttempts: 150, correctAttempts: 120 }
  },
  {
    id: '2',
    category: 'regulation',
    difficulty: 'basic',
    type: 'judgment',
    content: '员工上班期间可以随意使用公司电脑进行私人活动。',
    options: ['正确', '错误'],
    correctAnswers: [1],
    validityStart: '2024-01-01',
    validityEnd: '2025-12-31',
    isActive: true,
    stats: { totalAttempts: 200, correctAttempts: 180 }
  },
  {
    id: '3',
    category: 'industry',
    difficulty: 'advanced',
    type: 'multiple',
    content: '当前行业发展的主要趋势包括？',
    options: ['数字化转型', '人工智能应用', '绿色可持续发展', '传统制造业回归'],
    correctAnswers: [0, 1, 2],
    validityStart: '2024-01-01',
    validityEnd: '2025-12-31',
    isActive: true,
    stats: { totalAttempts: 80, correctAttempts: 40 }
  },
  {
    id: '4',
    category: 'safety',
    difficulty: 'basic',
    type: 'single',
    content: '遇到火灾时，第一时间应该？',
    options: ['乘坐电梯逃生', '拨打火警电话并走安全通道', '收拾贵重物品', '等待救援'],
    correctAnswers: [1],
    validityStart: '2024-01-01',
    validityEnd: '2025-12-31',
    isActive: true,
    stats: { totalAttempts: 300, correctAttempts: 280 }
  },
  {
    id: '5',
    category: 'product',
    difficulty: 'advanced',
    type: 'single',
    content: '产品最新版本的核心更新亮点是？',
    options: ['界面美化', 'AI智能助手', '性能提升', '新增游戏功能'],
    correctAnswers: [1],
    validityStart: '2024-01-01',
    validityEnd: '2025-06-30',
    isActive: true,
    stats: { totalAttempts: 60, correctAttempts: 30 }
  },
  {
    id: '6',
    category: 'regulation',
    difficulty: 'advanced',
    type: 'multiple',
    content: '以下哪些行为违反了公司保密规定？',
    options: ['将内部文件发送给外部人员', '在公共场合讨论公司机密', '使用公司邮箱发送工作邮件', '将密码分享给同事'],
    correctAnswers: [0, 1, 3],
    validityStart: '2024-01-01',
    validityEnd: '2025-12-31',
    isActive: true,
    stats: { totalAttempts: 90, correctAttempts: 60 }
  },
  {
    id: '7',
    category: 'industry',
    difficulty: 'expert',
    type: 'single',
    content: '根据Gartner报告，未来三年行业增长率预计为？',
    options: ['5-10%', '15-20%', '25-30%', '35%以上'],
    correctAnswers: [1],
    validityStart: '2024-01-01',
    validityEnd: '2024-12-31',
    isActive: true,
    stats: { totalAttempts: 30, correctAttempts: 10 }
  },
  {
    id: '8',
    category: 'safety',
    difficulty: 'advanced',
    type: 'judgment',
    content: '使用灭火器时，应该对准火焰根部喷射。',
    options: ['正确', '错误'],
    correctAnswers: [0],
    validityStart: '2024-01-01',
    validityEnd: '2025-12-31',
    isActive: true,
    stats: { totalAttempts: 120, correctAttempts: 100 }
  }
];

export const mockCompetitions: Competition[] = [
  {
    id: '1',
    title: '2024年度产品知识竞赛',
    description: '测试员工对公司产品的了解程度，优胜者将获得奖励',
    startTime: dayjs().add(1, 'day').toISOString(),
    endTime: dayjs().add(7, 'day').toISOString(),
    duration: 30,
    questionCount: 20,
    randomQuestions: true,
    shuffleOptions: true,
    noBacktrack: true,
    participants: ['1', '2', '3'],
    categories: ['product'],
    difficulties: ['basic', 'advanced'],
    leaderboard: [
      { userId: '1', userName: '张三', score: 95, timeSpent: 1200, completedAt: dayjs().subtract(1, 'day').toISOString() },
      { userId: '2', userName: '李四', score: 88, timeSpent: 1400, completedAt: dayjs().subtract(1, 'day').toISOString() },
      { userId: '3', userName: '王五', score: 82, timeSpent: 1600, completedAt: dayjs().subtract(2, 'day').toISOString() }
    ]
  },
  {
    id: '2',
    title: '安全生产知识竞赛',
    description: '强化员工安全意识，学习安全规范',
    startTime: dayjs().subtract(3, 'day').toISOString(),
    endTime: dayjs().add(3, 'day').toISOString(),
    duration: 20,
    questionCount: 15,
    randomQuestions: true,
    shuffleOptions: true,
    noBacktrack: true,
    participants: ['1', '2', '3', '4', '5'],
    categories: ['safety'],
    difficulties: ['basic', 'advanced'],
    leaderboard: [
      { userId: '4', userName: '赵六', score: 98, timeSpent: 900, completedAt: dayjs().subtract(2, 'day').toISOString() },
      { userId: '5', userName: '钱七', score: 92, timeSpent: 1000, completedAt: dayjs().subtract(2, 'day').toISOString() }
    ]
  }
];

export const mockUser: User = {
  id: '1',
  name: '张三',
  department: '技术部',
  position: '高级工程师',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangSan',
  certificates: [
    {
      id: '1',
      title: '产品知识认证',
      issuedTo: '张三',
      issuedDate: '2024-01-15',
      validUntil: '2025-01-14',
      certificateNumber: 'CERT-2024-001',
      score: 90
    }
  ],
  competitionHistory: [
    { competitionId: '1', competitionTitle: '2024年度产品知识竞赛', score: 95, rank: 1, completedAt: '2024-03-10' }
  ],
  knowledgeRadar: {
    product: 85,
    regulation: 78,
    industry: 72,
    safety: 90
  }
};

export const mockTrainingCourses: TrainingCourse[] = [
  {
    id: '1',
    title: '新员工入职培训',
    description: '涵盖公司文化、规章制度、产品知识等基础内容',
    duration: '8小时',
    passScore: 80,
    questions: ['1', '2', '4']
  },
  {
    id: '2',
    title: '安全规范专项培训',
    description: '深入学习安全生产知识和应急处理流程',
    duration: '4小时',
    passScore: 90,
    questions: ['4', '8']
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '2024年度产品知识竞赛即将开始',
    content: '竞赛将于明天开始，请各位员工积极参与，优胜者将获得丰厚奖品！',
    type: 'competition',
    publishDate: dayjs().subtract(1, 'day').toISOString(),
    isRead: false
  },
  {
    id: '2',
    title: '新培训课程上线',
    content: '安全规范专项培训课程已上线，请相关员工按时完成学习。',
    type: 'training',
    publishDate: dayjs().subtract(3, 'day').toISOString(),
    isRead: true
  }
];

export const mockHonors: Honor[] = [
  {
    id: '1',
    userId: '1',
    userName: '张三',
    competitionTitle: '2024年度产品知识竞赛',
    rank: 1,
    awardDate: '2024-03-10'
  },
  {
    id: '2',
    userId: '4',
    userName: '赵六',
    competitionTitle: '安全生产知识竞赛',
    rank: 1,
    awardDate: '2024-03-08'
  }
];

export const mockDepartments = [
  { name: '技术部', avgScore: 85 },
  { name: '市场部', avgScore: 78 },
  { name: '销售部', avgScore: 82 },
  { name: '人力资源部', avgScore: 88 },
  { name: '财务部', avgScore: 75 }
];
