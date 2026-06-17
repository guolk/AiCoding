export type LayerType = 'core' | 'support' | 'general'
export type DepthLevel = 'aware' | 'familiar' | 'master'
export type MetricType = 'books' | 'courses' | 'articles' | 'hours' | 'projects'
export type ResourceType = 'book' | 'course' | 'project'
export type ResourceStatus = 'pending' | 'in_progress' | 'completed'
export type AssessmentType = 'written' | 'project' | 'teach'
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed'
export type OutputType = 'article' | 'project' | 'material'
export type OKRStatus = 'planning' | 'active' | 'completed'

export interface KnowledgeDomain {
  id: string
  name: string
  layerType: LayerType
  color: string
  sortOrder: number
}

export interface KnowledgeArea {
  id: string
  domainId: string
  name: string
  description: string
  depthTarget: DepthLevel
  currentDepth: DepthLevel
  isGap: boolean
  gapSeverity: number
  notes: string
}

export interface QuarterlyOKR {
  id: string
  quarter: string
  focusAreaId: string
  objective: string
  vision: string
  status: OKRStatus
}

export interface KeyResult {
  id: string
  okrId: string
  description: string
  metricType: MetricType
  targetValue: number
  currentValue: number
  unit: string
  sortOrder: number
}

export interface LearningResource {
  id: string
  areaId: string
  krId: string | null
  type: ResourceType
  title: string
  author: string
  url: string
  status: ResourceStatus
  priority: number
  dependsOn: string | null
  estimatedHours: number
  notes: string
}

export interface LearningTime {
  id: string
  areaId: string
  weeklyHours: number
  weekStartDate: string
}

export interface Assessment {
  id: string
  areaId: string
  type: AssessmentType
  title: string
  description: string
  status: AssessmentStatus
  score: number | null
  completedDate: string | null
  reflection: string
}

export interface OutputItem {
  id: string
  areaId: string
  type: OutputType
  title: string
  contentSummary: string
  url: string
  publishDate: string
  tags: string[]
}

export interface UseCase {
  id: string
  areaId: string
  title: string
  scenario: string
  application: string
  occurredDate: string
  result: string
  lessonsLearned: string
}

export interface AppState {
  domains: KnowledgeDomain[]
  areas: KnowledgeArea[]
  okrs: QuarterlyOKR[]
  keyResults: KeyResult[]
  resources: LearningResource[]
  learningTimes: LearningTime[]
  assessments: Assessment[]
  outputs: OutputItem[]
  useCases: UseCase[]
  currentQuarter: string
  sidebarCollapsed: boolean
}

export const DEPTH_LABELS: Record<DepthLevel, string> = {
  aware: '了解',
  familiar: '熟悉',
  master: '精通',
}

export const DEPTH_ORDER: DepthLevel[] = ['aware', 'familiar', 'master']

export const LAYER_LABELS: Record<LayerType, string> = {
  core: '核心专业',
  support: '辅助技能',
  general: '通识素养',
}

export const METRIC_LABELS: Record<MetricType, string> = {
  books: '本',
  courses: '门',
  articles: '篇',
  hours: '小时',
  projects: '个',
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  book: '书籍',
  course: '课程',
  project: '实践项目',
}

export const ASSESSMENT_TYPE_LABELS: Record<AssessmentType, string> = {
  written: '笔试测验',
  project: '项目实践',
  teach: '教授他人',
}

export const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  article: '文章',
  project: '项目',
  material: '教学材料',
}

export const OKR_STATUS_LABELS: Record<OKRStatus, string> = {
  planning: '规划中',
  active: '进行中',
  completed: '已完成',
}

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成',
}
