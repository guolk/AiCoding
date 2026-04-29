import { BaseConnection } from './BaseConnection.js';
import { Point, IConnection } from '../types/index.js';
export declare class CurveConnection extends BaseConnection {
    constructor(config: Partial<IConnection> & {
        fromPoint?: Point;
        toPoint?: Point;
    });
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
    protected drawPath(ctx: CanvasRenderingContext2D): void;
    private calculateControlPoints;
    getArrowPoints(): Point[];
    private getPointOnCurve;
    containsPoint(point: Point, scale: number): boolean;
    protected calculatePoints(obstacles: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>): Point[];
    private calculateDetourPoints;
}
