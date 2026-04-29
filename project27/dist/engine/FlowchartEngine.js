import { ConnectionStyle, PortType } from '../types/index.js';
import { getDefaultConfig, snapToGrid } from '../utils/index.js';
import { NodeFactory } from '../nodes/index.js';
import { ConnectionFactory } from '../connections/index.js';
import { HistoryManager } from '../history/index.js';
import { AlignmentManager } from '../alignment/index.js';
import { MiniMap } from '../minimap/index.js';
import { ExportManager, ImportManager } from '../export/index.js';
export class FlowchartEngine {
    constructor(canvas, config) {
        this.nodes = [];
        this.connections = [];
        this.viewState = {
            offset: { x: 0, y: 0 },
            scale: 1
        };
        this.mouseState = {
            isDown: false,
            isDragging: false,
            isPanning: false,
            isDrawingConnection: false,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            draggingNodes: [],
            nodeStartPositions: new Map(),
            connectionFromPort: null,
            connectionFromPoint: { x: 0, y: 0 }
        };
        this.selectionState = {
            selectedNodes: new Set(),
            selectedConnections: new Set(),
            hoveredNode: null,
            hoveredPort: null,
            hoveredConnection: null
        };
        this.animationFrameId = null;
        this.isDirty = false;
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get canvas context');
        }
        this.ctx = context;
        this.config = { ...getDefaultConfig(), ...config };
        this.historyManager = new HistoryManager(this.config.historyMaxSteps);
        this.alignmentManager = new AlignmentManager();
        this.miniMap = new MiniMap(this.config.miniMap, {
            width: canvas.width,
            height: canvas.height
        });
        this.exportManager = new ExportManager();
        this.importManager = new ImportManager();
        this.setupEventListeners();
        this.startRenderLoop();
        this.saveState();
    }
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    handleMouseDown(e) {
        const canvasPoint = this.getCanvasPoint(e);
        const worldPoint = this.canvasToWorld(canvasPoint);
        this.mouseState.isDown = true;
        this.mouseState.startPosition = { ...canvasPoint };
        this.mouseState.currentPosition = { ...canvasPoint };
        if (this.miniMap.isPointOnMap(canvasPoint)) {
            const newOffset = this.miniMap.getWorldPositionFromMapPoint(canvasPoint, this.viewState);
            this.viewState.offset = newOffset;
            this.mouseState.isPanning = true;
            this.markDirty();
            return;
        }
        const portResult = this.getPortAtPoint(worldPoint);
        if (portResult) {
            this.mouseState.isDrawingConnection = true;
            this.mouseState.connectionFromPort = portResult.port;
            this.mouseState.connectionFromPoint = this.getPortWorldPosition(portResult.node, portResult.port);
            this.markDirty();
            return;
        }
        const connectionResult = this.getConnectionAtPoint(worldPoint);
        if (connectionResult) {
            if (e.shiftKey) {
                if (this.selectionState.selectedConnections.has(connectionResult.id)) {
                    this.selectionState.selectedConnections.delete(connectionResult.id);
                }
                else {
                    this.selectionState.selectedConnections.add(connectionResult.id);
                }
            }
            else {
                this.selectionState.selectedConnections.clear();
                this.selectionState.selectedNodes.clear();
                this.selectionState.selectedConnections.add(connectionResult.id);
            }
            this.markDirty();
            return;
        }
        const nodeResult = this.getNodeAtPoint(worldPoint);
        if (nodeResult) {
            if (e.shiftKey) {
                if (this.selectionState.selectedNodes.has(nodeResult.id)) {
                    this.selectionState.selectedNodes.delete(nodeResult.id);
                }
                else {
                    this.selectionState.selectedNodes.add(nodeResult.id);
                }
            }
            else {
                if (!this.selectionState.selectedNodes.has(nodeResult.id)) {
                    this.selectionState.selectedConnections.clear();
                    this.selectionState.selectedNodes.clear();
                    this.selectionState.selectedNodes.add(nodeResult.id);
                }
            }
            this.mouseState.isDragging = true;
            this.mouseState.draggingNodes = Array.from(this.selectionState.selectedNodes);
            this.mouseState.nodeStartPositions.clear();
            for (const nodeId of this.mouseState.draggingNodes) {
                const node = this.getNodeById(nodeId);
                if (node) {
                    this.mouseState.nodeStartPositions.set(nodeId, { ...node.position });
                }
            }
            this.markDirty();
            return;
        }
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.mouseState.isPanning = true;
            this.markDirty();
            return;
        }
        this.selectionState.selectedNodes.clear();
        this.selectionState.selectedConnections.clear();
        this.markDirty();
    }
    handleMouseMove(e) {
        const canvasPoint = this.getCanvasPoint(e);
        const worldPoint = this.canvasToWorld(canvasPoint);
        this.mouseState.currentPosition = { ...canvasPoint };
        if (this.mouseState.isPanning) {
            const dx = canvasPoint.x - this.mouseState.startPosition.x;
            const dy = canvasPoint.y - this.mouseState.startPosition.y;
            this.viewState.offset = {
                x: this.viewState.offset.x + dx,
                y: this.viewState.offset.y + dy
            };
            this.mouseState.startPosition = { ...canvasPoint };
            this.markDirty();
            return;
        }
        if (this.mouseState.isDrawingConnection) {
            this.markDirty();
            return;
        }
        if (this.mouseState.isDragging && this.mouseState.draggingNodes.length > 0) {
            const dx = canvasPoint.x - this.mouseState.startPosition.x;
            const dy = canvasPoint.y - this.mouseState.startPosition.y;
            const worldDx = dx / this.viewState.scale;
            const worldDy = dy / this.viewState.scale;
            for (const nodeId of this.mouseState.draggingNodes) {
                const node = this.getNodeById(nodeId);
                const startPos = this.mouseState.nodeStartPositions.get(nodeId);
                if (node && startPos) {
                    let newX = startPos.x + worldDx;
                    let newY = startPos.y + worldDy;
                    if (this.config.snapToGrid) {
                        newX = snapToGrid({ x: newX, y: 0 }, this.config.gridSize).x;
                        newY = snapToGrid({ x: 0, y: newY }, this.config.gridSize).y;
                    }
                    node.moveTo({ x: newX, y: newY });
                }
            }
            this.updateConnections();
            this.markDirty();
            return;
        }
        let needUpdate = false;
        const hoveredConnection = this.getConnectionAtPoint(worldPoint);
        if (hoveredConnection) {
            if (this.selectionState.hoveredConnection !== hoveredConnection.id) {
                this.selectionState.hoveredConnection = hoveredConnection.id;
                needUpdate = true;
            }
        }
        else {
            if (this.selectionState.hoveredConnection !== null) {
                this.selectionState.hoveredConnection = null;
                needUpdate = true;
            }
        }
        const portResult = this.getPortAtPoint(worldPoint);
        if (portResult) {
            if (!this.selectionState.hoveredPort ||
                this.selectionState.hoveredPort.portId !== portResult.port.id) {
                this.selectionState.hoveredPort = {
                    nodeId: portResult.node.id,
                    portId: portResult.port.id
                };
                this.canvas.style.cursor = 'crosshair';
                needUpdate = true;
            }
        }
        else {
            if (this.selectionState.hoveredPort !== null) {
                this.selectionState.hoveredPort = null;
                this.canvas.style.cursor = 'default';
                needUpdate = true;
            }
        }
        const nodeResult = this.getNodeAtPoint(worldPoint);
        if (nodeResult) {
            if (this.selectionState.hoveredNode !== nodeResult.id) {
                this.selectionState.hoveredNode = nodeResult.id;
                this.canvas.style.cursor = 'move';
                needUpdate = true;
            }
        }
        else if (!portResult) {
            if (this.selectionState.hoveredNode !== null) {
                this.selectionState.hoveredNode = null;
                this.canvas.style.cursor = 'default';
                needUpdate = true;
            }
        }
        if (needUpdate) {
            this.markDirty();
        }
    }
    handleMouseUp(e) {
        const canvasPoint = this.getCanvasPoint(e);
        const worldPoint = this.canvasToWorld(canvasPoint);
        if (this.mouseState.isDrawingConnection) {
            const targetPortResult = this.getPortAtPoint(worldPoint);
            if (targetPortResult && this.mouseState.connectionFromPort) {
                const fromPort = this.mouseState.connectionFromPort;
                const toPort = targetPortResult.port;
                if (fromPort.nodeId !== toPort.nodeId &&
                    fromPort.type === PortType.OUTPUT &&
                    toPort.type === PortType.INPUT) {
                    const exists = this.connections.some((c) => c.fromPortId === fromPort.id && c.toPortId === toPort.id);
                    if (!exists) {
                        const fromNode = this.getNodeById(fromPort.nodeId);
                        const toNode = this.getNodeById(toPort.nodeId);
                        if (fromNode && toNode) {
                            const fromPoint = this.getPortWorldPosition(fromNode, fromPort);
                            const toPoint = this.getPortWorldPosition(toNode, toPort);
                            const obstacles = this.nodes
                                .filter((n) => n.id !== fromNode.id && n.id !== toNode.id)
                                .map((n) => n.bounds);
                            const connection = ConnectionFactory.createConnection(ConnectionStyle.POLYLINE, {
                                fromPortId: fromPort.id,
                                toPortId: toPort.id,
                                fromPoint,
                                toPoint
                            });
                            connection.updatePoints(fromPoint, toPoint, obstacles);
                            this.connections.push(connection);
                            this.saveState();
                        }
                    }
                }
            }
        }
        if (this.mouseState.isDragging) {
            this.saveState();
        }
        this.mouseState.isDown = false;
        this.mouseState.isDragging = false;
        this.mouseState.isPanning = false;
        this.mouseState.isDrawingConnection = false;
        this.mouseState.draggingNodes = [];
        this.mouseState.nodeStartPositions.clear();
        this.mouseState.connectionFromPort = null;
        this.markDirty();
    }
    handleMouseLeave() {
        this.mouseState.isDown = false;
        this.mouseState.isDragging = false;
        this.mouseState.isPanning = false;
        this.mouseState.isDrawingConnection = false;
        this.markDirty();
    }
    handleWheel(e) {
        e.preventDefault();
        const canvasPoint = this.getCanvasPoint(e);
        const worldPoint = this.canvasToWorld(canvasPoint);
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(5, this.viewState.scale * zoomFactor));
        const scaleChange = newScale / this.viewState.scale;
        this.viewState.offset = {
            x: canvasPoint.x - (canvasPoint.x - this.viewState.offset.x) * scaleChange,
            y: canvasPoint.y - (canvasPoint.y - this.viewState.offset.y) * scaleChange
        };
        this.viewState.scale = newScale;
        this.markDirty();
    }
    handleKeyDown(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    if (e.shiftKey) {
                        this.redo();
                    }
                    else {
                        this.undo();
                    }
                    e.preventDefault();
                    break;
                case 'y':
                    this.redo();
                    e.preventDefault();
                    break;
                case 'a':
                    this.selectAll();
                    e.preventDefault();
                    break;
                case 'c':
                    e.preventDefault();
                    break;
                case 'v':
                    e.preventDefault();
                    break;
            }
        }
        else {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    this.deleteSelected();
                    break;
                case 'Escape':
                    this.clearSelection();
                    break;
            }
        }
    }
    getCanvasPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    canvasToWorld(canvasPoint) {
        return {
            x: (canvasPoint.x - this.viewState.offset.x) / this.viewState.scale,
            y: (canvasPoint.y - this.viewState.offset.y) / this.viewState.scale
        };
    }
    worldToCanvas(worldPoint) {
        return {
            x: worldPoint.x * this.viewState.scale + this.viewState.offset.x,
            y: worldPoint.y * this.viewState.scale + this.viewState.offset.y
        };
    }
    getNodeAtPoint(point) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            if (node.containsPoint(point)) {
                return node;
            }
        }
        return null;
    }
    getPortAtPoint(point) {
        for (const node of this.nodes) {
            const port = node.getPortAtPoint(point, this.viewState.scale);
            if (port) {
                return { node, port };
            }
        }
        return null;
    }
    getConnectionAtPoint(point) {
        for (let i = this.connections.length - 1; i >= 0; i--) {
            const connection = this.connections[i];
            if (connection.containsPoint(point, this.viewState.scale)) {
                return connection;
            }
        }
        return null;
    }
    getNodeById(id) {
        return this.nodes.find((n) => n.id === id);
    }
    getPortById(portId) {
        for (const node of this.nodes) {
            const port = node.getPortById(portId);
            if (port) {
                return { node, port };
            }
        }
        return null;
    }
    getPortWorldPosition(node, port) {
        return {
            x: node.position.x + port.position.x * node.size.width,
            y: node.position.y + port.position.y * node.size.height
        };
    }
    updateConnections() {
        const obstacles = this.nodes.map((n) => n.bounds);
        for (const connection of this.connections) {
            const fromPortInfo = this.getPortById(connection.fromPortId);
            const toPortInfo = this.getPortById(connection.toPortId);
            if (fromPortInfo && toPortInfo) {
                const fromPoint = this.getPortWorldPosition(fromPortInfo.node, fromPortInfo.port);
                const toPoint = this.getPortWorldPosition(toPortInfo.node, toPortInfo.port);
                const filteredObstacles = obstacles.filter((o) => o.x !== fromPortInfo.node.bounds.x ||
                    o.y !== fromPortInfo.node.bounds.y ||
                    o.width !== fromPortInfo.node.bounds.width ||
                    o.height !== fromPortInfo.node.bounds.height).filter((o) => o.x !== toPortInfo.node.bounds.x ||
                    o.y !== toPortInfo.node.bounds.y ||
                    o.width !== toPortInfo.node.bounds.width ||
                    o.height !== toPortInfo.node.bounds.height);
                connection.updatePoints(fromPoint, toPoint, filteredObstacles);
            }
        }
    }
    saveState() {
        const nodeData = this.nodes.map((n) => n.toJSON());
        const connectionData = this.connections.map((c) => c.toJSON());
        this.historyManager.saveState(nodeData, connectionData);
    }
    undo() {
        const state = this.historyManager.undo();
        if (state) {
            this.nodes = state.nodes.map((n) => NodeFactory.fromJSON(n));
            this.connections = state.connections.map((c) => {
                const fromPortInfo = this.getPortById(c.fromPortId);
                const toPortInfo = this.getPortById(c.toPortId);
                const fromPoint = fromPortInfo
                    ? this.getPortWorldPosition(fromPortInfo.node, fromPortInfo.port)
                    : { x: 0, y: 0 };
                const toPoint = toPortInfo
                    ? this.getPortWorldPosition(toPortInfo.node, toPortInfo.port)
                    : { x: 0, y: 0 };
                return ConnectionFactory.fromJSON(c, fromPoint, toPoint);
            });
            this.markDirty();
        }
    }
    redo() {
        const state = this.historyManager.redo();
        if (state) {
            this.nodes = state.nodes.map((n) => NodeFactory.fromJSON(n));
            this.connections = state.connections.map((c) => {
                const fromPortInfo = this.getPortById(c.fromPortId);
                const toPortInfo = this.getPortById(c.toPortId);
                const fromPoint = fromPortInfo
                    ? this.getPortWorldPosition(fromPortInfo.node, fromPortInfo.port)
                    : { x: 0, y: 0 };
                const toPoint = toPortInfo
                    ? this.getPortWorldPosition(toPortInfo.node, toPortInfo.port)
                    : { x: 0, y: 0 };
                return ConnectionFactory.fromJSON(c, fromPoint, toPoint);
            });
            this.markDirty();
        }
    }
    deleteSelected() {
        let deleted = false;
        for (const connId of this.selectionState.selectedConnections) {
            const index = this.connections.findIndex((c) => c.id === connId);
            if (index !== -1) {
                this.connections.splice(index, 1);
                deleted = true;
            }
        }
        for (const nodeId of this.selectionState.selectedNodes) {
            const index = this.nodes.findIndex((n) => n.id === nodeId);
            if (index !== -1) {
                this.nodes.splice(index, 1);
                this.connections = this.connections.filter((c) => c.fromPortId !== nodeId && c.toPortId !== nodeId);
                deleted = true;
            }
        }
        if (deleted) {
            this.clearSelection();
            this.saveState();
            this.markDirty();
        }
    }
    selectAll() {
        this.selectionState.selectedNodes.clear();
        for (const node of this.nodes) {
            this.selectionState.selectedNodes.add(node.id);
        }
        this.selectionState.selectedConnections.clear();
        for (const conn of this.connections) {
            this.selectionState.selectedConnections.add(conn.id);
        }
        this.markDirty();
    }
    clearSelection() {
        this.selectionState.selectedNodes.clear();
        this.selectionState.selectedConnections.clear();
        this.markDirty();
    }
    markDirty() {
        this.isDirty = true;
    }
    startRenderLoop() {
        const render = () => {
            if (this.isDirty) {
                this.render();
                this.isDirty = false;
            }
            this.animationFrameId = requestAnimationFrame(render);
        };
        this.animationFrameId = requestAnimationFrame(render);
    }
    render() {
        this.ctx.save();
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.ctx.translate(this.viewState.offset.x, this.viewState.offset.y);
        this.ctx.scale(this.viewState.scale, this.viewState.scale);
        this.drawConnections();
        this.drawNodes();
        if (this.mouseState.isDrawingConnection) {
            this.drawConnectionPreview();
        }
        this.ctx.restore();
        this.miniMap.draw(this.ctx, this.nodes.map((n) => n.toJSON()), this.connections.map((c) => c.toJSON()), this.viewState);
    }
    drawGrid() {
        const gridSize = this.config.gridSize * this.viewState.scale;
        this.ctx.strokeStyle = '#E5E5E5';
        this.ctx.lineWidth = 0.5;
        const startX = -this.viewState.offset.x % gridSize;
        const startY = -this.viewState.offset.y % gridSize;
        for (let x = startX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = startY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    drawNodes() {
        for (const node of this.nodes) {
            const isSelected = this.selectionState.selectedNodes.has(node.id);
            const isHovered = this.selectionState.hoveredNode === node.id;
            node.draw(this.ctx, this.viewState.scale);
            if (isSelected) {
                this.drawSelectionBorder(node);
            }
            if (isHovered || isSelected) {
                this.drawNodePorts(node);
            }
        }
    }
    drawSelectionBorder(node) {
        const { x, y, width, height } = node.bounds;
        const padding = 2 / this.viewState.scale;
        this.ctx.strokeStyle = '#2196F3';
        this.ctx.lineWidth = 2 / this.viewState.scale;
        this.ctx.setLineDash([4 / this.viewState.scale, 4 / this.viewState.scale]);
        this.ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);
        this.ctx.setLineDash([]);
    }
    drawNodePorts(node) {
        const portRadius = 8 / this.viewState.scale;
        for (const port of node.ports) {
            const pos = this.getPortWorldPosition(node, port);
            const isHovered = this.selectionState.hoveredPort?.nodeId === node.id &&
                this.selectionState.hoveredPort?.portId === port.id;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, portRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = port.type === PortType.INPUT ? '#FF6B6B' : '#4ECDC4';
            this.ctx.fill();
            this.ctx.strokeStyle = isHovered ? '#FFFFFF' : '#333333';
            this.ctx.lineWidth = isHovered ? 3 / this.viewState.scale : 1.5 / this.viewState.scale;
            this.ctx.stroke();
        }
    }
    drawConnections() {
        for (const connection of this.connections) {
            const isSelected = this.selectionState.selectedConnections.has(connection.id);
            const isHovered = this.selectionState.hoveredConnection === connection.id;
            if (isSelected || isHovered) {
                const origColor = connection.color;
                const origWidth = connection.width;
                connection.color = isSelected ? '#2196F3' : '#666666';
                connection.width = isSelected ? origWidth * 1.5 : origWidth * 1.2;
                connection.draw(this.ctx, this.viewState.scale);
                connection.color = origColor;
                connection.width = origWidth;
            }
            else {
                connection.draw(this.ctx, this.viewState.scale);
            }
        }
    }
    drawConnectionPreview() {
        const toPoint = this.canvasToWorld(this.mouseState.currentPosition);
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#999999';
        this.ctx.lineWidth = 2 / this.viewState.scale;
        this.ctx.setLineDash([6 / this.viewState.scale, 4 / this.viewState.scale]);
        this.ctx.moveTo(this.mouseState.connectionFromPoint.x, this.mouseState.connectionFromPoint.y);
        this.ctx.lineTo(toPoint.x, toPoint.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    addNode(type, position, title, config) {
        const node = NodeFactory.createNode(type, {
            position,
            title,
            color: config?.color || this.config.defaultNodeColor,
            textColor: config?.textColor || this.config.defaultTextColor,
            fontSize: config?.fontSize || this.config.defaultFontSize,
            size: config?.size || this.config.defaultNodeSize,
            ...config
        });
        node.addPort(PortType.INPUT, { x: 0, y: 0.5 }, 'Input');
        node.addPort(PortType.OUTPUT, { x: 1, y: 0.5 }, 'Output');
        this.nodes.push(node);
        this.saveState();
        this.markDirty();
        return node;
    }
    removeNode(nodeId) {
        const index = this.nodes.findIndex((n) => n.id === nodeId);
        if (index === -1)
            return false;
        this.nodes.splice(index, 1);
        this.connections = this.connections.filter((c) => c.fromPortId !== nodeId && c.toPortId !== nodeId);
        if (this.selectionState.selectedNodes.has(nodeId)) {
            this.selectionState.selectedNodes.delete(nodeId);
        }
        this.saveState();
        this.markDirty();
        return true;
    }
    alignSelected(alignType) {
        const selectedNodes = this.nodes.filter((n) => this.selectionState.selectedNodes.has(n.id));
        if (selectedNodes.length < 2)
            return;
        const positions = this.alignmentManager.align(selectedNodes.map((n) => n.toJSON()), alignType);
        for (const [nodeId, pos] of positions) {
            const node = this.getNodeById(nodeId);
            if (node) {
                node.moveTo(pos);
            }
        }
        this.updateConnections();
        this.saveState();
        this.markDirty();
    }
    distributeSelected(distributeType) {
        const selectedNodes = this.nodes.filter((n) => this.selectionState.selectedNodes.has(n.id));
        if (selectedNodes.length < 3)
            return;
        const positions = this.alignmentManager.distribute(selectedNodes.map((n) => n.toJSON()), distributeType);
        for (const [nodeId, pos] of positions) {
            const node = this.getNodeById(nodeId);
            if (node) {
                node.moveTo(pos);
            }
        }
        this.updateConnections();
        this.saveState();
        this.markDirty();
    }
    exportToJSON() {
        const nodeData = this.nodes.map((n) => n.toJSON());
        const connectionData = this.connections.map((c) => c.toJSON());
        return this.exportManager.exportToJSON(nodeData, connectionData);
    }
    exportToSVG(options) {
        const nodeData = this.nodes.map((n) => n.toJSON());
        const connectionData = this.connections.map((c) => c.toJSON());
        return this.exportManager.exportToSVG(nodeData, connectionData, options);
    }
    importFromJSON(jsonString) {
        const result = this.importManager.importFromJSON(jsonString);
        if (result.success || result.nodes.length > 0) {
            this.nodes = result.nodes.map((n) => NodeFactory.fromJSON(n));
            this.connections = result.connections.map((c) => {
                const fromPortInfo = this.getPortById(c.fromPortId);
                const toPortInfo = this.getPortById(c.toPortId);
                const fromPoint = fromPortInfo
                    ? this.getPortWorldPosition(fromPortInfo.node, fromPortInfo.port)
                    : { x: 0, y: 0 };
                const toPoint = toPortInfo
                    ? this.getPortWorldPosition(toPortInfo.node, toPortInfo.port)
                    : { x: 0, y: 0 };
                const connection = ConnectionFactory.fromJSON(c, fromPoint, toPoint);
                connection.updatePoints(fromPoint, toPoint);
                return connection;
            });
            this.clearSelection();
            this.historyManager.clear();
            this.saveState();
            this.markDirty();
        }
        return result;
    }
    canUndo() {
        return this.historyManager.canUndo();
    }
    canRedo() {
        return this.historyManager.canRedo();
    }
    getNodes() {
        return [...this.nodes];
    }
    getConnections() {
        return [...this.connections];
    }
    getSelectedNodes() {
        return Array.from(this.selectionState.selectedNodes);
    }
    getSelectedConnections() {
        return Array.from(this.selectionState.selectedConnections);
    }
    setViewState(offset, scale) {
        this.viewState.offset = { ...offset };
        this.viewState.scale = scale;
        this.markDirty();
    }
    getViewState() {
        return {
            offset: { ...this.viewState.offset },
            scale: this.viewState.scale
        };
    }
    setConfig(config) {
        this.config = { ...this.config, ...config };
        if (config.historyMaxSteps !== undefined) {
            this.historyManager.setMaxSteps(config.historyMaxSteps);
        }
        if (config.miniMap) {
            this.miniMap.updateConfig(config.miniMap);
        }
        this.markDirty();
    }
    destroy() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}
