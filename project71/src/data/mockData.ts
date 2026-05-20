import { DialogueScenario, Word, Phrase, GrammarError, ProgressData, Video, NewsItem, CollocationExercise, UserProfile, NewsVocabulary } from '../types'

export const userProfile: UserProfile = {
  name: '学习者',
  level: 'intermediate',
  vocabularySize: 3500,
  vocabularyCount: 3500,
  streak: 7,
  totalPracticeTime: 1260
}

export const dialogueScenarios: DialogueScenario[] = [
  {
    id: '1',
    title: '餐厅点餐',
    description: '在西餐厅学习如何点餐、询问菜品和结账',
    category: 'restaurant',
    icon: '🍽️',
    difficulty: 'easy',
    roles: ['顾客', '服务员'],
    lines: [
      { id: 'l1', speaker: '服务员', role: '服务员', text: 'Good evening! Welcome to our restaurant. Do you have a reservation?', hint: '晚上好！欢迎来到我们餐厅。您有预订吗？' },
      { id: 'l2', speaker: '顾客', role: '顾客', text: 'Good evening. A table for two, please.', hint: '晚上好。请给我们一个两人桌。' },
      { id: 'l3', speaker: '服务员', role: '服务员', text: 'Certainly. Right this way. Here are your menus. May I take your order?', hint: '好的。这边请。这是菜单。您现在要点餐吗？' },
      { id: 'l4', speaker: '顾客', role: '顾客', text: 'Yes, I\'d like the steak, medium rare, with a side of vegetables.', hint: '是的，我要牛排，五分熟，配蔬菜。' },
      { id: 'l5', speaker: '服务员', role: '服务员', text: 'Excellent choice. Would you like anything to drink?', hint: '很好的选择。您想喝点什么吗？' },
      { id: 'l6', speaker: '顾客', role: '顾客', text: 'Just a glass of water, please. And could we get the bill later?', hint: '一杯水就好。稍后能把账单给我们吗？' },
      { id: 'l7', speaker: '服务员', role: '服务员', text: 'Of course. Enjoy your meal!', hint: '当然。祝您用餐愉快！' }
    ]
  },
  {
    id: '2',
    title: '问路',
    description: '在陌生城市询问方向和交通方式',
    category: 'direction',
    icon: '🗺️',
    difficulty: 'easy',
    roles: ['路人', '询问者'],
    lines: [
      { id: 'l1', speaker: '询问者', role: '询问者', text: 'Excuse me, could you help me find the nearest subway station?', hint: '打扰一下，您能帮我找到最近的地铁站吗？' },
      { id: 'l2', speaker: '路人', role: '路人', text: 'Sure! Go straight for two blocks, then turn right. You\'ll see it on your left.', hint: '当然！直走两个街区，然后右转。它就在你的左边。' },
      { id: 'l3', speaker: '询问者', role: '询问者', text: 'How long will it take to walk there?', hint: '走到那里需要多长时间？' },
      { id: 'l4', speaker: '路人', role: '路人', text: 'About 10 minutes. Or you can take bus number 5, it\'s faster.', hint: '大约10分钟。或者你可以坐5路公交车，更快。' },
      { id: 'l5', speaker: '询问者', role: '询问者', text: 'Thank you so much! I really appreciate your help.', hint: '非常感谢！真的很感谢你的帮助。' },
      { id: 'l6', speaker: '路人', role: '路人', text: 'You\'re welcome! Have a great day.', hint: '不客气！祝你今天愉快。' }
    ]
  },
  {
    id: '3',
    title: '购物',
    description: '在商场购物时询问价格、尺码和讨价还价',
    category: 'shopping',
    icon: '🛍️',
    difficulty: 'medium',
    roles: ['顾客', '店员'],
    lines: [
      { id: 'l1', speaker: '店员', role: '店员', text: 'Good afternoon! Is there anything I can help you with today?', hint: '下午好！今天有什么可以帮您的吗？' },
      { id: 'l2', speaker: '顾客', role: '顾客', text: 'Hi, I\'m looking for a leather jacket. Do you have this in a size medium?', hint: '你好，我在找一件皮夹克。这款有中号的吗？' },
      { id: 'l3', speaker: '店员', role: '店员', text: 'Let me check... Yes, we do. Would you like to try it on? The fitting room is over there.', hint: '我查一下...是的，有。您想试穿一下吗？试衣间在那边。' },
      { id: 'l4', speaker: '顾客', role: '顾客', text: 'It fits perfectly. How much is it?', hint: '非常合身。多少钱？' },
      { id: 'l5', speaker: '店员', role: '店员', text: 'It\'s $299. But it\'s on sale this week for 20% off.', hint: '299美元。但是这周打八折。' },
      { id: 'l6', speaker: '顾客', role: '顾客', text: 'That\'s a good deal. I\'ll take it. Can I pay by credit card?', hint: '很划算。我买了。可以刷信用卡吗？' },
      { id: 'l7', speaker: '店员', role: '店员', text: 'Absolutely. Would you like a receipt and a gift bag?', hint: '当然可以。您需要收据和礼品袋吗？' }
    ]
  },
  {
    id: '4',
    title: '就医',
    description: '在医院描述症状、预约和询问医嘱',
    category: 'hospital',
    icon: '🏥',
    difficulty: 'medium',
    roles: ['病人', '医生'],
    lines: [
      { id: 'l1', speaker: '医生', role: '医生', text: 'Good morning. What seems to be the problem today?', hint: '早上好。今天哪里不舒服？' },
      { id: 'l2', speaker: '病人', role: '病人', text: 'Good morning, Doctor. I\'ve been having a headache and a sore throat for three days.', hint: '早上好，医生。我头痛和喉咙痛已经三天了。' },
      { id: 'l3', speaker: '医生', role: '医生', text: 'Let me examine you. Do you have a fever or cough?', hint: '让我检查一下。你发烧或咳嗽吗？' },
      { id: 'l4', speaker: '病人', role: '病人', text: 'I had a mild fever yesterday, but no cough. I also feel very tired.', hint: '我昨天有点低烧，但不咳嗽。我也感觉很累。' },
      { id: 'l5', speaker: '医生', role: '医生', text: 'It sounds like you have a viral infection. I\'ll prescribe some medicine for you.', hint: '听起来你是病毒感染。我给你开点药。' },
      { id: 'l6', speaker: '病人', role: '病人', text: 'Thank you, Doctor. How often should I take the medicine?', hint: '谢谢你，医生。这个药应该多久吃一次？' },
      { id: 'l7', speaker: '医生', role: '医生', text: 'Three times a day after meals. Get plenty of rest and drink lots of fluids. Come back if you don\'t feel better in a week.', hint: '一天三次，饭后吃。多休息，多喝水。如果一周内没有好转就回来复诊。' }
    ]
  },
  {
    id: '5',
    title: '工作会议',
    description: '在商务会议中表达观点、讨论项目和时间安排',
    category: 'meeting',
    icon: '💼',
    difficulty: 'hard',
    roles: ['项目经理', '团队成员'],
    lines: [
      { id: 'l1', speaker: '项目经理', role: '项目经理', text: 'Good morning, everyone. Let\'s start the Q3 project review. First, I\'d like to discuss the timeline for the new product launch.', hint: '大家早上好。我们开始第三季度项目回顾吧。首先，我想讨论一下新产品发布的时间线。' },
      { id: 'l2', speaker: '团队成员', role: '团队成员', text: 'From a development perspective, we\'re on track with the core features. However, the testing phase might need an extra week.', hint: '从开发角度来看，核心功能进展顺利。然而，测试阶段可能需要额外一周。' },
      { id: 'l3', speaker: '项目经理', role: '项目经理', text: 'I see. What are the main bottlenecks you\'re encountering?', hint: '我明白了。你们遇到的主要瓶颈是什么？' },
      { id: 'l4', speaker: '团队成员', role: '团队成员', text: 'The integration with the payment gateway is more complex than anticipated. We\'re also waiting for the final design assets from the marketing team.', hint: '与支付网关的集成比预期的要复杂。我们也在等待市场团队提供最终的设计素材。' },
      { id: 'l5', speaker: '项目经理', role: '项目经理', text: 'Understood. I\'ll follow up with marketing this afternoon. Can we schedule a quick status update for tomorrow?', hint: '明白了。今天下午我会和市场部跟进。我们明天可以安排一个快速的状态更新会议吗？' },
      { id: 'l6', speaker: '团队成员', role: '团队成员', text: 'Yes, that works. I\'ll prepare a detailed progress report with risk assessment by EOD today.', hint: '可以。我会在今天下班前准备一份详细的进度报告和风险评估。' },
      { id: 'l7', speaker: '项目经理', role: '项目经理', text: 'Perfect. Let\'s also discuss the budget allocation for Q4 while we\'re on the topic.', hint: '很好。我们正好在讨论这个话题，也顺便谈谈第四季度的预算分配吧。' }
    ]
  }
]

export const practiceSentences = [
  { id: 's1', text: 'The quick brown fox jumps over the lazy dog.', translation: '敏捷的棕色狐狸跳过懒惰的狗。', difficulty: 'easy' },
  { id: 's2', text: 'Practice makes perfect, but nobody\'s perfect, so why practice?', translation: '熟能生巧，但人无完人，那为什么还要练习呢？', difficulty: 'medium' },
  { id: 's3', text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', translation: '人生最大的荣耀不在于从不跌倒，而在于每次跌倒后都能爬起来。', difficulty: 'hard' },
  { id: 's4', text: 'I would like to order a cup of coffee and a piece of cake, please.', translation: '我想点一杯咖啡和一块蛋糕，谢谢。', difficulty: 'easy' },
  { id: 's5', text: 'Could you please recommend a good restaurant around here?', translation: '你能推荐附近一家好的餐厅吗？', difficulty: 'easy' },
  { id: 's6', text: 'The meeting has been rescheduled to next Wednesday at 2 PM.', translation: '会议已改期到下周三下午两点。', difficulty: 'medium' },
  { id: 's7', text: 'Unfortunately, we cannot approve your request at this time due to budget constraints.', translation: '不幸的是，由于预算限制，我们目前无法批准您的请求。', difficulty: 'hard' },
  { id: 's8', text: 'I\'m looking forward to hearing from you soon regarding this matter.', translation: '我期待着很快收到您关于此事的回复。', difficulty: 'medium' }
]

export const vocabularyWords: Word[] = [
  { id: 'w1', word: 'accomplish', phonetic: '/əˈkɒmplɪʃ/', meaning: '完成，实现', example: 'She accomplished her goal of running a marathon.', category: 'formal', collocations: ['accomplish a goal', 'accomplish a task', 'accomplish success'], isFavorite: true },
  { id: 'w2', word: 'awesome', phonetic: '/ˈɔːsəm/', meaning: '极好的，令人惊叹的', example: 'That concert was awesome!', category: 'informal', collocations: ['absolutely awesome', 'totally awesome'], isFavorite: false },
  { id: 'w3', word: 'nevertheless', phonetic: '/ˌnevəðəˈles/', meaning: '然而，尽管如此', example: 'The news was unexpected; nevertheless, it was true.', category: 'written', collocations: ['nevertheless,', 'and nevertheless'], isFavorite: true },
  { id: 'w4', word: 'gonna', phonetic: '/ˈɡənə/', meaning: '将要（going to的口语形式）', example: 'I\'m gonna see a movie tonight.', category: 'spoken', collocations: ['be gonna do', 'gonna go'], isFavorite: false },
  { id: 'w5', word: 'facilitate', phonetic: '/fəˈsɪlɪteɪt/', meaning: '促进，使便利', example: 'The new system will facilitate faster communication.', category: 'formal', collocations: ['facilitate communication', 'facilitate learning', 'facilitate the process'], isFavorite: false },
  { id: 'w6', word: 'chill', phonetic: '/tʃɪl/', meaning: '放松，冷静', example: 'Let\'s just chill at home this weekend.', category: 'informal', collocations: ['chill out', 'chill with friends'], isFavorite: true },
  { id: 'w7', word: 'consequently', phonetic: '/ˈkɒnsɪkwəntli/', meaning: '因此，结果', example: 'He didn\'t study; consequently, he failed the exam.', category: 'written', collocations: ['consequently,', 'and consequently'], isFavorite: false },
  { id: 'w8', word: 'wanna', phonetic: '/ˈwɒnə/', meaning: '想要（want to的口语形式）', example: 'Do you wanna grab some coffee?', category: 'spoken', collocations: ['wanna do', 'wanna go'], isFavorite: false }
]

export const phrases: Phrase[] = [
  { id: 'p1', phrase: 'break the ice', meaning: '打破僵局', scenario: '社交场合', style: 'spoken', isFavorite: true },
  { id: 'p2', phrase: 'hit the hay', meaning: '上床睡觉', scenario: '日常对话', style: 'informal', isFavorite: false },
  { id: 'p3', phrase: 'by and large', meaning: '总的来说', scenario: '正式讨论', style: 'formal', isFavorite: true },
  { id: 'p4', phrase: 'in accordance with', meaning: '按照，根据', scenario: '法律/商务', style: 'written', isFavorite: false },
  { id: 'p5', phrase: 'piece of cake', meaning: '小菜一碟', scenario: '日常对话', style: 'informal', isFavorite: false },
  { id: 'p6', phrase: 'as far as I\'m concerned', meaning: '就我而言', scenario: '观点表达', style: 'spoken', isFavorite: true },
  { id: 'p7', phrase: 'on the contrary', meaning: '相反', scenario: '辩论/写作', style: 'formal', isFavorite: false },
  { id: 'p8', phrase: 'with reference to', meaning: '关于，根据', scenario: '商务邮件', style: 'written', isFavorite: false }
]

export const grammarErrors: GrammarError[] = [
  { id: 'e1', original: 'I go to the park yesterday.', corrected: 'I went to the park yesterday.', explanation: 'yesterday是过去时间状语，动词应该用过去式went而不是go。', errorType: '时态错误', timestamp: new Date('2026-05-18'), count: 3 },
  { id: 'e2', original: 'He have two brothers.', corrected: 'He has two brothers.', explanation: '第三人称单数主语He后面的have应该变为has。', errorType: '主谓一致', timestamp: new Date('2026-05-17'), count: 2 },
  { id: 'e3', original: 'She is more beautiful than me.', corrected: 'She is more beautiful than I (am).', explanation: '在比较句中，than后面应该用主格I，口语中可以用me，但正式写作需要用I。', errorType: '代词格', timestamp: new Date('2026-05-16'), count: 1 },
  { id: 'e4', original: 'I have seen him last week.', corrected: 'I saw him last week.', explanation: 'last week是明确的过去时间，不能与现在完成时have seen连用，应使用一般过去时saw。', errorType: '时态错误', timestamp: new Date('2026-05-15'), count: 4 },
  { id: 'e5', original: 'The news are very exciting.', corrected: 'The news is very exciting.', explanation: 'news是不可数名词，谓语动词应该用单数形式is。', errorType: '主谓一致', timestamp: new Date('2026-05-14'), count: 2 }
]

export const progressData: ProgressData[] = [
  { date: '周一', pronunciation: 65, grammar: 58, vocabulary: 72, fluency: 60 },
  { date: '周二', pronunciation: 68, grammar: 62, vocabulary: 74, fluency: 63 },
  { date: '周三', pronunciation: 70, grammar: 65, vocabulary: 75, fluency: 66 },
  { date: '周四', pronunciation: 72, grammar: 68, vocabulary: 77, fluency: 69 },
  { date: '周五', pronunciation: 75, grammar: 70, vocabulary: 79, fluency: 72 },
  { date: '周六', pronunciation: 78, grammar: 73, vocabulary: 81, fluency: 75 },
  { date: '周日', pronunciation: 80, grammar: 76, vocabulary: 83, fluency: 78 }
]

export const lastWeekProgress: ProgressData[] = [
  { date: '周一', pronunciation: 55, grammar: 48, vocabulary: 62, fluency: 50 },
  { date: '周二', pronunciation: 58, grammar: 52, vocabulary: 64, fluency: 53 },
  { date: '周三', pronunciation: 60, grammar: 55, vocabulary: 65, fluency: 56 },
  { date: '周四', pronunciation: 62, grammar: 58, vocabulary: 67, fluency: 59 },
  { date: '周五', pronunciation: 65, grammar: 60, vocabulary: 69, fluency: 62 },
  { date: '周六', pronunciation: 68, grammar: 63, vocabulary: 71, fluency: 65 },
  { date: '周日', pronunciation: 70, grammar: 66, vocabulary: 73, fluency: 68 }
]

export const videos: Video[] = [
  {
    id: 'v1',
    title: 'Daily English Conversation Practice',
    description: 'Learn common English phrases used in daily conversations with native speakers',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=english%20conversation%20classroom%20friendly%20teacher&image_size=landscape_16_9',
    duration: '12:34',
    level: 'beginner',
    difficulty: 'beginner',
    category: '会话',
    views: '1.2M',
    source: 'BBC Learning English',
    keyPoints: [
      'Learn 10 essential greetings and responses',
      'Practice ordering food and drinks in a cafe',
      'Master small talk for casual conversations',
      'Learn how to ask for and give directions'
    ],
    vocabulary: ['greetings', 'small talk', 'menu', 'direction', 'polite', 'request']
  },
  {
    id: 'v2',
    title: 'Business English Meetings',
    description: 'Essential phrases for professional meetings and discussions in the workplace',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=business%20meeting%20professional%20office&image_size=landscape_16_9',
    duration: '18:22',
    level: 'intermediate',
    difficulty: 'intermediate',
    category: '商务',
    views: '856K',
    source: 'Business English Pod',
    keyPoints: [
      'How to start and end meetings professionally',
      'Expressing opinions and agreeing/disagreeing politely',
      'Making suggestions and proposals',
      'Summarizing decisions and action items'
    ],
    vocabulary: ['agenda', 'proposal', 'deadline', 'strategy', 'feedback', 'follow up']
  },
  {
    id: 'v3',
    title: 'English Pronunciation Masterclass',
    description: 'Perfect your English pronunciation with these proven exercises and techniques',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pronunciation%20training%20speech%20microphone&image_size=landscape_16_9',
    duration: '25:10',
    level: 'intermediate',
    difficulty: 'intermediate',
    category: '发音',
    views: '2.1M',
    source: 'Rachel\'s English',
    keyPoints: [
      'Master the 10 most difficult English sounds',
      'Learn word stress and sentence rhythm',
      'Practice linking words for natural speech',
      'Reduce your native accent in 5 easy steps'
    ],
    vocabulary: ['pronunciation', 'stress', 'rhythm', 'intonation', 'vowel', 'consonant']
  },
  {
    id: 'v4',
    title: 'Advanced English Grammar',
    description: 'Complex grammar structures for advanced learners aiming for C1/C2 level',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=advanced%20english%20grammar%20book%20study&image_size=landscape_16_9',
    duration: '32:45',
    level: 'advanced',
    difficulty: 'advanced',
    category: '语法',
    views: '543K',
    source: 'English Grammar Secrets',
    keyPoints: [
      'Master advanced conditional sentences',
      'Learn subjunctive mood for formal writing',
      'Understand inverted sentences for emphasis',
      'Practice complex sentence structures with multiple clauses'
    ],
    vocabulary: ['conditional', 'subjunctive', 'inversion', 'clause', 'tense', 'modal']
  },
  {
    id: 'v5',
    title: 'Travel English Survival Guide',
    description: 'Everything you need to know for traveling abroad in English-speaking countries',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20airport%20adventure%20world&image_size=landscape_16_9',
    duration: '15:30',
    level: 'beginner',
    difficulty: 'beginner',
    category: '旅行',
    views: '1.8M',
    source: 'Travel English 101',
    keyPoints: [
      'Airport vocabulary and check-in procedures',
      'Hotel check-in and making special requests',
      'Ordering at restaurants and understanding menus',
      'Asking for help and dealing with emergencies'
    ],
    vocabulary: ['passport', 'boarding pass', 'reservation', 'check-in', 'luggage', 'customs']
  },
  {
    id: 'v6',
    title: 'Idioms and Phrasal Verbs',
    description: 'Learn common English idioms and how to use them naturally in conversation',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=english%20idioms%20creative%20language%20art&image_size=landscape_16_9',
    duration: '20:15',
    level: 'advanced',
    difficulty: 'advanced',
    category: '习语',
    views: '987K',
    source: 'English with Lucy',
    keyPoints: [
      '20 most common English idioms in daily use',
      'Essential phrasal verbs for everyday conversations',
      'How to avoid common idiom mistakes',
      'Practice using idioms in context'
    ],
    vocabulary: ['break a leg', 'hit the hay', 'piece of cake', 'hang out', 'figure out', 'look forward to']
  }
]

export const newsItems: NewsItem[] = [
  {
    id: 'n1',
    title: 'Global Climate Summit Reaches Historic Agreement',
    content: 'World leaders at the Global Climate Summit have reached a historic agreement to reduce carbon emissions by 50% by 2030. The landmark deal, which took weeks of intense negotiations, sets binding targets for both developed and developing nations. This agreement marks a major turning point in the fight against climate change.',
    translation: '全球气候峰会达成历史性协议。各国领导人在全球气候峰会上达成了一项历史性协议，到2030年将碳排放量减少50%。这项具有里程碑意义的协议经过数周的紧张谈判，为发达国家和发展中国家设定了具有约束力的目标。该协议标志着应对气候变化斗争的一个重大转折点。',
    vocabulary: [
      { word: 'historic', phonetic: '/hɪˈstɒrɪk/', partOfSpeech: 'adj.', meaning: '历史性的', example: 'This is a historic moment for our country.' },
      { word: 'emissions', phonetic: '/ɪˈmɪʃənz/', partOfSpeech: 'n.', meaning: '排放', example: 'The factory is reducing its carbon emissions.' },
      { word: 'landmark', phonetic: '/ˈlændmɑːk/', partOfSpeech: 'adj.', meaning: '里程碑式的', example: 'The Supreme Court made a landmark decision.' },
      { word: 'negotiations', phonetic: '/nɪˌɡəʊʃiˈeɪʃənz/', partOfSpeech: 'n.', meaning: '谈判', example: 'After lengthy negotiations, they reached an agreement.' },
      { word: 'binding', phonetic: '/ˈbaɪndɪŋ/', partOfSpeech: 'adj.', meaning: '有约束力的', example: 'The contract is legally binding.' }
    ],
    date: '2026-05-20',
    category: '国际新闻',
    difficulty: 'intermediate',
    duration: '1:00',
    summary: '世界各国领导人在气候峰会上达成历史性协议，承诺到2030年减少50%的碳排放。'
  },
  {
    id: 'n2',
    title: 'Tech Giants Announce AI Safety Partnership',
    content: 'Major technology companies have announced a unprecedented partnership to develop safety standards for artificial intelligence. The collaboration aims to ensure AI systems are developed responsibly and benefit society as a whole. Experts believe this will help prevent potential misuse of advanced AI technologies.',
    translation: '科技巨头宣布AI安全合作伙伴关系。大型科技公司宣布了一项前所未有的合作，旨在制定人工智能安全标准。该合作旨在确保人工智能系统得到负责任的开发，并造福整个社会。专家认为，这将有助于防止先进人工智能技术被滥用。',
    vocabulary: [
      { word: 'unprecedented', phonetic: '/ʌnˈpresɪdentɪd/', partOfSpeech: 'adj.', meaning: '前所未有的', example: 'The pandemic caused unprecedented disruption.' },
      { word: 'partnership', phonetic: '/ˈpɑːtnəʃɪp/', partOfSpeech: 'n.', meaning: '伙伴关系', example: 'We formed a strategic partnership with the company.' },
      { word: 'collaboration', phonetic: '/kəˌlæbəˈreɪʃən/', partOfSpeech: 'n.', meaning: '合作', example: 'The project requires close collaboration between teams.' },
      { word: 'responsibly', phonetic: '/rɪˈspɒnsəbli/', partOfSpeech: 'adv.', meaning: '负责任地', example: 'We must use technology responsibly.' },
      { word: 'benefit', phonetic: '/ˈbenɪfɪt/', partOfSpeech: 'v.', meaning: '有益于', example: 'Regular exercise benefits your health.' }
    ],
    date: '2026-05-19',
    category: '科技',
    difficulty: 'intermediate',
    duration: '1:00',
    summary: '多家大型科技公司宣布建立AI安全伙伴关系，共同制定安全标准。'
  },
  {
    id: 'n3',
    title: 'New Study Reveals Benefits of Language Learning',
    content: 'A groundbreaking study published today reveals that learning a second language can significantly improve cognitive function and delay the onset of dementia. Researchers found that bilingual individuals showed enhanced problem-solving skills and greater mental flexibility. The study followed over 1,000 participants for more than 20 years.',
    translation: '新研究揭示语言学习的好处。今天发表的一项突破性研究显示，学习第二语言可以显著改善认知功能并延缓痴呆症的发作。研究人员发现，会说两种语言的人表现出更强的解决问题能力和更大的思维灵活性。这项研究对1000多名参与者进行了20多年的跟踪调查。',
    vocabulary: [
      { word: 'groundbreaking', phonetic: '/ˈɡraʊndbreɪkɪŋ/', partOfSpeech: 'adj.', meaning: '突破性的', example: 'Scientists made a groundbreaking discovery.' },
      { word: 'cognitive', phonetic: '/ˈkɒɡnɪtɪv/', partOfSpeech: 'adj.', meaning: '认知的', example: 'Cognitive skills include memory and attention.' },
      { word: 'onset', phonetic: '/ˈɒnset/', partOfSpeech: 'n.', meaning: '开始，发作', example: 'The onset of the disease is gradual.' },
      { word: 'dementia', phonetic: '/dɪˈmenʃə/', partOfSpeech: 'n.', meaning: '痴呆症', example: 'Dementia affects memory and thinking.' },
      { word: 'bilingual', phonetic: '/baɪˈlɪŋɡwəl/', partOfSpeech: 'adj.', meaning: '双语的', example: 'She is bilingual in English and Spanish.' }
    ],
    date: '2026-05-18',
    category: '健康',
    difficulty: 'advanced',
    duration: '1:00',
    summary: '研究表明，学习第二语言可以显著改善认知功能，延缓痴呆症的发生。'
  }
]

export const collocationExercises: CollocationExercise[] = [
  { id: 'c1', sentence: 'We need to ___ a decision by Friday.', blank: '___', options: ['make', 'do', 'take', 'give'], answer: 'make', category: '动词搭配' },
  { id: 'c2', sentence: 'She ___ great progress in her English studies.', blank: '___', options: ['did', 'made', 'took', 'got'], answer: 'made', category: '动词搭配' },
  { id: 'c3', sentence: 'Can you ___ me a favor?', blank: '___', options: ['make', 'do', 'give', 'take'], answer: 'do', category: '动词搭配' },
  { id: 'c4', sentence: 'The company will ___ a new product next month.', blank: '___', options: ['start', 'begin', 'launch', 'open'], answer: 'launch', category: '商务搭配' },
  { id: 'c5', sentence: 'You should ___ advantage of this opportunity.', blank: '___', options: ['make', 'take', 'have', 'get'], answer: 'take', category: '动词搭配' },
  { id: 'c6', sentence: 'Please ___ attention to the speaker.', blank: '___', options: ['give', 'make', 'pay', 'take'], answer: 'pay', category: '动词搭配' },
  { id: 'c7', sentence: 'We need to ___ the problem carefully.', blank: '___', options: ['analyze', 'decide', 'make', 'do'], answer: 'analyze', category: '动词搭配' },
  { id: 'c8', sentence: 'The meeting has been ___ until next week.', blank: '___', options: ['postponed', 'cancelled', 'stopped', 'ended'], answer: 'postponed', category: '商务搭配' }
]

export const pronunciationWords = [
  { id: 'p1', word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃən/', meaning: '发音' },
  { id: 'p2', word: 'thoroughly', phonetic: '/ˈθʌrəli/', meaning: '彻底地' },
  { id: 'p3', word: 'scheduled', phonetic: '/ˈskedʒuːld/', meaning: '预定的' },
  { id: 'p4', word: 'comfortable', phonetic: '/ˈkʌmftəbəl/', meaning: '舒适的' },
  { id: 'p5', word: 'vegetable', phonetic: '/ˈvedʒtəbəl/', meaning: '蔬菜' },
  { id: 'p6', word: 'chocolate', phonetic: '/ˈtʃɒklət/', meaning: '巧克力' },
  { id: 'p7', word: 'interest', phonetic: '/ˈɪntrəst/', meaning: '兴趣' },
  { id: 'p8', word: 'beautiful', phonetic: '/ˈbjuːtɪfəl/', meaning: '美丽的' }
]

export const evaluatePronunciation = (): number => {
  const baseScore = Math.floor(Math.random() * 30) + 60
  const variance = Math.floor(Math.random() * 15) - 5
  return Math.min(100, Math.max(50, baseScore + variance))
}

export const evaluateFluency = (speed: number): number => {
  if (speed < 80) return Math.floor(Math.random() * 20) + 60
  if (speed < 120) return Math.floor(Math.random() * 20) + 70
  if (speed < 150) return Math.floor(Math.random() * 15) + 75
  return Math.floor(Math.random() * 15) + 80
}

export const generateWaveformData = (length: number = 50): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * 80) + 20)
}
