import { BaseNode } from './BaseNode.js';
import { RectangleNode } from './RectangleNode.js';
import { DiamondNode } from './DiamondNode.js';
import { CircleNode } from './CircleNode.js';
import { ParallelogramNode } from './ParallelogramNode.js';
import { SwimlaneNode } from './SwimlaneNode.js';
import { NodeType } from '../types/index.js';
export { BaseNode, RectangleNode, DiamondNode, CircleNode, ParallelogramNode, SwimlaneNode };
export class NodeFactory {
    static createNode(type, config) {
        switch (type) {
            case NodeType.RECTANGLE:
                return new RectangleNode(config);
            case NodeType.DIAMOND:
                return new DiamondNode(config);
            case NodeType.CIRCLE:
                return new CircleNode(config);
            case NodeType.PARALLELOGRAM:
                return new ParallelogramNode(config);
            case NodeType.SWIMLANE:
                return new SwimlaneNode(config);
            default:
                return new RectangleNode(config);
        }
    }
    static fromJSON(data) {
        return this.createNode(data.type, data);
    }
}
