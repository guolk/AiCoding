import { BaseConnection } from './BaseConnection.js';
import { StraightConnection } from './StraightConnection.js';
import { PolylineConnection } from './PolylineConnection.js';
import { CurveConnection } from './CurveConnection.js';
import { IConnection, ConnectionStyle, Point } from '../types/index.js';

export { BaseConnection, StraightConnection, PolylineConnection, CurveConnection };

export class ConnectionFactory {
  static createConnection(
    style: ConnectionStyle,
    config: Partial<IConnection> & { fromPoint: Point; toPoint: Point }
  ): BaseConnection {
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

  static fromJSON(data: IConnection, fromPoint: Point, toPoint: Point): BaseConnection {
    return this.createConnection(data.style, {
      ...data,
      fromPoint,
      toPoint
    });
  }
}
