export interface DesignToken {
  id: string
  name: string
  semanticName: string
  category: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow' | 'elevation'
  value: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface NamingRule {
  id: string
  category: string
  pattern: string
  example: string
  description: string
}

export interface VersionRecord {
  id: string
  version: string
  date: string
  author: string
  changes: ChangeItem[]
  impactScope: string[]
  description: string
}

export interface ChangeItem {
  type: 'add' | 'modify' | 'delete'
  item: string
  detail: string
}

export interface ComponentDoc {
  id: string
  name: string
  category: string
  description: string
  usage: string
  forbidden: string[]
  codeExample: string
  designLink: string
  status: ComponentState[]
  relatedComponents: string[]
  tags: string[]
}

export interface ComponentState {
  name: string
  preview: string
  description: string
}

export interface DesignDecision {
  id: string
  title: string
  date: string
  author: string
  background: string
  alternatives: Alternative[]
  decision: string
  reason: string
}

export interface Alternative {
  name: string
  pros: string[]
  cons: string[]
}

export interface ReviewRecord {
  id: string
  title: string
  date: string
  participants: string[]
  discussionPoints: string[]
  finalDecision: string
  attachments: string[]
}

export interface DesignPrinciple {
  id: string
  title: string
  description: string
  examples: string[]
}

export interface IconItem {
  id: string
  name: string
  category: string
  svg: string
  tags: string[]
}

export interface IllustrationItem {
  id: string
  name: string
  category: string
  url: string
  copyright: string
  usageScope: string[]
}

export interface FontItem {
  id: string
  name: string
  family: string
  weights: number[]
  license: string
  licenseUrl: string
}

export interface ChecklistItem {
  id: string
  feature: string
  items: ChecklistDetail[]
  assignee: string
  deadline: string
  status: 'pending' | 'in-progress' | 'completed'
}

export interface ChecklistDetail {
  name: string
  checked: boolean
}

export interface DesignReviewItem {
  id: string
  feature: string
  designer: string
  developer: string
  differences: DiffItem[]
  status: 'pending' | 'resolved' | 'confirmed'
  date: string
}

export interface DiffItem {
  location: string
  design: string
  implementation: string
  suggestion: string
  resolved: boolean
}