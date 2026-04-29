import { NodeType } from '../types/index.js';
import { pointInRect } from '../utils/index.js';
import { BaseNode } from './BaseNode.js';
export class SwimlaneNode extends BaseNode {
    constructor(config) {
        super({
            ...config,
            type: NodeType.SWIMLANE
        });
        this.titlePosition = config.titlePosition || 'top';
        this.children = config.children || [];
    }
    draw(ctx, scale) {
        const { x, y, width, height } = this.bounds;
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([4 / scale, 4 / scale]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        if (this.titlePosition === 'top') {
            const titleHeight = 30 / scale;
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y, width, titleHeight);
            ctx.fillStyle = this.textColor;
            ctx.font = `bold ${(this.fontSize + 2) / scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.title, x + width / 2, y + titleHeight / 2);
        }
        else {
            const titleWidth = 30 / scale;
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y, titleWidth, height);
            ctx.save();
            ctx.translate(x + titleWidth / 2, y + height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillStyle = this.textColor;
            ctx.font = `bold ${(this.fontSize + 2) / scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.title, 0, 0);
            ctx.restore();
        }
        this.drawPorts(ctx, scale);
    }
    containsPoint(point) {
        return pointInRect(point, this.bounds);
    }
    addChild(nodeId) {
        if (!this.children.includes(nodeId)) {
            this.children.push(nodeId);
        }
    }
    removeChild(nodeId) {
        this.children = this.children.filter((id) => id !== nodeId);
    }
    hasChild(nodeId) {
        return this.children.includes(nodeId);
    }
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            titlePosition: this.titlePosition,
            children: [...this.children]
        };
    }
}
