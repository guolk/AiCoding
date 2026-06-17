import { Router, type Request, type Response } from 'express'
import { argumentList as allArgs, getNextId } from '../data/store.js'
import type { Argument } from '../../shared/types.js'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  const { topicId, side } = req.query
  let list = [...allArgs]
  if (topicId) list = list.filter(a => a.topicId === Number(topicId))
  if (side) list = list.filter(a => a.side === side)
  list.sort((a, b) => b.strength - a.strength)
  res.json({ success: true, data: list })
})

router.get('/by-topic/:topicId', (req: Request, res: Response) => {
  const topicId = Number(req.params.topicId)
  const pro = allArgs.filter(a => a.topicId === topicId && a.side === 'pro')
  const con = allArgs.filter(a => a.topicId === topicId && a.side === 'con')
  const byFramework = {
    value: {
      pro: pro.filter(a => a.framework === 'value'),
      con: con.filter(a => a.framework === 'value'),
    },
    fact: {
      pro: pro.filter(a => a.framework === 'fact'),
      con: con.filter(a => a.framework === 'fact'),
    },
    logic: {
      pro: pro.filter(a => a.framework === 'logic'),
      con: con.filter(a => a.framework === 'logic'),
    },
  }
  res.json({ success: true, data: { pro, con, byFramework } })
})

router.post('/', (req: Request, res: Response) => {
  const body = req.body as Partial<Argument> & { topicId: number; side: 'pro' | 'con'; content: string; framework: 'value' | 'fact' | 'logic' }
  if (!body.topicId || !body.side || !body.content || !body.framework) {
    res.status(400).json({ success: false, error: '缺少必填字段' })
    return
  }
  const newArg: Argument = {
    id: getNextId('argument'),
    topicId: body.topicId,
    side: body.side,
    content: body.content,
    evidence: body.evidence || '',
    framework: body.framework,
    strength: body.strength ?? 5,
    rebuttal: body.rebuttal,
    response: body.response,
  }
  allArgs.push(newArg)
  res.status(201).json({ success: true, data: newArg })
})

router.put('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = allArgs.findIndex(a => a.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '论点不存在' })
    return
  }
  allArgs[idx] = { ...allArgs[idx], ...req.body }
  res.json({ success: true, data: allArgs[idx] })
})

router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const idx = allArgs.findIndex(a => a.id === id)
  if (idx === -1) {
    res.status(404).json({ success: false, error: '论点不存在' })
    return
  }
  allArgs.splice(idx, 1)
  res.json({ success: true })
})

export default router
