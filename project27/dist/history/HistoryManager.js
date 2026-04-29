import { deepClone } from '../utils/index.js';
export class HistoryManager {
    constructor(maxSteps = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxSteps = 50;
        this.maxSteps = maxSteps;
    }
    canUndo() {
        return this.currentIndex > 0;
    }
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    saveState(nodes, connections) {
        const state = {
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
    undo() {
        if (!this.canUndo())
            return null;
        this.currentIndex--;
        const state = this.history[this.currentIndex];
        return {
            nodes: deepClone(state.nodes),
            connections: deepClone(state.connections)
        };
    }
    redo() {
        if (!this.canRedo())
            return null;
        this.currentIndex++;
        const state = this.history[this.currentIndex];
        return {
            nodes: deepClone(state.nodes),
            connections: deepClone(state.connections)
        };
    }
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
    getHistoryCount() {
        return this.history.length;
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    getMaxSteps() {
        return this.maxSteps;
    }
    setMaxSteps(maxSteps) {
        this.maxSteps = maxSteps;
        while (this.history.length > this.maxSteps) {
            this.history.shift();
            this.currentIndex = Math.max(-1, this.currentIndex - 1);
        }
    }
}
