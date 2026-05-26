export interface User {
  id: string
  username: string
  avatar: string
  bio: string
  level: number
  points: number
  totalPoints: number
  joinedAt: Date
  expertiseTags: string[]
  helpedUsers: number
  questionsAsked: number
  questionsAnswered: number
  acceptedAnswers: number
  followedTags: string[]
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  tagId?: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface Tag {
  id: string
  name: string
  description: string
  category: string
  color: string
  questionCount: number
  followerCount: number
}

export interface Question {
  id: string
  title: string
  content: string
  authorId: string
  author: User
  tags: string[]
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  voteCount: number
  answerCount: number
  viewCount: number
  hasAcceptedAnswer: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Answer {
  id: string
  questionId: string
  content: string
  authorId: string
  author: User
  voteCount: number
  isAccepted: boolean
  isBestAnswer: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  parentId: string
  parentType: 'question' | 'answer'
  content: string
  authorId: string
  author: User
  createdAt: Date
}

export interface Vote {
  id: string
  userId: string
  targetId: string
  targetType: 'question' | 'answer'
  value: 1 | -1
}

export interface LearningStream {
  id: string
  userId: string
  questionId: string
  question: Question
  pushedAt: Date
  isRead: boolean
  streamType: 'followed_tag' | 'recommended' | 'daily_challenge'
}

export interface DailyChallenge {
  id: string
  questionId: string
  question: Question
  date: Date
  isCompleted: boolean
  isCorrect: boolean | null
  userAnswerId?: string
}

export interface QuizQuestion {
  id: string
  questionId: string
  question: Question
  userAnswer: string
  isCorrect: boolean
  attemptedAt: Date
  correctAnswer?: string
}

export interface KnowledgeArea {
  tagId: string
  tagName: string
  score: number
  questionsAnswered: number
  answersAccepted: number
}

export interface Notification {
  id: string
  userId: string
  type: 'answer' | 'vote' | 'badge' | 'level_up' | 'mention'
  title: string
  content: string
  relatedId?: string
  isRead: boolean
  createdAt: Date
}

export interface PointTransaction {
  id: string
  userId: string
  points: number
  reason: string
  relatedId?: string
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  parentId?: string
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface FilterOptions {
  category?: string
  tag?: string
  difficulty?: Difficulty
  sortBy?: 'newest' | 'popular' | 'unanswered' | 'most_voted'
  searchQuery?: string
}
