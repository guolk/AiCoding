import { Point, Rect, INode, IConnection, IMiniMapConfig, IViewState } from '../types/index.js';
export declare class MiniMap {
    private config;
    private viewport;
    private scale;
    private contentBounds;
    constructor(config: IMiniMapConfig, viewport: {
        width: number;
        height: number;
    });
    updateConfig(config: Partial<IMiniMapConfig>): void;
    updateViewport(viewport: {
        width: number;
        height: number;
    }): void;
    draw(ctx: CanvasRenderingContext2D, nodes: INode[], connections: IConnection[], viewState: IViewState): void;
    private calculateContentBounds;
    private worldToMap;
    private mapToWorld;
    private drawNodes;
    private getNodeColor;
    private drawConnections;
    private drawViewportIndicator;
    isPointOnMap(point: Point): boolean;
    getWorldPositionFromMapPoint(mapPoint: Point, viewState: IViewState): Point;
    getMapRect(): Rect;
}
