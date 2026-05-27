import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { transformWine } from '../utils'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      include: {
        wine: true
      },
      orderBy: {
        priority: 'asc'
      }
    })
    res.json(items.map(item => ({
      ...item,
      wine: item.wine ? transformWine(item.wine) : null
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: req.params.id },
      include: {
        wine: true
      }
    })
    if (!item) {
      return res.status(404).json({ error: 'Wishlist item not found' })
    }
    res.json({
      ...item,
      wine: item.wine ? transformWine(item.wine) : null
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist item' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { wineId, priority, budget, notes } = req.body

    const item = await prisma.wishlistItem.create({
      data: {
        wineId,
        priority,
        budget,
        notes
      },
      include: {
        wine: true
      }
    })
    res.status(201).json({
      ...item,
      wine: item.wine ? transformWine(item.wine) : null
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to add to wishlist' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.wishlistItem.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wishlist item' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.wishlistItem.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' })
  }
})

export default router
