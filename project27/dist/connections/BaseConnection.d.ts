import { IConnection, ConnectionStyle, Point } from '../types/index.js';
export declare abstract class BaseConnection implements IConnection {
    id: string;
    fromPortId: string;
    toPortId: string;
    style: ConnectionStyle;
    points: Point[];
    color: string;
    width: number;
    fromPoint: Point;
    toPoint: Point;
    constructor(config: Partial<IConnection> & {
        fromPoint?: Point;
        toPoint?: Point;
    });
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
    protected abstract drawPath(ctx: CanvasRenderingContext2D): void;
    protected drawArrow(ctx: CanvasRenderingContext2D, scale: number): void;
    abstract getArrowPoints(): Point[];
    abstract containsPoint(point: Point, scale: number): boolean;
    updatePoints(fromPoint: Point, toPoint: Point, obstacles?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>): void;
    protected abstract calculatePoints(obstacles: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>): Point[];
    toJSON(): IConnection;
}
