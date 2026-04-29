import { IConnection, ConnectionStyle, Point, IEngineConfig } from '../types/index.js';
import { generateId } from '../utils/index.js';

export abstract class BaseConnection implements IConnection {
  id: string;
  fromPortId: string;
  toPortId: string;
  style: ConnectionStyle;
  points: Point[];
  color: string;
  width: number;
  fromPoint: Point;
  toPoint: Point;

  constructor(config: Partial<IConnection> & { fromPoint?: Point; toPoint?: Point }) {
    this.id = config.id || generateId();
    this.fromPortId = config.fromPortId || '';
    this.toPortId = config.toPortId || '';
    this.style = config.style || ConnectionStyle.POLYLINE;
    this.points = config.points || [];
    this.color = config.color || '#333333';
    this.width = config.width || 2;
    this.fromPoint = config.fromPoint || { x: 0, y: 0 };
    this.toPoint = config.toPoint || { x: 0, y: 0 };
  }

  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width / scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    this.drawPath(ctx);
    ctx.stroke();
    this.drawArrow(ctx, scale);
  }

  protected abstract drawPath(ctx: CanvasRenderingContext2D): void;

  protected drawArrow(ctx: CanvasRenderingContext2D, scale: number): void {
    const points = this.getArrowPoints();
    if (points.length < 2) return;

    const lastPoint = points[points.length - 1];
    const prevPoint = points[points.length - 2];

    const angle = Math.atan2(lastPoint.y - prevPoint.y, lastPoint.x - prevPoint.x);
    const arrowLength = 12 / scale;
    const arrowAngle = Math.PI / 6;

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(
      lastPoint.x - arrowLength * Math.cos(angle - arrowAngle),
      lastPoint.y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      lastPoint.x - arrowLength * Math.cos(angle + arrowAngle),
      lastPoint.y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();

    ctx.fillStyle = this.color;
    ctx.fill();
  }

  abstract getArrowPoints(): Point[];

  abstract containsPoint(point: Point, scale: number): boolean;

  updatePoints(fromPoint: Point, toPoint: Point, obstacles?: Array<{ x: number; y: number; width: number; height: number }>): void {
    this.fromPoint = fromPoint;
    this.toPoint = toPoint;
    this.points = this.calculatePoints(obstacles || []);
  }

  protected abstract calculatePoints(obstacles: Array<{ x: number; y: number; width: number; height: number }>): Point[];

  toJSON(): IConnection {
    return {
      id: this.id,
      fromPortId: this.fromPortId,
      toPortId: this.toPortId,
      style: this.style,
      points: this.points.map((p) => ({ ...p })),
      color: this.color,
      width: this.width
    };
  }
}
