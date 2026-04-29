import { BaseConnection } from './BaseConnection.js';
import { StraightConnection } from './StraightConnection.js';
import { PolylineConnection } from './PolylineConnection.js';
import { CurveConnection } from './CurveConnection.js';
import { IConnection, ConnectionStyle, Point } from '../types/index.js';
export { BaseConnection, StraightConnection, PolylineConnection, CurveConnection };
export declare class ConnectionFactory {
    static createConnection(style: ConnectionStyle, config: Partial<IConnection> & {
        fromPoint: Point;
        toPoint: Point;
    }): BaseConnection;
    static fromJSON(data: IConnection, fromPoint: Point, toPoint: Point): BaseConnection;
}
