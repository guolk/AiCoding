import { PortType, NodeType } from '../types/index.js';
import { generateId, getNodeBounds } from '../utils/index.js';
export class BaseNode {
    constructor(config) {
        this.id = config.id || generateId();
        this.type = config.type || NodeType.RECTANGLE;
        this.position = config.position || { x: 0, y: 0 };
        this.size = config.size || { width: 140, height: 70 };
        this.title = config.title || 'Node';
        this.ports = config.ports || [];
        this.color = config.color || '#4A90D9';
        this.textColor = config.textColor || '#FFFFFF';
        this.fontSize = config.fontSize || 14;
        this.data = config.data;
    }
    get bounds() {
        return getNodeBounds(this.position, this.size);
    }
    get center() {
        return {
            x: this.position.x + this.size.width / 2,
            y: this.position.y + this.size.height / 2
        };
    }
    addPort(type, position, name) {
        const port = {
            id: generateId(),
            type,
            position,
            name,
            nodeId: this.id
        };
        this.ports.push(port);
        return port;
    }
    removePort(portId) {
        this.ports = this.ports.filter((p) => p.id !== portId);
    }
    getPortById(portId) {
        return this.ports.find((p) => p.id === portId);
    }
    getPortsByType(type) {
        return this.ports.filter((p) => p.type === type);
    }
    moveTo(newPosition) {
        this.position = { ...newPosition };
    }
    resize(newSize) {
        this.size = { ...newSize };
    }
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            position: { ...this.position },
            size: { ...this.size },
            title: this.title,
            ports: this.ports.map((p) => ({ ...p })),
            color: this.color,
            textColor: this.textColor,
            fontSize: this.fontSize,
            data: this.data ? { ...this.data } : undefined
        };
    }
    drawPorts(ctx, scale) {
        const portRadius = 6 / scale;
        this.ports.forEach((port) => {
            const absPos = this.getAbsolutePortPosition(port);
            ctx.beginPath();
            ctx.arc(absPos.x, absPos.y, portRadius, 0, Math.PI * 2);
            ctx.fillStyle = port.type === PortType.INPUT ? '#FF6B6B' : '#4ECDC4';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.5 / scale;
            ctx.stroke();
        });
    }
    getAbsolutePortPosition(port) {
        return {
            x: this.position.x + port.position.x * this.size.width,
            y: this.position.y + port.position.y * this.size.height
        };
    }
    drawSelectionBorder(ctx, scale) {
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([4 / scale, 4 / scale]);
        ctx.strokeRect(this.position.x - 2 / scale, this.position.y - 2 / scale, this.size.width + 4 / scale, this.size.height + 4 / scale);
        ctx.setLineDash([]);
    }
    getPortAtPoint(point, scale) {
        const portRadius = 10 / scale;
        for (const port of this.ports) {
            const absPos = this.getAbsolutePortPosition(port);
            const dx = point.x - absPos.x;
            const dy = point.y - absPos.y;
            if (Math.sqrt(dx * dx + dy * dy) <= portRadius) {
                return port;
            }
        }
        return undefined;
    }
}
