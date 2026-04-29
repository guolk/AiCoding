import { NodeType, ConnectionStyle } from '../types/index.js';
export class ExportManager {
    exportToJSON(nodes, connections) {
        const data = {
            nodes: nodes.map((node) => ({ ...node })),
            connections: connections.map((conn) => ({ ...conn })),
            version: '1.0.0',
            createdAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }
    exportToSVG(nodes, connections, options) {
        const padding = options?.padding ?? 50;
        const bounds = this.calculateBounds(nodes, padding);
        const width = options?.width ?? bounds.width;
        const height = options?.height ?? bounds.height;
        const backgroundColor = options?.backgroundColor ?? '#FFFFFF';
        const offsetX = -bounds.x + padding;
        const offsetY = -bounds.y + padding;
        let svgContent = '';
        svgContent += this.generateSVGHeader(width, height, backgroundColor);
        svgContent += this.generateNodesSVG(nodes, offsetX, offsetY);
        svgContent += this.generateConnectionsSVG(connections, offsetX, offsetY);
        svgContent += this.generateSVGFooter();
        return svgContent;
    }
    calculateBounds(nodes, padding) {
        if (nodes.length === 0) {
            return { x: 0, y: 0, width: 800, height: 600 };
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const node of nodes) {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + node.size.width);
            maxY = Math.max(maxY, node.position.y + node.size.height);
        }
        return {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2
        };
    }
    generateSVGHeader(width, height, backgroundColor) {
        return `<svg xmlns="http://www.w3.org/2000/svg" 
         xmlns:xlink="http://www.w3.org/1999/xlink" 
         width="${width}" 
         height="${height}" 
         viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
`;
    }
    generateNodesSVG(nodes, offsetX, offsetY) {
        let content = '';
        for (const node of nodes) {
            const x = node.position.x + offsetX;
            const y = node.position.y + offsetY;
            const w = node.size.width;
            const h = node.size.height;
            content += `  <!-- Node: ${node.id} -->\n`;
            switch (node.type) {
                case NodeType.RECTANGLE:
                    content += this.generateRectangleNodeSVG(x, y, w, h, node);
                    break;
                case NodeType.DIAMOND:
                    content += this.generateDiamondNodeSVG(x, y, w, h, node);
                    break;
                case NodeType.CIRCLE:
                    content += this.generateCircleNodeSVG(x, y, w, h, node);
                    break;
                case NodeType.PARALLELOGRAM:
                    content += this.generateParallelogramNodeSVG(x, y, w, h, node);
                    break;
                case NodeType.SWIMLANE:
                    content += this.generateSwimlaneNodeSVG(x, y, w, h, node);
                    break;
            }
        }
        return content;
    }
    generateRectangleNodeSVG(x, y, w, h, node) {
        return `  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" 
          fill="${node.color}" stroke="${this.darkenColor(node.color)}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + h / 2}" 
          text-anchor="middle" dominant-baseline="middle"
          fill="${node.textColor}" font-family="Arial" font-size="${node.fontSize}" font-weight="bold">
      ${this.escapeXml(node.title)}
    </text>
  </g>
`;
    }
    generateDiamondNodeSVG(x, y, w, h, node) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
        return `  <g>
    <polygon points="${points}" 
             fill="${node.color}" stroke="${this.darkenColor(node.color)}" stroke-width="2"/>
    <text x="${cx}" y="${cy}" 
          text-anchor="middle" dominant-baseline="middle"
          fill="${node.textColor}" font-family="Arial" font-size="${node.fontSize}" font-weight="bold">
      ${this.escapeXml(node.title)}
    </text>
  </g>
`;
    }
    generateCircleNodeSVG(x, y, w, h, node) {
        const radius = Math.min(w, h) / 2;
        const cx = x + w / 2;
        const cy = y + h / 2;
        return `  <g>
    <circle cx="${cx}" cy="${cy}" r="${radius}" 
            fill="${node.color}" stroke="${this.darkenColor(node.color)}" stroke-width="2"/>
    <text x="${cx}" y="${cy}" 
          text-anchor="middle" dominant-baseline="middle"
          fill="${node.textColor}" font-family="Arial" font-size="${node.fontSize}" font-weight="bold">
      ${this.escapeXml(node.title)}
    </text>
  </g>
`;
    }
    generateParallelogramNodeSVG(x, y, w, h, node) {
        const skew = w * 0.2;
        const points = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`;
        return `  <g>
    <polygon points="${points}" 
             fill="${node.color}" stroke="${this.darkenColor(node.color)}" stroke-width="2"/>
    <text x="${x + w / 2}" y="${y + h / 2}" 
          text-anchor="middle" dominant-baseline="middle"
          fill="${node.textColor}" font-family="Arial" font-size="${node.fontSize}" font-weight="bold">
      ${this.escapeXml(node.title)}
    </text>
  </g>
`;
    }
    generateSwimlaneNodeSVG(x, y, w, h, node) {
        const titleHeight = 30;
        const isHorizontal = node.titlePosition === 'top';
        if (isHorizontal) {
            return `  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" 
          fill="#F5F5F5" stroke="#E0E0E0" stroke-width="2" stroke-dasharray="5,5"/>
    <rect x="${x}" y="${y}" width="${w}" height="${titleHeight}" 
          fill="${node.color}"/>
    <text x="${x + w / 2}" y="${y + titleHeight / 2}" 
          text-anchor="middle" dominant-baseline="middle"
          fill="${node.textColor}" font-family="Arial" font-size="${node.fontSize + 2}" font-weight="bold">
      ${this.escapeXml(node.title)}
    </text>
  </g>
`;
        }
        else {
            const titleWidth = 30;
            return `  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" 
          fill="#F5F5F5" stroke="#E0E0E0" stroke-width="2" stroke-dasharray="5,5"/>
    <rect x="${x}" y="${y}" width="${titleWidth}" height="${h}" 
          fill="${node.color}"/>
    <text x="${x + titleWidth / 2}" y="${y + h / 2}" 
          text-anchor="middle" dominant-baseline="middle"
          fill="${node.textColor}" font-family="Arial" font-size="${node.fontSize + 2}" font-weight="bold"
          transform="rotate(-90, ${x + titleWidth / 2}, ${y + h / 2})">
      ${this.escapeXml(node.title)}
    </text>
  </g>
`;
        }
    }
    generateConnectionsSVG(connections, offsetX, offsetY) {
        let content = '\n  <!-- Connections -->\n';
        for (const conn of connections) {
            if (conn.points.length < 2)
                continue;
            const transformedPoints = conn.points.map((p) => ({
                x: p.x + offsetX,
                y: p.y + offsetY
            }));
            content += `  <!-- Connection: ${conn.id} -->\n`;
            switch (conn.style) {
                case ConnectionStyle.STRAIGHT:
                    content += this.generateStraightConnectionSVG(transformedPoints, conn);
                    break;
                case ConnectionStyle.CURVE:
                    content += this.generateCurveConnectionSVG(transformedPoints, conn);
                    break;
                case ConnectionStyle.POLYLINE:
                default:
                    content += this.generatePolylineConnectionSVG(transformedPoints, conn);
                    break;
            }
        }
        return content;
    }
    generateStraightConnectionSVG(points, conn) {
        if (points.length < 2)
            return '';
        const start = points[0];
        const end = points[points.length - 1];
        const arrowPath = this.generateArrowPath(end, start);
        return `  <g>
    <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" 
          stroke="${conn.color}" stroke-width="${conn.width}"/>
    <path d="${arrowPath}" fill="${conn.color}"/>
  </g>
`;
    }
    generatePolylineConnectionSVG(points, conn) {
        if (points.length < 2)
            return '';
        const pathData = points
            .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
            .join(' ');
        const lastPoint = points[points.length - 1];
        const prevPoint = points[points.length - 2];
        const arrowPath = this.generateArrowPath(lastPoint, prevPoint);
        return `  <g>
    <path d="${pathData}" fill="none" 
          stroke="${conn.color}" stroke-width="${conn.width}" 
          stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${arrowPath}" fill="${conn.color}"/>
  </g>
`;
    }
    generateCurveConnectionSVG(points, conn) {
        if (points.length < 2)
            return '';
        const start = points[0];
        const end = points[points.length - 1];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const controlDistance = Math.sqrt(dx * dx + dy * dy) * 0.3;
        const c1x = start.x + dx * 0.3;
        const c1y = start.y + dy * 0.1;
        const c2x = end.x - dx * 0.3;
        const c2y = end.y - dy * 0.1;
        const arrowControlPoint = {
            x: end.x - (c2x - end.x) * 0.1,
            y: end.y - (c2y - end.y) * 0.1
        };
        const arrowPath = this.generateArrowPath(end, arrowControlPoint);
        return `  <g>
    <path d="M ${start.x} ${start.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end.x} ${end.y}" 
          fill="none" stroke="${conn.color}" stroke-width="${conn.width}" 
          stroke-linecap="round"/>
    <path d="${arrowPath}" fill="${conn.color}"/>
  </g>
`;
    }
    generateArrowPath(end, start) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowLength = 12;
        const arrowAngle = Math.PI / 6;
        const p1x = end.x - arrowLength * Math.cos(angle - arrowAngle);
        const p1y = end.y - arrowLength * Math.sin(angle - arrowAngle);
        const p2x = end.x - arrowLength * Math.cos(angle + arrowAngle);
        const p2y = end.y - arrowLength * Math.sin(angle + arrowAngle);
        return `M ${end.x} ${end.y} L ${p1x} ${p1y} L ${p2x} ${p2y} Z`;
    }
    generateSVGFooter() {
        return '</svg>';
    }
    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
    darkenColor(color, amount = 30) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
}
