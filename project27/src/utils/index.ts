import { Point, Rect, Size, IEngineConfig } from '../types/index.js';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectIntersect(r1: Rect, r2: Rect): boolean {
  return !(
    r1.x + r1.width < r2.x ||
    r2.x + r2.width < r1.x ||
    r1.y + r1.height < r2.y ||
    r2.y + r2.height < r1.y
  );
}

export function lineIntersectsRect(
  p1: Point,
  p2: Point,
  rect: Rect
): boolean {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  const intersectsLeft = lineIntersectsLine(
    p1,
    p2,
    { x: left, y: top },
    { x: left, y: bottom }
  );
  const intersectsRight = lineIntersectsLine(
    p1,
    p2,
    { x: right, y: top },
    { x: right, y: bottom }
  );
  const intersectsTop = lineIntersectsLine(
    p1,
    p2,
    { x: left, y: top },
    { x: right, y: top }
  );
  const intersectsBottom = lineIntersectsLine(
    p1,
    p2,
    { x: left, y: bottom },
    { x: right, y: bottom }
  );

  return intersectsLeft || intersectsRight || intersectsTop || intersectsBottom;
}

export function lineIntersectsLine(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  ) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

function direction(p1: Point, p2: Point, p3: Point): number {
  return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

function onSegment(p1: Point, p2: Point, p3: Point): boolean {
  return (
    Math.min(p1.x, p2.x) <= p3.x &&
    p3.x <= Math.max(p1.x, p2.x) &&
    Math.min(p1.y, p2.y) <= p3.y &&
    p3.y <= Math.max(p1.y, p2.y)
  );
}

export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPoint(p1: Point, p2: Point, t: number): Point {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t)
  };
}

export function expandRect(rect: Rect, padding: number): Rect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  };
}

export function getNodeBounds(position: Point, size: Size): Rect {
  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height
  };
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function getDefaultConfig(): IEngineConfig {
  return {
    defaultNodeSize: { width: 140, height: 70 },
    defaultPortRadius: 8,
    defaultConnectionWidth: 2,
    defaultConnectionColor: '#333333',
    defaultNodeColor: '#4A90D9',
    defaultTextColor: '#FFFFFF',
    defaultFontSize: 14,
    gridSize: 10,
    snapToGrid: true,
    historyMaxSteps: 50,
    miniMap: {
      width: 200,
      height: 150,
      position: { x: 10, y: 10 }
    }
  };
}
