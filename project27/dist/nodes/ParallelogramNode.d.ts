import { Point, INode } from '../types/index.js';
import { BaseNode } from './BaseNode.js';
export declare class ParallelogramNode extends BaseNode {
    private skew;
    constructor(config: Partial<INode> & {
        skew?: number;
    });
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
    containsPoint(point: Point): boolean;
    private pointInTriangle;
    private drawText;
    private darkenColor;
    toJSON(): INode & {
        skew?: number;
    };
}
