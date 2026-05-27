import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { transformWine, transformUserPreference } from '../utils'

const router = Router()

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const allBottles = await prisma.wineBottle.findMany({
      include: {
        wine: true
      }
    })

    const inCellar = allBottles.filter(b => b.status === 'IN_CELLAR')
    const reserved = allBottles.filter(b => b.status === 'RESERVED')
    const opened = allBottles.filter(b => b.status === 'OPENED')
    const consumed = allBottles.filter(b => b.status === 'CONSUMED')

    const totalPurchaseValue = allBottles.reduce((sum, b) => sum + b.purchasePrice, 0)
    const totalMarketValue = allBottles.reduce((sum, b) => sum + (b.currentMarketPrice || b.purchasePrice), 0)
    const inventoryValue = inCellar.reduce((sum, b) => sum + b.purchasePrice, 0)
    const inventoryMarketValue = inCellar.reduce((sum, b) => sum + (b.currentMarketPrice || b.purchasePrice), 0)

    const wineGroups: Record<string, { wine: any; count: number }> = {}
    inCellar.forEach(bottle => {
      if (!wineGroups[bottle.wineId]) {
        wineGroups[bottle.wineId] = { wine: transformWine(bottle.wine), count: 0 }
      }
      wineGroups[bottle.wineId].count++
    })

    const preferences = await prisma.userPreference.findFirst()
    const lowStockThreshold = preferences?.lowStockThreshold || 2
    const lowStockItems = Object.values(wineGroups)
      .filter(g => g.count < lowStockThreshold)
      .map(g => ({
        ...g.wine,
        currentStock: g.count,
        threshold: lowStockThreshold
      }))

    res.json({
      totalBottles: allBottles.length,
      inCellar: inCellar.length,
      reserved: reserved.length,
      opened: opened.length,
      consumed: consumed.length,
      totalPurchaseValue,
      totalMarketValue,
      inventoryValue,
      inventoryMarketValue,
      valueChange: inventoryMarketValue - inventoryValue,
      valueChangePercent: inventoryValue > 0 ? ((inventoryMarketValue - inventoryValue) / inventoryValue * 100) : 0,
      uniqueWines: Object.keys(wineGroups).length,
      lowStockItems
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch inventory summary' })
  }
})

router.get('/by-wine', async (_req: Request, res: Response) => {
  try {
    const bottles = await prisma.wineBottle.findMany({
      where: {
        status: 'IN_CELLAR'
      },
      include: {
        wine: true
      }
    })

    const wineGroups: Record<string, any> = {}
    bottles.forEach(bottle => {
      if (!wineGroups[bottle.wineId]) {
        wineGroups[bottle.wineId] = {
          wine: transformWine(bottle.wine),
          bottles: [],
          totalValue: 0,
          avgPrice: 0
        }
      }
      wineGroups[bottle.wineId].bottles.push(bottle)
      wineGroups[bottle.wineId].totalValue += bottle.purchasePrice
    })

    Object.values(wineGroups).forEach(group => {
      group.avgPrice = group.totalValue / group.bottles.length
      group.count = group.bottles.length
    })

    res.json(Object.values(wineGroups))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory by wine' })
  }
})

router.get('/alerts', async (_req: Request, res: Response) => {
  try {
    const preferences = await prisma.userPreference.findFirst()
    const lowStockThreshold = preferences?.lowStockThreshold || 2

    const inCellarBottles = await prisma.wineBottle.findMany({
      where: { status: 'IN_CELLAR' },
      include: { wine: true }
    })

    const wineCounts: Record<string, number> = {}
    inCellarBottles.forEach(b => {
      wineCounts[b.wineId] = (wineCounts[b.wineId] || 0) + 1
    })

    const lowStockWines = await Promise.all(
      Object.entries(wineCounts)
        .filter(([_, count]) => count < lowStockThreshold)
        .map(async ([wineId, count]) => {
          const wine = await prisma.wine.findUnique({ where: { id: wineId } })
          return { wine: wine ? transformWine(wine) : null, currentStock: count, threshold: lowStockThreshold }
        })
    )

    const allWines = await prisma.wine.findMany({
      where: {
        agingPotential: { not: null }
      }
    })

    const currentYear = new Date().getFullYear()
    const peakSoonWines = allWines
      .filter(wine => {
        const vintageYear = wine.vintage
        const agingPotential = wine.agingPotential || 5
        const peakFrom = vintageYear + Math.floor(agingPotential * 0.5)
        const peakTo = vintageYear + Math.floor(agingPotential * 0.8)
        return currentYear >= peakFrom && currentYear <= peakTo
      })
      .map(wine => {
        const vintageYear = wine.vintage
        const agingPotential = wine.agingPotential || 5
        const peakTo = vintageYear + Math.floor(agingPotential * 0.8)
        return {
          wine: transformWine(wine),
          yearsLeftInPeak: peakTo - currentYear
        }
      })

    res.json({
      lowStock: lowStockWines.filter(w => w.wine),
      peakSoon: peakSoonWines
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory alerts' })
  }
})

export default router
