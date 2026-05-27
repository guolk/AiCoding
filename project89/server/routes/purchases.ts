import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { transformWine } from '../utils'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        bottles: {
          include: {
            wine: true
          }
        }
      },
      orderBy: {
        purchaseDate: 'desc'
      }
    })
    res.json(purchases.map(p => ({
      ...p,
      bottles: p.bottles.map(b => ({
        ...b,
        wine: b.wine ? transformWine(b.wine) : null
      }))
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' })
  }
})

router.get('/statistics', async (_req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        status: 'RECEIVED'
      }
    })

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    const monthlyStats: Record<string, number> = {}
    const yearlyStats: Record<string, number> = {}

    purchases.forEach(purchase => {
      const date = new Date(purchase.purchaseDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const yearKey = String(date.getFullYear())

      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + purchase.totalAmount
      yearlyStats[yearKey] = (yearlyStats[yearKey] || 0) + purchase.totalAmount
    })

    const thisMonthTotal = monthlyStats[`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`] || 0
    const thisYearTotal = yearlyStats[String(currentYear)] || 0
    const lastYearTotal = yearlyStats[String(currentYear - 1)] || 0

    res.json({
      totalPurchases: purchases.length,
      totalSpent: purchases.reduce((sum, p) => sum + p.totalAmount, 0),
      thisMonthTotal,
      thisYearTotal,
      lastYearTotal,
      yearlyComparison: lastYearTotal > 0 ? ((thisYearTotal - lastYearTotal) / lastYearTotal * 100) : 0,
      monthlyStats,
      yearlyStats,
      averagePurchase: purchases.length > 0 ? purchases.reduce((sum, p) => sum + p.totalAmount, 0) / purchases.length : 0
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch purchase statistics' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        bottles: {
          include: {
            wine: true
          }
        }
      }
    })
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' })
    }
    res.json({
      ...purchase,
      bottles: purchase.bottles.map(b => ({
        ...b,
        wine: b.wine ? transformWine(b.wine) : null
      }))
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { vendor, purchaseDate, totalAmount, status, notes } = req.body

    const purchase = await prisma.purchase.create({
      data: {
        vendor,
        purchaseDate: new Date(purchaseDate),
        totalAmount,
        status,
        notes
      },
      include: {
        bottles: true
      }
    })
    res.status(201).json(purchase)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create purchase' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const purchase = await prisma.purchase.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(purchase)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.purchase.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase' })
  }
})

export default router
