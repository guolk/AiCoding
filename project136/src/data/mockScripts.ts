import type { CommentaryScript, TimelineMarker, EmergencyLine, ListenerFeedback, SkillImprovement, PrepChecklist, SentimentType, SkillCategory, ChecklistCategory } from '../types';

export const mockScripts: CommentaryScript[] = [
  {
    id: 'script-1',
    matchId: 'match-1',
    background: '欧冠半决赛首回合，皇马坐镇伯纳乌迎战巴萨。这是本赛季两队的第三次交锋，前两次交手皇马一胜一平稍占上风。两队球迷都对这场比赛充满期待，伯纳乌球场座无虚席。',
    teamIntro: '皇家马德里方面，安切洛蒂派出了最强阵容，贝林厄姆领衔中场，维尼修斯和罗德里戈组成锋线。巴塞罗那这边，哈维延续了4-3-3阵型，莱万多夫斯基突前，佩德里和加维坐镇中场。',
    tacticalAnalysis: '皇马预计会利用维尼修斯的速度冲击巴萨的右路，通过快速反击制造威胁。而巴萨则会坚持他们的传控打法，利用中场的控球优势逐步推进。中场的争夺将是决定比赛走势的关键。',
    historyBattle: '两队历史上共交锋258次，皇马102胜59平97负略占上风。在欧冠赛场上，皇马6胜3平2负占据优势。上赛季欧冠半决赛，皇马正是淘汰了巴萨最终夺冠。',
    suspenseSetup: '本场比赛有几个看点：1.贝林厄姆能否继续他的进球状态？2.巴萨的防线能否限制住维尼修斯？3.莫德里奇会首发吗？让我们拭目以待！',
    createdAt: '2026-06-03T10:00:00',
    updatedAt: '2026-06-04T15:30:00'
  },
  {
    id: 'script-2',
    matchId: 'match-3',
    background: '欧冠小组赛第一轮，拜仁主场迎战大巴黎。这是一场德甲霸主对阵法甲新贵的强强对话。安联球场的气氛从开场就将达到顶点。',
    teamIntro: '拜仁慕尼黑方面，凯恩领衔锋线，穆西亚拉和萨内分居两翼。大巴黎这边，姆巴佩和登贝莱组成恐怖的攻击线，多纳鲁马镇守龙门。',
    tacticalAnalysis: '拜仁会利用主场优势主动出击，通过边路的传中和中路的后插上制造威胁。大巴黎则会依靠姆巴佩的速度打反击，利用拜仁后压上留下的空间。',
    historyBattle: '两队历史上共交锋12次，拜仁5胜4平3负稍占优势。最近一次交手是在2023年欧冠决赛，拜仁1-0获胜夺冠。',
    suspenseSetup: '凯恩能否攻破大巴黎的球门？姆巴佩会有怎样的表现？让我们一起见证这场精彩对决！',
    createdAt: '2026-06-01T09:00:00',
    updatedAt: '2026-06-02T14:20:00'
  },
  {
    id: 'script-3',
    matchId: 'match-4',
    background: '意甲第35轮，尤文主场迎战AC米兰。这是一场关乎欧冠资格的关键战役，两队都不容有失。都灵安联球场将见证这场意大利国家德比。',
    teamIntro: '尤文图斯方面，弗拉霍维奇突前，拉比奥和洛卡特利组成双后腰。AC米兰这边，莱奥和普利希奇组成双翼，吉鲁担任单箭头。',
    tacticalAnalysis: '尤文会采取稳守反击的策略，利用弗拉霍维奇的高空优势和速度制造威胁。米兰则会通过边路的突破和传中来寻找破门机会。',
    historyBattle: '两队历史交锋178次，尤文70胜59平49负占优。本赛季首回合交手，米兰主场2-0获胜。',
    suspenseSetup: '弗拉霍维奇能否延续进球状态？米兰的防线能否顶住尤文的反击？让我们拭目以待！',
    createdAt: '2026-06-04T11:00:00',
    updatedAt: '2026-06-05T10:15:00'
  }
];

export const mockTimelineMarkers: TimelineMarker[] = [
  { id: 'marker-1', scriptId: 'script-1', timePoint: 0, content: '开场介绍：欢迎各位收看欧冠半决赛', type: 'general', priority: 'high' },
  { id: 'marker-2', scriptId: 'script-1', timePoint: 5, content: '介绍双方首发阵容和阵型', type: 'general', priority: 'medium' },
  { id: 'marker-3', scriptId: 'script-1', timePoint: 15, content: '强调中场争夺的重要性', type: 'key', priority: 'high' },
  { id: 'marker-4', scriptId: 'script-1', timePoint: 30, content: '分析上半场战术执行情况', type: 'general', priority: 'medium' },
  { id: 'marker-5', scriptId: 'script-1', timePoint: 45, content: '中场休息总结：比分、数据、关键事件', type: 'key', priority: 'high' },
  { id: 'marker-6', scriptId: 'script-1', timePoint: 60, content: '关注换人调整', type: 'general', priority: 'medium' },
  { id: 'marker-7', scriptId: 'script-1', timePoint: 75, content: '分析双方体能状况', type: 'general', priority: 'medium' },
  { id: 'marker-8', scriptId: 'script-1', timePoint: 85, content: '强调比赛收官阶段', type: 'key', priority: 'high' },
  { id: 'marker-9', scriptId: 'script-2', timePoint: 0, content: '开场介绍：欧冠小组赛首轮焦点战', type: 'general', priority: 'high' },
  { id: 'marker-10', scriptId: 'script-2', timePoint: 10, content: '分析凯恩的战术作用', type: 'key', priority: 'high' },
  { id: 'marker-11', scriptId: 'script-2', timePoint: 45, content: '中场总结：姆巴佩的表现', type: 'key', priority: 'high' },
  { id: 'marker-12', scriptId: 'script-3', timePoint: 0, content: '开场介绍：意大利国家德比', type: 'general', priority: 'high' },
  { id: 'marker-13', scriptId: 'script-3', timePoint: 20, content: '关注弗拉霍维奇的跑位', type: 'key', priority: 'high' }
];

export const mockEmergencyLines: EmergencyLine[] = [
  { id: 'line-1', category: 'interruption', content: '观众朋友们，我们的信号出现了一点问题，技术人员正在紧急处理，请大家稍等片刻。', tags: ['信号中断', '技术问题'], usageCount: 3 },
  { id: 'line-2', category: 'interruption', content: '抱歉，我们暂时失去了现场画面，请不要走开，信号马上就会恢复。', tags: ['画面中断', '技术故障'], usageCount: 2 },
  { id: 'line-3', category: 'delay', content: '比赛出现了短暂的中断，让我们利用这个时间来回顾一下上半场的精彩瞬间。', tags: ['比赛暂停', '回看'], usageCount: 5 },
  { id: 'line-4', category: 'delay', content: '看来裁判需要查看VAR，趁这个机会我们来分析一下刚才这次进攻的战术配合。', tags: ['VAR', '战术分析'], usageCount: 8 },
  { id: 'line-5', category: 'accident', content: '场上出现了球员受伤的情况，让我们共同为这位球员祈祷，希望他没有大碍。', tags: ['球员受伤', '突发情况'], usageCount: 2 },
  { id: 'line-6', category: 'accident', content: '场上发生了一些意外情况，我们看到裁判正在与双方球员沟通，让我们静待事件的发展。', tags: ['冲突', '突发'], usageCount: 1 },
  { id: 'line-7', category: 'other', content: '各位观众，由于现场天气原因，比赛可能会受到一些影响，我们会持续为大家关注最新情况。', tags: ['天气', '环境'], usageCount: 1 },
  { id: 'line-8', category: 'other', content: '让我们稍事休息，稍后为您带来更加精彩的比赛解说。', tags: ['广告', '休息'], usageCount: 6 }
];

export const mockPrepChecklists: PrepChecklist[] = [
  {
    id: 'checklist-1',
    matchId: 'match-1',
    items: [
      { id: 'item-1', title: '收集球队近期数据', description: '获取近5场比赛数据和关键球员状态', category: 'data' as ChecklistCategory, completed: true },
      { id: 'item-2', title: '研究历史交锋记录', description: '整理两队近10次交手的战绩和关键数据', category: 'data' as ChecklistCategory, completed: true },
      { id: 'item-3', title: '测试麦克风设备', description: '检查主麦克风和备用麦克风的工作状态', category: 'equipment' as ChecklistCategory, completed: true },
      { id: 'item-4', title: '检查网络连接', description: '测试直播网络的稳定性和带宽', category: 'equipment' as ChecklistCategory, completed: false },
      { id: 'item-5', title: '完成背景介绍初稿', description: '撰写比赛背景和赛事重要性介绍', category: 'script' as ChecklistCategory, completed: true },
      { id: 'item-6', title: '准备战术分析要点', description: '分析双方战术打法和关键对位', category: 'script' as ChecklistCategory, completed: false },
      { id: 'item-7', title: '制作时间轴标记', description: '标注解说的关键时间节点和内容', category: 'script' as ChecklistCategory, completed: false }
    ],
    completedCount: 4,
    totalCount: 7
  }
];

export const mockReviews = [
  {
    id: 'review-1',
    matchId: 'match-3',
    highlights: '今天的解说整体节奏把握得很好，开场介绍很精彩，战术分析也比较到位。特别是第67分钟对姆巴佩进球的分析，很有层次感。数据调用也很及时。',
    improvements: '下半场后半段语速有点快，部分细节没有讲清楚。另外在换人调整的分析上可以更深入一些，探讨一下战术变化的原因。',
    createdAt: '2026-06-03T23:30:00'
  },
  {
    id: 'review-2',
    matchId: 'match-8',
    highlights: '开场悬念设置得很好，调动了观众的情绪。加时赛阶段的解说很有激情，与比赛的紧张氛围很契合。',
    improvements: '上半场第25分钟的一次越位判罚解读有误，需要加强对规则的熟悉。另外有些专业术语的使用频率可以适当减少。',
    createdAt: '2026-06-01T22:45:00'
  }
];

export const mockListenerFeedback: ListenerFeedback[] = [
  { id: 'feedback-1', reviewId: 'review-1', source: '直播弹幕', content: '解说太专业了，战术分析一针见血！', sentiment: 'positive' as SentimentType, keywords: ['专业', '战术分析'] },
  { id: 'feedback-2', reviewId: 'review-1', source: '直播弹幕', content: '语速有点快，听不太清', sentiment: 'negative' as SentimentType, keywords: ['语速', '听不清'] },
  { id: 'feedback-3', reviewId: 'review-1', source: '社交媒体', content: '姆巴佩进球那段解说太燃了！', sentiment: 'positive' as SentimentType, keywords: ['激情', '进球'] },
  { id: 'feedback-4', reviewId: 'review-1', source: '直播留言', content: '数据很详细，学到了很多', sentiment: 'positive' as SentimentType, keywords: ['数据', '详细'] },
  { id: 'feedback-5', reviewId: 'review-2', source: '社交媒体', content: '越位那个判罚解说错了吧', sentiment: 'negative' as SentimentType, keywords: ['误判', '越位'] },
  { id: 'feedback-6', reviewId: 'review-2', source: '直播弹幕', content: '加时赛的解说太棒了，有那味儿了', sentiment: 'positive' as SentimentType, keywords: ['加时赛', '激情'] }
];

export const mockSkillImprovements: SkillImprovement[] = [
  {
    id: 'skill-1',
    category: 'speech_speed' as SkillCategory,
    goal: '保持稳定的语速，每分钟控制在180-200字之间',
    practiceLog: '每天进行30分钟的朗读练习，录制自己的解说并回听分析。最近3场比赛的语速控制有明显进步，只有在比赛激烈时段偶尔会加快。',
    progress: 75,
    startDate: '2026-05-01'
  },
  {
    id: 'skill-2',
    category: 'terminology' as SkillCategory,
    goal: '正确使用足球专业术语，避免错误和滥用',
    practiceLog: '每周学习5个新的战术术语，在解说中适当运用。已经学习了20个术语，正在努力在合适的时机使用。',
    progress: 60,
    startDate: '2026-05-10'
  },
  {
    id: 'skill-3',
    category: 'emotion' as SkillCategory,
    goal: '在关键时刻能够调动气氛，把握煽情的时机',
    practiceLog: '观看经典比赛的解说录像，学习前辈的情绪调动技巧。最近两场关键比赛的情绪表达收到了不错的反馈。',
    progress: 50,
    startDate: '2026-05-15'
  },
  {
    id: 'skill-4',
    category: 'other' as SkillCategory,
    goal: '提升数据分析能力，能够快速解读关键数据',
    practiceLog: '每天花30分钟研究数据统计方法，学习如何将数据转化为观众听得懂的语言。',
    progress: 40,
    startDate: '2026-05-20'
  }
];
