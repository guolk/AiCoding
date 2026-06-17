import { Router, type Request, type Response } from 'express'
import {
  members, skillAssessments, practices, speechFragments, todos, getNextId, topics,
} from '../data/store.js'
import type { SkillAssessment, Practice, SpeechFragment, Todo } from '../../shared/types.js'

const router = Router()

// Members
router.get('/', (req: Request, res: Response) => {
  res.json({ success: true, data: members })
})

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const member = members.find(m => m.id === id)
  if (!member) {
    res.status(404).json({ success: false, error: '队员不存在' })
    return
  }
  const skills = skillAssessments
    .filter(s => s.memberId === id)
    .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())

  const latestSkills = skills[0] || null
  res.json({ success: true, data: { member, latestSkills, skillHistory: skills } })
})

// Skills
router.get('/:id/skills', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const skills = skillAssessments
    .filter(s => s.memberId === id)
    .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime())
  res.json({ success: true, data: skills })
})

router.post('/:id/skills', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const body = req.body as Partial<SkillAssessment>
  const sa: SkillAssessment = {
    id: getNextId('skill'),
    memberId: id,
    argumentation: body.argumentation ?? 5,
    interrogation: body.interrogation ?? 5,
    speech: body.speech ?? 5,
    improvisation: body.improvisation ?? 5,
    assessedAt: new Date().toISOString(),
  }
  skillAssessments.push(sa)
  res.status(201).json({ success: true, data: sa })
})

// Practices
router.get('/:id/practices', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const list = practices
    .filter(p => p.memberId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(p => ({
      ...p,
      topicTitle: p.topicId ? topics.find(t => t.id === p.topicId)?.title : undefined,
    }))
  res.json({ success: true, data: list })
})

router.post('/practices', (req: Request, res: Response) => {
  const body = req.body as Partial<Practice> & { memberId: number; type: Practice['type']; content: string }
  if (!body.memberId || !body.type || !body.content) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const p: Practice = {
    id: getNextId('practice'),
    memberId: body.memberId,
    topicId: body.topicId,
    type: body.type,
    content: body.content,
    notes: body.notes || '',
    date: body.date || new Date().toISOString(),
  }
  practices.push(p)
  res.status(201).json({
    success: true,
    data: {
      ...p,
      topicTitle: p.topicId ? topics.find(t => t.id === p.topicId)?.title : undefined,
    },
  })
})

// Speech fragments
router.get('/fragments', (req: Request, res: Response) => {
  const { memberId } = req.query
  let list = [...speechFragments]
  if (memberId) list = list.filter(f => f.memberId === Number(memberId))
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const enriched = list.map(f => ({
    ...f,
    tagsArray: f.tags ? f.tags.split(',').map(s => s.trim()) : [],
    memberName: members.find(m => m.id === f.memberId)?.name || '',
    topicTitle: f.topicId ? topics.find(t => t.id === f.topicId)?.title : undefined,
  }))
  res.json({ success: true, data: enriched })
})

router.post('/fragments', (req: Request, res: Response) => {
  const body = req.body as Partial<SpeechFragment> & { memberId: number; content: string }
  if (!body.memberId || !body.content) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const f: SpeechFragment = {
    id: getNextId('fragment'),
    memberId: body.memberId,
    topicId: body.topicId,
    content: body.content,
    tags: body.tags || '',
    notes: body.notes || '',
    createdAt: new Date().toISOString(),
  }
  speechFragments.push(f)
  res.status(201).json({
    success: true,
    data: {
      ...f,
      tagsArray: f.tags ? f.tags.split(',').map(s => s.trim()) : [],
      memberName: members.find(m => m.id === f.memberId)?.name || '',
      topicTitle: f.topicId ? topics.find(t => t.id === f.topicId)?.title : undefined,
    },
  })
})

// Todos
router.get('/todos/all', (req: Request, res: Response) => {
  res.json({ success: true, data: todos })
})

router.post('/todos', (req: Request, res: Response) => {
  const body = req.body as Partial<Todo> & { title: string }
  if (!body.title) {
    res.status(400).json({ success: false, error: '缺少标题' })
    return
  }
  const t: Todo = {
    id: getNextId('todo'),
    title: body.title,
    status: body.status || 'pending',
    priority: body.priority || 'medium',
    topicId: body.topicId,
    dueDate: body.dueDate,
  }
  todos.push(t)
  res.status(201).json({ success: true, data: t })
})

router.put('/todos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = todos.findIndex(t => t.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '待办不存在' })
    return
  }
  todos[idx] = { ...todos[idx], ...req.body }
  res.json({ success: true, data: todos[idx] })
})

router.delete('/todos/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = todos.findIndex(t => t.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '待办不存在' })
    return
  }
  todos.splice(idx, 1)
  res.json({ success: true })
})

// Team overview
router.get('/team/overview', (req: Request, res: Response) => {
  const list = members
    .filter(m => m.role !== 'coach')
    .map(m => {
      const skills = skillAssessments
        .filter(s => s.memberId === m.id)
        .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime())
      const s = skills[0]
      return {
        ...m,
        latestSkills: s || null,
        avgScore: s ? Math.round(((s.argumentation + s.interrogation + s.speech + s.improvisation) / 4) * 10) / 10 : 0,
        practiceCount: practices.filter(p => p.memberId === m.id).length,
        fragmentCount: speechFragments.filter(f => f.memberId === m.id).length,
      }
    })
  res.json({ success: true, data: list })
})

export default router
