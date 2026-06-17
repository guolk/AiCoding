import type {
  Topic, Argument, Match, Review, ReviewArgument, Member,
  SkillAssessment, Practice, SpeechFragment, Todo
} from '../../shared/types.js'

let nextId = {
  topic: 100, argument: 200, match: 100, review: 100, reviewArgument: 100,
  member: 100, skill: 100, practice: 100, fragment: 100, todo: 100,
}

export const topics: Topic[] = [
  {
    id: 1, title: '人工智能应该取代人类的大部分工作',
    type: 'value', difficulty: 4, field: '科技伦理',
    description: '探讨AI在社会分工中的定位，以及人机协作的未来',
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 2, title: '当代大学生更应该注重专业深度还是综合广度',
    type: 'value', difficulty: 3, field: '教育',
    description: '讨论高等教育的培养方向与社会需求',
    createdAt: '2026-05-05T10:00:00Z',
  },
  {
    id: 3, title: '网络语言的流行对汉语发展利大于弊',
    type: 'value', difficulty: 3, field: '文化',
    description: '探讨互联网时代语言的演变',
    createdAt: '2026-05-08T11:00:00Z',
  },
  {
    id: 4, title: '高校应该全面推行宽进严出制度',
    type: 'policy', difficulty: 4, field: '教育',
    description: '讨论高等教育入学与毕业标准的改革',
    createdAt: '2026-05-10T09:30:00Z',
  },
  {
    id: 5, title: '应该全面禁止宠物食用野生动物',
    type: 'policy', difficulty: 2, field: '社会',
    description: '公共卫生与动物权益的平衡',
    createdAt: '2026-05-12T14:00:00Z',
  },
  {
    id: 6, title: '短视频平台的兴起提升/降低了公众的信息素养',
    type: 'fact', difficulty: 3, field: '媒体',
    description: '碎片化信息时代的认知能力探讨',
    createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 7, title: '应该在中小学全面推行人工智能教育',
    type: 'policy', difficulty: 3, field: '教育',
    description: '科技素养的从小培养',
    createdAt: '2026-05-18T09:00:00Z',
  },
  {
    id: 8, title: '佛系标签对青年成长弊大于利',
    type: 'value', difficulty: 3, field: '社会',
    description: '当代青年的价值观与心态',
    createdAt: '2026-05-20T11:00:00Z',
  },
]

export const argumentList: Argument[] = [
  // Topic 1: AI
  { id: 1, topicId: 1, side: 'pro', content: 'AI的高效率能推动社会生产力跨越式发展', evidence: '麦肯锡报告：AI自动化可提升全球GDP 1.2%/年', framework: 'fact', strength: 8, rebuttal: '但效率不等于公平，大量失业会引发动荡', response: '新产业会创造新岗位，历史上工业革命也是如此' },
  { id: 2, topicId: 1, side: 'pro', content: '人类应从重复性劳动中解放，追求更有意义的创造', evidence: '马斯洛需求层次理论：自我实现是最高需求', framework: 'value', strength: 9, rebuttal: '并非所有人都具备创造性劳动的能力', response: '社会应提供终身学习体系赋能个体转型' },
  { id: 3, topicId: 1, side: 'pro', content: 'AI在专业领域的决策精度已经超越人类', evidence: 'DeepMind在医疗诊断中准确率超过资深医生', framework: 'fact', strength: 7 },
  { id: 4, topicId: 1, side: 'con', content: '大规模失业将引发严重的社会不平等与动荡', evidence: '2008金融危机后失业率上升导致社会运动频发', framework: 'fact', strength: 9, rebuttal: '历史上技术革命最终创造了更多岗位', response: 'AI的替代速度远超此前，社会缓冲期不够' },
  { id: 5, topicId: 1, side: 'con', content: '人类工作的价值不仅在效率，更在情感与温度', evidence: '护理、教育等行业中人文关怀不可替代', framework: 'value', strength: 8, rebuttal: '情感劳动恰恰是AI最难替代的领域', response: '正方说的"大部分工作"包括这些服务行业' },
  { id: 6, topicId: 1, side: 'con', content: '人类失去工作会陷入存在意义危机', evidence: '存在主义心理学：劳动是自我实现的重要途径', framework: 'value', strength: 7 },
  // Topic 2: 深度vs广度
  { id: 7, topicId: 2, side: 'pro', content: '专才是社会分工细化的必然要求', evidence: '现代科研/技术需要10000小时才能成为专家', framework: 'fact', strength: 8, rebuttal: '跨学科创新是突破的重要来源', response: '深度是跨界的基础，无深度的广度是浅薄' },
  { id: 8, topicId: 2, side: 'pro', content: '专业深度决定个人的核心竞争力', evidence: 'T型人才模型中垂直那一划是基础', framework: 'value', strength: 9 },
  { id: 9, topicId: 2, side: 'con', content: '跨界复合型人才更适应快速变化的时代', evidence: 'Uber/Airbnb都是跨界创新的典范', framework: 'fact', strength: 9, rebuttal: '跨界需要至少在一个领域有深度理解', response: '广度是抓住新机遇的前提，深度可以后期补' },
  { id: 10, topicId: 2, side: 'con', content: '综合素养是个人成长的长期底色', evidence: '通识教育是世界名校的普遍传统', framework: 'value', strength: 8 },
  // Topic 3: 网络语言
  { id: 11, topicId: 3, side: 'pro', content: '网络语言丰富了汉语的表达力与创造力', evidence: '每年新词汇被《现代汉语词典》收录', framework: 'fact', strength: 7 },
  { id: 12, topicId: 3, side: 'pro', content: '语言本就是活的，自然演变不应被人为限制', evidence: '汉语历经千年演变，每一次融合都是活力体现', framework: 'value', strength: 8 },
  { id: 13, topicId: 3, side: 'con', content: '网络语言的碎片化会降低人们的深度表达能力', evidence: '多篇学术论文指出青少年写作逻辑弱化', framework: 'fact', strength: 8 },
  { id: 14, topicId: 3, side: 'con', content: '过度使用网络语言会造成代际沟通壁垒', evidence: '00后与60后在语言上的鸿沟日益显著', framework: 'fact', strength: 7 },
  // Topic 4: 宽进严出
  { id: 15, topicId: 4, side: 'pro', content: '宽进严出能真正提升高等教育质量', evidence: '欧美名校普遍实行严出制度，毕业质量更高', framework: 'fact', strength: 9 },
  { id: 16, topicId: 4, side: 'con', content: '严出会加剧学生压力与心理健康问题', evidence: '清华北大等名校退学率引发关注', framework: 'fact', strength: 7 },
]

export const matches: Match[] = [
  { id: 1, topicId: 1, date: '2026-06-22T14:00:00Z', venue: '学术报告厅A', teamA: '晨曦辩论社', teamB: '星辰辩论队', status: 'upcoming' },
  { id: 2, topicId: 2, date: '2026-06-25T15:30:00Z', venue: '主楼301', teamA: '晨曦辩论社', teamB: '风云演讲社', status: 'upcoming' },
  { id: 3, topicId: 1, date: '2026-05-20T14:00:00Z', venue: '学术报告厅B', teamA: '晨曦辩论社', teamB: '星辰辩论队', winner: '晨曦辩论社', bestSpeaker: '张明', status: 'completed' },
  { id: 4, topicId: 3, date: '2026-05-18T10:00:00Z', venue: '图书馆多功能厅', teamA: '风云演讲社', teamB: '星辰辩论队', winner: '星辰辩论队', bestSpeaker: '李悦', status: 'completed' },
  { id: 5, topicId: 5, date: '2026-06-30T09:00:00Z', venue: '学术报告厅A', teamA: '晨曦辩论社', teamB: '论剑辩论社', status: 'upcoming' },
  { id: 6, topicId: 4, date: '2026-05-10T14:00:00Z', venue: '主楼205', teamA: '论剑辩论社', teamB: '风云演讲社', winner: '论剑辩论社', bestSpeaker: '王浩', status: 'completed' },
]

export const reviews: Review[] = [
  { id: 1, matchId: 3, notes: '晨曦辩论社抓住了生产力提升这一核心，用数据有力支撑了论点。星辰辩论队在社会不平等的反驳上角度新颖，但未能深入展开。', createdAt: '2026-05-21T09:00:00Z' },
  { id: 2, matchId: 4, notes: '星辰辩论队在事实依据层面准备充分，代际沟通的案例打动评委。网络语言创造力的举证略显单薄。', createdAt: '2026-05-19T09:00:00Z' },
]

export const reviewArguments: ReviewArgument[] = [
  { id: 1, reviewId: 1, argumentId: 1, effectiveness: 'effective' },
  { id: 2, reviewId: 1, argumentId: 2, effectiveness: 'effective' },
  { id: 3, reviewId: 1, argumentId: 4, effectiveness: 'failed' },
  { id: 4, reviewId: 2, argumentId: 13, effectiveness: 'effective' },
  { id: 5, reviewId: 2, argumentId: 11, effectiveness: 'failed' },
]

export const members: Member[] = [
  { id: 1, name: '张明', role: 'captain', joinDate: '2024-09-01T00:00:00Z' },
  { id: 2, name: '李悦', role: 'member', joinDate: '2024-09-01T00:00:00Z' },
  { id: 3, name: '王浩', role: 'member', joinDate: '2024-09-15T00:00:00Z' },
  { id: 4, name: '陈雪', role: 'member', joinDate: '2025-03-01T00:00:00Z' },
  { id: 5, name: '刘老师', role: 'coach', joinDate: '2024-09-01T00:00:00Z' },
  { id: 6, name: '赵一凡', role: 'member', joinDate: '2025-09-01T00:00:00Z' },
]

export const skillAssessments: SkillAssessment[] = [
  { id: 1, memberId: 1, argumentation: 9, interrogation: 8, speech: 7, improvisation: 8, assessedAt: '2026-05-30T00:00:00Z' },
  { id: 2, memberId: 2, argumentation: 8, interrogation: 9, speech: 9, improvisation: 7, assessedAt: '2026-05-30T00:00:00Z' },
  { id: 3, memberId: 3, argumentation: 7, interrogation: 7, speech: 8, improvisation: 8, assessedAt: '2026-05-30T00:00:00Z' },
  { id: 4, memberId: 4, argumentation: 6, interrogation: 5, speech: 7, improvisation: 6, assessedAt: '2026-05-30T00:00:00Z' },
  { id: 5, memberId: 6, argumentation: 7, interrogation: 6, speech: 6, improvisation: 7, assessedAt: '2026-05-30T00:00:00Z' },
]

export const practices: Practice[] = [
  { id: 1, memberId: 4, topicId: 1, type: 'argumentation', content: 'AI辩题立论框架练习，构建了三层论点结构', notes: '对价值判断层的理解仍需深化', date: '2026-06-10T00:00:00Z' },
  { id: 2, memberId: 4, type: 'interrogation', content: '盘问环节模拟训练：针对定义模糊点进行追问', notes: '追问的连贯性需要加强，避免被对方转移话题', date: '2026-06-12T00:00:00Z' },
  { id: 3, memberId: 6, topicId: 2, type: 'speech', content: '3分钟陈词练习：深度与广度的价值比较', notes: '语速偏快，结尾升华不够自然', date: '2026-06-14T00:00:00Z' },
  { id: 4, memberId: 2, type: 'improvisation', content: '即兴反驳训练：10个常见论点快速反驳', notes: '表现优秀，可尝试更刁钻的角度', date: '2026-06-15T00:00:00Z' },
  { id: 5, memberId: 4, type: 'improvisation', content: '即兴立论练习：随机抽取辩题3分钟准备', notes: '逻辑链构建较慢，需要积累更多通用框架', date: '2026-06-16T00:00:00Z' },
]

export const speechFragments: SpeechFragment[] = [
  { id: 1, memberId: 2, topicId: 1, content: '当我们谈论AI取代工作时，我们其实在谈一个更根本的问题：人类究竟想要一个怎样的未来？是把人困在流水线上做机器的奴隶，还是让科技成为解放人的翅膀？我相信答案是后者。', tags: '升华,开篇,价值层', notes: '非常精彩的价值升华，节奏和情感配合完美，可作为开篇范本学习', createdAt: '2026-05-20T14:30:00Z' },
  { id: 2, memberId: 1, topicId: 1, content: '对方辩友刚才说失业会引发动荡，那请问第一次工业革命时，也有人担心纺车工人失业，但最终创造的岗位远超失去的岗位。历史已经证明：害怕进步本身才是最大的风险。', tags: '反驳,类比,历史例证', notes: '类比反驳的典范，历史案例与逻辑推导结合紧密', createdAt: '2026-05-20T14:45:00Z' },
  { id: 3, memberId: 3, topicId: 3, content: '各位，语言的本质是什么？是沟通。当爷爷奶奶听不懂孙子孙女的"yyds""emo"时，语言最基本的沟通功能都被割裂了，我们还能谈什么发展？', tags: '定义切入,反问,生活化案例', notes: '从定义切入的技巧值得学习，反问有力，案例贴近评委', createdAt: '2026-05-18T10:15:00Z' },
  { id: 4, memberId: 2, topicId: 4, content: '严出，不是为了把学生拦在毕业门外，而是为了让每一张毕业证都代表着真正的实力。宽进给了每个人机会，严出才是对所有努力者的公平。', tags: '价值升华,结尾', notes: '结尾点题+价值升华，是典型的好结辩句式', createdAt: '2026-06-01T15:00:00Z' },
]

export const todos: Todo[] = [
  { id: 1, title: '准备AI辩题反方论点补充', status: 'pending', priority: 'high', topicId: 1, dueDate: '2026-06-20T00:00:00Z' },
  { id: 2, title: '完成5月20日比赛复盘报告', status: 'completed', priority: 'medium', topicId: 1, dueDate: '2026-05-22T00:00:00Z' },
  { id: 3, title: '组织陈雪的盘问专项训练', status: 'pending', priority: 'high', dueDate: '2026-06-19T00:00:00Z' },
  { id: 4, title: '整理近期优秀发言片段', status: 'pending', priority: 'low', dueDate: '2026-06-28T00:00:00Z' },
  { id: 5, title: '准备宽进严出辩题的正方立论', status: 'pending', priority: 'medium', topicId: 4, dueDate: '2026-06-25T00:00:00Z' },
]

export function getNextId(type: keyof typeof nextId): number {
  return ++nextId[type]
}
