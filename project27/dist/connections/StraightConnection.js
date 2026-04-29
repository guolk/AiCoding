import { BaseConnection } from './BaseConnection.js';
import { ConnectionStyle } from '../types/index.js';
import { distance, lineIntersectsRect, expandRect } from '../utils/index.js';
export class StraightConnection extends BaseConnection {
    constructor(config) {
        super({
            ...config,
            style: ConnectionStyle.STRAIGHT
        });
    }
    draw(ctx, scale) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width / scale;
        ctx.lineCap = 'round';
        ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
        ctx.lineTo(this.toPoint.x, this.toPoint.y);
        ctx.stroke();
        this.drawArrow(ctx, scale);
    }
    drawPath(ctx) {
        ctx.moveTo(this.fromPoint.x, this.fromPoint.y);
        ctx.lineTo(this.toPoint.x, this.toPoint.y);
    }
    getArrowPoints() {
        return [this.fromPoint, this.toPoint];
    }
    containsPoint(point, scale) {
        const tolerance = 8 / scale;
        const dx = this.toPoint.x - this.fromPoint.x;
        const dy = this.toPoint.y - this.fromPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0)
            return distance(point, this.fromPoint) <= tolerance;
        const t = Math.max(0, Math.min(1, ((point.x - this.fromPoint.x) * dx + (point.y - this.fromPoint.y) * dy) / (length * length)));
        const closestPoint = {
            x: this.fromPoint.x + t * dx,
            y: this.fromPoint.y + t * dy
        };
        return distance(point, closestPoint) <= tolerance;
    }
    calculatePoints(obstacles) {
        let needsToAvoid = false;
        for (const obstacle of obstacles) {
            const expanded = expandRect(obstacle, 10);
            if (lineIntersectsRect(this.fromPoint, this.toPoint, expanded)) {
                needsToAvoid = true;
                break;
            }
        }
        if (!needsToAvoid) {
            return [this.fromPoint, this.toPoint];
        }
        const points = this.calculateAvoidingPath(obstacles);
        return points;
    }
    calculateAvoidingPath(obstacles) {
        const points = [this.fromPoint];
        let currentPoint = this.fromPoint;
        let remainingObstacles = [...obstacles];
        while (remainingObstacles.length > 0) {
            let nextPoint = this.toPoint;
            let nearestObstacle = null;
            let minDist = Infinity;
            for (const obstacle of remainingObstacles) {
                const expanded = expandRect(obstacle, 15);
                if (lineIntersectsRect(currentPoint, this.toPoint, expanded)) {
                    const obstacleCenter = {
                        x: expanded.x + expanded.width / 2,
                        y: expanded.y + expanded.height / 2
                    };
                    const dist = distance(currentPoint, obstacleCenter);
                    if (dist < minDist) {
                        minDist = dist;
                        nearestObstacle = expanded;
                    }
                }
            }
            if (nearestObstacle) {
                const detourPoint = this.calculateDetourPoint(currentPoint, this.toPoint, nearestObstacle);
                points.push(detourPoint);
                currentPoint = detourPoint;
                remainingObstacles = remainingObstacles.filter((o) => o !== nearestObstacle);
            }
            else {
                break;
            }
        }
        points.push(this.toPoint);
        return points;
    }
    calculateDetourPoint(from, to, obstacle) {
        const dir = {
            x: to.x - from.x,
            y: to.y - from.y
        };
        const isHorizontal = Math.abs(dir.x) > Math.abs(dir.y);
        let detourX, detourY;
        if (isHorizontal) {
            const obstacleCenterY = obstacle.y + obstacle.height / 2;
            const fromY = from.y;
            detourY = fromY < obstacleCenterY
                ? obstacle.y - 20
                : obstacle.y + obstacle.height + 20;
            const obstacleCenterX = obstacle.x + obstacle.width / 2;
            detourX = obstacleCenterX;
        }
        else {
            const obstacleCenterX = obstacle.x + obstacle.width / 2;
            const fromX = from.x;
            detourX = fromX < obstacleCenterX
                ? obstacle.x - 20
                : obstacle.x + obstacle.width + 20;
            const obstacleCenterY = obstacle.y + obstacle.height / 2;
            detourY = obstacleCenterY;
        }
        return { x: detourX, y: detourY };
    }
}
