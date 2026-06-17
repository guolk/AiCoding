import type {
  KnowledgeDomain,
  KnowledgeArea,
  QuarterlyOKR,
  KeyResult,
  LearningResource,
  LearningTime,
  Assessment,
  OutputItem,
  UseCase,
} from '@/types'

export const mockDomains: KnowledgeDomain[] = [
  { id: 'd1', name: '前端工程', layerType: 'core', color: '#1e3a5f', sortOrder: 1 },
  { id: 'd2', name: '后端架构', layerType: 'core', color: '#2d5f8a', sortOrder: 2 },
  { id: 'd3', name: '数据科学', layerType: 'support', color: '#2d6a4f', sortOrder: 3 },
  { id: 'd4', name: '产品设计', layerType: 'support', color: '#3d8b6e', sortOrder: 4 },
  { id: 'd5', name: '哲学思辨', layerType: 'general', color: '#7b68ee', sortOrder: 5 },
  { id: 'd6', name: '写作表达', layerType: 'general', color: '#9b8aee', sortOrder: 6 },
]

export const mockAreas: KnowledgeArea[] = [
  { id: 'a1', domainId: 'd1', name: 'React生态', description: 'React核心原理、状态管理、服务端渲染、组件库开发', depthTarget: 'master', currentDepth: 'familiar', isGap: false, gapSeverity: 0, notes: '需要深入学习React内部机制，完成3个开源项目贡献' },
  { id: 'a2', domainId: 'd1', name: 'TypeScript', description: '类型系统、泛型编程、类型体操、工程化配置', depthTarget: 'master', currentDepth: 'familiar', isGap: false, gapSeverity: 0, notes: '目标：成为团队TS技术顾问' },
  { id: 'a3', domainId: 'd1', name: 'CSS架构', description: 'CSS-in-JS、原子化CSS、设计系统、跨端适配', depthTarget: 'familiar', currentDepth: 'aware', isGap: false, gapSeverity: 0, notes: '重点学习Tailwind CSS和Stitches' },
  { id: 'a4', domainId: 'd1', name: '性能优化', description: '首屏加载、运行时性能、监控体系、性能预算', depthTarget: 'familiar', currentDepth: 'aware', isGap: true, gapSeverity: 0.85, notes: '缺乏系统性能优化经验，需要建立指标体系' },
  { id: 'a5', domainId: 'd2', name: 'Node.js', description: '事件循环、流处理、微服务、进程管理', depthTarget: 'familiar', currentDepth: 'familiar', isGap: false, gapSeverity: 0, notes: '已完成2个生产级项目' },
  { id: 'a6', domainId: 'd2', name: '数据库设计', description: 'SQL优化、NoSQL选型、数据建模、事务处理', depthTarget: 'familiar', currentDepth: 'aware', isGap: true, gapSeverity: 0.65, notes: '需要深入理解索引原理和查询优化' },
  { id: 'a7', domainId: 'd2', name: '系统架构', description: '分布式系统、微服务、消息队列、缓存策略', depthTarget: 'aware', currentDepth: 'aware', isGap: true, gapSeverity: 0.92, notes: '几乎没有实战经验，Q3重点突破' },
  { id: 'a8', domainId: 'd3', name: '机器学习', description: '监督学习、深度学习、模型部署、特征工程', depthTarget: 'aware', currentDepth: 'aware', isGap: true, gapSeverity: 0.75, notes: '仅了解概念，缺乏项目实践' },
  { id: 'a9', domainId: 'd3', name: '数据可视化', description: 'D3.js、ECharts、叙事可视化、交互设计', depthTarget: 'familiar', currentDepth: 'familiar', isGap: false, gapSeverity: 0, notes: '已交付5个可视化项目' },
  { id: 'a10', domainId: 'd4', name: '交互设计', description: '用户研究、信息架构、原型设计、可用性测试', depthTarget: 'aware', currentDepth: 'aware', isGap: false, gapSeverity: 0, notes: '能独立完成中保真原型' },
  { id: 'a11', domainId: 'd5', name: '认识论', description: '知识论、真理理论、认知偏差、批判性思维', depthTarget: 'aware', currentDepth: 'aware', isGap: true, gapSeverity: 0.55, notes: '每周阅读1篇哲学论文' },
  { id: 'a12', domainId: 'd6', name: '技术写作', description: '文档写作、博客创作、知识分享、教学材料', depthTarget: 'familiar', currentDepth: 'aware', isGap: true, gapSeverity: 0.68, notes: '需要系统性提升，目标月更4篇技术文章' },
]

export const mockOKRs: QuarterlyOKR[] = [
  { id: 'okr1', quarter: '2026-Q2', focusAreaId: 'a1', objective: '精通React生态体系，成为团队React技术专家', vision: '能够独立设计复杂React应用架构，解决团队React技术难题，并指导初中级开发者成长', status: 'active' },
  { id: 'okr2', quarter: '2026-Q2', focusAreaId: 'a4', objective: '建立系统化前端性能优化方法论', vision: '形成从指标定义到优化落地的完整知识体系，具备性能优化实战能力，带领团队提升产品性能30%', status: 'active' },
  { id: 'okr3', quarter: '2026-Q1', focusAreaId: 'a5', objective: '深入理解Node.js服务端开发', vision: '能独立设计和开发中等复杂度的Node.js后端服务，理解事件循环原理和异步编程最佳实践', status: 'completed' },
  { id: 'okr4', quarter: '2026-Q3', focusAreaId: 'a7', objective: '入门分布式系统架构', vision: '理解分布式系统核心概念和常见架构模式，能参与简单分布式系统的设计讨论', status: 'planning' },
  { id: 'okr5', quarter: '2026-Q1', focusAreaId: 'a9', objective: '数据可视化能力系统化提升', vision: '掌握主流可视化库，能独立完成复杂数据看板的设计与开发', status: 'completed' },
]

export const mockKeyResults: KeyResult[] = [
  { id: 'kr1', okrId: 'okr1', description: '精读React源码核心模块', metricType: 'books', targetValue: 3, currentValue: 1, unit: '本', sortOrder: 1 },
  { id: 'kr2', okrId: 'okr1', description: '完成React高级实战课程', metricType: 'courses', targetValue: 2, currentValue: 1, unit: '门', sortOrder: 2 },
  { id: 'kr3', okrId: 'okr1', description: '输出React技术深度文章', metricType: 'articles', targetValue: 5, currentValue: 2, unit: '篇', sortOrder: 3 },
  { id: 'kr4', okrId: 'okr1', description: '完成React内部机制学习', metricType: 'hours', targetValue: 80, currentValue: 35, unit: '小时', sortOrder: 4 },
  { id: 'kr5', okrId: 'okr2', description: '完成Web性能优化专项课程', metricType: 'courses', targetValue: 1, currentValue: 0, unit: '门', sortOrder: 1 },
  { id: 'kr6', okrId: 'okr2', description: '实践3个性能优化项目', metricType: 'projects', targetValue: 3, currentValue: 1, unit: '个', sortOrder: 2 },
  { id: 'kr7', okrId: 'okr2', description: '输出性能优化实践文章', metricType: 'articles', targetValue: 3, currentValue: 0, unit: '篇', sortOrder: 3 },
  { id: 'kr8', okrId: 'okr3', description: '完成Node.js后端实战课程', metricType: 'courses', targetValue: 2, currentValue: 2, unit: '门', sortOrder: 1 },
  { id: 'kr9', okrId: 'okr3', description: '开发完整后端项目', metricType: 'projects', targetValue: 1, currentValue: 1, unit: '个', sortOrder: 2 },
  { id: 'kr10', okrId: 'okr3', description: 'Node.js学习投入时间', metricType: 'hours', targetValue: 60, currentValue: 60, unit: '小时', sortOrder: 3 },
  { id: 'kr11', okrId: 'okr5', description: '完成D3.js专项课程', metricType: 'courses', targetValue: 1, currentValue: 1, unit: '门', sortOrder: 1 },
  { id: 'kr12', okrId: 'okr5', description: '交付可视化项目', metricType: 'projects', targetValue: 3, currentValue: 3, unit: '个', sortOrder: 2 },
  { id: 'kr13', okrId: 'okr5', description: '可视化学习投入', metricType: 'hours', targetValue: 40, currentValue: 42, unit: '小时', sortOrder: 3 },
]

export const mockResources: LearningResource[] = [
  { id: 'r1', areaId: 'a1', krId: 'kr1', type: 'book', title: 'React设计原理', author: '卡颂', url: 'https://book.douban.com/subject/36079598/', status: 'completed', priority: 1, dependsOn: null, estimatedHours: 20, notes: '深入理解Fiber架构和调度机制' },
  { id: 'r2', areaId: 'a1', krId: 'kr1', type: 'book', title: 'React技术揭秘', author: '冴羽', url: 'https://react.iamkasong.com/', status: 'in_progress', priority: 2, dependsOn: 'r1', estimatedHours: 15, notes: '配合源码阅读' },
  { id: 'r3', areaId: 'a1', krId: 'kr2', type: 'course', title: 'React高级实战：设计模式和最佳实践', author: '极客时间', url: '', status: 'in_progress', priority: 3, dependsOn: null, estimatedHours: 30, notes: '系统学习设计模式' },
  { id: 'r4', areaId: 'a1', krId: 'kr2', type: 'course', title: 'React服务端渲染深度实践', author: '掘金小册', url: '', status: 'pending', priority: 4, dependsOn: 'r3', estimatedHours: 25, notes: 'Next.js为主线' },
  { id: 'r5', areaId: 'a1', krId: 'kr3', type: 'project', title: 'React组件库开发', author: '', url: '', status: 'pending', priority: 5, dependsOn: 'r2', estimatedHours: 40, notes: '综合应用所学知识，发布npm包' },
  { id: 'r6', areaId: 'a4', krId: 'kr5', type: 'course', title: 'Web性能优化全链路实战', author: '极客时间', url: '', status: 'pending', priority: 1, dependsOn: null, estimatedHours: 25, notes: '涵盖首屏、运行时、网络等全链路' },
  { id: 'r7', areaId: 'a4', krId: 'kr6', type: 'project', title: '电商首页性能优化', author: '', url: '', status: 'in_progress', priority: 2, dependsOn: null, estimatedHours: 20, notes: '实际项目，目标LCP<2s' },
  { id: 'r8', areaId: 'a4', krId: 'kr6', type: 'project', title: '后台管理系统性能优化', author: '', url: '', status: 'pending', priority: 3, dependsOn: 'r7', estimatedHours: 15, notes: '聚焦打包体积优化' },
  { id: 'r9', areaId: 'a5', krId: 'kr8', type: 'course', title: 'Node.js开发实战', author: '极客时间', url: '', status: 'completed', priority: 1, dependsOn: null, estimatedHours: 30, notes: '朴灵老师主讲' },
  { id: 'r10', areaId: 'a5', krId: 'kr8', type: 'course', title: 'Node.js进阶：集群与性能', author: '掘金小册', url: '', status: 'completed', priority: 2, dependsOn: 'r9', estimatedHours: 20, notes: '' },
  { id: 'r11', areaId: 'a5', krId: 'kr9', type: 'project', title: 'Express全栈博客系统', author: '', url: 'https://github.com/example/blog', status: 'completed', priority: 3, dependsOn: 'r9', estimatedHours: 35, notes: '已上线，日活500+' },
  { id: 'r12', areaId: 'a7', krId: null, type: 'book', title: '数据密集型应用系统设计', author: 'Martin Kleppmann', url: '', status: 'pending', priority: 1, dependsOn: null, estimatedHours: 30, notes: 'Q3计划必读' },
  { id: 'r13', areaId: 'a9', krId: 'kr11', type: 'course', title: 'D3.js从入门到精通', author: '慕课网', url: '', status: 'completed', priority: 1, dependsOn: null, estimatedHours: 20, notes: '' },
  { id: 'r14', areaId: 'a9', krId: 'kr12', type: 'project', title: '销售数据看板', author: '', url: '', status: 'completed', priority: 2, dependsOn: 'r13', estimatedHours: 25, notes: '已交付业务方使用' },
  { id: 'r15', areaId: 'a12', krId: null, type: 'course', title: '技术写作指南', author: '极客时间', url: '', status: 'pending', priority: 1, dependsOn: null, estimatedHours: 10, notes: '提升技术博客质量' },
]

export const mockLearningTimes: LearningTime[] = [
  { id: 'lt1', areaId: 'a1', weeklyHours: 10, weekStartDate: '2026-04-07' },
  { id: 'lt2', areaId: 'a4', weeklyHours: 5, weekStartDate: '2026-04-07' },
  { id: 'lt3', areaId: 'a5', weeklyHours: 3, weekStartDate: '2026-04-07' },
  { id: 'lt4', areaId: 'a2', weeklyHours: 4, weekStartDate: '2026-04-07' },
  { id: 'lt5', areaId: 'a12', weeklyHours: 2, weekStartDate: '2026-04-07' },
  { id: 'lt6', areaId: 'a9', weeklyHours: 3, weekStartDate: '2026-04-07' },
  { id: 'lt7', areaId: 'a11', weeklyHours: 1, weekStartDate: '2026-04-07' },
]

export const mockAssessments: Assessment[] = [
  { id: 'as1', areaId: 'a1', type: 'written', title: 'React核心概念测试', description: '覆盖Virtual DOM、Fiber架构、Hooks原理、生命周期等核心知识点', status: 'completed', score: 85, completedDate: '2026-03-15', reflection: '对Hooks底层实现还不够清晰，需要继续深入源码' },
  { id: 'as2', areaId: 'a1', type: 'project', title: 'React组件库开发', description: '独立开发一套包含10+组件的UI库，支持主题定制、按需加载', status: 'in_progress', score: null, completedDate: null, reflection: '' },
  { id: 'as3', areaId: 'a1', type: 'teach', title: 'React Hooks内部原理分享', description: '向团队15+开发者讲解Hooks的闭包原理和链表实现机制', status: 'not_started', score: null, completedDate: null, reflection: '' },
  { id: 'as4', areaId: 'a5', type: 'project', title: '全栈博客后端开发', description: '使用Node.js + MongoDB开发RESTful API，包含用户认证、文章管理、评论系统', status: 'completed', score: 90, completedDate: '2026-03-28', reflection: '需要更多分布式场景的实践，消息队列和缓存的应用还不够熟练' },
  { id: 'as5', areaId: 'a9', type: 'teach', title: '数据可视化最佳实践分享', description: '团队内部分享D3.js与ECharts选型对比与实战案例', status: 'completed', score: 88, completedDate: '2026-02-20', reflection: '提问环节反应良好，准备了15个实战案例' },
  { id: 'as6', areaId: 'a4', type: 'written', title: 'Web性能指标测试', description: 'Core Web Vitals、LCP、FID、CLS等指标体系知识考核', status: 'not_started', score: null, completedDate: null, reflection: '' },
  { id: 'as7', areaId: 'a2', type: 'project', title: 'TypeScript类型体操训练', description: '完成50道类型体操题目，挑战复杂类型推导', status: 'in_progress', score: null, completedDate: null, reflection: '' },
  { id: 'as8', areaId: 'a9', type: 'written', title: '数据可视化基础测试', description: 'SVG、Canvas、WebGL渲染原理，D3.js核心API', status: 'completed', score: 92, completedDate: '2026-01-25', reflection: '地理可视化部分还需要加强' },
]

export const mockOutputs: OutputItem[] = [
  { id: 'o1', areaId: 'a1', type: 'article', title: 'React Fiber架构深度解析', contentSummary: '从源码层面分析React Fiber的工作原理、调度机制、优先级管理，配合大量示意图帮助理解', url: 'https://juejin.cn/post/xxxx1', publishDate: '2026-03-10', tags: ['React', 'Fiber', '源码解析'] },
  { id: 'o2', areaId: 'a1', type: 'article', title: 'React Hooks实现原理探秘', contentSummary: '深入理解Hooks的闭包原理、链表实现、状态更新机制，通过手写迷你React来验证学习成果', url: 'https://juejin.cn/post/xxxx2', publishDate: '2026-04-02', tags: ['React', 'Hooks', '底层原理'] },
  { id: 'o3', areaId: 'a5', type: 'project', title: 'Express全栈博客系统', contentSummary: '基于Node.js + MongoDB的全栈博客，包含用户认证、文章管理、评论系统、数据统计，已上线并获得500+日活', url: 'https://github.com/example/blog', publishDate: '2026-03-28', tags: ['Node.js', 'MongoDB', '全栈'] },
  { id: 'o4', areaId: 'a9', type: 'material', title: '数据可视化最佳实践课件', contentSummary: 'D3.js与ECharts选型对比、实战案例合集、性能优化技巧，团队内部分享材料，共60页PPT', url: '', publishDate: '2026-02-20', tags: ['可视化', 'D3.js', 'ECharts'] },
  { id: 'o5', areaId: 'a4', type: 'article', title: 'Web性能优化：从指标到实践', contentSummary: 'Core Web Vitals指标体系解读、常见性能问题诊断、优化方案实战，附完整性能预算模板', url: 'https://juejin.cn/post/xxxx3', publishDate: '2026-04-15', tags: ['性能优化', 'Core Web Vitals'] },
  { id: 'o6', areaId: 'a1', type: 'article', title: 'React设计模式实战指南', contentSummary: 'HOC、Render Props、自定义Hook、组合模式等10种React设计模式的应用场景与实现', url: 'https://juejin.cn/post/xxxx4', publishDate: '2026-05-08', tags: ['React', '设计模式'] },
  { id: 'o7', areaId: 'a2', type: 'material', title: 'TypeScript入门到精通笔记', contentSummary: '类型系统、泛型编程、条件类型、映射类型等高级特性系统整理，5万字学习笔记', url: '', publishDate: '2026-04-20', tags: ['TypeScript', '学习笔记'] },
  { id: 'o8', areaId: 'a9', type: 'project', title: '销售数据可视化看板', contentSummary: '使用ECharts开发的交互式数据看板，支持多维度筛选、钻取分析，日均访问2000+次', url: '', publishDate: '2026-03-15', tags: ['ECharts', '数据看板'] },
  { id: 'o9', areaId: 'a11', type: 'article', title: '认知偏差清单：程序员思维盲区', contentSummary: '整理20种常见认知偏差及其在编程决策中的表现，附应对策略', url: 'https://juejin.cn/post/xxxx5', publishDate: '2026-05-20', tags: ['认知', '思维', '程序员成长'] },
]

export const mockUseCases: UseCase[] = [
  { id: 'uc1', areaId: 'a1', title: 'React性能调优实战', scenario: '公司核心产品首页加载时间超过5秒，用户反馈卡顿严重，急需优化', application: '应用React.lazy、Suspense和代码分割技术，配合路由级别的按需加载；使用React.memo优化不必要的重渲染；虚拟化长列表', occurredDate: '2026-03-20', result: '首屏加载时间从5.2秒降至1.8秒，FCP提升65%，用户满意度提升40%', lessonsLearned: '代码分割策略需要结合路由设计和业务场景，不是分的越细越好；性能监控要前置' },
  { id: 'uc2', areaId: 'a5', title: 'Node.js微服务拆分', scenario: '原有单体应用在双十一期间扩展困难，数据库成为瓶颈，用户请求超时严重', application: '将用户模块拆分为独立微服务，引入Redis缓存热点数据，使用RabbitMQ实现服务间异步通信', occurredDate: '2026-03-25', result: '用户模块可独立部署，峰值响应时间减少40%，数据库压力降低60%，顺利通过双十一压测', lessonsLearned: '服务间通信的设计是关键难点，需要考虑幂等性、重试机制和降级策略' },
  { id: 'uc3', areaId: 'a9', title: '运营数据看板开发', scenario: '运营团队需要实时数据监控，但现有报表系统更新滞后，获取数据需要2小时以上', application: '使用ECharts开发交互式数据看板，对接实时数据流，支持多维度筛选和下钻分析', occurredDate: '2026-02-15', result: '运营决策效率大幅提升，数据获取时间从2小时减少到5秒以内，看板日均访问2000+次', lessonsLearned: '数据可视化需要先深入理解业务需求，而不是单纯追求炫酷的视觉效果' },
  { id: 'uc4', areaId: 'a4', title: '电商H5首屏优化', scenario: '移动端H5页面在3G网络下首屏加载超过8秒，流失率高达60%', application: '实施图片WebP格式转换、关键CSS内联、非关键JS延迟加载、接口数据预取、骨架屏体验优化', occurredDate: '2026-04-10', result: '3G网络下首屏从8.3秒降至2.1秒，用户流失率下降28%，转化率提升15%', lessonsLearned: '移动端性能优化要考虑弱网环境，需要建立分级的性能体验标准' },
  { id: 'uc5', areaId: 'a2', title: 'TypeScript大型项目重构', scenario: '原有JavaScript项目维护困难，类型错误频发，团队协作效率低下', application: '制定渐进式TS迁移方案，建立统一的类型定义规范，配置严格的TS检查规则，引入类型自动生成工具', occurredDate: '2026-05-05', result: '线上类型错误减少90%，代码可维护性大幅提升，新人上手时间缩短50%', lessonsLearned: 'TS迁移不要追求一步到位，渐进式迁移配合自动化工具可以大幅降低成本' },
  { id: 'uc6', areaId: 'a1', title: '企业级组件库建设', scenario: '公司多条产品线UI不统一，重复开发严重，缺乏标准化的组件体系', application: '主导建设企业级React组件库，制定设计规范，实现40+基础组件和业务组件，支持主题定制和按需加载', occurredDate: '2026-04-28', result: '新功能开发效率提升30%，UI一致性评分从3.2分提升至4.5分，组件库已在8个项目中应用', lessonsLearned: '组件库建设需要与设计团队深度协作，API设计的前瞻性和向后兼容至关重要' },
]

export const weeklyHeatmapData: Record<string, number> = {
  '2026-04-07': 8, '2026-04-08': 6, '2026-04-09': 10, '2026-04-10': 4,
  '2026-04-11': 7, '2026-04-12': 3, '2026-04-13': 2,
  '2026-04-14': 9, '2026-04-15': 5, '2026-04-16': 8, '2026-04-17': 6,
  '2026-04-18': 4, '2026-04-19': 1, '2026-04-20': 0,
  '2026-04-21': 7, '2026-04-22': 10, '2026-04-23': 9, '2026-04-24': 6,
  '2026-04-25': 5, '2026-04-26': 3, '2026-04-27': 2,
}

export function resetDemoData() {
  const keys = [
    'okr-domains', 'okr-areas', 'okr-okrs', 'okr-keyResults', 'okr-resources',
    'okr-learningTimes', 'okr-assessments', 'okr-outputs', 'okr-useCases',
    'okr-currentQuarter', 'okr-sidebarCollapsed'
  ]
  keys.forEach(key => localStorage.removeItem(key))
}
