import { BaseConnection } from './BaseConnection.js';
import { ConnectionStyle } from '../types/index.js';
import { distance, lineIntersectsRect, expandRect } from '../utils/index.js';
export class CurveConnection extends BaseConnection {
    constructor(config) {
        super({
            ...config,
            style: ConnectionStyle.CURVE
        });
    }
    draw(ctx, scale) {
        if (this.points.length < 2)
            return;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width / scale;
        ctx.lineCap = 'round';
        const controlPoints = this.calculateControlPoints();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        if (controlPoints.length === 2) {
            ctx.bezierCurveTo(controlPoints[0].x, controlPoints[0].y, controlPoints[1].x, controlPoints[1].y, this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        }
        else {
            for (let i = 1; i < this.points.length - 1; i++) {
                const prev = this.points[i - 1];
                const current = this.points[i];
                const next = this.points[i + 1];
                const c1 = {
                    x: (prev.x + current.x) / 2,
                    y: (prev.y + current.y) / 2
                };
                const c2 = {
                    x: (current.x + next.x) / 2,
                    y: (current.y + next.y) / 2
                };
                ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, current.x, current.y);
            }
        }
        ctx.stroke();
        this.drawArrow(ctx, scale);
    }
    drawPath(ctx) {
        if (this.points.length < 2)
            return;
        const controlPoints = this.calculateControlPoints();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        if (controlPoints.length === 2) {
            ctx.bezierCurveTo(controlPoints[0].x, controlPoints[0].y, controlPoints[1].x, controlPoints[1].y, this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        }
    }
    calculateControlPoints() {
        if (this.points.length < 2)
            return [];
        const start = this.points[0];
        const end = this.points[this.points.length - 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const controlDistance = length * 0.3;
        return [
            {
                x: start.x + dx * 0.3,
                y: start.y + dy * 0.1
            },
            {
                x: end.x - dx * 0.3,
                y: end.y - dy * 0.1
            }
        ];
    }
    getArrowPoints() {
        if (this.points.length < 2)
            return [this.fromPoint, this.toPoint];
        const start = this.points[0];
        const end = this.points[this.points.length - 1];
        const controlPoints = this.calculateControlPoints();
        if (controlPoints.length === 2) {
            const nearEnd = this.getPointOnCurve(0.9, start, controlPoints[0], controlPoints[1], end);
            return [nearEnd, end];
        }
        return [this.points[this.points.length - 2], end];
    }
    getPointOnCurve(t, p0, p1, p2, p3) {
        const u = 1 - t;
        return {
            x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
            y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
        };
    }
    containsPoint(point, scale) {
        const tolerance = 8 / scale;
        const start = this.points[0];
        const end = this.points[this.points.length - 1];
        const controlPoints = this.calculateControlPoints();
        if (controlPoints.length < 2)
            return false;
        for (let t = 0; t <= 1; t += 0.01) {
            const curvePoint = this.getPointOnCurve(t, start, controlPoints[0], controlPoints[1], end);
            if (distance(point, curvePoint) <= tolerance) {
                return true;
            }
        }
        return false;
    }
    calculatePoints(obstacles) {
        const start = this.fromPoint;
        const end = this.toPoint;
        let needsDetour = false;
        for (const obstacle of obstacles) {
            const expanded = expandRect(obstacle, 15);
            if (lineIntersectsRect(start, end, expanded)) {
                needsDetour = true;
                break;
            }
        }
        if (!needsDetour) {
            return [{ ...start }, { ...end }];
        }
        const detourPoints = this.calculateDetourPoints(start, end, obstacles);
        return detourPoints;
    }
    calculateDetourPoints(start, end, obstacles) {
        const points = [{ ...start }];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const isHorizontal = Math.abs(dx) > Math.abs(dy);
        let nearestObstacle = null;
        let minDist = Infinity;
        const expandedObstacles = obstacles.map((o) => expandRect(o, 20));
        for (const obstacle of expandedObstacles) {
            if (lineIntersectsRect(start, end, obstacle)) {
                const dist = distance(start, {
                    x: obstacle.x + obstacle.width / 2,
                    y: obstacle.y + obstacle.height / 2
                });
                if (dist < minDist) {
                    minDist = dist;
                    nearestObstacle = obstacle;
                }
            }
        }
        if (nearestObstacle) {
            const centerX = nearestObstacle.x + nearestObstacle.width / 2;
            const centerY = nearestObstacle.y + nearestObstacle.height / 2;
            let detourPoint;
            if (isHorizontal) {
                const goAbove = start.y < centerY;
                detourPoint = {
                    x: centerX,
                    y: goAbove
                        ? nearestObstacle.y - 30
                        : nearestObstacle.y + nearestObstacle.height + 30
                };
            }
            else {
                const goLeft = start.x < centerX;
                detourPoint = {
                    x: goLeft
                        ? nearestObstacle.x - 30
                        : nearestObstacle.x + nearestObstacle.width + 30,
                    y: centerY
                };
            }
            points.push(detourPoint);
        }
        points.push({ ...end });
        return points;
    }
}
