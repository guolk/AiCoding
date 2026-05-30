import type { Pattern, Pixel, Project } from '@/types';

export interface MaterialCalculation {
  color: string;
  yarnId?: string;
  pixelCount: number;
  estimatedWeight: number;
  percentage: number;
}

export function calculateMaterialUsage(
  pattern: Pattern,
  projectDimensions: { width: number; height: number; unit: 'cm' | 'in' },
  stitchDensity: number = 10
): MaterialCalculation[] {
  const colorPixelMap = new Map<string, { pixels: Pixel[]; yarnId?: string }>();
  
  pattern.pixels.forEach(pixel => {
    const key = pixel.yarnId || pixel.color;
    if (!colorPixelMap.has(key)) {
      colorPixelMap.set(key, { pixels: [], yarnId: pixel.yarnId });
    }
    colorPixelMap.get(key)!.pixels.push(pixel);
  });
  
  const totalPixels = pattern.pixels.length;
  const results: MaterialCalculation[] = [];
  
  const widthInCm = projectDimensions.unit === 'in' 
    ? projectDimensions.width * 2.54 
    : projectDimensions.width;
  const heightInCm = projectDimensions.unit === 'in'
    ? projectDimensions.height * 2.54
    : projectDimensions.height;
  
  const areaCm2 = widthInCm * heightInCm;
  const totalStitches = areaCm2 * stitchDensity;
  const gramsPerStitch = 0.05;
  
  colorPixelMap.forEach(({ pixels, yarnId }, key) => {
    const pixelCount = pixels.length;
    const percentage = totalPixels > 0 ? pixelCount / totalPixels : 0;
    const estimatedWeight = totalStitches * percentage * gramsPerStitch;
    
    const pixel = pixels[0];
    results.push({
      color: pixel.color,
      yarnId,
      pixelCount,
      estimatedWeight: Math.round(estimatedWeight * 10) / 10,
      percentage: Math.round(percentage * 1000) / 10
    });
  });
  
  return results.sort((a, b) => b.pixelCount - a.pixelCount);
}

export function getProjectMaterialSummary(project: Project, yarns: Map<string, { colorName: string; colorHex: string; brand: string }>) {
  return project.yarnsUsed.map(y => {
    const yarn = yarns.get(y.yarnId);
    return {
      yarnId: y.yarnId,
      yarnName: yarn?.colorName || '未知线材',
      brand: yarn?.brand || '',
      color: yarn?.colorHex || '#CCCCCC',
      estimatedWeight: y.estimatedWeight,
      usedWeight: y.usedWeight,
      remaining: y.estimatedWeight - y.usedWeight
    };
  });
}

export function generateMaterialCSV(materials: MaterialCalculation[], yarns: Map<string, { colorName: string; colorHex: string; brand: string }>): string {
  const headers = ['颜色', '色号', '品牌', '像素数', '预估用量(g)', '占比(%)'];
  const rows = materials.map(m => {
    const yarn = m.yarnId ? yarns.get(m.yarnId) : null;
    return [
      yarn?.colorName || m.color,
      m.yarnId || '-',
      yarn?.brand || '-',
      m.pixelCount.toString(),
      m.estimatedWeight.toString(),
      m.percentage.toString()
    ];
  });
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
