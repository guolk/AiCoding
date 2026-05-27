import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { transformWine } from '../utils'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const bottles = await prisma.wineBottle.findMany({
      include: {
        wine: true,
        purchase: true,
        tastingNotes: {
          orderBy: {
            tastingDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    })
    res.json(bottles.map(b => ({
      ...b,
      wine: b.wine ? transformWine(b.wine) : null
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bottles' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const bottle = await prisma.wineBottle.findUnique({
      where: { id: req.params.id },
      include: {
        wine: true,
        purchase: true,
        tastingNotes: {
          orderBy: {
            tastingDate: 'desc'
          }
        }
      }
    })
    if (!bottle) {
      return res.status(404).json({ error: 'Bottle not found' })
    }
    res.json({
      ...bottle,
      wine: bottle.wine ? transformWine(bottle.wine) : null
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bottle' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      wineId,
      purchasePrice,
      purchaseDate,
      purchaseChannel,
      storageLocation,
      currentMarketPrice,
      status,
      purchaseId
    } = req.body

    const bottle = await prisma.wineBottle.create({
      data: {
        wineId,
        purchasePrice,
        purchaseDate: new Date(purchaseDate),
        purchaseChannel,
        storageLocation,
        currentMarketPrice,
        status,
        purchaseId
      },
      include: {
        wine: true
      }
    })
    res.status(201).json({
      ...bottle,
      wine: bottle.wine ? transformWine(bottle.wine) : null
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create bottle' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const bottle = await prisma.wineBottle.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(bottle)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bottle' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.wineBottle.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bottle' })
  }
})

export default router
