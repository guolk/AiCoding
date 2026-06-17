export type TopicType = 'policy' | 'value' | 'fact'
export type Side = 'pro' | 'con'
export type Framework = 'value' | 'fact' | 'logic'
export type MatchStatus = 'upcoming' | 'completed'
export type MemberRole = 'captain' | 'member' | 'coach'
export type PracticeType = 'argumentation' | 'interrogation' | 'speech' | 'improvisation'
export type TodoStatus = 'pending' | 'completed'
export type TodoPriority = 'low' | 'medium' | 'high'
export type Effectiveness = 'effective' | 'failed'

export interface Topic {
  id: number
  title: string
  type: TopicType
  difficulty: number
  field: string
  description: string
  createdAt: string
}

export interface Argument {
  id: number
  topicId: number
  side: Side
  content: string
  evidence: string
  framework: Framework
  strength: number
  rebuttal?: string
  response?: string
}

export interface Match {
  id: number
  topicId: number
  date: string
  venue: string
  teamA: string
  teamB: string
  winner?: string
  bestSpeaker?: string
  status: MatchStatus
}

export interface Review {
  id: number
  matchId: number
  notes: string
  createdAt: string
}

export interface ReviewArgument {
  id: number
  reviewId: number
  argumentId: number
  effectiveness: Effectiveness
}

export interface Member {
  id: number
  name: string
  role: MemberRole
  joinDate: string
}

export interface SkillAssessment {
  id: number
  memberId: number
  argumentation: number
  interrogation: number
  speech: number
  improvisation: number
  assessedAt: string
}

export interface Practice {
  id: number
  memberId: number
  topicId?: number
  type: PracticeType
  content: string
  notes: string
  date: string
}

export interface SpeechFragment {
  id: number
  memberId: number
  topicId?: number
  content: string
  tags: string
  notes: string
  createdAt: string
}

export interface Todo {
  id: number
  title: string
  status: TodoStatus
  priority: TodoPriority
  topicId?: number
  dueDate?: string
}

export interface TopicListItem extends Topic {
  argumentCount: number
  matchCount: number
}

export interface TopicDetail extends Topic {
  proArguments: Argument[]
  conArguments: Argument[]
  matchHistory: (Match & { topicTitle: string })[]
}

export interface CreateTopicBody {
  title: string
  type: TopicType
  difficulty: number
  field: string
  description: string
}

export interface DashboardStats {
  topicCount: number
  argumentCount: number
  matchCount: number
  memberCount: number
  avgSkill: number
  upcomingMatches: (Match & { topicTitle: string })[]
  pendingTodos: Todo[]
}
