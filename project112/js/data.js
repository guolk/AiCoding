const designerData = {
  name: 'Alex Chen',
  title: 'Senior Product Designer',
  bio: '拥有8年数字产品设计经验，专注于用户体验设计和品牌视觉系统。曾在多家知名科技公司担任设计负责人，主导过超过50个产品项目的设计工作。我相信好的设计是解决问题的艺术，是用户与产品之间的桥梁。',
  philosophy: '设计不是装饰，而是沟通。每一个像素、每一个交互，都在向用户传递信息。我的设计理念是：以用户为中心，以数据为依据，以美感为表达。追求简洁而不简单，功能与形式的完美平衡。',
  avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20asian%20male%20designer%20portrait%20headshot%20modern%20studio%20lighting&image_size=square',
  contact: {
    email: 'alex@designstudio.com',
    phone: '+86 138 0000 0000',
    location: '上海, 中国'
  },
  social: {
    dribbble: 'https://dribbble.com',
    behance: 'https://behance.net',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com'
  },
  skills: [
    { name: 'UI设计', level: 95, category: 'design' },
    { name: '品牌设计', level: 88, category: 'design' },
    { name: '动效设计', level: 82, category: 'design' },
    { name: 'UX研究', level: 90, category: 'research' },
    { name: '交互设计', level: 92, category: 'design' },
    { name: '原型设计', level: 85, category: 'design' }
  ],
  tools: [
    { name: 'Figma', category: 'UI设计', projects: ['Nova银行', 'HealthHub', 'StyleMate'], icon: 'fa-palette' },
    { name: 'Sketch', category: 'UI设计', projects: ['TravelEase', 'FoodieGo'], icon: 'fa-pencil-ruler' },
    { name: 'Adobe Illustrator', category: '品牌设计', projects: ['Nova银行品牌', 'EcoShop'], icon: 'fa-bezier-curve' },
    { name: 'Adobe Photoshop', category: '视觉设计', projects: ['Nova银行', 'TravelEase'], icon: 'fa-image' },
    { name: 'After Effects', category: '动效设计', projects: ['Nova银行APP', 'HealthHub'], icon: 'fa-film' },
    { name: 'Principle', category: '动效设计', projects: ['StyleMate', 'FoodieGo'], icon: 'fa-play-circle' },
    { name: 'Framer', category: '原型设计', projects: ['Nova银行', 'HealthHub'], icon: 'fa-mobile-alt' },
    { name: 'InVision', category: '原型设计', projects: ['TravelEase', 'StyleMate'], icon: 'fa-eye' }
  ],
  awards: [
    { title: 'Red Dot Design Award', organization: 'Red Dot', year: '2024', description: '凭借Nova银行APP项目获得产品设计类红点奖' },
    { title: 'iF Design Award', organization: 'iF', year: '2023', description: 'HealthHub健康管理平台获得界面设计奖' },
    { title: 'Awwwards SOTD', organization: 'Awwwards', year: '2023', description: '个人作品集网站被评选为当日最佳网站' },
    { title: 'CSS Design Awards', organization: 'CSSDA', year: '2022', description: 'StyleMate时尚APP获得UI设计特别奖' },
    { title: 'Behance Featured', organization: 'Behance', year: '2022', description: 'EcoShop品牌设计项目被Behance官方精选推荐' }
  ],
  testimonials: [
    {
      name: '张伟',
      role: 'CEO',
      company: 'Nova银行',
      quote: 'Alex是我合作过的最出色的设计师之一。他不仅在视觉设计上有独到的见解，更重要的是能够深入理解业务需求，将复杂的金融产品转化为用户友好的体验。我们的APP上线后，用户满意度提升了45%。',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20businessman%20portrait%20headshot%20formal%20suit&image_size=square'
    },
    {
      name: '李娜',
      role: '产品总监',
      company: 'HealthHub',
      quote: '与Alex的合作非常愉快。他对细节的关注令人印象深刻，每一个交互、每一个动画都经过精心设计。他带来的不仅是设计能力，更是产品思维。强烈推荐给任何需要高质量设计的团队。',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20chinese%20businesswoman%20portrait%20headshot%20modern%20office&image_size=square'
    },
    {
      name: '王强',
      role: '创始人',
      company: 'StyleMate',
      quote: 'Alex帮助我们从零打造了整个品牌和产品体验。他的设计理念和执行力都是一流的。更难能可贵的是，他能够站在用户的角度思考问题，让产品真正有温度。我们的转化率在设计改版后提升了35%。',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20young%20entrepreneur%20portrait%20casual%20professional&image_size=square'
    }
  ],
  experience: [
    { role: 'Senior Product Designer', company: '知名科技公司', period: '2021 - 至今', description: '负责核心产品的用户体验设计，带领3人设计团队，推动设计系统建设' },
    { role: 'Product Designer', company: '互联网金融公司', period: '2018 - 2021', description: '主导多个金融产品的设计工作，包括移动端APP和Web端管理系统' },
    { role: 'UI Designer', company: '设计工作室', period: '2016 - 2018', description: '参与多个品牌和数字产品的视觉设计工作' }
  ],
  stats: {
    projects: 50,
    clients: 30,
    awards: 12,
    years: 8
  },
  designStyle: '我的设计风格追求极简与功能的平衡。偏好大面积留白、清晰的层次结构、以及精致的微交互。色彩运用上注重克制，用少量强调色引导用户注意力。'
};

const projectsData = [
  {
    id: 'nova-bank',
    name: 'Nova银行APP',
    client: 'Nova Digital Bank',
    industry: '金融科技',
    completionDate: '2024年3月',
    tools: ['Figma', 'After Effects', 'Principle', 'Illustrator'],
    background: 'Nova银行是一家新兴的数字银行，需要一套全新的移动银行体验来吸引年轻用户群体。传统银行APP功能繁杂、操作复杂，用户体验普遍不佳。',
    tags: ['UI设计', 'UX研究', '动效设计', '金融'],
    featured: true,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20mobile%20banking%20app%20interface%20design%20showcase%20multiple%20screens%20clean%20minimal%20dark%20theme&image_size=landscape_16_9',
    gallery: [
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20banking%20home%20screen%20dashboard%20clean%20modern%20UI%20financial%20app&image_size=portrait_4_3', caption: '首页设计 - 信息架构优化' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20banking%20transfer%20payment%20screen%20UX%20design%20finance%20app&image_size=portrait_4_3', caption: '转账功能 - 简化操作流程' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20banking%20investment%20portfolio%20screen%20data%20visualization%20charts&image_size=portrait_4_3', caption: '投资组合 - 数据可视化' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20banking%20card%20management%20screen%20modern%20UI%20design&image_size=portrait_4_3', caption: '卡片管理 - 视觉层级分明' }
    ],
    process: [
      {
        stage: '调研阶段',
        title: '用户研究与竞品分析',
        description: '通过深度访谈、问卷调查和竞品分析，我们发现用户在使用银行APP时面临的主要痛点：信息过载、操作复杂、信任感不足。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20research%20workshop%20whiteboard%20post%20it%20notes%20brainstorming&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=competitive%20analysis%20chart%20UX%20research%20data%20visualization&image_size=square'
        ]
      },
      {
        stage: '草图阶段',
        title: '信息架构与低保真原型',
        description: '基于调研结果，重新设计信息架构。将核心功能前置，减少操作层级。通过手绘草图快速验证多个导航方案。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hand%20drawn%20wireframes%20sketches%20mobile%20app%20design%20paper%20prototypes&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ux%20wireframes%20low%20fidelity%20mobile%20app%20screens%20layout&image_size=square'
        ]
      },
      {
        stage: '方案迭代',
        title: '可用性测试与迭代优化',
        description: '进行了5轮可用性测试，每轮8-12名用户。针对转账流程、理财页面等关键路径进行了多次迭代优化。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=usability%20testing%20session%20user%20research%20observation&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=design%20iteration%20comparison%20before%20after%20UI%20improvement&image_size=square'
        ]
      },
      {
        stage: '最终稿',
        title: '视觉设计与动效规范',
        description: '确立深色主题的视觉风格，配合精心设计的微交互动效，提升整体使用体验。制定完整的设计系统和组件库。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=design%20system%20components%20UI%20kit%20atoms%20molecules&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=motion%20design%20animation%20ui%20transitions%20microinteractions&image_size=square'
        ]
      }
    ],
    caseStudy: {
      problemDefinition: '传统银行APP普遍存在功能堆积、操作复杂、缺乏信任感等问题。Nova银行作为新成立的数字银行，需要通过卓越的用户体验来建立竞争优势，吸引对传统银行不满的年轻用户群体。',
      designGoals: [
        '打造简洁、直观的银行操作体验',
        '建立用户对数字银行的信任感',
        '提升核心业务的转化率（转账、理财）',
        '创建可扩展的设计系统'
      ],
      solution: '我们采用了以用户为中心的设计方法，通过深入的用户研究理解目标用户的真实需求。重新设计了信息架构，将核心功能前置展示。引入深色主题配合精心设计的微交互动效，创造出既专业又现代的品牌形象。同时建立了完整的设计系统，确保产品在快速迭代中保持一致性。',
      execution: '项目历时5个月，经历了多轮用户研究、原型设计、可用性测试和视觉迭代。设计团队与产品、开发团队紧密协作，确保设计方案能够高质量落地。最终交付了完整的移动端设计稿、设计系统文档、以及动效规范。',
      results: '上线后获得了用户的积极反馈，各项核心指标显著提升。产品设计获得红点奖认可，为Nova银行建立了良好的品牌形象。'
    },
    metrics: [
      { label: '用户满意度', before: 58, after: 84, unit: '%' },
      { label: '转账完成率', before: 62, after: 89, unit: '%' },
      { label: '平均操作步骤', before: 8, after: 4, unit: '步' },
      { label: '月活跃用户', before: 100, after: 250, unit: 'K' }
    ],
    designDecisions: [
      {
        option: '深色主题',
        description: '采用深炭灰作为主背景，配合渐变强调色',
        chosen: true,
        reason: '深色主题更符合金融产品的专业感，同时能减少眼睛疲劳，突出关键数据和操作按钮。用户测试显示80%的用户偏好深色模式。'
      },
      {
        option: '浅色主题',
        description: '传统的白色背景+黑色文字',
        chosen: false,
        reason: '虽然浅色主题更常见，但在金融场景中缺乏辨识度，也无法营造高端感。'
      },
      {
        option: '底部Tab导航',
        description: '将核心功能放在底部导航栏',
        chosen: true,
        reason: '移动端单手操作友好，用户可以快速在各模块间切换。减少了深层级导航带来的迷失感。'
      },
      {
        option: '汉堡菜单',
        description: '侧边抽屉式导航',
        chosen: false,
        reason: '研究表明汉堡菜单中的功能使用率较低，不适合银行核心操作功能。'
      }
    ]
  },
  {
    id: 'healthhub',
    name: 'HealthHub健康平台',
    client: 'HealthTech Inc.',
    industry: '健康科技',
    completionDate: '2023年9月',
    tools: ['Figma', 'Framer', 'Photoshop'],
    background: 'HealthHub是一款综合性健康管理应用，需要整合运动、饮食、睡眠等多维度健康数据，帮助用户建立健康生活习惯。',
    tags: ['UI设计', '数据可视化', '健康', 'UX研究'],
    featured: true,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20fitness%20mobile%20app%20interface%20design%20multiple%20screens%20clean%20modern%20green%20accent&image_size=landscape_16_9',
    gallery: [
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20app%20dashboard%20fitness%20tracking%20data%20visualization%20clean%20UI&image_size=portrait_4_3', caption: '健康仪表盘 - 数据一目了然' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20app%20workout%20exercise%20screen%20fitness%20tracking%20interface&image_size=portrait_4_3', caption: '运动记录 - 激励式设计' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20app%20nutrition%20diet%20tracking%20food%20log%20interface&image_size=portrait_4_3', caption: '饮食追踪 - 便捷录入' }
    ],
    process: [
      {
        stage: '调研阶段',
        title: '用户画像与场景分析',
        description: '通过用户访谈和日记研究，深入了解不同用户群体的健康管理习惯和痛点。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20persona%20canvas%20UX%20research%20customer%20journey%20map&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20lifestyle%20user%20research%20data%20analysis%20charts&image_size=square'
        ]
      },
      {
        stage: '草图阶段',
        title: '游戏化激励机制设计',
        description: '探索多种游戏化元素，设计能够激励用户持续使用的激励机制。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gamification%20design%20badges%20achievements%20reward%20system%20sketches&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20engagement%20loop%20habit%20formation%20design%20diagram&image_size=square'
        ]
      },
      {
        stage: '最终稿',
        title: '视觉设计与交互动效',
        description: '清新活力的视觉风格，配合流畅的动画过渡，让健康管理变得有趣。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20app%20UI%20design%20clean%20modern%20interface%20green%20accent&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=motion%20design%20health%20app%20progress%20animation%20smooth%20transitions&image_size=square'
        ]
      }
    ],
    caseStudy: {
      problemDefinition: '健康管理类APP普遍存在用户留存率低的问题。用户往往在新鲜感过后就停止使用。如何设计能够激励用户持续使用、培养健康习惯的产品体验成为核心挑战。',
      designGoals: [
        '提升用户7日留存率至40%以上',
        '设计有效的激励机制',
        '简化健康数据录入流程',
        '建立数据信任感'
      ],
      solution: '我们引入了游戏化设计元素，包括成就徽章、等级系统、社交挑战等。同时优化了数据录入体验，支持智能识别和快捷录入。通过清晰的数据可视化，让用户能够直观看到自己的进步。',
      execution: '通过多轮原型测试验证游戏化机制的有效性，最终确定了"每日目标+成就系统"的激励方案。设计团队与开发团队密切配合，确保动效体验流畅自然。',
      results: '产品上线后，7日留存率从22%提升至45%，用户日均使用时长增加了60%。'
    },
    metrics: [
      { label: '7日留存率', before: 22, after: 45, unit: '%' },
      { label: '日均使用时长', before: 5, after: 8, unit: '分钟' },
      { label: '数据录入完成率', before: 40, after: 75, unit: '%' }
    ],
    designDecisions: [
      {
        option: '绿色主色调',
        description: '清新活力的绿色作为主色，渐变橙色作为强调色',
        chosen: true,
        reason: '绿色与健康、自然相关联，能够营造积极向上的氛围。渐变增添现代感和活力。'
      },
      {
        option: '蓝色主色调',
        description: '专业可信的医疗蓝',
        chosen: false,
        reason: '蓝色过于偏向医疗专业感，不利于营造日常健康管理的轻松氛围。'
      }
    ]
  },
  {
    id: 'stylemate',
    name: 'StyleMate时尚APP',
    client: 'Fashion Tech Co.',
    industry: '时尚电商',
    completionDate: '2023年5月',
    tools: ['Figma', 'Principle', 'Illustrator'],
    background: 'StyleMate是一款AI驱动的时尚穿搭应用，需要为用户提供个性化穿搭建议和虚拟试衣体验。',
    tags: ['UI设计', '品牌设计', '电商', 'AI'],
    featured: false,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20style%20mobile%20app%20interface%20design%20wardrobe%20outfit%20planning%20elegant%20minimal&image_size=landscape_16_9',
    gallery: [
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20app%20outfit%20inspiration%20feed%20UI%20design%20clothing%20cards&image_size=portrait_4_3', caption: '穿搭灵感 - 沉浸式浏览' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20app%20virtual%20wardrobe%20closet%20organization%20UI%20design&image_size=portrait_4_3', caption: '虚拟衣橱 - 智能分类' }
    ],
    process: [
      {
        stage: '调研阶段',
        title: '时尚消费行为研究',
        description: '研究目标用户的穿搭习惯、购物决策过程和品牌偏好。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20consumer%20research%20mood%20board%20style%20trends%20analysis&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shopping%20behavior%20user%20journey%20map%20customer%20experience&image_size=square'
        ]
      },
      {
        stage: '最终稿',
        title: '视觉设计与品牌表达',
        description: '优雅精致的视觉风格，配合流畅的滑动体验，打造高端时尚感。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fashion%20app%20UI%20design%20elegant%20minimalist%20aesthetic%20clothing%20interface&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20identity%20fashion%20logo%20visual%20system%20typography&image_size=square'
        ]
      }
    ],
    caseStudy: {
      problemDefinition: '用户在穿搭决策上花费大量时间，衣橱利用率低，同时网购服装常常面临尺码和搭配不合适的问题。',
      designGoals: [
        '降低穿搭决策时间',
        '提升衣橱利用率',
        '增加购买转化率',
        '建立个性化品牌形象'
      ],
      solution: '通过AI算法分析用户体型、风格偏好和场合需求，提供个性化穿搭建议。虚拟试衣功能让用户可以预览穿搭效果。',
      execution: '设计了沉浸式的浏览体验和流畅的交互动效。视觉风格追求简约高端，突出服装本身。',
      results: '产品上线后用户满意度达89%，购买转化率提升35%。'
    },
    metrics: [
      { label: '用户满意度', before: 65, after: 89, unit: '%' },
      { label: '购买转化率', before: 2.1, after: 2.8, unit: '%' },
      { label: '平均穿搭决策时间', before: 25, after: 10, unit: '分钟' }
    ],
    designDecisions: [
      {
        option: '瀑布流浏览',
        description: '类似Pinterest的瀑布流布局',
        chosen: true,
        reason: '瀑布流更适合展示服装图片，能够在一屏内展示更多内容，提升浏览效率。'
      },
      {
        option: '网格布局',
        description: '规整的商品网格',
        chosen: false,
        reason: '网格布局过于电商化，不利于营造时尚灵感的氛围。'
      }
    ]
  },
  {
    id: 'novo-brand',
    name: 'Nova银行品牌设计',
    client: 'Nova Digital Bank',
    industry: '品牌设计',
    completionDate: '2024年1月',
    tools: ['Illustrator', 'Photoshop'],
    background: 'Nova银行需要一套完整的品牌视觉系统，传达"数字时代的银行"这一品牌理念。',
    tags: ['品牌设计', 'Logo设计', 'VI系统'],
    featured: false,
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bank%20brand%20identity%20design%20logo%20guidelines%20visual%20system%20modern%20corporate&image_size=landscape_16_9',
    gallery: [
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bank%20logo%20design%20modern%20geometric%20brand%20mark%20monogram&image_size=portrait_4_3', caption: 'Logo设计 - 几何与信任' },
      { type: 'image', url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20guidelines%20visual%20identity%20system%20typography%20colors&image_size=portrait_4_3', caption: 'VI手册 - 规范与应用' }
    ],
    process: [
      {
        stage: '调研阶段',
        title: '品牌定位与视觉探索',
        description: '分析竞品品牌，确定Nova银行的差异化定位——年轻、科技、可信。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20positioning%20strategy%20mood%20board%20competitor%20analysis&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=visual%20inspiration%20moodboard%20modern%20banking%20fintech%20aesthetic&image_size=square'
        ]
      },
      {
        stage: '草图阶段',
        title: 'Logo概念探索',
        description: '探索了超过50个Logo概念，从几何图形到抽象符号。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=logo%20sketches%20hand%20drawn%20concepts%20branding%20design%20process&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=logo%20exploration%20iterations%20brand%20mark%20refinement&image_size=square'
        ]
      },
      {
        stage: '最终稿',
        title: '完整视觉系统',
        description: '最终确定的品牌系统包括Logo、色彩、字体、图形元素和应用规范。',
        images: [
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20identity%20system%20complete%20visual%20language%20applications&image_size=square',
          'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=brand%20collateral%20design%20business%20cards%20stationery&image_size=square'
        ]
      }
    ],
    caseStudy: {
      problemDefinition: '传统银行品牌形象普遍保守、刻板，难以吸引年轻用户群体。Nova银行需要建立既专业可信又年轻活力的品牌形象。',
      designGoals: [
        '传达科技感和创新精神',
        '建立信任感和专业感',
        '打造可扩展的视觉系统',
        '在金融领域建立差异化'
      ],
      solution: '采用几何图形构建品牌符号，融合"增长"和"连接"的概念。色彩上选用深色搭配珊瑚粉和金色，既稳重又现代。',
      execution: '经过多轮概念探索和迭代，最终确定了品牌符号和完整的视觉系统。',
      results: '品牌系统获得客户高度认可，成为Nova银行所有触点的视觉规范基础。'
    },
    metrics: [
      { label: '品牌认知度', before: 0, after: 78, unit: '%' },
      { label: '用户信任感', before: 45, after: 82, unit: '%' }
    ],
    designDecisions: [
      {
        option: '几何符号Logo',
        description: '由几何图形构成的抽象符号',
        chosen: true,
        reason: '几何图形具有永恒感和现代感，同时可以传达精确、可信的品牌特质。'
      },
      {
        option: '文字Logo',
        description: '以字体设计为主的纯文字Logo',
        chosen: false,
        reason: '纯文字Logo缺乏图形记忆点，难以在小尺寸应用场景下保持辨识度。'
      }
    ]
  }
];

const currentProjectId = new URLSearchParams(window.location.search).get('id') || 'nova-bank';
const currentProject = projectsData.find(p => p.id === currentProjectId) || projectsData[0];
