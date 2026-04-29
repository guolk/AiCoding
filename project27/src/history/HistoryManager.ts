import { IHistoryState, INode, IConnection } from '../types/index.js';
import { deepClone } from '../utils/index.js';

export class HistoryManager {
  private history: IHistoryState[] = [];
  private currentIndex: number = -1;
  private maxSteps: number = 50;

  constructor(maxSteps: number = 50) {
    this.maxSteps = maxSteps;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  saveState(nodes: INode[], connections: IConnection[]): void {
    const state: IHistoryState = {
      nodes: deepClone(nodes),
      connections: deepClone(connections),
      timestamp: Date.now()
    };

    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(state);
    this.currentIndex = this.history.length - 1;

    if (this.history.length > this.maxSteps) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo(): { nodes: INode[]; connections: IConnection[] } | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    const state = this.history[this.currentIndex];

    return {
      nodes: deepClone(state.nodes),
      connections: deepClone(state.connections)
    };
  }

  redo(): { nodes: INode[]; connections: IConnection[] } | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const state = this.history[this.currentIndex];

    return {
      nodes: deepClone(state.nodes),
      connections: deepClone(state.connections)
    };
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  getHistoryCount(): number {
    return this.history.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getMaxSteps(): number {
    return this.maxSteps;
  }

  setMaxSteps(maxSteps: number): void {
    this.maxSteps = maxSteps;

    while (this.history.length > this.maxSteps) {
      this.history.shift();
      this.currentIndex = Math.max(-1, this.currentIndex - 1);
    }
  }
}
