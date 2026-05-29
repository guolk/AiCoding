import { Plot, PlantingLog, VolunteerTask, ForumPost, SharingPost, Tool, InventoryItem, ExpenseRecord } from '../../src/types';

export const initialPlots: Plot[] = [
  {
    id: 'plot-1',
    name: 'A1地块',
    area: 12,
    coordinates: { x: 20, y: 20, width: 100, height: 80 },
    status: 'adopted',
    currentCrop: '番茄',
    adopter: {
      name: '张三',
      userId: 'user-1',
      startDate: '2026-03-01',
      endDate: '2026-09-30'
    },
    rotationHistory: [
      { id: 'rot-1', season: '春季', year: 2026, crop: '番茄', notes: '生长良好' },
      { id: 'rot-2', season: '秋季', year: 2025, crop: '白菜', notes: '产量一般' }
    ]
  },
  {
    id: 'plot-2',
    name: 'A2地块',
    area: 10,
    coordinates: { x: 140, y: 20, width: 80, height: 80 },
    status: 'adopted',
    currentCrop: '黄瓜',
    adopter: {
      name: '李四',
      userId: 'user-2',
      startDate: '2026-02-15',
      endDate: '2026-08-15'
    },
    rotationHistory: [
      { id: 'rot-3', season: '春季', year: 2026, crop: '黄瓜', notes: '需要搭架子' },
      { id: 'rot-4', season: '冬季', year: 2025, crop: '菠菜', notes: '耐寒性强' }
    ]
  },
  {
    id: 'plot-3',
    name: 'B1地块',
    area: 15,
    coordinates: { x: 20, y: 120, width: 120, height: 100 },
    status: 'available',
    rotationHistory: [
      { id: 'rot-5', season: '夏季', year: 2025, crop: '茄子', notes: '长势喜人' }
    ]
  },
  {
    id: 'plot-4',
    name: 'B2地块',
    area: 8,
    coordinates: { x: 160, y: 120, width: 80, height: 100 },
    status: 'pending',
    currentCrop: '辣椒',
    adopter: {
      name: '王五',
      userId: 'user-3',
      startDate: '2026-05-20',
      endDate: '2026-11-20'
    },
    rotationHistory: [
      { id: 'rot-6', season: '春季', year: 2025, crop: '萝卜', notes: '土壤肥沃' }
    ]
  },
  {
    id: 'plot-5',
    name: 'C1地块',
    area: 18,
    coordinates: { x: 20, y: 240, width: 140, height: 90 },
    status: 'adopted',
    currentCrop: '草莓',
    adopter: {
      name: '赵六',
      userId: 'user-4',
      startDate: '2026-01-10',
      endDate: '2026-07-10'
    },
    rotationHistory: [
      { id: 'rot-7', season: '春季', year: 2026, crop: '草莓', notes: '品种改良中' }
    ]
  },
  {
    id: 'plot-6',
    name: 'C2地块',
    area: 10,
    coordinates: { x: 180, y: 240, width: 90, height: 90 },
    status: 'available',
    rotationHistory: []
  }
];

export const initialPlantingLogs: PlantingLog[] = [
  {
    id: 'log-1',
    plotId: 'plot-1',
    plotName: 'A1地块',
    seedDate: '2026-03-10',
    variety: '千禧番茄',
    density: 15,
    cropType: '番茄',
    careRecords: [
      { id: 'care-1', date: '2026-03-15', type: 'water', notes: '首次浇水，透水' },
      { id: 'care-2', date: '2026-03-25', type: 'fertilize', notes: '施用腐熟有机肥' },
      { id: 'care-3', date: '2026-04-05', type: 'prune', notes: '去除侧枝，整枝' }
    ],
    photos: [
      { id: 'photo-1', date: '2026-03-10', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', caption: '播种当日' },
      { id: 'photo-2', date: '2026-04-01', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', caption: '幼苗期' },
      { id: 'photo-3', date: '2026-05-01', url: 'https://images.unsplash.com/photo-1546470427-227c7279ba4a?w=400', caption: '开花期' }
    ],
    harvests: []
  },
  {
    id: 'log-2',
    plotId: 'plot-2',
    plotName: 'A2地块',
    seedDate: '2026-02-20',
    variety: '本地黄瓜',
    density: 12,
    cropType: '黄瓜',
    careRecords: [
      { id: 'care-4', date: '2026-02-25', type: 'water', notes: '浇水保湿' },
      { id: 'care-5', date: '2026-03-10', type: 'fertilize', notes: '追肥' }
    ],
    photos: [
      { id: 'photo-4', date: '2026-03-01', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400', caption: '幼苗' }
    ],
    harvests: [
      { id: 'harvest-1', date: '2026-05-10', quantity: 5, unit: 'kg', quality: 'good', notes: '第一批收获' }
    ]
  }
];

export const initialTasks: VolunteerTask[] = [
  {
    id: 'task-1',
    title: '公共草坪修剪',
    type: 'lawn_maint',
    assignedTo: ['张三', '李四'],
    date: '2026-06-05',
    time: '09:00',
    location: '花园北侧草坪',
    status: 'pending',
    description: '修剪公共区域草坪，清理落叶'
  },
  {
    id: 'task-2',
    title: '公共区域浇水',
    type: 'watering',
    assignedTo: ['王五'],
    date: '2026-06-03',
    time: '17:00',
    location: '公共花坛',
    status: 'in_progress',
    description: '给公共花坛的花卉浇水'
  },
  {
    id: 'task-3',
    title: '花园清洁日',
    type: 'cleanup',
    assignedTo: [],
    date: '2026-06-10',
    time: '08:00',
    location: '整个花园',
    status: 'pending',
    description: '清理花园垃圾，整理工具房'
  }
];

export const initialPosts: ForumPost[] = [
  {
    id: 'post-1',
    title: '哪种有机肥效果最好？',
    content: '大家好，最近在选有机肥，想请教一下大家，牛粪、羊粪、鸡粪哪种对于蔬菜种植效果最好？我种的是番茄和黄瓜。',
    author: '张三',
    category: 'fertilizer',
    likes: 15,
    comments: [
      { id: 'comment-1', author: '李四', content: '我个人推荐羊粪，肥力温和，不容易烧苗。', createdAt: '2026-05-20T10:30:00' },
      { id: 'comment-2', author: '赵六', content: '腐熟的牛粪也不错，就是要注意发酵充分。', createdAt: '2026-05-20T11:00:00' }
    ],
    createdAt: '2026-05-20T09:00:00'
  },
  {
    id: 'post-2',
    title: '番茄病虫害防治经验分享',
    content: '今年番茄出现了一些蚜虫和白粉病，经过尝试，我发现用苦参碱+大蒜水喷洒效果不错，分享给大家。',
    author: '李四',
    category: 'pest',
    likes: 23,
    comments: [
      { id: 'comment-3', author: '王五', content: '感谢分享！我也试试这个方法。', createdAt: '2026-05-25T14:00:00' }
    ],
    createdAt: '2026-05-22T15:30:00'
  },
  {
    id: 'post-3',
    title: '阳台种植小技巧',
    content: '对于阳台空间有限的朋友，推荐使用垂直种植架，可以大大节省空间。另外要注意通风和光照。',
    author: '赵六',
    category: 'tips',
    likes: 31,
    comments: [],
    createdAt: '2026-05-18T20:00:00'
  }
];

export const initialSharing: SharingPost[] = [
  {
    id: 'share-1',
    crop: '黄瓜',
    quantity: 3,
    unit: 'kg',
    author: '李四',
    pickupLocation: '花园入口工具房',
    status: 'available',
    createdAt: '2026-05-28T10:00:00',
    description: '自家种的有机黄瓜，新鲜采摘'
  },
  {
    id: 'share-2',
    crop: '草莓',
    quantity: 500,
    unit: 'g',
    author: '赵六',
    pickupLocation: 'C1地块旁边',
    status: 'pending_pickup',
    createdAt: '2026-05-27T16:00:00',
    description: '奶油草莓，甜度高'
  }
];

export const initialTools: Tool[] = [
  {
    id: 'tool-1',
    name: '大铁锹',
    type: '挖掘工具',
    status: 'available',
    borrowHistory: [
      { id: 'borrow-1', userId: 'user-1', userName: '张三', borrowDate: '2026-05-01', returnDate: '2026-05-03', expectedReturn: '2026-05-04' }
    ]
  },
  {
    id: 'tool-2',
    name: '小铲子',
    type: '挖掘工具',
    status: 'borrowed',
    currentBorrower: { id: 'borrow-2', userId: 'user-2', userName: '李四', borrowDate: '2026-05-28', expectedReturn: '2026-05-30' },
    borrowHistory: [
      { id: 'borrow-3', userId: 'user-3', userName: '王五', borrowDate: '2026-05-10', returnDate: '2026-05-12', expectedReturn: '2026-05-13' }
    ]
  },
  {
    id: 'tool-3',
    name: '浇水壶(10L)',
    type: '灌溉工具',
    status: 'available',
    borrowHistory: []
  },
  {
    id: 'tool-4',
    name: '浇水壶(5L)',
    type: '灌溉工具',
    status: 'maintenance',
    borrowHistory: [
      { id: 'borrow-4', userId: 'user-4', userName: '赵六', borrowDate: '2026-05-15', returnDate: '2026-05-18', expectedReturn: '2026-05-18' }
    ]
  },
  {
    id: 'tool-5',
    name: '独轮车',
    type: '运输工具',
    status: 'available',
    borrowHistory: []
  }
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: '腐熟羊粪',
    type: 'fertilizer',
    quantity: 50,
    unit: 'kg',
    lowThreshold: 20,
    lastUpdated: '2026-05-20'
  },
  {
    id: 'inv-2',
    name: '番茄种子',
    type: 'seed',
    quantity: 200,
    unit: '粒',
    lowThreshold: 50,
    lastUpdated: '2026-05-15'
  },
  {
    id: 'inv-3',
    name: '黄瓜种子',
    type: 'seed',
    quantity: 30,
    unit: '粒',
    lowThreshold: 50,
    lastUpdated: '2026-05-25'
  },
  {
    id: 'inv-4',
    name: '复合有机肥',
    type: 'fertilizer',
    quantity: 15,
    unit: 'kg',
    lowThreshold: 10,
    lastUpdated: '2026-05-22'
  }
];

export const initialExpenses: ExpenseRecord[] = [
  {
    id: 'exp-1',
    type: 'water',
    period: '2026年5月',
    totalAmount: 150,
    splitMethod: 'equal',
    individualShares: [
      { userId: 'user-1', userName: '张三', amount: 37.5, paid: true },
      { userId: 'user-2', userName: '李四', amount: 37.5, paid: true },
      { userId: 'user-3', userName: '王五', amount: 37.5, paid: false },
      { userId: 'user-4', userName: '赵六', amount: 37.5, paid: true }
    ],
    status: 'partial',
    createdAt: '2026-05-30T10:00:00'
  },
  {
    id: 'exp-2',
    type: 'electric',
    period: '2026年4月',
    totalAmount: 120,
    splitMethod: 'equal',
    individualShares: [
      { userId: 'user-1', userName: '张三', amount: 30, paid: true },
      { userId: 'user-2', userName: '李四', amount: 30, paid: true },
      { userId: 'user-3', userName: '王五', amount: 30, paid: true },
      { userId: 'user-4', userName: '赵六', amount: 30, paid: true }
    ],
    status: 'paid',
    createdAt: '2026-05-01T10:00:00'
  }
];
