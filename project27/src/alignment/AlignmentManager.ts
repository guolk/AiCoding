import { AlignType, DistributeType, INode } from '../types/index.js';

export type NodeBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class AlignmentManager {
  align(
    nodes: INode[],
    alignType: AlignType
  ): Map<string, { x: number; y: number }> {
    if (nodes.length < 2) return new Map();

    const positions = new Map<string, { x: number; y: number }>();
    const bounds = this.getNodesBounds(nodes);

    let referenceBound: NodeBounds;
    switch (alignType) {
      case AlignType.LEFT:
        referenceBound = this.findLeftmost(bounds);
        break;
      case AlignType.RIGHT:
        referenceBound = this.findRightmost(bounds);
        break;
      case AlignType.TOP:
        referenceBound = this.findTopmost(bounds);
        break;
      case AlignType.BOTTOM:
        referenceBound = this.findBottommost(bounds);
        break;
      case AlignType.CENTER_HORIZONTAL:
        referenceBound = this.findHorizontalCenter(bounds);
        break;
      case AlignType.CENTER_VERTICAL:
        referenceBound = this.findVerticalCenter(bounds);
        break;
      default:
        return positions;
    }

    for (const node of nodes) {
      const bound = bounds.get(node.id);
      if (!bound) continue;

      let newX = node.position.x;
      let newY = node.position.y;

      switch (alignType) {
        case AlignType.LEFT:
          newX = referenceBound.x;
          break;
        case AlignType.RIGHT:
          newX = referenceBound.x + referenceBound.width - node.size.width;
          break;
        case AlignType.TOP:
          newY = referenceBound.y;
          break;
        case AlignType.BOTTOM:
          newY = referenceBound.y + referenceBound.height - node.size.height;
          break;
        case AlignType.CENTER_HORIZONTAL:
          const refCenterX = referenceBound.x + referenceBound.width / 2;
          newX = refCenterX - node.size.width / 2;
          break;
        case AlignType.CENTER_VERTICAL:
          const refCenterY = referenceBound.y + referenceBound.height / 2;
          newY = refCenterY - node.size.height / 2;
          break;
      }

      positions.set(node.id, { x: newX, y: newY });
    }

    return positions;
  }

  distribute(
    nodes: INode[],
    distributeType: DistributeType
  ): Map<string, { x: number; y: number }> {
    if (nodes.length < 3) return new Map();

    const positions = new Map<string, { x: number; y: number }>();
    const bounds = this.getNodesBounds(nodes);
    const sortedNodes = this.sortNodes(nodes, bounds, distributeType);

    if (sortedNodes.length < 3) return positions;

    const first = sortedNodes[0];
    const last = sortedNodes[sortedNodes.length - 1];
    const firstBound = bounds.get(first.id)!;
    const lastBound = bounds.get(last.id)!;

    if (distributeType === DistributeType.HORIZONTAL) {
      const totalWidth =
        lastBound.x +
        lastBound.width -
        firstBound.x -
        this.calculateTotalNodeWidth(sortedNodes, bounds);
      const gap = totalWidth / (sortedNodes.length - 1);

      let currentX = firstBound.x + firstBound.width;
      for (let i = 1; i < sortedNodes.length - 1; i++) {
        currentX += gap;
        const node = sortedNodes[i];
        positions.set(node.id, {
          x: currentX,
          y: node.position.y
        });
        currentX += bounds.get(node.id)!.width;
      }
    } else {
      const totalHeight =
        lastBound.y +
        lastBound.height -
        firstBound.y -
        this.calculateTotalNodeHeight(sortedNodes, bounds);
      const gap = totalHeight / (sortedNodes.length - 1);

      let currentY = firstBound.y + firstBound.height;
      for (let i = 1; i < sortedNodes.length - 1; i++) {
        currentY += gap;
        const node = sortedNodes[i];
        positions.set(node.id, {
          x: node.position.x,
          y: currentY
        });
        currentY += bounds.get(node.id)!.height;
      }
    }

    return positions;
  }

  private getNodesBounds(nodes: INode[]): Map<string, NodeBounds> {
    const bounds = new Map<string, NodeBounds>();
    for (const node of nodes) {
      bounds.set(node.id, {
        x: node.position.x,
        y: node.position.y,
        width: node.size.width,
        height: node.size.height
      });
    }
    return bounds;
  }

  private findLeftmost(bounds: Map<string, NodeBounds>): NodeBounds {
    let leftmost: NodeBounds | null = null;
    for (const bound of bounds.values()) {
      if (!leftmost || bound.x < leftmost.x) {
        leftmost = bound;
      }
    }
    return leftmost!;
  }

  private findRightmost(bounds: Map<string, NodeBounds>): NodeBounds {
    let rightmost: NodeBounds | null = null;
    for (const bound of bounds.values()) {
      const rightEdge = bound.x + bound.width;
      const rightmostEdge = rightmost ? rightmost.x + rightmost.width : -Infinity;
      if (!rightmost || rightEdge > rightmostEdge) {
        rightmost = bound;
      }
    }
    return rightmost!;
  }

  private findTopmost(bounds: Map<string, NodeBounds>): NodeBounds {
    let topmost: NodeBounds | null = null;
    for (const bound of bounds.values()) {
      if (!topmost || bound.y < topmost.y) {
        topmost = bound;
      }
    }
    return topmost!;
  }

  private findBottommost(bounds: Map<string, NodeBounds>): NodeBounds {
    let bottommost: NodeBounds | null = null;
    for (const bound of bounds.values()) {
      const bottomEdge = bound.y + bound.height;
      const bottommostEdge = bottommost
        ? bottommost.y + bottommost.height
        : Infinity;
      if (!bottommost || bottomEdge > bottommostEdge) {
        bottommost = bound;
      }
    }
    return bottommost!;
  }

  private findHorizontalCenter(bounds: Map<string, NodeBounds>): NodeBounds {
    let minX = Infinity;
    let maxX = -Infinity;
    for (const bound of bounds.values()) {
      minX = Math.min(minX, bound.x);
      maxX = Math.max(maxX, bound.x + bound.width);
    }
    const centerX = (minX + maxX) / 2;
    return {
      x: centerX - 0.5,
      y: 0,
      width: 1,
      height: 1
    };
  }

  private findVerticalCenter(bounds: Map<string, NodeBounds>): NodeBounds {
    let minY = Infinity;
    let maxY = -Infinity;
    for (const bound of bounds.values()) {
      minY = Math.min(minY, bound.y);
      maxY = Math.max(maxY, bound.y + bound.height);
    }
    const centerY = (minY + maxY) / 2;
    return {
      x: 0,
      y: centerY - 0.5,
      width: 1,
      height: 1
    };
  }

  private sortNodes(
    nodes: INode[],
    bounds: Map<string, NodeBounds>,
    distributeType: DistributeType
  ): INode[] {
    return [...nodes].sort((a, b) => {
      const aBound = bounds.get(a.id)!;
      const bBound = bounds.get(b.id)!;

      if (distributeType === DistributeType.HORIZONTAL) {
        return aBound.x - bBound.x;
      } else {
        return aBound.y - bBound.y;
      }
    });
  }

  private calculateTotalNodeWidth(
    nodes: INode[],
    bounds: Map<string, NodeBounds>
  ): number {
    let total = 0;
    for (const node of nodes) {
      const bound = bounds.get(node.id);
      if (bound) {
        total += bound.width;
      }
    }
    return total;
  }

  private calculateTotalNodeHeight(
    nodes: INode[],
    bounds: Map<string, NodeBounds>
  ): number {
    let total = 0;
    for (const node of nodes) {
      const bound = bounds.get(node.id);
      if (bound) {
        total += bound.height;
      }
    }
    return total;
  }
}
