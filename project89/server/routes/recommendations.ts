import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { transformWine, transformUserPreference, stringifyJsonField } from '../utils'

const router = Router()

router.get('/pairings', async (_req: Request, res: Response) => {
  try {
    const pairings = await prisma.foodPairing.findMany({
      include: {
        wine: true
      },
      orderBy: {
        rating: 'desc'
      }
    })
    res.json(pairings.map(p => ({
      ...p,
      wine: p.wine ? transformWine(p.wine) : null
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pairings' })
  }
})

router.post('/pairings', async (req: Request, res: Response) => {
  try {
    const { wineId, dishName, dishType, description, rating } = req.body

    const pairing = await prisma.foodPairing.create({
      data: {
        wineId,
        dishName,
        dishType,
        description,
        rating
      },
      include: {
        wine: true
      }
    })
    res.status(201).json({
      ...pairing,
      wine: pairing.wine ? transformWine(pairing.wine) : null
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create pairing' })
  }
})

router.get('/pairings/suggest/:dishType', async (req: Request, res: Response) => {
  try {
    const { dishType } = req.params

    const pairings = await prisma.foodPairing.findMany({
      where: {
        dishType: {
          contains: dishType
        }
      },
      include: {
        wine: true
      },
      orderBy: {
        rating: 'desc'
      }
    })

    res.json(pairings.map(p => ({
      ...p,
      wine: p.wine ? transformWine(p.wine) : null
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pairing suggestions' })
  }
})

router.get('/personalized', async (_req: Request, res: Response) => {
  try {
    const highScoreNotes = await prisma.tastingNote.findMany({
      where: {
        overallScore: {
          gte: 85
        }
      },
      include: {
        wine: true
      },
      orderBy: {
        overallScore: 'desc'
      }
    })

    const typeCount: Record<string, number> = {}
    const grapeCount: Record<string, number> = {}
    const regionCount: Record<string, number> = {}

    highScoreNotes.forEach(note => {
      const transformedWine = transformWine(note.wine)
      const type = transformedWine.type
      typeCount[type] = (typeCount[type] || 0) + 1

      const grapes = Array.isArray(transformedWine.grapeVarieties) ? transformedWine.grapeVarieties : []
      grapes.forEach((grape: string) => {
        grapeCount[grape] = (grapeCount[grape] || 0) + 1
      })

      if (transformedWine.region) {
        regionCount[transformedWine.region] = (regionCount[transformedWine.region] || 0) + 1
      }
    })

    const favoriteTypes = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type)

    const favoriteGrapes = Object.entries(grapeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([grape]) => grape)

    const favoriteRegions = Object.entries(regionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([region]) => region)

    const allWines = await prisma.wine.findMany({
      include: {
        bottles: {
          where: {
            status: 'IN_CELLAR'
          }
        },
        tastingNotes: {
          orderBy: {
            tastingDate: 'desc'
          },
          take: 1
        }
      }
    })

    const recommendedWines = allWines
      .map(transformWine)
      .filter(wine => {
        const hasBottles = wine.bottles.length > 0
        const hasHighScore = wine.tastingNotes.length > 0 && wine.tastingNotes[0].overallScore >= 85
        const matchesType = favoriteTypes.includes(wine.type)
        return hasBottles && (hasHighScore || matchesType)
      })
      .sort((a, b) => {
        const aScore = a.tastingNotes[0]?.overallScore || 0
        const bScore = b.tastingNotes[0]?.overallScore || 0
        return bScore - aScore
      })
      .slice(0, 10)

    const wishlistRecommendations = await prisma.wishlistItem.findMany({
      include: {
        wine: true
      },
      orderBy: {
        priority: 'asc'
      },
      take: 5
    })

    res.json({
      tasteProfile: {
        favoriteTypes,
        favoriteGrapes,
        favoriteRegions,
        totalHighScoreNotes: highScoreNotes.length
      },
      recommendedToDrink: recommendedWines,
      wishlistRecommendations: wishlistRecommendations.map(item => transformWine(item.wine))
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch personalized recommendations' })
  }
})

router.get('/suggest-pairing/:wineId', async (req: Request, res: Response) => {
  try {
    const { wineId } = req.params
    const wine = await prisma.wine.findUnique({ where: { id: wineId } })

    if (!wine) {
      return res.status(404).json({ error: 'Wine not found' })
    }

    const transformedWine = transformWine(wine)
    const pairingSuggestions = getPairingSuggestions(transformedWine.type, Array.isArray(transformedWine.grapeVarieties) ? transformedWine.grapeVarieties : [])

    const existingPairings = await prisma.foodPairing.findMany({
      where: { wineId },
      orderBy: { rating: 'desc' }
    })

    res.json({
      wine: transformedWine,
      suggestedPairings: pairingSuggestions,
      userPairings: existingPairings
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pairing suggestions' })
  }
})

function getPairingSuggestions(wineType: string, grapes: string[]): Array<{ dishName: string; dishType: string; reason: string }> {
  const suggestions: Array<{ dishName: string; dishType: string; reason: string }> = []

  if (wineType === 'RED') {
    suggestions.push({ dishName: '烤牛排', dishType: '红肉', reason: '红酒的单宁与牛肉的脂肪完美平衡' })
    suggestions.push({ dishName: '红酒炖牛肉', dishType: '炖菜', reason: '浓郁的红酒与慢炖的牛肉相得益彰' })
    suggestions.push({ dishName: '硬奶酪拼盘', dishType: '奶酪', reason: '成熟的红酒与硬质奶酪搭配绝佳' })
    
    if (grapes.includes('赤霞珠') || grapes.includes('Cabernet Sauvignon')) {
      suggestions.push({ dishName: '烤羊排', dishType: '红肉', reason: '赤霞珠的结构与羊排的风味相配' })
    }
    if (grapes.includes('黑皮诺') || grapes.includes('Pinot Noir')) {
      suggestions.push({ dishName: '烤鸭', dishType: '禽肉', reason: '黑皮诺的优雅与烤鸭的细腻匹配' })
      suggestions.push({ dishName: '松露意面', dishType: '面食', reason: '黑皮诺的香气与松露完美融合' })
    }
  } else if (wineType === 'WHITE') {
    suggestions.push({ dishName: '烤鲈鱼', dishType: '海鲜', reason: '白葡萄酒的酸度与海鲜的鲜味平衡' })
    suggestions.push({ dishName: '凯撒沙拉', dishType: '沙拉', reason: '清爽的白葡萄酒与沙拉搭配' })
    suggestions.push({ dishName: '烤鸡', dishType: '禽肉', reason: '白葡萄酒与鸡肉的百搭组合' })
    
    if (grapes.includes('霞多丽') || grapes.includes('Chardonnay')) {
      suggestions.push({ dishName: '龙虾', dishType: '海鲜', reason: '黄油般的霞多丽与龙虾的 richness 相配' })
    }
    if (grapes.includes('长相思') || grapes.includes('Sauvignon Blanc')) {
      suggestions.push({ dishName: '山羊奶酪', dishType: '奶酪', reason: '长相思的酸度与山羊奶酪完美搭配' })
    }
  } else if (wineType === 'SPARKLING') {
    suggestions.push({ dishName: '生蚝', dishType: '海鲜', reason: '起泡酒的气泡与生蚝的鲜美绝配' })
    suggestions.push({ dishName: '炸鱼薯条', dishType: '油炸', reason: '起泡酒的酸度解油腻' })
    suggestions.push({ dishName: '水果塔', dishType: '甜点', reason: '起泡酒与水果甜点的清新组合' })
  } else if (wineType === 'ROSE') {
    suggestions.push({ dishName: '希腊沙拉', dishType: '沙拉', reason: '桃红的清爽与地中海风味相配' })
    suggestions.push({ dishName: '烤虾', dishType: '海鲜', reason: '桃红与烤虾的甜美相得益彰' })
    suggestions.push({ dishName: '寿司', dishType: '日料', reason: '干型桃红与寿司的搭配令人惊喜' })
  } else if (wineType === 'DESSERT') {
    suggestions.push({ dishName: '巧克力蛋糕', dishType: '甜点', reason: '甜酒与巧克力的经典组合' })
    suggestions.push({ dishName: '蓝纹奶酪', dishType: '奶酪', reason: '贵腐酒与蓝纹奶酪的完美平衡' })
    suggestions.push({ dishName: '焦糖布丁', dishType: '甜点', reason: '甜酒与焦糖的风味互补' })
  } else if (wineType === 'FORTIFIED') {
    suggestions.push({ dishName: '雪茄', dishType: '其他', reason: '波特酒与雪茄是经典搭配' })
    suggestions.push({ dishName: '核桃蛋糕', dishType: '甜点', reason: '雪利酒的坚果香气与核桃蛋糕相配' })
    suggestions.push({ dishName: '炖水果', dishType: '甜点', reason: '马德拉酒与炖水果的风味互补' })
  }

  return suggestions.slice(0, 6)
}

router.get('/preferences', async (_req: Request, res: Response) => {
  try {
    const preferences = await prisma.userPreference.findFirst()
    if (!preferences) {
      const defaultPrefs = await prisma.userPreference.create({
        data: {
          favoriteTypes: stringifyJsonField([]),
          favoriteRegions: stringifyJsonField([]),
          favoriteGrapes: stringifyJsonField([]),
          lowStockThreshold: 2
        }
      })
      res.json(transformUserPreference(defaultPrefs))
    } else {
      res.json(transformUserPreference(preferences))
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences' })
  }
})

router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body }
    if (updateData.favoriteTypes !== undefined) {
      updateData.favoriteTypes = stringifyJsonField(updateData.favoriteTypes)
    }
    if (updateData.favoriteRegions !== undefined) {
      updateData.favoriteRegions = stringifyJsonField(updateData.favoriteRegions)
    }
    if (updateData.favoriteGrapes !== undefined) {
      updateData.favoriteGrapes = stringifyJsonField(updateData.favoriteGrapes)
    }
    
    const preferences = await prisma.userPreference.findFirst()
    if (preferences) {
      const updated = await prisma.userPreference.update({
        where: { id: preferences.id },
        data: updateData
      })
      res.json(transformUserPreference(updated))
    } else {
      const created = await prisma.userPreference.create({
        data: updateData
      })
      res.json(transformUserPreference(created))
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' })
  }
})

export default router
