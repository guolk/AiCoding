import { NodeType, Point, INode } from '../types/index.js';
import { pointInRect } from '../utils/index.js';
import { BaseNode } from './BaseNode.js';

export class RectangleNode extends BaseNode {
  constructor(config: Partial<INode>) {
    super({
      ...config,
      type: NodeType.RECTANGLE
    });
  }

  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    const { x, y, width, height } = this.bounds;

    ctx.fillStyle = this.color;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = this.darkenColor(this.color, 20);
    ctx.lineWidth = 1.5 / scale;
    ctx.strokeRect(x, y, width, height);

    this.drawText(ctx, scale);
    this.drawPorts(ctx, scale);
  }

  containsPoint(point: Point): boolean {
    return pointInRect(point, this.bounds);
  }

  private drawText(ctx: CanvasRenderingContext2D, scale: number): void {
    ctx.fillStyle = this.textColor;
    ctx.font = `bold ${this.fontSize / scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const words = this.title.split(' ');
    const maxWidth = this.size.width * 0.85;
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);

    const lineHeight = (this.fontSize + 4) / scale;
    const totalHeight = lines.length * lineHeight;
    const startY = this.center.y - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, this.center.x, startY + index * lineHeight);
    });
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
