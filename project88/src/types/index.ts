export type Channel = 'interview' | 'survey' | 'ticket' | 'competitor'

export type KanoType = 'must' | 'expected' | 'excited' | 'indifferent' | 'reverse'

export type RequirementStatus = 'pending' | 'kano_classified' | 'rice_scored' | 'planned' | 'developing' | 'done'

export interface Requirement {
  id: string
  title: string
  description: string
  channel: Channel
  source: string
  createdAt: string
  updatedAt: string
  status: RequirementStatus
  kanoType: KanoType | null
  kanoReason: string
  rice: {
    reach: number
    impact: number
    confidence: number
    effort: number
    score: number
  } | null
  tags: string[]
}

export interface Interview {
  id: string
  userName: string
  userRole: string
  date: string
  background: string
  questions: string
  quotes: string
  insights: string
  tags: string[]
  createdAt: string
}

export interface Persona {
  id: string
  name: string
  role: string
  avatar: string
  age: string
  occupation: string
  goals: string
  frustrations: string
  behaviors: string
  quote: string
  tags: string[]
  createdAt: string
}

export interface JourneyStage {
  id: string
  stage: string
  action: string
  feeling: number
  painPoint: string
  opportunity: string
}

export interface JourneyMap {
  id: string
  name: string
  personaIds: string[]
  stages: JourneyStage[]
  createdAt: string
}

export interface Competitor {
  id: string
  name: string
  website: string
  description: string
  createdAt: string
}

export interface FeatureItem {
  id: string
  feature: string
  category: string
  ours: boolean
  oursNote: string
  competitors: { [competitorId: string]: boolean }
  notes: string
}

export interface CompetitorVersion {
  id: string
  competitorId: string
  version: string
  date: string
  changes: string
  impact: string
}

export interface MarketPosition {
  id: string
  competitorId: string
  xLabel: string
  yLabel: string
  xValue: number
  yValue: number
  note: string
}

export interface RoadmapItem {
  id: string
  title: string
  quarter: string
  year: number
  priority: 'high' | 'medium' | 'low'
  status: 'planned' | 'in_progress' | 'done' | 'delayed'
  description: string
  requirementIds: string[]
}

export interface Milestone {
  id: string
  title: string
  version: string
  date: string
  deliverables: string
  status: 'pending' | 'in_progress' | 'done' | 'delayed'
  roadmapItemId: string
}

export interface EffectRecord {
  id: string
  feature: string
  launchDate: string
  metric: string
  target: string
  actual: string
  analysis: string
  roadmapItemId: string
}

export interface PRDDocument {
  id: string
  title: string
  version: string
  author: string
  createdAt: string
  updatedAt: string
  content: string
  history: PRDHistoryEntry[]
}

export interface PRDHistoryEntry {
  version: string
  date: string
  author: string
  changes: string
}

export interface AppState {
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
}
