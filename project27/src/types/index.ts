export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum NodeType {
  RECTANGLE = 'rectangle',
  DIAMOND = 'diamond',
  CIRCLE = 'circle',
  PARALLELOGRAM = 'parallelogram',
  SWIMLANE = 'swimlane'
}

export enum PortType {
  INPUT = 'input',
  OUTPUT = 'output'
}

export enum ConnectionStyle {
  STRAIGHT = 'straight',
  POLYLINE = 'polyline',
  CURVE = 'curve'
}

export enum AlignType {
  LEFT = 'left',
  CENTER_HORIZONTAL = 'centerH',
  RIGHT = 'right',
  TOP = 'top',
  CENTER_VERTICAL = 'centerV',
  BOTTOM = 'bottom'
}

export enum DistributeType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

export interface IPort {
  id: string;
  type: PortType;
  position: Point;
  name?: string;
  nodeId: string;
}

export interface IConnection {
  id: string;
  fromPortId: string;
  toPortId: string;
  style: ConnectionStyle;
  points: Point[];
  color: string;
  width: number;
}

export interface INode {
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
}

export interface ISwimlane extends INode {
  titlePosition: 'top' | 'left';
  children: string[];
}

export interface IFlowchartData {
  nodes: INode[];
  connections: IConnection[];
  version: string;
  createdAt: string;
}

export interface IHistoryState {
  nodes: INode[];
  connections: IConnection[];
  timestamp: number;
}

export interface IViewState {
  offset: Point;
  scale: number;
}

export interface IMiniMapConfig {
  width: number;
  height: number;
  position: Point;
}

export interface IEngineConfig {
  defaultNodeSize: Size;
  defaultPortRadius: number;
  defaultConnectionWidth: number;
  defaultConnectionColor: string;
  defaultNodeColor: string;
  defaultTextColor: string;
  defaultFontSize: number;
  gridSize: number;
  snapToGrid: boolean;
  historyMaxSteps: number;
  miniMap: IMiniMapConfig;
}
