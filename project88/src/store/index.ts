import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Requirement, Interview, Persona, JourneyMap, Competitor, FeatureItem,
  CompetitorVersion, MarketPosition, RoadmapItem, Milestone, EffectRecord, PRDDocument
} from '../types'

const initialRequirements: Requirement[] = [
  {
    id: 'req-1',
    title: '支持批量导出数据',
    description: '用户希望能够批量选择并导出数据为Excel或CSV格式',
    channel: 'ticket',
    source: '客服工单-张三',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
    status: 'rice_scored',
    kanoType: 'expected',
    kanoReason: '用户期望具备此功能，缺少会造成不便',
    rice: { reach: 3, impact: 3, confidence: 4, effort: 2, score: 4.5 },
    tags: ['数据导出', '效率提升']
  },
  {
    id: 'req-2',
    title: '增加数据可视化仪表盘',
    description: '希望有更直观的数据图表展示功能',
    channel: 'interview',
    source: '用户访谈-李四',
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2026-03-10T09:00:00Z',
    status: 'kano_classified',
    kanoType: 'excited',
    kanoReason: '能显著提升用户体验，带来惊喜',
    rice: null,
    tags: ['可视化', '仪表盘']
  },
  {
    id: 'req-3',
    title: '修复登录页面加载缓慢',
    description: '登录时经常需要等待5秒以上',
    channel: 'ticket',
    source: '客服工单-王五',
    createdAt: '2026-03-12T14:00:00Z',
    updatedAt: '2026-03-12T14:00:00Z',
    status: 'planned',
    kanoType: 'must',
    kanoReason: '基础功能，必须保证',
    rice: { reach: 5, impact: 4, confidence: 5, effort: 2, score: 10 },
    tags: ['性能', '登录']
  },
  {
    id: 'req-4',
    title: '支持移动端适配',
    description: '竞品都支持移动端访问',
    channel: 'competitor',
    source: '竞品对标-竞品A',
    createdAt: '2026-03-08T11:00:00Z',
    updatedAt: '2026-03-08T11:00:00Z',
    status: 'pending',
    kanoType: null,
    kanoReason: '',
    rice: null,
    tags: ['移动端', '适配']
  },
  {
    id: 'req-5',
    title: '增加操作快捷键',
    description: '通过问卷反馈，用户希望有快捷键',
    channel: 'survey',
    source: '用户问卷-第3期',
    createdAt: '2026-03-20T16:00:00Z',
    updatedAt: '2026-03-20T16:00:00Z',
    status: 'pending',
    kanoType: null,
    kanoReason: '',
    rice: null,
    tags: ['快捷键', '效率']
  }
]

const initialInterviews: Interview[] = [
  {
    id: 'int-1',
    userName: '张三',
    userRole: '市场经理',
    date: '2026-03-10',
    background: '张三是某互联网公司市场经理，有5年经验，每天使用竞品进行数据分析',
    questions: 'Q1: 您目前的工作流程有哪些痛点？\nQ2: 您最希望产品改进什么？',
    quotes: '"如果能批量导出数据，我每天能节省2小时"',
    insights: '1. 用户对批量导出需求强烈\n2. 现有操作步骤繁琐\n3. 用户希望自动化报表功能',
    tags: ['数据分析', '效率'],
    createdAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'int-2',
    userName: '李四',
    userRole: '产品总监',
    date: '2026-03-12',
    background: '李四是某SaaS公司产品总监，管理3个产品线',
    questions: 'Q1: 您如何做产品决策？\nQ2: 数据在决策中扮演什么角色？',
    quotes: '"数据可视化是现在的刚需，没有图表根本看不懂趋势"',
    insights: '1. 高层管理者需要可视化看板\n2. 实时数据更新很重要\n3. 移动端查看数据是普遍需求',
    tags: ['可视化', '决策支持'],
    createdAt: '2026-03-12T14:00:00Z'
  }
]

const initialPersonas: Persona[] = [
  {
    id: 'per-1',
    name: '数据分析师-小王',
    role: '数据分析师',
    avatar: '',
    age: '28岁',
    occupation: '互联网公司数据分析师',
    goals: '快速获取和分析数据，输出有价值的洞察',
    frustrations: '数据导出麻烦，图表不够直观',
    behaviors: '每天处理大量数据，依赖Excel进行分析',
    quote: '"数据就是我的武器，工具不好用我就没法打仗"',
    tags: ['数据分析', '效率'],
    createdAt: '2026-03-15T10:00:00Z'
  },
  {
    id: 'per-2',
    name: '产品经理-小李',
    role: '产品经理',
    avatar: '',
    age: '32岁',
    occupation: 'SaaS产品经理',
    goals: '基于数据做正确的产品决策',
    frustrations: '数据分散在各个系统，难以整合',
    behaviors: '每周查看数据报表，与团队同步',
    quote: '"没有数据支撑的决策都是在赌博"',
    tags: ['产品决策', '数据驱动'],
    createdAt: '2026-03-15T11:00:00Z'
  }
]

const initialJourneys: JourneyMap[] = [
  {
    id: 'jou-1',
    name: '数据分析师日常工作旅程',
    personaIds: ['per-1'],
    stages: [
      { id: 's1', stage: '登录', action: '打开系统输入账号密码', feeling: 3, painPoint: '登录等待时间过长', opportunity: '优化登录性能' },
      { id: 's2', stage: '数据查询', action: '选择条件查询数据', feeling: 4, painPoint: '筛选条件不够灵活', opportunity: '增加自定义筛选' },
      { id: 's3', stage: '数据分析', action: '查看数据表格和图表', feeling: 3, painPoint: '图表类型有限', opportunity: '增加更多图表类型' },
      { id: 's4', stage: '数据导出', action: '导出数据到Excel', feeling: 2, painPoint: '只能单条导出', opportunity: '支持批量导出' },
      { id: 's5', stage: '报告生成', action: '整理数据形成报告', feeling: 3, painPoint: '手动整理耗时', opportunity: '自动生成报告模板' }
    ],
    createdAt: '2026-03-15T12:00:00Z'
  }
]

const initialCompetitors: Competitor[] = [
  { id: 'com-1', name: '竞品A', website: 'https://competitor-a.com', description: '老牌数据分析工具，功能全面', createdAt: '2026-03-01T10:00:00Z' },
  { id: 'com-2', name: '竞品B', website: 'https://competitor-b.com', description: '新兴SaaS工具，界面现代', createdAt: '2026-03-01T11:00:00Z' },
  { id: 'com-3', name: '竞品C', website: 'https://competitor-c.com', description: '免费工具，用户量大', createdAt: '2026-03-01T12:00:00Z' }
]

const initialFeatures: FeatureItem[] = [
  { id: 'f1', feature: '数据查询', category: '基础功能', ours: true, oursNote: '支持基础查询', competitors: { 'com-1': true, 'com-2': true, 'com-3': true }, notes: '都有基础查询' },
  { id: 'f2', feature: '数据可视化', category: '高级功能', ours: true, oursNote: '3种图表', competitors: { 'com-1': true, 'com-2': true, 'com-3': false }, notes: '竞品C缺失' },
  { id: 'f3', feature: '批量导出', category: '效率工具', ours: false, oursNote: '', competitors: { 'com-1': true, 'com-2': true, 'com-3': false }, notes: '我们待开发' },
  { id: 'f4', feature: '移动端', category: '平台支持', ours: false, oursNote: '', competitors: { 'com-1': true, 'com-2': true, 'com-3': true }, notes: '我们缺失' },
  { id: 'f5', feature: 'AI数据洞察', category: '高级功能', ours: false, oursNote: '', competitors: { 'com-1': false, 'com-2': true, 'com-3': false }, notes: '仅竞品B有' }
]

const initialVersions: CompetitorVersion[] = [
  { id: 'ver-1', competitorId: 'com-1', version: 'v3.2', date: '2026-03-01', changes: '新增数据透视表功能', impact: '提升了复杂分析能力' },
  { id: 'ver-2', competitorId: 'com-2', version: 'v2.0', date: '2026-03-05', changes: '全面改版，增加AI洞察', impact: '重大更新，用户体验大幅提升' },
  { id: 'ver-3', competitorId: 'com-1', version: 'v3.3', date: '2026-03-15', changes: '优化性能，修复Bug', impact: '体验更流畅' }
]

const initialMarketPositions: MarketPosition[] = [
  { id: 'mp-1', competitorId: 'com-1', xLabel: '产品成熟度', yLabel: '价格', xValue: 85, yValue: 80, note: '功能全面但价格高' },
  { id: 'mp-2', competitorId: 'com-2', xLabel: '产品成熟度', yLabel: '价格', xValue: 70, yValue: 50, note: '功能现代价格适中' },
  { id: 'mp-3', competitorId: 'com-3', xLabel: '产品成熟度', yLabel: '价格', xValue: 45, yValue: 10, note: '功能简单但免费' },
  { id: 'mp-self', competitorId: 'self', xLabel: '产品成熟度', yLabel: '价格', xValue: 60, yValue: 60, note: '我们的产品' }
]

const initialRoadmapItems: RoadmapItem[] = [
  { id: 'rm-1', title: 'Q1 性能优化', quarter: 'Q1', year: 2026, priority: 'high', status: 'done', description: '优化登录性能和数据加载速度', requirementIds: ['req-3'] },
  { id: 'rm-2', title: 'Q2 批量导出功能', quarter: 'Q2', year: 2026, priority: 'high', status: 'in_progress', description: '支持批量选择和导出数据', requirementIds: ['req-1'] },
  { id: 'rm-3', title: 'Q3 可视化仪表盘', quarter: 'Q3', year: 2026, priority: 'medium', status: 'planned', description: '新增可视化仪表盘功能', requirementIds: ['req-2'] },
  { id: 'rm-4', title: 'Q4 移动端适配', quarter: 'Q4', year: 2026, priority: 'medium', status: 'planned', description: '响应式设计，支持移动端访问', requirementIds: ['req-4'] }
]

const initialMilestones: Milestone[] = [
  { id: 'ms-1', title: 'v1.0 性能优化版', version: 'v1.0', date: '2026-03-31', deliverables: '登录优化、数据加载优化', status: 'done', roadmapItemId: 'rm-1' },
  { id: 'ms-2', title: 'v1.1 批量导出版', version: 'v1.1', date: '2026-06-30', deliverables: '批量导出功能、导出模板', status: 'in_progress', roadmapItemId: 'rm-2' },
  { id: 'ms-3', title: 'v1.2 可视化版', version: 'v1.2', date: '2026-09-30', deliverables: '仪表盘、多种图表', status: 'pending', roadmapItemId: 'rm-3' }
]

const initialEffectRecords: EffectRecord[] = [
  { id: 'ef-1', feature: '登录性能优化', launchDate: '2026-03-20', metric: '登录平均等待时间', target: '<1秒', actual: '0.8秒', analysis: '优化后用户登录体验显著提升', roadmapItemId: 'rm-1' }
]

const initialPRDs: PRDDocument[] = [
  {
    id: 'prd-1',
    title: '批量导出功能PRD',
    version: 'v1.0',
    author: '产品经理',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-15T10:00:00Z',
    content: '# 批量导出功能PRD\n\n## 1. 背景\n用户需要批量导出数据...\n\n## 2. 需求描述\n支持多选、导出Excel/CSV...\n\n## 3. 功能详情\n### 3.1 选择功能\n支持全选、多选、反选...\n\n## 4. 验收标准\n- 导出1000条数据不超过5秒',
    history: [
      { version: 'v1.0', date: '2026-03-10', author: '产品经理', changes: '初始版本' },
      { version: 'v1.1', date: '2026-03-15', author: '产品经理', changes: '增加反选功能说明' }
    ]
  }
]

interface Store {
  requirements: Requirement[]
  interviews: Interview[]
  personas: Persona[]
  journeys: JourneyMap[]
  competitors: Competitor[]
  features: FeatureItem[]
  competitorVersions: CompetitorVersion[]
  marketPositions: MarketPosition[]
  roadmapItems: RoadmapItem[]
  milestones: Milestone[]
  effectRecords: EffectRecord[]
  prdDocuments: PRDDocument[]
  addRequirement: (r: Requirement) => void
  updateRequirement: (id: string, r: Partial<Requirement>) => void
  deleteRequirement: (id: string) => void
  addInterview: (i: Interview) => void
  updateInterview: (id: string, i: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  addPersona: (p: Persona) => void
  updatePersona: (id: string, p: Partial<Persona>) => void
  deletePersona: (id: string) => void
  addJourney: (j: JourneyMap) => void
  updateJourney: (id: string, j: Partial<JourneyMap>) => void
  deleteJourney: (id: string) => void
  addCompetitor: (c: Competitor) => void
  updateCompetitor: (id: string, c: Partial<Competitor>) => void
  deleteCompetitor: (id: string) => void
  addFeature: (f: FeatureItem) => void
  updateFeature: (id: string, f: Partial<FeatureItem>) => void
  deleteFeature: (id: string) => void
  addVersion: (v: CompetitorVersion) => void
  updateVersion: (id: string, v: Partial<CompetitorVersion>) => void
  deleteVersion: (id: string) => void
  addMarketPosition: (m: MarketPosition) => void
  updateMarketPosition: (id: string, m: Partial<MarketPosition>) => void
  deleteMarketPosition: (id: string) => void
  addRoadmapItem: (r: RoadmapItem) => void
  updateRoadmapItem: (id: string, r: Partial<RoadmapItem>) => void
  deleteRoadmapItem: (id: string) => void
  addMilestone: (m: Milestone) => void
  updateMilestone: (id: string, m: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void
  addEffectRecord: (e: EffectRecord) => void
  updateEffectRecord: (id: string, e: Partial<EffectRecord>) => void
  deleteEffectRecord: (id: string) => void
  addPRD: (p: PRDDocument) => void
  updatePRD: (id: string, p: Partial<PRDDocument>) => void
  deletePRD: (id: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      requirements: initialRequirements,
      interviews: initialInterviews,
      personas: initialPersonas,
      journeys: initialJourneys,
      competitors: initialCompetitors,
      features: initialFeatures,
      competitorVersions: initialVersions,
      marketPositions: initialMarketPositions,
      roadmapItems: initialRoadmapItems,
      milestones: initialMilestones,
      effectRecords: initialEffectRecords,
      prdDocuments: initialPRDs,
      addRequirement: (r) => set((s) => ({ requirements: [...s.requirements, r] })),
      updateRequirement: (id, r) => set((s) => ({ requirements: s.requirements.map((x) => x.id === id ? { ...x, ...r } : x) })),
      deleteRequirement: (id) => set((s) => ({ requirements: s.requirements.filter((x) => x.id !== id) })),
      addInterview: (i) => set((s) => ({ interviews: [...s.interviews, i] })),
      updateInterview: (id, i) => set((s) => ({ interviews: s.interviews.map((x) => x.id === id ? { ...x, ...i } : x) })),
      deleteInterview: (id) => set((s) => ({ interviews: s.interviews.filter((x) => x.id !== id) })),
      addPersona: (p) => set((s) => ({ personas: [...s.personas, p] })),
      updatePersona: (id, p) => set((s) => ({ personas: s.personas.map((x) => x.id === id ? { ...x, ...p } : x) })),
      deletePersona: (id) => set((s) => ({ personas: s.personas.filter((x) => x.id !== id) })),
      addJourney: (j) => set((s) => ({ journeys: [...s.journeys, j] })),
      updateJourney: (id, j) => set((s) => ({ journeys: s.journeys.map((x) => x.id === id ? { ...x, ...j } : x) })),
      deleteJourney: (id) => set((s) => ({ journeys: s.journeys.filter((x) => x.id !== id) })),
      addCompetitor: (c) => set((s) => ({ competitors: [...s.competitors, c] })),
      updateCompetitor: (id, c) => set((s) => ({ competitors: s.competitors.map((x) => x.id === id ? { ...x, ...c } : x) })),
      deleteCompetitor: (id) => set((s) => ({ competitors: s.competitors.filter((x) => x.id !== id) })),
      addFeature: (f) => set((s) => ({ features: [...s.features, f] })),
      updateFeature: (id, f) => set((s) => ({ features: s.features.map((x) => x.id === id ? { ...x, ...f } : x) })),
      deleteFeature: (id) => set((s) => ({ features: s.features.filter((x) => x.id !== id) })),
      addVersion: (v) => set((s) => ({ competitorVersions: [...s.competitorVersions, v] })),
      updateVersion: (id, v) => set((s) => ({ competitorVersions: s.competitorVersions.map((x) => x.id === id ? { ...x, ...v } : x) })),
      deleteVersion: (id) => set((s) => ({ competitorVersions: s.competitorVersions.filter((x) => x.id !== id) })),
      addMarketPosition: (m) => set((s) => ({ marketPositions: [...s.marketPositions, m] })),
      updateMarketPosition: (id, m) => set((s) => ({ marketPositions: s.marketPositions.map((x) => x.id === id ? { ...x, ...m } : x) })),
      deleteMarketPosition: (id) => set((s) => ({ marketPositions: s.marketPositions.filter((x) => x.id !== id) })),
      addRoadmapItem: (r) => set((s) => ({ roadmapItems: [...s.roadmapItems, r] })),
      updateRoadmapItem: (id, r) => set((s) => ({ roadmapItems: s.roadmapItems.map((x) => x.id === id ? { ...x, ...r } : x) })),
      deleteRoadmapItem: (id) => set((s) => ({ roadmapItems: s.roadmapItems.filter((x) => x.id !== id) })),
      addMilestone: (m) => set((s) => ({ milestones: [...s.milestones, m] })),
      updateMilestone: (id, m) => set((s) => ({ milestones: s.milestones.map((x) => x.id === id ? { ...x, ...m } : x) })),
      deleteMilestone: (id) => set((s) => ({ milestones: s.milestones.filter((x) => x.id !== id) })),
      addEffectRecord: (e) => set((s) => ({ effectRecords: [...s.effectRecords, e] })),
      updateEffectRecord: (id, e) => set((s) => ({ effectRecords: s.effectRecords.map((x) => x.id === id ? { ...x, ...e } : x) })),
      deleteEffectRecord: (id) => set((s) => ({ effectRecords: s.effectRecords.filter((x) => x.id !== id) })),
      addPRD: (p) => set((s) => ({ prdDocuments: [...s.prdDocuments, p] })),
      updatePRD: (id, p) => set((s) => ({ prdDocuments: s.prdDocuments.map((x) => x.id === id ? { ...x, ...p } : x) })),
      deletePRD: (id) => set((s) => ({ prdDocuments: s.prdDocuments.filter((x) => x.id !== id) }))
    }),
    { name: 'pm-workbench-storage' }
  )
)
