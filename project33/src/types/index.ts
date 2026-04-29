export interface TreeNode {
  value: number
  left?: TreeNode | null
  right?: TreeNode | null
  height?: number
  balanceFactor?: number
}

export interface TreeNodeVisual extends TreeNode {
  id: string
  x: number
  y: number
  isHighlighted: boolean
  isVisited: boolean
  isCurrent: boolean
}

export interface AnimationStep {
  id: string
  description: string
  highlightedNodes: string[]
  visitedNodes: string[]
  currentNode: string | null
  extras?: Record<string, unknown>
}

export interface HashTableEntry {
  key: number
  value: number
  index: number
  status: 'empty' | 'occupied' | 'deleted' | 'collision'
  chain?: HashTableEntry[]
}

export interface HeapNode {
  value: number
  index: number
  level: number
  x: number
  y: number
  isHighlighted: boolean
  isSwapping: boolean
}

export interface GraphNode {
  id: string
  value: number
  x: number
  y: number
  isVisited: boolean
  isCurrent: boolean
  isHighlighted: boolean
  distance?: number
  predecessor?: string
}

export interface GraphEdge {
  from: string
  to: string
  isHighlighted: boolean
}

export interface QueueState {
  items: number[]
  front: number
  rear: number
}

export interface StackState {
  items: number[]
  top: number
}

export type DataStructureType = 'bst' | 'avl' | 'hashtable' | 'heap' | 'graph'
export type HashMethod = 'linear' | 'chaining'
export type TraversalType = 'pre' | 'in' | 'post' | 'level'
export type SearchType = 'bfs' | 'dfs'
export type OperationType = 'insert' | 'delete' | 'search' | 'traverse'

export interface ComplexityInfo {
  bestCase: string
  averageCase: string
  worstCase: string
  spaceComplexity: string
  description: string
}

export interface CodeExample {
  language: 'python' | 'javascript'
  code: string
}
