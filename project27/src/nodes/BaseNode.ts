import { INode, IPort, PortType, NodeType, Point, Size } from '../types/index.js';
import { generateId, getNodeBounds, pointInRect } from '../utils/index.js';

export abstract class BaseNode implements INode {
  id: string;
  type: NodeType;
  position: Point;
  size: Size;
  title: string;
  ports: IPort[];
  color: string;
  textColor: string;
  fontSize: number;
  data?: Record<string, unknown>;

  constructor(config: Partial<INode>) {
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

  abstract draw(ctx: CanvasRenderingContext2D, scale: number): void;

  abstract containsPoint(point: Point): boolean;

  get bounds(): { x: number; y: number; width: number; height: number } {
    return getNodeBounds(this.position, this.size);
  }

  get center(): Point {
    return {
      x: this.position.x + this.size.width / 2,
      y: this.position.y + this.size.height / 2
    };
  }

  addPort(type: PortType, position: Point, name?: string): IPort {
    const port: IPort = {
      id: generateId(),
      type,
      position,
      name,
      nodeId: this.id
    };
    this.ports.push(port);
    return port;
  }

  removePort(portId: string): void {
    this.ports = this.ports.filter((p) => p.id !== portId);
  }

  getPortById(portId: string): IPort | undefined {
    return this.ports.find((p) => p.id === portId);
  }

  getPortsByType(type: PortType): IPort[] {
    return this.ports.filter((p) => p.type === type);
  }

  moveTo(newPosition: Point): void {
    this.position = { ...newPosition };
  }

  resize(newSize: Size): void {
    this.size = { ...newSize };
  }

  toJSON(): INode {
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

  protected drawPorts(ctx: CanvasRenderingContext2D, scale: number): void {
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

  protected getAbsolutePortPosition(port: IPort): Point {
    return {
      x: this.position.x + port.position.x * this.size.width,
      y: this.position.y + port.position.y * this.size.height
    };
  }

  protected drawSelectionBorder(
    ctx: CanvasRenderingContext2D,
    scale: number
  ): void {
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2 / scale;
    ctx.setLineDash([4 / scale, 4 / scale]);
    ctx.strokeRect(
      this.position.x - 2 / scale,
      this.position.y - 2 / scale,
      this.size.width + 4 / scale,
      this.size.height + 4 / scale
    );
    ctx.setLineDash([]);
  }

  getPortAtPoint(point: Point, scale: number): IPort | undefined {
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
