import type { Pixel, SymmetrySettings } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getColorCategory(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  
  if (l < 0.15) return '黑色系';
  if (l > 0.85) return '白色系';
  
  const diff = max - min;
  if (diff < 20) return '灰色系';
  
  const h = getHue(r, g, b, max, min);
  
  if (h >= 0 && h < 30) return '红色系';
  if (h >= 30 && h < 60) return '橙色系';
  if (h >= 60 && h < 90) return '黄色系';
  if (h >= 90 && h < 150) return '绿色系';
  if (h >= 150 && h < 210) return '青色系';
  if (h >= 210 && h < 270) return '蓝色系';
  if (h >= 270 && h < 330) return '紫色系';
  return '红色系';
}

function getHue(r: number, g: number, b: number, max: number, min: number): number {
  const diff = max - min;
  let h = 0;
  
  if (diff === 0) return 0;
  
  if (max === r) {
    h = ((g - b) / diff) % 6;
  } else if (max === g) {
    h = (b - r) / diff + 2;
  } else {
    h = (r - g) / diff + 4;
  }
  
  h *= 60;
  if (h < 0) h += 360;
  
  return h;
}

export function generateSymmetricPixels(
  pixels: Pixel[],
  width: number,
  height: number,
  symmetry: SymmetrySettings
): Pixel[] {
  const result: Pixel[] = [];
  const pixelMap = new Map<string, Pixel>();
  
  pixels.forEach(p => {
    pixelMap.set(`${p.x},${p.y}`, p);
    result.push(p);
    
    const symmetricPoints = getSymmetricPoints(p.x, p.y, width, height, symmetry);
    symmetricPoints.forEach(sp => {
      if (sp.x >= 0 && sp.x < width && sp.y >= 0 && sp.y < height) {
        const key = `${sp.x},${sp.y}`;
        if (!pixelMap.has(key)) {
          const newPixel = { ...p, x: sp.x, y: sp.y };
          pixelMap.set(key, newPixel);
          result.push(newPixel);
        }
      }
    });
  });
  
  return result;
}

function getSymmetricPoints(
  x: number,
  y: number,
  width: number,
  height: number,
  symmetry: SymmetrySettings
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  
  if (symmetry.vertical) {
    points.push({ x: Math.floor(centerX * 2 - x), y });
  }
  
  if (symmetry.horizontal) {
    points.push({ x, y: Math.floor(centerY * 2 - y) });
  }
  
  if (symmetry.vertical && symmetry.horizontal) {
    points.push({
      x: Math.floor(centerX * 2 - x),
      y: Math.floor(centerY * 2 - y)
    });
  }
  
  if (symmetry.diagonal1) {
    if (x < width && y < height) {
      points.push({ x: y, y: x });
    }
  }
  
  if (symmetry.diagonal2) {
    const d1X = height - 1 - y;
    const d1Y = width - 1 - x;
    if (d1X >= 0 && d1X < width && d1Y >= 0 && d1Y < height) {
      points.push({ x: d1X, y: d1Y });
    }
  }
  
  return points;
}

export const DEFAULT_COLORS = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FF6600', '#9900FF',
  '#FF9999', '#99FF99', '#9999FF', '#FFFF99', '#FF99FF',
  '#99FFFF', '#FFCC99', '#CC99FF', '#FF99CC', '#99CCFF',
  '#CCFFCC', '#FFCCCC', '#CCCCFF', '#FFE4C4', '#F5DEB3',
  '#DEB887', '#D2691E', '#8B4513', '#A0522D', '#CD853F',
  '#F4A460', '#DAA520', '#B8860B', '#FFD700', '#808080',
  '#C0C0C0', '#800000', '#800080', '#008080', '#008000'
];
