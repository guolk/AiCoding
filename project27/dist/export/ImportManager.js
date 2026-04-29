import { NodeType, ConnectionStyle } from '../types/index.js';
import { deepClone } from '../utils/index.js';
export class ImportManager {
    importFromJSON(jsonString) {
        const result = {
            success: false,
            nodes: [],
            connections: [],
            errors: []
        };
        try {
            const data = JSON.parse(jsonString);
            if (!data.nodes || !Array.isArray(data.nodes)) {
                result.errors.push('Invalid data format: nodes array is missing');
                return result;
            }
            if (!data.connections || !Array.isArray(data.connections)) {
                result.errors.push('Invalid data format: connections array is missing');
                return result;
            }
            const nodeValidation = this.validateNodes(data.nodes);
            if (nodeValidation.errors.length > 0) {
                result.errors.push(...nodeValidation.errors);
            }
            const connValidation = this.validateConnections(data.connections, data.nodes);
            if (connValidation.errors.length > 0) {
                result.errors.push(...connValidation.errors);
            }
            if (result.errors.length > 0) {
                result.nodes = nodeValidation.validNodes;
                result.connections = connValidation.validConnections;
                return result;
            }
            result.nodes = deepClone(data.nodes);
            result.connections = deepClone(data.connections);
            result.success = true;
        }
        catch (error) {
            result.errors.push(`Failed to parse JSON: ${error.message}`);
        }
        return result;
    }
    validateNodes(nodes) {
        const validNodes = [];
        const errors = [];
        const nodeIds = new Set();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!node.id) {
                errors.push(`Node at index ${i}: Missing id`);
                continue;
            }
            if (nodeIds.has(node.id)) {
                errors.push(`Node at index ${i}: Duplicate id '${node.id}'`);
                continue;
            }
            if (!node.type || !Object.values(NodeType).includes(node.type)) {
                errors.push(`Node '${node.id}': Invalid type '${node.type}'`);
                continue;
            }
            if (!node.position) {
                errors.push(`Node '${node.id}': Missing position`);
                continue;
            }
            if (!node.size) {
                errors.push(`Node '${node.id}': Missing size`);
                continue;
            }
            if (node.type === NodeType.SWIMLANE) {
                const swimlane = node;
                if (swimlane.titlePosition && !['top', 'left'].includes(swimlane.titlePosition)) {
                    errors.push(`Swimlane '${node.id}': Invalid titlePosition '${swimlane.titlePosition}'`);
                }
                if (swimlane.children && !Array.isArray(swimlane.children)) {
                    errors.push(`Swimlane '${node.id}': Invalid children array`);
                }
            }
            nodeIds.add(node.id);
            validNodes.push(node);
        }
        return { validNodes, errors };
    }
    validateConnections(connections, nodes) {
        const validConnections = [];
        const errors = [];
        const connectionIds = new Set();
        const allPortIds = new Set();
        for (const node of nodes) {
            if (node.ports && Array.isArray(node.ports)) {
                for (const port of node.ports) {
                    if (port.id) {
                        allPortIds.add(port.id);
                    }
                }
            }
        }
        for (let i = 0; i < connections.length; i++) {
            const conn = connections[i];
            if (!conn.id) {
                errors.push(`Connection at index ${i}: Missing id`);
                continue;
            }
            if (connectionIds.has(conn.id)) {
                errors.push(`Connection at index ${i}: Duplicate id '${conn.id}'`);
                continue;
            }
            if (!conn.fromPortId) {
                errors.push(`Connection '${conn.id}': Missing fromPortId`);
                continue;
            }
            if (!conn.toPortId) {
                errors.push(`Connection '${conn.id}': Missing toPortId`);
                continue;
            }
            if (conn.fromPortId === conn.toPortId) {
                errors.push(`Connection '${conn.id}': Cannot connect port to itself`);
                continue;
            }
            if (!allPortIds.has(conn.fromPortId)) {
                errors.push(`Connection '${conn.id}': fromPortId '${conn.fromPortId}' not found in any node`);
            }
            if (!allPortIds.has(conn.toPortId)) {
                errors.push(`Connection '${conn.id}': toPortId '${conn.toPortId}' not found in any node`);
            }
            if (!conn.style || !Object.values(ConnectionStyle).includes(conn.style)) {
                errors.push(`Connection '${conn.id}': Invalid style '${conn.style}', defaulting to polyline`);
            }
            if (!conn.points || !Array.isArray(conn.points) || conn.points.length < 2) {
                errors.push(`Connection '${conn.id}': Invalid points array, requires at least 2 points`);
            }
            connectionIds.add(conn.id);
            validConnections.push(conn);
        }
        return { validConnections, errors };
    }
}
