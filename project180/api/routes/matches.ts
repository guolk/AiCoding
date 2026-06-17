import { Router, type Request, type Response } from 'express'
import {
  matches, reviews, reviewArguments, topics, getNextId,
} from '../data/store.js'
import type { Match, Review } from '../../shared/types.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query
  let list = [...matches]
  if (status) list = list.filter(m => m.status === status)
  list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const enriched = list.map(m => ({
    ...m,
    topicTitle: topics.find(t => t.id === m.topicId)?.title || '',
  }))
  res.json({ success: true, data: enriched })
})

router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const match = matches.find(m => m.id === id)
  if (!match) {
    res.status(404).json({ success: false, error: '比赛不存在' })
    return
  }
  const enriched = {
    ...match,
    topicTitle: topics.find(t => t.id === match.topicId)?.title || '',
    review: reviews.find(r => r.matchId === match.id),
  }
  res.json({ success: true, data: enriched })
})

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Match> & { topicId: number; date: string; teamA: string; teamB: string }
  if (!body.topicId || !body.date || !body.teamA || !body.teamB) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const newMatch: Match = {
    id: getNextId('match'),
    topicId: body.topicId,
    date: body.date,
    venue: body.venue || '',
    teamA: body.teamA,
    teamB: body.teamB,
    status: 'upcoming',
  }
  matches.push(newMatch)
  res.status(201).json({
    success: true,
    data: { ...newMatch, topicTitle: topics.find(t => t.id === newMatch.topicId)?.title || '' },
  })
})

router.post('/:id/result', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = matches.findIndex(m => m.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '比赛不存在' })
    return
  }
  const { winner, bestSpeaker } = req.body
  if (!winner) {
    res.status(400).json({ success: false, error: '请指定获胜方' })
    return
  }
  matches[idx] = {
    ...matches[idx], winner, bestSpeaker, status: 'completed',
  }
  res.json({ success: true, data: matches[idx] })
})

router.get('/:id/review', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const match = matches.find(m => m.id === id)
  if (!match) {
    res.status(404).json({ success: false, error: '比赛不存在' })
    return
  }
  const review = reviews.find(r => r.matchId === id)
  if (!review) {
    res.json({ success: true, data: null })
    return
  }
  const ra = reviewArguments.filter(r => r.reviewId === review.id)
  res.json({
    success: true,
    data: {
      ...review,
      effectiveArguments: ra.filter(r => r.effectiveness === 'effective').map(r => r.argumentId),
      failedArguments: ra.filter(r => r.effectiveness === 'failed').map(r => r.argumentId),
    },
  })
})

router.post('/:id/review', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const match = matches.find(m => m.id === id)
  if (!match) {
    res.status(404).json({ success: false, error: '比赛不存在' })
    return
  }
  const { effectiveArguments = [], failedArguments = [], notes = '' } = req.body

  // Delete existing review
  const existingIdx = reviews.findIndex(r => r.matchId === id)
  if (existingIdx !== -1) {
    const rv = reviews[existingIdx]
    const existingRAs = reviewArguments.filter(r => r.reviewId === rv.id)
    existingRAs.forEach(_ => {
      const ri = reviewArguments.findIndex(r => r.reviewId === rv.id)
      if (ri !== -1) reviewArguments.splice(ri, 1)
    })
    reviews.splice(existingIdx, 1)
  }

  const newReview: Review = {
    id: getNextId('review'),
    matchId: id,
    notes,
    createdAt: new Date().toISOString(),
  }
  reviews.push(newReview)

  effectiveArguments.forEach((argId: number) => {
    reviewArguments.push({
      id: getNextId('reviewArgument'),
      reviewId: newReview.id,
      argumentId: argId,
      effectiveness: 'effective',
    })
  })
  failedArguments.forEach((argId: number) => {
    reviewArguments.push({
      id: getNextId('reviewArgument'),
      reviewId: newReview.id,
      argumentId: argId,
      effectiveness: 'failed',
    })
  })

  res.status(201).json({
    success: true,
    data: {
      ...newReview,
      effectiveArguments,
      failedArguments,
    },
  })
})

export default router
