import { useRef, useEffect, useCallback, useState } from 'react';
import type { Pixel, SymmetrySettings } from '@/types';
import { generateSymmetricPixels } from '@/utils/colorUtils';

interface PixelGridProps {
  width: number;
  height: number;
  cellSize: number;
  pixels: Pixel[];
  currentColor: string;
  currentYarnId?: string;
  tool: 'brush' | 'eraser' | 'fill' | 'picker';
  showGrid: boolean;
  symmetry: SymmetrySettings;
  onPixelChange: (x: number, y: number, color: string, yarnId?: string) => void;
  onPixelErase: (x: number, y: number) => void;
  onPixelsSet: (pixels: Pixel[]) => void;
}

export default function PixelGrid({
  width,
  height,
  cellSize,
  pixels,
  currentColor,
  currentYarnId,
  tool,
  showGrid,
  symmetry,
  onPixelChange,
  onPixelErase,
  onPixelsSet
}: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

  const getPixelFromEvent = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = Math.floor((clientX - rect.left) / cellSize);
      const y = Math.floor((clientY - rect.top) / cellSize);

      if (x < 0 || x >= width || y < 0 || y >= height) return null;
      return { x, y };
    },
    [cellSize, width, height]
  );

  const fillArea = useCallback(
    (startX: number, startY: number, targetColor: string) => {
      const pixelMap = new Map(pixels.map((p) => [`${p.x},${p.y}`, p.color]));
      const startKey = `${startX},${startY}`;
      const startColor = pixelMap.get(startKey) || '#FFFFFF';

      if (startColor === currentColor) return;

      const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];
      const visited = new Set<string>();
      const newPixels: Pixel[] = pixels.filter((p) => {
        const key = `${p.x},${p.y}`;
        if (pixelMap.get(key) === startColor) {
          return false;
        }
        return true;
      });

      while (stack.length > 0) {
        const pos = stack.pop()!;
        const key = `${pos.x},${pos.y}`;

        if (visited.has(key)) continue;
        if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height) continue;

        const existingColor = pixelMap.get(key) || '#FFFFFF';
        if (existingColor !== startColor) continue;

        visited.add(key);
        newPixels.push({ x: pos.x, y: pos.y, color: targetColor, yarnId: currentYarnId });

        stack.push({ x: pos.x + 1, y: pos.y });
        stack.push({ x: pos.x - 1, y: pos.y });
        stack.push({ x: pos.x, y: pos.y + 1 });
        stack.push({ x: pos.x, y: pos.y - 1 });
      }

      const allPixels = generateSymmetricPixels(newPixels, width, height, symmetry);
      onPixelsSet(allPixels);
    },
    [pixels, currentColor, currentYarnId, width, height, symmetry, onPixelsSet]
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const pos = getPixelFromEvent(e);
      if (!pos) return;

      setIsDrawing(true);
      setLastPos(pos);

      if (tool === 'fill') {
        fillArea(pos.x, pos.y, currentColor);
      } else if (tool === 'eraser') {
        onPixelErase(pos.x, pos.y);
      } else {
        onPixelChange(pos.x, pos.y, currentColor, currentYarnId);
      }
    },
    [tool, currentColor, currentYarnId, getPixelFromEvent, fillArea, onPixelChange, onPixelErase]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || tool === 'fill') return;
      e.preventDefault();

      const pos = getPixelFromEvent(e);
      if (!pos) return;

      if (!lastPos || pos.x !== lastPos.x || pos.y !== lastPos.y) {
        setLastPos(pos);
        if (tool === 'eraser') {
          onPixelErase(pos.x, pos.y);
        } else {
          onPixelChange(pos.x, pos.y, currentColor, currentYarnId);
        }
      }
    },
    [isDrawing, tool, lastPos, currentColor, currentYarnId, getPixelFromEvent, onPixelChange, onPixelErase]
  );

  const handleEnd = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayWidth = width * cellSize;
    const displayHeight = height * cellSize;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    const pixelMap = new Map(pixels.map((p) => [`${p.x},${p.y}`, p.color]));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        const color = pixelMap.get(key);
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    if (showGrid && cellSize > 3) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, displayHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(displayWidth, y * cellSize);
        ctx.stroke();
      }
    }
  }, [width, height, cellSize, pixels, showGrid]);

  return (
    <div
      id="pattern-preview"
      className="overflow-auto bg-white rounded-xl border border-gray-200 shadow-inner p-4"
    >
      <canvas
        ref={canvasRef}
        className="cursor-crosshair touch-none mx-auto block"
        style={{
          imageRendering: 'pixelated'
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  );
}
