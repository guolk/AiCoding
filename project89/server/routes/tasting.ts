import { Router, Request, Response } from 'express'
import prisma from '../prisma'
import { transformTastingNote, stringifyJsonField, transformWine } from '../utils'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const notes = await prisma.tastingNote.findMany({
      include: {
        wine: true,
        bottle: true
      },
      orderBy: {
        tastingDate: 'desc'
      }
    })
    res.json(notes.map(note => ({
      ...transformTastingNote(note),
      wine: note.wine ? transformWine(note.wine) : null
    })))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasting notes' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const note = await prisma.tastingNote.findUnique({
      where: { id: req.params.id },
      include: {
        wine: true,
        bottle: true
      }
    })
    if (!note) {
      return res.status(404).json({ error: 'Tasting note not found' })
    }
    res.json({
      ...transformTastingNote(note),
      wine: note.wine ? transformWine(note.wine) : null
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasting note' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      wineBottleId,
      wineId,
      tastingDate,
      decantingTime,
      servingTemp,
      pairedFood,
      appearanceScore,
      appearanceNotes,
      aromaScore,
      aromaNotes,
      aromaDescriptors,
      tasteScore,
      tasteNotes,
      tasteDescriptors,
      finishScore,
      finishNotes,
      overallScore,
      notes,
      expectationMatch,
      expectationNotes
    } = req.body

    const tastingNote = await prisma.tastingNote.create({
      data: {
        wineBottleId,
        wineId,
        tastingDate: new Date(tastingDate),
        decantingTime,
        servingTemp,
        pairedFood,
        appearanceScore,
        appearanceNotes,
        aromaScore,
        aromaNotes,
        aromaDescriptors: stringifyJsonField(Array.isArray(aromaDescriptors) ? aromaDescriptors : []),
        tasteScore,
        tasteNotes,
        tasteDescriptors: stringifyJsonField(Array.isArray(tasteDescriptors) ? tasteDescriptors : []),
        finishScore,
        finishNotes,
        overallScore,
        notes,
        expectationMatch,
        expectationNotes
      },
      include: {
        wine: true,
        bottle: true
      }
    })

    await prisma.wineBottle.update({
      where: { id: wineBottleId },
      data: { status: 'CONSUMED' }
    })

    res.status(201).json({
      ...transformTastingNote(tastingNote),
      wine: tastingNote.wine ? transformWine(tastingNote.wine) : null
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create tasting note' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body }
    if (updateData.aromaDescriptors !== undefined) {
      updateData.aromaDescriptors = stringifyJsonField(updateData.aromaDescriptors)
    }
    if (updateData.tasteDescriptors !== undefined) {
      updateData.tasteDescriptors = stringifyJsonField(updateData.tasteDescriptors)
    }
    if (updateData.tastingDate) {
      updateData.tastingDate = new Date(updateData.tastingDate)
    }
    const note = await prisma.tastingNote.update({
      where: { id: req.params.id },
      data: updateData
    })
    res.json(transformTastingNote(note))
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tasting note' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.tastingNote.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tasting note' })
  }
})

export default router
