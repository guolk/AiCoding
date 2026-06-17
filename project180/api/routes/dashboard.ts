import { Router, type Request, type Response } from 'express'
import {
  topics, argumentList as allArgs, matches, members, todos, skillAssessments
} from '../data/store.js'
import type { DashboardStats } from '../../shared/types.js'

const router = Router()

router.get('/stats', (req: Request, res: Response) => {
  const topicCount = topics.length
  const argumentCount = allArgs.length
  const matchCount = matches.length
  const memberCount = members.filter(m => m.role !== 'coach').length

  const assessments = skillAssessments.slice(-memberCount)
  const avgSkill = assessments.length > 0
    ? Math.round(
        assessments.reduce((sum, a) => {
          return sum + (a.argumentation + a.interrogation + a.speech + a.improvisation) / 4
        }, 0) / assessments.length * 10
      ) / 10
    : 0

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingMatches = matches
    .filter(m => {
      const d = new Date(m.date)
      return d >= now && d <= in7Days
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(m => ({
      ...m,
      topicTitle: topics.find(t => t.id === m.topicId)?.title || '',
    }))

  const pendingTodos = todos
    .filter(t => t.status === 'pending')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 } as const
      if (order[a.priority] !== order[b.priority]) {
        return order[a.priority] - order[b.priority]
      }
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  const stats: DashboardStats = {
    topicCount, argumentCount, matchCount, memberCount, avgSkill,
    upcomingMatches, pendingTodos,
  }

  res.json({ success: true, data: stats })
})

export default router
