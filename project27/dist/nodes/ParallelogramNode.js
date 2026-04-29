import { NodeType } from '../types/index.js';
import { BaseNode } from './BaseNode.js';
export class ParallelogramNode extends BaseNode {
    constructor(config) {
        super({
            ...config,
            type: NodeType.PARALLELOGRAM
        });
        this.skew = 0.2;
        if (config.skew !== undefined) {
            this.skew = config.skew;
        }
    }
    draw(ctx, scale) {
        const { x, y, width, height } = this.bounds;
        const skewAmount = width * this.skew;
        ctx.beginPath();
        ctx.moveTo(x + skewAmount, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width - skewAmount, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = this.darkenColor(this.color, 20);
        ctx.lineWidth = 1.5 / scale;
        ctx.stroke();
        this.drawText(ctx, scale);
        this.drawPorts(ctx, scale);
    }
    containsPoint(point) {
        const { x, y, width, height } = this.bounds;
        const skewAmount = width * this.skew;
        const triangle1 = [
            { x, y: y + height },
            { x: x + skewAmount, y },
            { x: x + width - skewAmount, y: y + height }
        ];
        const triangle2 = [
            { x: x + skewAmount, y },
            { x: x + width, y },
            { x: x + width - skewAmount, y: y + height }
        ];
        return (this.pointInTriangle(point, triangle1) ||
            this.pointInTriangle(point, triangle2));
    }
    pointInTriangle(point, triangle) {
        const [p0, p1, p2] = triangle;
        const s = p0.x * (p2.y - p0.y) - p0.y * (p2.x - p0.x) + point.x * (p0.y - p2.y) + point.y * (p2.x - p0.x);
        const t = p0.x * (p1.y - p0.y) - p0.y * (p1.x - p0.x) + point.x * (p0.y - p1.y) + point.y * (p1.x - p0.x);
        if ((s < 0) !== (t < 0))
            return false;
        const A = -p1.y * (p2.x - p0.x) +
            p0.y * (p2.x - p1.x) +
            p1.x * (p2.y - p0.y) -
            p0.x * (p2.y - p1.y);
        return A < 0 ? (s <= 0 && s + t >= A) : (s >= 0 && s + t <= A);
    }
    drawText(ctx, scale) {
        ctx.fillStyle = this.textColor;
        ctx.font = `bold ${this.fontSize / scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const skewAmount = this.size.width * this.skew;
        const maxWidth = (this.size.width - skewAmount * 2) * 0.85;
        const words = this.title.split(' ');
        const lines = [];
        let currentLine = words[0] || '';
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width <= maxWidth) {
                currentLine = testLine;
            }
            else {
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
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            skew: this.skew
        };
    }
}
