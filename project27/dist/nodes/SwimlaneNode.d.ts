import { Point, ISwimlane } from '../types/index.js';
import { BaseNode } from './BaseNode.js';
export declare class SwimlaneNode extends BaseNode implements ISwimlane {
    titlePosition: 'top' | 'left';
    children: string[];
    constructor(config: Partial<ISwimlane>);
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
    containsPoint(point: Point): boolean;
    addChild(nodeId: string): void;
    removeChild(nodeId: string): void;
    hasChild(nodeId: string): boolean;
    toJSON(): ISwimlane;
}
