import { INode, IConnection } from '../types/index.js';
export declare class HistoryManager {
    private history;
    private currentIndex;
    private maxSteps;
    constructor(maxSteps?: number);
    canUndo(): boolean;
    canRedo(): boolean;
    saveState(nodes: INode[], connections: IConnection[]): void;
    undo(): {
        nodes: INode[];
        connections: IConnection[];
    } | null;
    redo(): {
        nodes: INode[];
        connections: IConnection[];
    } | null;
    clear(): void;
    getHistoryCount(): number;
    getCurrentIndex(): number;
    getMaxSteps(): number;
    setMaxSteps(maxSteps: number): void;
}
