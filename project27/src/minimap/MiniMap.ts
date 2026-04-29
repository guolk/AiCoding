import { Point, Rect, INode, IConnection, IMiniMapConfig, IViewState, NodeType } from '../types/index.js';

export class MiniMap {
  private config: IMiniMapConfig;
  private viewport: { width: number; height: number };
  private scale: number = 1;
  private contentBounds: Rect = { x: 0, y: 0, width: 0, height: 0 };

  constructor(config: IMiniMapConfig, viewport: { width: number; height: number }) {
    this.config = config;
    this.viewport = viewport;
  }

  updateConfig(config: Partial<IMiniMapConfig>): void {
    this.config = { ...this.config, ...config };
  }

  updateViewport(viewport: { width: number; height: number }): void {
    this.viewport = viewport;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    nodes: INode[],
    connections: IConnection[],
    viewState: IViewState
  ): void {
    this.calculateContentBounds(nodes);

    const { width: mapWidth, height: mapHeight } = this.config;
    const { x: mapX, y: mapY } = this.config.position;

    ctx.save();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(mapX, mapY, mapWidth, mapHeight);

    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapWidth, mapHeight);

    ctx.beginPath();
    ctx.rect(mapX, mapY, mapWidth, mapHeight);
    ctx.clip();

    this.drawConnections(ctx, connections);
    this.drawNodes(ctx, nodes);
    this.drawViewportIndicator(ctx, viewState);

    ctx.restore();
  }

  private calculateContentBounds(nodes: INode[]): void {
    if (nodes.length === 0) {
      this.contentBounds = { x: 0, y: 0, width: 0, height: 0 };
      this.scale = 1;
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.size.width);
      maxY = Math.max(maxY, node.position.y + node.size.height);
    }

    const padding = 50;
    this.contentBounds = {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    };

    const scaleX = this.config.width / this.contentBounds.width;
    const scaleY = this.config.height / this.contentBounds.height;
    this.scale = Math.min(scaleX, scaleY, 1);
  }

  private worldToMap(worldPoint: Point): Point {
    return {
      x:
        this.config.position.x +
        (worldPoint.x - this.contentBounds.x) * this.scale,
      y:
        this.config.position.y +
        (worldPoint.y - this.contentBounds.y) * this.scale
    };
  }

  private mapToWorld(mapPoint: Point): Point {
    return {
      x:
        (mapPoint.x - this.config.position.x) / this.scale +
        this.contentBounds.x,
      y:
        (mapPoint.y - this.config.position.y) / this.scale +
        this.contentBounds.y
    };
  }

  private drawNodes(ctx: CanvasRenderingContext2D, nodes: INode[]): void {
    for (const node of nodes) {
      const topLeft = this.worldToMap(node.position);
      const width = node.size.width * this.scale;
      const height = node.size.height * this.scale;

      ctx.fillStyle = this.getNodeColor(node);
      ctx.fillRect(topLeft.x, topLeft.y, width, height);

      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(topLeft.x, topLeft.y, width, height);
    }
  }

  private getNodeColor(node: INode): string {
    switch (node.type) {
      case NodeType.SWIMLANE:
        return 'rgba(240, 240, 240, 0.8)';
      case NodeType.DIAMOND:
        return 'rgba(255, 193, 7, 0.8)';
      case NodeType.CIRCLE:
        return 'rgba(156, 39, 176, 0.8)';
      case NodeType.PARALLELOGRAM:
        return 'rgba(76, 175, 80, 0.8)';
      default:
        return 'rgba(33, 150, 243, 0.8)';
    }
  }

  private drawConnections(
    ctx: CanvasRenderingContext2D,
    connections: IConnection[]
  ): void {
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
    ctx.lineWidth = 1;

    for (const conn of connections) {
      if (conn.points.length < 2) continue;

      const start = this.worldToMap(conn.points[0]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < conn.points.length; i++) {
        const point = this.worldToMap(conn.points[i]);
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }
  }

  private drawViewportIndicator(
    ctx: CanvasRenderingContext2D,
    viewState: IViewState
  ): void {
    const viewportWorldRect: Rect = {
      x: -viewState.offset.x / viewState.scale,
      y: -viewState.offset.y / viewState.scale,
      width: this.viewport.width / viewState.scale,
      height: this.viewport.height / viewState.scale
    };

    const topLeft = this.worldToMap({
      x: viewportWorldRect.x,
      y: viewportWorldRect.y
    });
    const bottomRight = this.worldToMap({
      x: viewportWorldRect.x + viewportWorldRect.width,
      y: viewportWorldRect.y + viewportWorldRect.height
    });

    ctx.strokeStyle = 'rgba(255, 87, 34, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 87, 34, 0.1)';
    ctx.fillRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
  }

  isPointOnMap(point: Point): boolean {
    const { x, y } = this.config.position;
    const { width, height } = this.config;

    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }

  getWorldPositionFromMapPoint(mapPoint: Point, viewState: IViewState): Point {
    const worldPoint = this.mapToWorld(mapPoint);

    return {
      x: -worldPoint.x * viewState.scale + this.viewport.width / 2,
      y: -worldPoint.y * viewState.scale + this.viewport.height / 2
    };
  }

  getMapRect(): Rect {
    return {
      x: this.config.position.x,
      y: this.config.position.y,
      width: this.config.width,
      height: this.config.height
    };
  }
}
