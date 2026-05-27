import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.json(promotions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' })
  }
})

router.get('/active', async (_req: Request, res: Response) => {
  try {
    const now = new Date()
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } }
        ]
      },
      orderBy: {
        price: 'asc'
      }
    })
    res.json(promotions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active promotions' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: req.params.id }
    })
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' })
    }
    res.json(promotion)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotion' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { vendor, wineName, winery, vintage, price, originalPrice, validUntil, url, notes, isActive } = req.body

    const promotion = await prisma.promotion.create({
      data: {
        vendor,
        wineName,
        winery,
        vintage,
        price,
        originalPrice,
        validUntil: validUntil ? new Date(validUntil) : null,
        url,
        notes,
        isActive: isActive !== undefined ? isActive : true
      }
    })
    res.status(201).json(promotion)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create promotion' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const promotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(promotion)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update promotion' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promotion' })
  }
})

export default router
