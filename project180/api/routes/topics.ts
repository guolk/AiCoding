import { Router, type Request, type Response } from 'express'
import {
  topics, argumentList as allArgs, matches, reviews, reviewArguments, getNextId,
} from '../data/store.js'
import type { Topic, TopicDetail, TopicListItem, CreateTopicBody } from '../../shared/types.js'

const router = Router()

function getTopicListItems(): TopicListItem[] {
  return topics.map(t => ({
    ...t,
    argumentCount: allArgs.filter(a => a.topicId === t.id).length,
    matchCount: matches.filter(m => m.topicId === t.id).length,
  }))
}

router.get('/', (req: Request, res: Response) => {
  const { type, difficulty, field, search } = req.query

  let list = getTopicListItems()

  if (type) list = list.filter(t => t.type === type)
  if (difficulty) list = list.filter(t => t.difficulty === Number(difficulty))
  if (field) list = list.filter(t => t.field === field)
  if (search && typeof search === 'string') {
    const s = search.toLowerCase()
    list = list.filter(t =>
      t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s)
    )
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  res.json({ success: true, data: list })
})

router.get('/fields', (req: Request, res: Response) => {
  const fields = Array.from(new Set(topics.map(t => t.field)))
  res.json({ success: true, data: fields })
})

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const topic = topics.find(t => t.id === id)
  if (!topic) {
    res.status(404).json({ success: false, error: '辩题不存在' })
    return
  }

  const proArguments = allArgs.filter(a => a.topicId === id && a.side === 'pro')
  const conArguments = allArgs.filter(a => a.topicId === id && a.side === 'con')
  const matchHistory = matches
    .filter(m => m.topicId === id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(m => ({
      ...m,
      topicTitle: topic.title,
      keyArguments: (() => {
        const rv = reviews.find(r => r.matchId === m.id)
        if (!rv) return []
        return reviewArguments
          .filter(ra => ra.reviewId === rv.id && ra.effectiveness === 'effective')
          .map(ra => ra.argumentId)
      })(),
    }))

  const detail: TopicDetail = {
    ...topic, proArguments, conArguments, matchHistory,
  }

  res.json({ success: true, data: detail })
})

router.post('/', (req: Request, res: Response) => {
  const body = req.body as CreateTopicBody
  if (!body.title || !body.type || !body.field || !body.difficulty) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }

  const newTopic: Topic = {
    id: getNextId('topic'),
    title: body.title,
    type: body.type,
    difficulty: body.difficulty,
    field: body.field,
    description: body.description || '',
    createdAt: new Date().toISOString(),
  }

  topics.push(newTopic)
  res.status(201).json({ success: true, data: { ...newTopic, argumentCount: 0, matchCount: 0 } })
})

router.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = topics.findIndex(t => t.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '辩题不存在' })
    return
  }

  const body = req.body as Partial<Topic>
  topics[idx] = { ...topics[idx], ...body }
  res.json({ success: true, data: topics[idx] })
})

router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = topics.findIndex(t => t.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '辩题不存在' })
    return
  }
  topics.splice(idx, 1)
  res.json({ success: true })
})

export default router
