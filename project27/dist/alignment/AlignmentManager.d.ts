import { AlignType, DistributeType, INode } from '../types/index.js';
export type NodeBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare class AlignmentManager {
    align(nodes: INode[], alignType: AlignType): Map<string, {
        x: number;
        y: number;
    }>;
    distribute(nodes: INode[], distributeType: DistributeType): Map<string, {
        x: number;
        y: number;
    }>;
    private getNodesBounds;
    private findLeftmost;
    private findRightmost;
    private findTopmost;
    private findBottommost;
    private findHorizontalCenter;
    private findVerticalCenter;
    private sortNodes;
    private calculateTotalNodeWidth;
    private calculateTotalNodeHeight;
}
