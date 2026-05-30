import { Material, Joke, JokeVersion, Performance, ShowRecord } from '../types';

export const seedMaterials: Material[] = [
  {
    id: 'mat-1',
    content: '今天在地铁上看到一个人用手机支架架着手机看电影，结果手机掉地上了，支架还在手里，他看了看支架，又看了看地上的手机，说了一句："你倒是等等我啊"',
    category: 'society',
    tags: ['地铁', '手机', '尴尬'],
    potential: 8,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    note: '可以发展成一个关于现代人依赖科技的段子',
  },
  {
    id: 'mat-2',
    content: '我妈最近学会了用微信，每天给我发养生文章，我跟她说妈我还年轻不需要养生，她说那你每天熬夜是什么意思？我：...',
    category: 'family',
    tags: ['妈妈', '微信', '代沟'],
    potential: 9,
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z',
    note: '这个共鸣应该很强',
  },
  {
    id: 'mat-3',
    content: '公司新来了一个00后，第一天上班就问我："前辈，这个加班是必须的吗？" 我："不是必须的，是日常的。" 他："那可以不日常吗？" 我："年轻人，你还年轻。"',
    category: 'workplace',
    tags: ['加班', '00后', '职场'],
    potential: 7,
    createdAt: '2024-01-13T09:00:00Z',
    updatedAt: '2024-01-13T09:00:00Z',
  },
  {
    id: 'mat-4',
    content: '我发现一个规律：越不想被人看到的状态，朋友圈越有人点赞；越想被人看到的成就，反而没人理。',
    category: 'personal',
    tags: ['社交', '心理'],
    potential: 6,
    createdAt: '2024-01-12T20:15:00Z',
    updatedAt: '2024-01-12T20:15:00Z',
  },
];

export const seedJokes: Joke[] = [
  {
    id: 'joke-1',
    materialId: 'mat-2',
    title: '妈妈的养生文章',
    setup: '我妈最近学会了用微信，她现在最大的爱好就是每天给我发各种养生文章。我跟她说："妈，我还年轻，不需要养生。" 你们猜她怎么说？',
    punchline: '她看了我一眼说："那你每天熬夜到三点是什么意思？修仙啊？"',
    tag: '所以现在我开始怀疑，我妈可能比我更懂我自己的身体。',
    estimatedDuration: 90,
    category: 'family',
    tags: ['妈妈', '微信', '代沟'],
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z',
  },
  {
    id: 'joke-2',
    materialId: 'mat-1',
    title: '地铁上的手机',
    setup: '现在的人啊，手机支架比手机还重要。前几天在地铁上看到一个人，手机掉地上了，支架还在手里紧紧握着。',
    punchline: '他看了看手里的支架，又看了看地上的手机，很认真地说了一句："你跑这么快干嘛？我还没准备好呢。"',
    tag: '那一刻我明白了，我们不是离不开手机，我们是离不开那种"一切尽在掌握"的错觉。',
    estimatedDuration: 75,
    category: 'society',
    tags: ['地铁', '手机', '科技'],
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
];

export const seedJokeVersions: JokeVersion[] = [
  {
    id: 'ver-1',
    jokeId: 'joke-1',
    versionNumber: 1,
    setup: '我妈会用微信了，天天给我发养生文章。我说我年轻不用，她说那你熬夜干嘛？',
    punchline: '她说那你每天熬夜到三点是什么意思？',
    tag: '',
    changeReason: '初版',
    createdAt: '2024-01-14T16:00:00Z',
  },
  {
    id: 'ver-2',
    jokeId: 'joke-1',
    versionNumber: 2,
    setup: '我妈最近学会了用微信，她现在最大的爱好就是每天给我发各种养生文章。我跟她说："妈，我还年轻，不需要养生。" 你们猜她怎么说？',
    punchline: '她看了我一眼说："那你每天熬夜到三点是什么意思？修仙啊？"',
    tag: '所以现在我开始怀疑，我妈可能比我更懂我自己的身体。',
    changeReason: '增加互动感，添加修仙这个网络热词，更接地气',
    createdAt: '2024-01-16T14:00:00Z',
  },
];

export const seedPerformances: Performance[] = [
  {
    id: 'perf-1',
    name: '开放麦首秀',
    occasion: 'open_mic',
    targetDuration: 10,
    date: '2024-01-20',
    venue: '本地喜剧俱乐部',
    jokeSlots: [
      { id: 'slot-1', jokeId: 'joke-2', order: 1, transition: '开场热场' },
      { id: 'slot-2', jokeId: 'joke-1', order: 2, transition: '说到家人...' },
    ],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
];

export const seedRecords: ShowRecord[] = [
  {
    id: 'rec-1',
    performanceId: 'perf-1',
    date: '2024-01-20',
    venue: '本地喜剧俱乐部',
    audienceType: 'general',
    audienceSize: 35,
    overallFeedback: '整体不错，互动需要加强',
    overallRating: 7,
    jokeFeedbacks: [
      {
        jokeId: 'joke-2',
        landed: true,
        laughterDuration: 3,
        bestLines: ['你跑这么快干嘛？我还没准备好呢。'],
        weakPoints: [],
      },
      {
        jokeId: 'joke-1',
        landed: true,
        laughterDuration: 5,
        bestLines: ['修仙啊？'],
        weakPoints: ['互动可以更多'],
      },
    ],
    selfEvaluation: {
      rhythmRating: 7,
      bodyLanguageRating: 6,
      interactionRating: 5,
      comment: '节奏还可以，但是肢体语言需要更自然，观众互动部分需要提前设计',
    },
    videoNotes: [
      { id: 'vn-1', timestamp: 120, note: '这里观众反应不错，保持这个节奏', type: 'good' },
      { id: 'vn-2', timestamp: 180, note: '这里停顿太长，下次注意', type: 'improvement' },
    ],
    createdAt: '2024-01-20T22:00:00Z',
  },
  {
    id: 'rec-2',
    performanceId: 'perf-1',
    date: '2024-02-05',
    venue: '另一家俱乐部',
    audienceType: 'general',
    audienceSize: 50,
    overallFeedback: '比上一场好，互动有进步',
    overallRating: 8,
    jokeFeedbacks: [
      {
        jokeId: 'joke-2',
        landed: true,
        laughterDuration: 4,
        bestLines: ['你跑这么快干嘛？'],
        weakPoints: [],
      },
      {
        jokeId: 'joke-1',
        landed: true,
        laughterDuration: 6,
        bestLines: ['修仙啊？', '我妈比我更懂我'],
        weakPoints: [],
      },
    ],
    selfEvaluation: {
      rhythmRating: 8,
      bodyLanguageRating: 7,
      interactionRating: 7,
      comment: '有进步！根据上次的反馈做了调整，效果明显。继续优化停顿节奏',
    },
    videoNotes: [],
    createdAt: '2024-02-05T22:30:00Z',
  },
];
