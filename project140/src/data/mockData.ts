import { 
  Topic, Guest, Episode, Outline, RecordingSession, RecordingFile, 
  EditingTask, Transcript, Asset, Platform, Publication, 
  AnalyticsData, Feedback, TodoItem 
} from '../types';

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const daysLater = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const hoursLater = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

export const mockTopics: Topic[] = [
  {
    id: 't1',
    title: 'AI时代的创意工作者如何保持竞争力',
    description: '探讨在人工智能快速发展的背景下，创意工作者如何利用AI工具提升效率，同时保持独特的人类创造力。',
    tags: ['AI', '创意', '职业发展'],
    heatScore: 85,
    feasibilityScore: 75,
    status: 'approved',
    createdAt: daysAgo(10),
  },
  {
    id: 't2',
    title: '远程工作三年后的职场新常态',
    description: '分析远程工作普及后，企业管理、团队协作、个人工作方式发生的永久性变化。',
    tags: ['远程办公', '职场', '管理'],
    heatScore: 72,
    feasibilityScore: 90,
    status: 'evaluating',
    createdAt: daysAgo(7),
  },
  {
    id: 't3',
    title: '从零开始打造个人品牌的实用指南',
    description: '邀请知名博主分享在社交媒体时代，普通人如何从零开始构建有影响力的个人品牌。',
    tags: ['个人品牌', '自媒体', '成长'],
    heatScore: 92,
    feasibilityScore: 60,
    status: 'idea',
    createdAt: daysAgo(3),
  },
  {
    id: 't4',
    title: '传统行业数字化转型的坑与路',
    description: '深度对话传统企业CIO，分享数字化转型过程中的实际挑战与成功经验。',
    tags: ['数字化', '企业转型', '技术'],
    heatScore: 68,
    feasibilityScore: 85,
    status: 'approved',
    createdAt: daysAgo(15),
  },
  {
    id: 't5',
    title: '播客创作者的收入模式全解析',
    description: '从广告、赞助到会员付费，全面分析播客商业化的各种路径和实际案例。',
    tags: ['播客', '商业化', '创作者经济'],
    heatScore: 78,
    feasibilityScore: 80,
    status: 'rejected',
    createdAt: daysAgo(20),
  },
];

export const mockGuests: Guest[] = [
  {
    id: 'g1',
    name: '张明远',
    contact: 'zhang@example.com',
    company: '创意工作室',
    title: '创意总监',
    status: 'confirmed',
    lastContact: daysAgo(2),
    communicationLog: [
      { date: daysAgo(5), content: '发送邀请邮件，介绍节目定位', type: 'email' },
      { date: daysAgo(3), content: '电话沟通录制时间和话题方向', type: 'phone' },
      { date: daysAgo(2), content: '确认档期为下周五下午2点，发送大纲草案', type: 'email' },
    ],
  },
  {
    id: 'g2',
    name: '李思琪',
    contact: 'siqi@example.com',
    company: '某科技公司',
    title: '首席产品官',
    status: 'negotiating',
    lastContact: daysAgo(1),
    communicationLog: [
      { date: daysAgo(7), content: '通过LinkedIn发送邀请', type: 'email' },
      { date: daysAgo(4), content: '助理回复表示感兴趣，需协调日程', type: 'email' },
      { date: daysAgo(1), content: '讨论可能的录制日期，对方希望安排在月底', type: 'phone' },
    ],
  },
  {
    id: 'g3',
    name: '王浩然',
    contact: 'haoran@example.com',
    company: '未来研究院',
    title: 'AI研究员',
    status: 'invited',
    lastContact: daysAgo(1),
    communicationLog: [
      { date: daysAgo(1), content: '发送正式邀请，附节目介绍和往期链接', type: 'email' },
    ],
  },
  {
    id: 'g4',
    name: '陈雨婷',
    contact: 'yuting@example.com',
    company: '自由职业',
    title: '独立设计师',
    status: 'declined',
    lastContact: daysAgo(10),
    communicationLog: [
      { date: daysAgo(12), content: '发送邀请', type: 'email' },
      { date: daysAgo(10), content: '回复近期太忙，希望以后有机会合作', type: 'email' },
    ],
  },
];

export const mockEpisodes: Episode[] = [
  {
    id: 'e1',
    title: '第25期：AI时代的创意工作者',
    topicId: 't1',
    guestId: 'g1',
    status: 'scheduled',
    publishDate: daysLater(7),
  },
  {
    id: 'e2',
    title: '第24期：远程工作的未来',
    topicId: 't2',
    status: 'editing',
    publishDate: daysLater(2),
  },
  {
    id: 'e3',
    title: '第23期：数字化转型实战',
    topicId: 't4',
    status: 'published',
    publishDate: daysAgo(5),
  },
];

export const mockOutlines: Outline[] = [
  {
    id: 'o1',
    episodeId: 'e1',
    questions: [
      { id: 'q1', content: '您觉得AI目前对创意行业最大的冲击是什么？', order: 1, estimatedTime: 5 },
      { id: 'q2', content: '您日常工作中最常使用哪些AI工具？', order: 2, estimatedTime: 8 },
      { id: 'q3', content: '创意工作者应该如何培养AI无法替代的能力？', order: 3, estimatedTime: 10 },
      { id: 'q4', content: '对于刚入行的年轻人有什么建议？', order: 4, estimatedTime: 7 },
    ],
    flow: [
      { id: 'f1', title: '开场白', description: '欢迎听众，介绍本期嘉宾和话题', duration: 2, order: 1 },
      { id: 'f2', title: 'AI现状讨论', description: '探讨AI在创意领域的应用现状', duration: 15, order: 2 },
      { id: 'f3', title: '工具实战分享', description: '嘉宾分享日常使用的AI工具和技巧', duration: 20, order: 3 },
      { id: 'f4', title: '核心能力培养', description: '讨论人类创造力的独特价值', duration: 15, order: 4 },
      { id: 'f5', title: '总结与展望', description: '给听众的建议和未来展望', duration: 8, order: 5 },
    ],
    transitions: [
      { id: 'tr1', from: '开场白', to: 'AI现状讨论', content: '好的，那我们正式进入今天的话题...' },
      { id: 'tr2', from: 'AI现状讨论', to: '工具实战分享', content: '聊了这么多大趋势，能不能给我们分享一些具体的工具...' },
      { id: 'tr3', from: '工具实战分享', to: '核心能力培养', content: '工具层面讲了很多，那在能力培养方面...' },
    ],
  },
];

export const mockSessions: RecordingSession[] = [
  {
    id: 's1',
    episodeId: 'e1',
    scheduledAt: daysLater(3),
    reminderSent: false,
    equipmentCheck: false,
    status: 'scheduled',
  },
  {
    id: 's2',
    episodeId: 'e2',
    scheduledAt: daysAgo(2),
    reminderSent: true,
    equipmentCheck: true,
    actualDuration: 3720,
    techIssues: '嘉宾网络偶有卡顿，15:30-16:00处需要修复',
    clipsToEdit: [
      { id: 'c1', startTime: 240, endTime: 310, note: '嘉宾口误，需要剪掉', type: 'cut' },
      { id: 'c2', startTime: 930, endTime: 960, note: '精彩观点，可以单独剪辑成片段', type: 'keep' },
      { id: 'c3', startTime: 2100, endTime: 2160, note: '网络卡顿，需要处理', type: 'review' },
    ],
    status: 'completed',
  },
];

export const mockFiles: RecordingFile[] = [
  {
    id: 'f1',
    sessionId: 's2',
    version: 'original',
    fileName: 'episode24_original.wav',
    fileSize: 256 * 1024 * 1024,
    duration: 3720,
    createdAt: daysAgo(2),
  },
  {
    id: 'f2',
    sessionId: 's2',
    version: 'edited',
    fileName: 'episode24_edited_v1.mp3',
    fileSize: 85 * 1024 * 1024,
    duration: 3240,
    createdAt: daysAgo(1),
  },
];

export const mockEditingTasks: EditingTask[] = [
  {
    id: 'ed1',
    episodeId: 'e2',
    cuts: [
      { id: 'cut1', startTime: 240, endTime: 310, description: '剪掉嘉宾口误部分', done: true },
      { id: 'cut2', startTime: 420, endTime: 480, description: '去掉冗长的停顿', done: true },
      { id: 'cut3', startTime: 2100, endTime: 2160, description: '修复网络卡顿片段', done: false },
      { id: 'cut4', startTime: 3100, endTime: 3200, description: '精简结尾部分', done: false },
    ],
    music: [
      { id: 'm1', name: '开场主题曲', position: 'intro', startTime: 0, volume: 0.3, done: true },
      { id: 'm2', name: '转场音效', position: 'background', startTime: 1800, volume: 0.1, done: false },
      { id: 'm3', name: '结尾曲', position: 'outro', startTime: 3180, volume: 0.3, done: false },
    ],
    cta: '如果你喜欢本期节目，请订阅我们的播客，并在评论区分享你的想法。也欢迎加入我们的听众社群，链接在节目简介中。',
    progress: 50,
    status: 'in_progress',
  },
];

export const mockTranscripts: Transcript[] = [
  {
    id: 'tr1',
    episodeId: 'e2',
    content: `主持人：欢迎收听第24期节目，今天我们来聊聊远程工作...

嘉宾：其实在疫情之前，我们公司就已经开始尝试混合办公模式...

主持人：那您觉得远程工作最大的挑战是什么？

嘉宾：我觉得是信任问题。管理者需要学会从"看工时"转向"看结果"...`,
    showNotes: [
      { id: 'sn1', timestamp: 0, content: '本期节目介绍' },
      { id: 'sn2', timestamp: 180, content: '远程工作的历史背景' },
      { id: 'sn3', timestamp: 600, content: '混合办公模式的最佳实践', link: 'https://example.com/hybrid-guide' },
      { id: 'sn4', timestamp: 1800, content: '如何建立远程团队信任' },
      { id: 'sn5', timestamp: 3000, content: '给管理者的建议' },
    ],
    progress: 75,
  },
];

export const mockAssets: Asset[] = [
  {
    id: 'a1',
    episodeId: 'e2',
    coverUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=podcast%20cover%20remote%20work%20future%20office%20modern%20minimalist%20blue%20orange&image_size=square_hd',
    images: [
      { id: 'img1', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=remote%20work%20laptop%20coffee%20home%20office&image_size=landscape_16_9', caption: '远程工作场景图' },
    ],
    designNotes: '封面采用蓝色主色调，体现科技感和未来感。使用了抽象的办公桌和网络连接元素。需要导出3种尺寸：1400x1400（播客平台）、1200x630（社交媒体）、1080x1080（Instagram）。',
  },
];

export const mockPlatforms: Platform[] = [
  { id: 'p1', name: '喜马拉雅', icon: 'radio', enabled: true },
  { id: 'p2', name: '苹果播客', icon: 'podcast', enabled: true },
  { id: 'p3', name: 'Spotify', icon: 'music', enabled: true },
  { id: 'p4', name: '小宇宙', icon: 'headphones', enabled: true },
  { id: 'p5', name: '网易云音乐', icon: 'cloud', enabled: false },
];

export const mockPublications: Publication[] = [
  {
    id: 'pub1',
    episodeId: 'e3',
    platformId: 'p1',
    status: 'published',
    publishedAt: daysAgo(5),
    url: 'https://ximalaya.com/episode/123',
  },
  {
    id: 'pub2',
    episodeId: 'e3',
    platformId: 'p2',
    status: 'published',
    publishedAt: daysAgo(5),
    url: 'https://apple.com/podcast/episode/456',
  },
  {
    id: 'pub3',
    episodeId: 'e3',
    platformId: 'p3',
    status: 'published',
    publishedAt: daysAgo(5),
    url: 'https://spotify.com/episode/789',
  },
  {
    id: 'pub4',
    episodeId: 'e2',
    platformId: 'p1',
    status: 'scheduled',
    scheduledAt: daysLater(2),
  },
  {
    id: 'pub5',
    episodeId: 'e2',
    platformId: 'p2',
    status: 'draft',
  },
];

const generateDailyData = (episodeId: string, platformId: string, days: number) => {
  const data: AnalyticsData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    data.push({
      id: `analytics-${episodeId}-${platformId}-${i}`,
      episodeId,
      platformId,
      date: daysAgo(i),
      plays: Math.floor(Math.random() * 500) + 100,
      newSubscribers: Math.floor(Math.random() * 20) + 5,
      comments: Math.floor(Math.random() * 10),
      averageListenTime: Math.floor(Math.random() * 1200) + 1200,
    });
  }
  return data;
};

export const mockAnalytics: AnalyticsData[] = [
  ...generateDailyData('e3', 'p1', 7),
  ...generateDailyData('e3', 'p2', 7),
  ...generateDailyData('e3', 'p3', 7),
];

export const mockFeedbacks: Feedback[] = [
  {
    id: 'fb1',
    episodeId: 'e3',
    content: '这期节目太棒了！作为一名传统行业的从业者，感同身受。特别是关于数据驱动决策的部分，给了我很多启发。',
    source: '苹果播客',
    highlighted: true,
    sentiment: 'positive',
    createdAt: daysAgo(4),
    author: '创业者小王',
  },
  {
    id: 'fb2',
    episodeId: 'e3',
    content: '讲得有点太泛了，希望能有更多具体的案例和可操作的方法。',
    source: '小宇宙',
    highlighted: false,
    sentiment: 'negative',
    createdAt: daysAgo(3),
    author: '产品经理小李',
  },
  {
    id: 'fb3',
    episodeId: 'e3',
    content: '请问嘉宾提到的那个数字化转型框架叫什么名字？有没有相关的书籍推荐？',
    source: '喜马拉雅',
    highlighted: true,
    sentiment: 'neutral',
    createdAt: daysAgo(2),
    author: '求知若渴',
  },
  {
    id: 'fb4',
    episodeId: 'e3',
    content: '第15分钟那段关于组织变革的论述太精彩了，反复听了三遍。',
    source: 'Spotify',
    highlighted: true,
    sentiment: 'positive',
    createdAt: daysAgo(1),
    author: '匿名用户',
  },
  {
    id: 'fb5',
    episodeId: 'e3',
    content: '嘉宾的声音很好听，内容也很专业，期待更多这样的节目。',
    source: '苹果播客',
    highlighted: false,
    sentiment: 'positive',
    createdAt: hoursLater(-5),
    author: '声控一枚',
  },
];

export const mockTodos: TodoItem[] = [
  {
    id: 'todo1',
    title: '完成第24期剪辑',
    type: 'editing',
    dueDate: daysLater(1),
    priority: 'high',
    completed: false,
  },
  {
    id: 'todo2',
    title: '联系嘉宾确认第25期录制大纲',
    type: 'planning',
    dueDate: daysLater(2),
    priority: 'high',
    completed: false,
  },
  {
    id: 'todo3',
    title: '设计第24期封面图',
    type: 'assets',
    dueDate: daysLater(1),
    priority: 'medium',
    completed: true,
  },
  {
    id: 'todo4',
    title: '准备下一期选题评估会议',
    type: 'planning',
    dueDate: daysLater(4),
    priority: 'medium',
    completed: false,
  },
  {
    id: 'todo5',
    title: '回复听众评论',
    type: 'audience',
    dueDate: daysLater(1),
    priority: 'low',
    completed: false,
  },
];
