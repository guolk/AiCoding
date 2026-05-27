import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import axios from 'axios'
import { transformWine, stringifyJsonField } from '../utils'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const wines = await prisma.wine.findMany({
      include: {
        bottles: true,
        tastingNotes: {
          orderBy: {
            tastingDate: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        winery: 'asc'
      }
    })
    res.json(wines.map(transformWine))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wines' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const wine = await prisma.wine.findUnique({
      where: { id: req.params.id },
      include: {
        bottles: {
          include: {
            purchase: true
          }
        },
        tastingNotes: {
          orderBy: {
            tastingDate: 'desc'
          }
        },
        pairings: true
      }
    })
    if (!wine) {
      return res.status(404).json({ error: 'Wine not found' })
    }
    res.json(transformWine(wine))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wine' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      winery,
      vintage,
      region,
      country,
      grapeVarieties,
      type,
      alcoholContent,
      agingPotential,
      vivinoId,
      vivinoRating,
      vivinoUrl,
      description,
      imageUrl
    } = req.body

    const wine = await prisma.wine.create({
      data: {
        name,
        winery,
        vintage,
        region,
        country,
        grapeVarieties: stringifyJsonField(Array.isArray(grapeVarieties) ? grapeVarieties : [grapeVarieties]),
        type,
        alcoholContent,
        agingPotential,
        vivinoId,
        vivinoRating,
        vivinoUrl,
        description,
        imageUrl
      }
    })
    res.status(201).json(transformWine(wine))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create wine' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body }
    if (updateData.grapeVarieties !== undefined) {
      updateData.grapeVarieties = stringifyJsonField(updateData.grapeVarieties)
    }
    const wine = await prisma.wine.update({
      where: { id: req.params.id },
      data: updateData
    })
    res.json(transformWine(wine))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wine' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const wineId = req.params.id
    
    await prisma.tastingNote.deleteMany({ where: { wineId } })
    await prisma.foodPairing.deleteMany({ where: { wineId } })
    await prisma.wishlistItem.deleteMany({ where: { wineId } })
    
    const bottles = await prisma.wineBottle.findMany({ where: { wineId } })
    const bottleIds = bottles.map(b => b.id)
    if (bottleIds.length > 0) {
      await prisma.tastingNote.deleteMany({ where: { wineBottleId: { in: bottleIds } } })
    }
    await prisma.wineBottle.deleteMany({ where: { wineId } })
    
    await prisma.wine.delete({ where: { id: wineId } })
    res.status(204).send()
  } catch (error) {
    console.error('Delete wine error:', error)
    res.status(500).json({ error: 'Failed to delete wine' })
  }
})

router.get('/vivino/search', async (req: Request, res: Response) => {
  try {
    const { winery, vintage } = req.query

    const mockVivinoData = {
      id: 'mock-' + Date.now(),
      name: `${winery} ${vintage}`,
      winery: String(winery),
      vintage: Number(vintage),
      region: '波尔多, 法国',
      country: '法国',
      grapeVarieties: ['赤霞珠', '梅洛'],
      type: 'RED',
      alcoholContent: 13.5,
      agingPotential: 10,
      vivinoRating: 4.2,
      vivinoUrl: `https://www.vivino.com/search/wineries/${winery}`,
      description: `来自${winery}酒庄的${vintage}年份葡萄酒，具有经典的风土特征。`,
      imageUrl: 'https://images.vivino.com/thumbs/placeholder.png'
    }

    res.json(mockVivinoData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to search Vivino' })
  }
})

router.get('/:id/drinking-window', async (req: Request, res: Response) => {
  try {
    const wine = await prisma.wine.findUnique({
      where: { id: req.params.id }
    })

    if (!wine) {
      return res.status(404).json({ error: 'Wine not found' })
    }

    const vintageYear = wine.vintage
    const agingPotential = wine.agingPotential || 5
    const currentYear = new Date().getFullYear()
    
    const drinkFrom = vintageYear + Math.floor(agingPotential * 0.3)
    const drinkTo = vintageYear + agingPotential
    const peakFrom = vintageYear + Math.floor(agingPotential * 0.5)
    const peakTo = vintageYear + Math.floor(agingPotential * 0.8)
    
    const isDrinkable = currentYear >= drinkFrom && currentYear <= drinkTo
    const isPeak = currentYear >= peakFrom && currentYear <= peakTo
    const isPastPeak = currentYear > drinkTo
    const isTooYoung = currentYear < drinkFrom

    let status = 'drinkable'
    if (isTooYoung) status = 'too_young'
    else if (isPeak) status = 'peak'
    else if (isPastPeak) status = 'past_peak'

    res.json({
      wineId: wine.id,
      vintage: vintageYear,
      agingPotential,
      drinkWindow: {
        from: drinkFrom,
        to: drinkTo
      },
      peakWindow: {
        from: peakFrom,
        to: peakTo
      },
      currentYear,
      status,
      yearsUntilPeak: Math.max(0, peakFrom - currentYear),
      yearsPastPeak: Math.max(0, currentYear - peakTo),
      recommended: isDrinkable && !isPastPeak
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate drinking window' })
  }
})

export default router
