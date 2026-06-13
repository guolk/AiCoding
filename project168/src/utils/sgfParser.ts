import { nanoid } from 'nanoid';
import type { MoveNode, StoneColor, Point, GameRecord, GameCategory } from '@/types';

function parseSGFPoint(sgfPoint: string): Point | null {
  if (!sgfPoint || sgfPoint === '') return null;
  if (sgfPoint.length !== 2) return null;
  
  const x = sgfPoint.charCodeAt(0) - 97;
  const y = sgfPoint.charCodeAt(1) - 97;
  
  if (x < 0 || x >= 19 || y < 0 || y >= 19) return null;
  
  return { x, y };
}

function toSGFPoint(point: Point | null): string {
  if (!point) return '';
  return String.fromCharCode(97 + point.x) + String.fromCharCode(97 + point.y);
}

interface SGFProperty {
  key: string;
  values: string[];
}

interface SGFNode {
  properties: SGFProperty[];
  children: SGFNode[];
}

function parseSGF(content: string): SGFNode {
  let pos = 0;
  
  function skipWhitespace() {
    while (pos < content.length && /\s/.test(content[pos])) {
      pos++;
    }
  }
  
  function parseProperty(): SGFProperty | null {
    skipWhitespace();
    if (pos >= content.length) return null;
    
    const keyMatch = content.slice(pos).match(/^[A-Z]+/);
    if (!keyMatch) return null;
    
    const key = keyMatch[0];
    pos += key.length;
    
    const values: string[] = [];
    
    while (pos < content.length && content[pos] === '[') {
      pos++;
      let value = '';
      while (pos < content.length && content[pos] !== ']') {
        if (content[pos] === '\\' && pos + 1 < content.length) {
          value += content[pos + 1];
          pos += 2;
        } else {
          value += content[pos];
          pos++;
        }
      }
      if (pos < content.length) pos++;
      values.push(value);
    }
    
    return { key, values };
  }
  
  function parseNode(): SGFNode {
    skipWhitespace();
    if (pos >= content.length || content[pos] !== ';') {
      return { properties: [], children: [] };
    }
    pos++;
    
    const properties: SGFProperty[] = [];
    let prop: SGFProperty | null;
    
    while ((prop = parseProperty())) {
      properties.push(prop);
    }
    
    skipWhitespace();
    
    const children: SGFNode[] = [];
    
    while (pos < content.length && content[pos] === '(') {
      pos++;
      children.push(parseNodeTree());
      skipWhitespace();
      if (pos < content.length && content[pos] === ')') {
        pos++;
      }
      skipWhitespace();
    }
    
    return { properties, children };
  }
  
  function parseNodeTree(): SGFNode {
    skipWhitespace();
    const root = parseNode();
    let current = root;
    
    skipWhitespace();
    while (pos < content.length && content[pos] === ';') {
      const child = parseNode();
      if (child.properties.length > 0 || child.children.length > 0) {
        current.children.push(child);
        current = child;
      }
      skipWhitespace();
    }
    
    return root;
  }
  
  skipWhitespace();
  if (content[pos] === '(') {
    pos++;
  }
  
  const result = parseNodeTree();
  
  skipWhitespace();
  if (pos < content.length && content[pos] === ')') {
    pos++;
  }
  
  return result;
}

function convertToMoveNodes(sgfNode: SGFNode, parentId: string | null, moveNumber: number, color?: StoneColor): MoveNode {
  let point: Point | null = null;
  let comment = '';
  let nodeColor: StoneColor | undefined = color;
  
  for (const prop of sgfNode.properties) {
    if (prop.key === 'B') {
      nodeColor = 'black';
      point = parseSGFPoint(prop.values[0]);
    } else if (prop.key === 'W') {
      nodeColor = 'white';
      point = parseSGFPoint(prop.values[0]);
    } else if (prop.key === 'C') {
      comment = prop.values[0];
    }
  }
  
  const id = nanoid();
  const nextColor: StoneColor = nodeColor === 'black' ? 'white' : 'black';
  
  const children: MoveNode[] = [];
  
  for (let i = 0; i < sgfNode.children.length; i++) {
    const childSGF = sgfNode.children[i];
    const childMoveNumber = nodeColor !== undefined ? moveNumber + 1 : moveNumber;
    const childNode = convertToMoveNodes(childSGF, id, childMoveNumber, nextColor);
    childNode.isMain = i === 0;
    children.push(childNode);
  }
  
  return {
    id,
    moveNumber,
    color: nodeColor || 'black',
    point,
    comment: comment || undefined,
    marks: [],
    children,
    parentId,
    isMain: true,
  };
}

interface SGFMetadata {
  title: string;
  blackPlayer: string;
  whitePlayer: string;
  result: string;
  date: string;
}

function extractMetadata(sgfRoot: SGFNode): SGFMetadata {
  const metadata: SGFMetadata = {
    title: '',
    blackPlayer: '',
    whitePlayer: '',
    result: '',
    date: '',
  };
  
  for (const prop of sgfRoot.properties) {
    switch (prop.key) {
      case 'GN':
      case 'N':
        metadata.title = prop.values[0] || '';
        break;
      case 'PB':
        metadata.blackPlayer = prop.values[0] || '';
        break;
      case 'PW':
        metadata.whitePlayer = prop.values[0] || '';
        break;
      case 'RE':
        metadata.result = prop.values[0] || '';
        break;
      case 'DT':
        metadata.date = prop.values[0] || '';
        break;
    }
  }
  
  return metadata;
}

export interface ParsedSGF {
  metadata: SGFMetadata;
  rootNode: MoveNode;
}

export function parseSGFToGameRecord(
  sgfContent: string,
  category: GameCategory = 'custom',
  tags: string[] = [],
  description?: string
): Omit<GameRecord, 'id' | 'createdAt' | 'updatedAt'> {
  const sgfRoot = parseSGF(sgfContent);
  const metadata = extractMetadata(sgfRoot);
  
  let firstMoveColor: StoneColor = 'black';
  for (const prop of sgfRoot.properties) {
    if (prop.key === 'B') {
      firstMoveColor = 'black';
      break;
    } else if (prop.key === 'W') {
      firstMoveColor = 'white';
      break;
    }
  }
  
  const rootNode = convertToMoveNodes(sgfRoot, null, 0, firstMoveColor);
  
  const today = new Date().toISOString().split('T')[0];
  
  return {
    title: metadata.title || '未命名棋谱',
    blackPlayer: metadata.blackPlayer || '黑方',
    whitePlayer: metadata.whitePlayer || '白方',
    result: metadata.result || undefined,
    date: metadata.date || today,
    category,
    tags,
    description,
    sgfContent,
    rootNode,
  };
}

export function generateSGF(game: GameRecord): string {
  let sgf = '(;GM[1]FF[4]';
  
  sgf += `GN[${game.title}]`;
  sgf += `PB[${game.blackPlayer}]`;
  sgf += `PW[${game.whitePlayer}]`;
  
  if (game.result) sgf += `RE[${game.result}]`;
  if (game.date) sgf += `DT[${game.date}]`;
  
  function nodeToSGF(node: MoveNode): string {
    let result = ';';
    
    if (node.moveNumber > 0) {
      const colorKey = node.color === 'black' ? 'B' : 'W';
      const pointStr = toSGFPoint(node.point);
      result += `${colorKey}[${pointStr}]`;
    }
    
    if (node.comment) {
      result += `C[${node.comment.replace(/[\[\]]/g, '\\$&')}]`;
    }
    
    if (node.children.length === 1) {
      result += nodeToSGF(node.children[0]);
    } else if (node.children.length > 1) {
      for (const child of node.children) {
        result += `(${nodeToSGF(child)})`;
      }
    }
    
    return result;
  }
  
  sgf += nodeToSGF(game.rootNode);
  sgf += ')';
  
  return sgf;
}

export function getNodeByPath(root: MoveNode, path: number[]): MoveNode | null {
  let current: MoveNode | null = root;
  
  for (const index of path) {
    if (!current || !current.children[index]) {
      return null;
    }
    current = current.children[index];
  }
  
  return current;
}

export function getPathToNode(root: MoveNode, targetId: string): number[] {
  const path: number[] = [];
  
  function search(node: MoveNode, currentPath: number[]): boolean {
    if (node.id === targetId) {
      path.push(...currentPath);
      return true;
    }
    
    for (let i = 0; i < node.children.length; i++) {
      if (search(node.children[i], [...currentPath, i])) {
        return true;
      }
    }
    
    return false;
  }
  
  search(root, []);
  return path;
}

export function getMainLineNodes(root: MoveNode): MoveNode[] {
  const nodes: MoveNode[] = [root];
  let current = root;
  
  while (current.children.length > 0) {
    const mainChild = current.children.find(c => c.isMain) || current.children[0];
    if (mainChild) {
      nodes.push(mainChild);
      current = mainChild;
    } else {
      break;
    }
  }
  
  return nodes;
}

export function getTotalMoves(root: MoveNode): number {
  return getMainLineNodes(root).length - 1;
}

export function getNodeAtMove(root: MoveNode, moveNumber: number): MoveNode | null {
  const mainLine = getMainLineNodes(root);
  return mainLine[moveNumber] || null;
}
