import type { Exercise, SheetMusic, Measure, Note } from '@/types';
import { generateUniqueId } from '@/utils/music';

function createMeasure(notes: Omit<Note, 'id'>[]): Measure {
  return {
    id: generateUniqueId(),
    notes: notes.map(n => ({ ...n, id: generateUniqueId() })),
    annotations: [],
  };
}

const beginnerExercises: Exercise[] = [
  {
    id: 'exercise-beginner-001',
    title: 'C大调音阶上行',
    difficulty: 'beginner',
    description: '练习C大调音阶上行，熟悉手指位置',
    duration: 30,
    tags: ['音阶', 'C大调', '基础'],
    createdAt: '2024-01-01T00:00:00Z',
    sheetMusic: {
      id: 'sheet-beginner-001',
      title: 'C大调音阶上行',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 100,
      notationType: 'staff',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      measures: [
        createMeasure([
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'D', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'E', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'F', octave: 4, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'A', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'B', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'C', octave: 5, duration: 'q', annotations: [] },
        ]),
      ],
    },
    expectedNotes: [],
  },
  {
    id: 'exercise-beginner-002',
    title: 'C大调音阶下行',
    difficulty: 'beginner',
    description: '练习C大调音阶下行，巩固手指灵活性',
    duration: 30,
    tags: ['音阶', 'C大调', '基础'],
    createdAt: '2024-01-01T00:00:00Z',
    sheetMusic: {
      id: 'sheet-beginner-002',
      title: 'C大调音阶下行',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 100,
      notationType: 'staff',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      measures: [
        createMeasure([
          { pitch: 'C', octave: 5, duration: 'q', annotations: [] },
          { pitch: 'B', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'A', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'F', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'E', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'D', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
        ]),
      ],
    },
    expectedNotes: [],
  },
  {
    id: 'exercise-beginner-003',
    title: '四分音符练习',
    difficulty: 'beginner',
    description: '练习稳定的四分音符节奏',
    duration: 45,
    tags: ['节奏', '四分音符', '基础'],
    createdAt: '2024-01-01T00:00:00Z',
    sheetMusic: {
      id: 'sheet-beginner-003',
      title: '四分音符练习',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 80,
      notationType: 'staff',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      measures: [
        createMeasure([
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'A', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'A', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'F', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'F', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'E', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'E', octave: 4, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'D', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'D', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
        ]),
      ],
    },
    expectedNotes: [],
  },
];

const intermediateExercises: Exercise[] = [
  {
    id: 'exercise-intermediate-001',
    title: 'G大调音阶与琶音',
    difficulty: 'intermediate',
    description: 'G大调音阶和琶音练习，包含升号调',
    duration: 60,
    tags: ['音阶', '琶音', 'G大调'],
    createdAt: '2024-01-01T00:00:00Z',
    sheetMusic: {
      id: 'sheet-intermediate-001',
      title: 'G大调音阶与琶音',
      clef: 'treble',
      keySignature: 'G',
      timeSignature: '4/4',
      tempo: 100,
      notationType: 'staff',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      measures: [
        createMeasure([
          { pitch: 'G', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'A', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'B', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'C', octave: 5, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'D', octave: 5, duration: 'q', annotations: [] },
          { pitch: 'E', octave: 5, duration: 'q', annotations: [] },
          { pitch: 'F#', octave: 5, duration: 'q', annotations: [] },
          { pitch: 'G', octave: 5, duration: 'q', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'G', octave: 4, duration: '8', annotations: [] },
          { pitch: 'B', octave: 4, duration: '8', annotations: [] },
          { pitch: 'D', octave: 5, duration: '8', annotations: [] },
          { pitch: 'G', octave: 5, duration: '8', annotations: [] },
          { pitch: 'D', octave: 5, duration: '8', annotations: [] },
          { pitch: 'B', octave: 4, duration: '8', annotations: [] },
          { pitch: 'G', octave: 4, duration: '8', annotations: [] },
          { pitch: 'G', octave: 4, duration: '8', annotations: [] },
        ]),
      ],
    },
    expectedNotes: [],
  },
];

const advancedExercises: Exercise[] = [
  {
    id: 'exercise-advanced-001',
    title: '肖邦练习曲片段 - 快速音阶',
    difficulty: 'advanced',
    description: '练习快速音阶和跨越手指的技巧',
    duration: 90,
    tags: ['快速音阶', '高级技巧', '肖邦'],
    createdAt: '2024-01-01T00:00:00Z',
    sheetMusic: {
      id: 'sheet-advanced-001',
      title: '肖邦练习曲片段',
      clef: 'treble',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: 160,
      notationType: 'staff',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      measures: [
        createMeasure([
          { pitch: 'C', octave: 5, duration: '16', annotations: [] },
          { pitch: 'D', octave: 5, duration: '16', annotations: [] },
          { pitch: 'E', octave: 5, duration: '16', annotations: [] },
          { pitch: 'F', octave: 5, duration: '16', annotations: [] },
          { pitch: 'G', octave: 5, duration: '16', annotations: [] },
          { pitch: 'A', octave: 5, duration: '16', annotations: [] },
          { pitch: 'B', octave: 5, duration: '16', annotations: [] },
          { pitch: 'C', octave: 6, duration: '16', annotations: [] },
        ]),
        createMeasure([
          { pitch: 'C', octave: 6, duration: '16', annotations: [] },
          { pitch: 'B', octave: 5, duration: '16', annotations: [] },
          { pitch: 'A', octave: 5, duration: '16', annotations: [] },
          { pitch: 'G', octave: 5, duration: '16', annotations: [] },
          { pitch: 'F', octave: 5, duration: '16', annotations: [] },
          { pitch: 'E', octave: 5, duration: '16', annotations: [] },
          { pitch: 'D', octave: 5, duration: '16', annotations: [] },
          { pitch: 'C', octave: 5, duration: '16', annotations: [] },
        ]),
      ],
    },
    expectedNotes: [],
  },
];

function generateId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(3, '0')}`;
}

function createBasicExercise(
  index: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  title: string,
  description: string
): Exercise {
  const difficultyPrefix = difficulty === 'beginner' ? 'beginner' : difficulty === 'intermediate' ? 'intermediate' : 'advanced';
  return {
    id: `exercise-${difficultyPrefix}-${String(index).padStart(3, '0')}`,
    title,
    difficulty,
    description,
    duration: difficulty === 'beginner' ? 30 : difficulty === 'intermediate' ? 60 : 90,
    tags: [difficulty === 'beginner' ? '基础' : difficulty === 'intermediate' ? '进阶' : '高级'],
    createdAt: '2024-01-01T00:00:00Z',
    sheetMusic: {
      id: `sheet-${difficultyPrefix}-${String(index).padStart(3, '0')}`,
      title,
      clef: 'treble',
      keySignature: 'C',
      timeSignature: '4/4',
      tempo: difficulty === 'beginner' ? 80 : difficulty === 'intermediate' ? 100 : 120,
      notationType: 'staff',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      measures: [
        createMeasure([
          { pitch: 'C', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'D', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'E', octave: 4, duration: 'q', annotations: [] },
          { pitch: 'F', octave: 4, duration: 'q', annotations: [] },
        ]),
      ],
    },
    expectedNotes: [],
  };
}

const allExercises: Exercise[] = [
  ...beginnerExercises,
  ...intermediateExercises,
  ...advancedExercises,
];

for (let i = 4; i <= 20; i++) {
  allExercises.push(createBasicExercise(i, 'beginner', `基础练习曲 ${i}`, `基础级别练习曲，适合初学者练习手指灵活性和节奏感`));
}

for (let i = 2; i <= 20; i++) {
  allExercises.push(createBasicExercise(i, 'intermediate', `进阶练习曲 ${i}`, `进阶级别练习曲，包含更多技巧和变化`));
}

for (let i = 2; i <= 15; i++) {
  allExercises.push(createBasicExercise(i, 'advanced', `高级练习曲 ${i}`, `高级别练习曲，挑战技巧极限`));
}

export const exercises: Exercise[] = allExercises;

export function getExercisesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Exercise[] {
  return exercises.filter(e => e.difficulty === difficulty);
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find(e => e.id === id);
}

export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return exercises.filter(e => 
    e.title.toLowerCase().includes(lowerQuery) ||
    e.description.toLowerCase().includes(lowerQuery) ||
    e.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
}

export const videoCoursesData = [
  {
    id: 'video-course-001',
    title: '钢琴入门：从零开始学钢琴',
    description: '适合零基础学习者的钢琴入门课程，从基本手型到简单曲目',
    instructor: '张老师',
    instructorId: 1,
    thumbnailUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=piano%20lesson%20thumbnail%20elegant%20music%20class&image_size=square_hd',
    videoUrl: '',
    duration: 3600,
    price: 99,
    isSubscriptionOnly: false,
    difficulty: 'beginner' as const,
    chapters: [
      { id: 'ch-001', title: '课程介绍与钢琴基础', startTime: 0, endTime: 600, description: '了解钢琴结构和基本坐姿' },
      { id: 'ch-002', title: '手型与指法', startTime: 600, endTime: 1200, description: '学习正确的手型和基本指法' },
      { id: 'ch-003', title: '认识五线谱', startTime: 1200, endTime: 1800, description: '学习五线谱基础知识' },
      { id: 'ch-004', title: '第一首简单曲子', startTime: 1800, endTime: 3600, description: '弹奏第一首完整的曲子' },
    ],
    subtitles: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'video-course-002',
    title: '音阶与琶音进阶技巧',
    description: '深入学习各种调式的音阶和琶音练习方法',
    instructor: '李老师',
    instructorId: 2,
    thumbnailUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=music%20scales%20and%20arpeggios%20piano%20lesson&image_size=square_hd',
    videoUrl: '',
    duration: 5400,
    price: 199,
    isSubscriptionOnly: false,
    difficulty: 'intermediate' as const,
    chapters: [
      { id: 'ch-001', title: '大调音阶练习', startTime: 0, endTime: 900, description: '所有大调的音阶练习方法' },
      { id: 'ch-002', title: '小调音阶练习', startTime: 900, endTime: 1800, description: '自然小调、和声小调、旋律小调' },
      { id: 'ch-003', title: '琶音技巧', startTime: 1800, endTime: 2700, description: '三和弦、七和弦琶音' },
      { id: 'ch-004', title: '速度与力度控制', startTime: 2700, endTime: 3600, description: '如何控制弹奏速度和力度变化' },
      { id: 'ch-005', title: '综合练习', startTime: 3600, endTime: 5400, description: '结合音阶琶音的综合练习' },
    ],
    subtitles: [],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'video-course-003',
    title: '肖邦练习曲详解',
    description: '深入分析肖邦练习曲的演奏技巧和音乐表现',
    instructor: '王教授',
    instructorId: 3,
    thumbnailUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chopin%20etudes%20piano%20master%20class%20elegant&image_size=square_hd',
    videoUrl: '',
    duration: 7200,
    price: 0,
    isSubscriptionOnly: true,
    difficulty: 'advanced' as const,
    chapters: [
      { id: 'ch-001', title: 'Op.10 No.1 圣咏前奏曲', startTime: 0, endTime: 1200, description: '分析这首标志性练习曲的技术难点' },
      { id: 'ch-002', title: 'Op.10 No.3 离别练习曲', startTime: 1200, endTime: 2400, description: '最著名的肖邦练习曲之一，旋律性极强' },
      { id: 'ch-003', title: 'Op.10 No.5 黑键练习曲', startTime: 2400, endTime: 3600, description: '全部使用黑键的技术练习' },
      { id: 'ch-004', title: 'Op.10 No.12 革命练习曲', startTime: 3600, endTime: 4800, description: '肖邦最具戏剧性的练习曲' },
      { id: 'ch-005', title: 'Op.25 系列练习曲', startTime: 4800, endTime: 7200, description: 'Op.25中代表性练习曲的分析' },
    ],
    subtitles: [],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  },
];

export const subscriptionPlansData = [
  {
    id: 'plan-monthly',
    name: '月度会员',
    description: '按月订阅，灵活选择',
    price: 99,
    billingCycle: 'monthly' as const,
    features: ['所有视频课程无限观看', '练习曲库完整访问', 'AI伴奏功能', '社区高级权限'],
    isPopular: false,
  },
  {
    id: 'plan-quarterly',
    name: '季度会员',
    description: '按季订阅，享8折优惠',
    price: 239,
    billingCycle: 'quarterly' as const,
    features: ['所有视频课程无限观看', '练习曲库完整访问', 'AI伴奏功能', '社区高级权限', '专属学习顾问'],
    isPopular: true,
  },
  {
    id: 'plan-yearly',
    name: '年度会员',
    description: '按年订阅，最优惠选择',
    price: 799,
    billingCycle: 'yearly' as const,
    features: ['所有视频课程无限观看', '练习曲库完整访问', 'AI伴奏功能', '社区高级权限', '专属学习顾问', '1对1指导视频2次'],
    isPopular: false,
  },
];

export const checkInStreakData = [
  {
    userId: 1,
    currentStreak: 15,
    longestStreak: 30,
    totalCheckIns: 120,
    lastCheckInDate: new Date().toISOString().split('T')[0],
  },
];

export const leaderboardData = [
  { userId: 1, userName: '音乐爱好者', streakDays: 30, totalPracticeMinutes: 1500, rank: 1 },
  { userId: 2, userName: '钢琴新手', streakDays: 25, totalPracticeMinutes: 1200, rank: 2 },
  { userId: 3, userName: '小提琴手', streakDays: 20, totalPracticeMinutes: 1000, rank: 3 },
  { userId: 4, userName: '吉他达人', streakDays: 18, totalPracticeMinutes: 900, rank: 4 },
  { userId: 5, userName: '古典音乐迷', streakDays: 15, totalPracticeMinutes: 750, rank: 5 },
];
