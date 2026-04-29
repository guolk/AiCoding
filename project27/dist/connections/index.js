import { BaseConnection } from './BaseConnection.js';
import { StraightConnection } from './StraightConnection.js';
import { PolylineConnection } from './PolylineConnection.js';
import { CurveConnection } from './CurveConnection.js';
import { ConnectionStyle } from '../types/index.js';
export { BaseConnection, StraightConnection, PolylineConnection, CurveConnection };
export class ConnectionFactory {
    static createConnection(style, config) {
        switch (style) {
            case ConnectionStyle.STRAIGHT:
                return new StraightConnection(config);
            case ConnectionStyle.CURVE:
                return new CurveConnection(config);
            case ConnectionStyle.POLYLINE:
            default:
                return new PolylineConnection(config);
        }
    }
    static fromJSON(data, fromPoint, toPoint) {
        return this.createConnection(data.style, {
            ...data,
            fromPoint,
            toPoint
        });
    }
}
