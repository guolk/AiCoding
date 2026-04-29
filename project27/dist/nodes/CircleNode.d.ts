import { Point, INode } from '../types/index.js';
import { BaseNode } from './BaseNode.js';
export declare class CircleNode extends BaseNode {
    constructor(config: Partial<INode>);
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
    containsPoint(point: Point): boolean;
    private drawText;
    private darkenColor;
}
