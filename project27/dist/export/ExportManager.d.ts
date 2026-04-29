import { INode, IConnection } from '../types/index.js';
export declare class ExportManager {
    exportToJSON(nodes: INode[], connections: IConnection[]): string;
    exportToSVG(nodes: INode[], connections: IConnection[], options?: {
        width?: number;
        height?: number;
        padding?: number;
        backgroundColor?: string;
    }): string;
    private calculateBounds;
    private generateSVGHeader;
    private generateNodesSVG;
    private generateRectangleNodeSVG;
    private generateDiamondNodeSVG;
    private generateCircleNodeSVG;
    private generateParallelogramNodeSVG;
    private generateSwimlaneNodeSVG;
    private generateConnectionsSVG;
    private generateStraightConnectionSVG;
    private generatePolylineConnectionSVG;
    private generateCurveConnectionSVG;
    private generateArrowPath;
    private generateSVGFooter;
    private escapeXml;
    private darkenColor;
}
