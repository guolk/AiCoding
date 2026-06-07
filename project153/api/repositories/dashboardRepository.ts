import { getAllRelics } from './relicRepository.js';
import { getAllNotes } from './noteRepository.js';
import { getAllAnalysis } from './analysisRepository.js';
import { getAllMaterials } from './materialRepository.js';
import type { DashboardStats } from '../../shared/types.js';

export async function getDashboardStats(): Promise<DashboardStats> {
  const [relics, notes, analysis, materials] = await Promise.all([
    getAllRelics(),
    getAllNotes(),
    getAllAnalysis(),
    getAllMaterials()
  ]);

  return {
    totalRelics: relics.length,
    totalNotes: notes.length,
    totalAnalysis: analysis.length,
    totalMaterials: materials.length,
    recentRelics: relics.slice(0, 5),
    recentNotes: notes.slice(0, 5)
  };
}
