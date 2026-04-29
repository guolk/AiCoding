import { INode, IConnection } from '../types/index.js';
export interface ImportResult {
    success: boolean;
    nodes: INode[];
    connections: IConnection[];
    errors: string[];
}
export declare class ImportManager {
    importFromJSON(jsonString: string): ImportResult;
    private validateNodes;
    private validateConnections;
}
