import { BaseNode } from './BaseNode.js';
import { RectangleNode } from './RectangleNode.js';
import { DiamondNode } from './DiamondNode.js';
import { CircleNode } from './CircleNode.js';
import { ParallelogramNode } from './ParallelogramNode.js';
import { SwimlaneNode } from './SwimlaneNode.js';
import { INode, NodeType } from '../types/index.js';
export { BaseNode, RectangleNode, DiamondNode, CircleNode, ParallelogramNode, SwimlaneNode };
export declare class NodeFactory {
    static createNode(type: NodeType, config: Partial<INode>): BaseNode;
    static fromJSON(data: INode): BaseNode;
}
