import { INode, IPort, PortType, NodeType, Point, Size } from '../types/index.js';
export declare abstract class BaseNode implements INode {
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
    constructor(config: Partial<INode>);
    abstract draw(ctx: CanvasRenderingContext2D, scale: number): void;
    abstract containsPoint(point: Point): boolean;
    get bounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    get center(): Point;
    addPort(type: PortType, position: Point, name?: string): IPort;
    removePort(portId: string): void;
    getPortById(portId: string): IPort | undefined;
    getPortsByType(type: PortType): IPort[];
    moveTo(newPosition: Point): void;
    resize(newSize: Size): void;
    toJSON(): INode;
    protected drawPorts(ctx: CanvasRenderingContext2D, scale: number): void;
    protected getAbsolutePortPosition(port: IPort): Point;
    protected drawSelectionBorder(ctx: CanvasRenderingContext2D, scale: number): void;
    getPortAtPoint(point: Point, scale: number): IPort | undefined;
}
