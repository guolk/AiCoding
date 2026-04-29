import { BaseConnection } from './BaseConnection.js';
import { ConnectionStyle } from '../types/index.js';
import { distance, lineIntersectsRect, expandRect } from '../utils/index.js';
export class PolylineConnection extends BaseConnection {
    constructor(config) {
        super({
            ...config,
            style: ConnectionStyle.POLYLINE
        });
    }
    draw(ctx, scale) {
        if (this.points.length < 2)
            return;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width / scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        this.drawArrow(ctx, scale);
    }
    drawPath(ctx) {
        if (this.points.length < 2)
            return;
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
    }
    getArrowPoints() {
        if (this.points.length < 2)
            return [this.fromPoint, this.toPoint];
        return [
            this.points[this.points.length - 2],
            this.points[this.points.length - 1]
        ];
    }
    containsPoint(point, scale) {
        const tolerance = 8 / scale;
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length === 0) {
                if (distance(point, p1) <= tolerance)
                    return true;
                continue;
            }
            const t = Math.max(0, Math.min(1, ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / (length * length)));
            const closestPoint = {
                x: p1.x + t * dx,
                y: p1.y + t * dy
            };
            if (distance(point, closestPoint) <= tolerance) {
                return true;
            }
        }
        return false;
    }
    calculatePoints(obstacles) {
        const points = [];
        const start = this.fromPoint;
        const end = this.toPoint;
        points.push({ ...start });
        let needsDetour = false;
        for (const obstacle of obstacles) {
            const expanded = expandRect(obstacle, 15);
            if (lineIntersectsRect(start, end, expanded)) {
                needsDetour = true;
                break;
            }
        }
        if (!needsDetour) {
            const midX = (start.x + end.x) / 2;
            points.push({ x: midX, y: start.y });
            points.push({ x: midX, y: end.y });
            points.push({ ...end });
            return points;
        }
        const path = this.calculatePathWithObstacles(start, end, obstacles);
        points.push(...path.slice(1));
        return points;
    }
    calculatePathWithObstacles(start, end, obstacles) {
        const points = [{ ...start }];
        let currentPoint = { ...start };
        const expandedObstacles = obstacles.map((o) => expandRect(o, 20));
        while (true) {
            const directPathClear = expandedObstacles.every((o) => !lineIntersectsRect(currentPoint, end, o));
            if (directPathClear) {
                const midX = (currentPoint.x + end.x) / 2;
                points.push({ x: midX, y: currentPoint.y });
                points.push({ x: midX, y: end.y });
                points.push({ ...end });
                break;
            }
            const nextPoint = this.findNextPoint(currentPoint, end, expandedObstacles);
            if (!nextPoint)
                break;
            const midX = (currentPoint.x + nextPoint.x) / 2;
            points.push({ x: midX, y: currentPoint.y });
            points.push({ x: midX, y: nextPoint.y });
            points.push({ ...nextPoint });
            currentPoint = nextPoint;
        }
        return points;
    }
    findNextPoint(from, to, obstacles) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        let nearestObstacle = null;
        let minDist = Infinity;
        for (const obstacle of obstacles) {
            if (lineIntersectsRect(from, to, obstacle)) {
                const dist = distance(from, {
                    x: obstacle.x + obstacle.width / 2,
                    y: obstacle.y + obstacle.height / 2
                });
                if (dist < minDist) {
                    minDist = dist;
                    nearestObstacle = obstacle;
                }
            }
        }
        if (!nearestObstacle)
            return null;
        if (isHorizontal) {
            const goAbove = from.y < nearestObstacle.y + nearestObstacle.height / 2;
            return {
                x: nearestObstacle.x + nearestObstacle.width / 2,
                y: goAbove ? nearestObstacle.y - 10 : nearestObstacle.y + nearestObstacle.height + 10
            };
        }
        else {
            const goLeft = from.x < nearestObstacle.x + nearestObstacle.width / 2;
            return {
                x: goLeft ? nearestObstacle.x - 10 : nearestObstacle.x + nearestObstacle.width + 10,
                y: nearestObstacle.y + nearestObstacle.height / 2
            };
        }
    }
}
