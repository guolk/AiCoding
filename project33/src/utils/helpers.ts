import { TreeNode, TreeNodeVisual, AnimationStep } from '../types'

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}

export const getTreeHeight = (node: TreeNode | null | undefined): number => {
  if (!node) return 0
  const leftHeight = getTreeHeight(node.left)
  const rightHeight = getTreeHeight(node.right)
  return Math.max(leftHeight, rightHeight) + 1
}

export const getNodeCount = (node: TreeNode | null | undefined): number => {
  if (!node) return 0
  return 1 + getNodeCount(node.left) + getNodeCount(node.right)
}

export const calculateTreeLayout = (
  root: TreeNode,
  width: number,
  height: number
): Map<string, TreeNodeVisual> => {
  const nodeMap = new Map<string, TreeNodeVisual>()
  const treeHeight = getTreeHeight(root)
  const levelHeight = height / (treeHeight + 1)
  
  const traverse = (
    node: TreeNode,
    level: number,
    leftBound: number,
    rightBound: number,
    _parentId?: string
  ): string => {
    const x = (leftBound + rightBound) / 2
    const y = level * levelHeight + 50
    const id = generateId()
    
    const visualNode: TreeNodeVisual = {
      ...node,
      id,
      x,
      y,
      isHighlighted: false,
      isVisited: false,
      isCurrent: false,
    }
    
    nodeMap.set(id, visualNode)
    
    if (node.left) {
      const leftId = traverse(node.left, level + 1, leftBound, x, id)
      visualNode.left = { ...node.left, id: leftId } as TreeNodeVisual
    }
    
    if (node.right) {
      const rightId = traverse(node.right, level + 1, x, rightBound, id)
      visualNode.right = { ...node.right, id: rightId } as TreeNodeVisual
    }
    
    return id
  }
  
  traverse(root, 0, 0, width)
  return nodeMap
}

export const createAnimationStep = (
  description: string,
  options: Partial<AnimationStep> = {}
): AnimationStep => {
  return {
    id: generateId(),
    description,
    highlightedNodes: options.highlightedNodes || [],
    visitedNodes: options.visitedNodes || [],
    currentNode: options.currentNode || null,
    extras: options.extras,
  }
}

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const hashFunction = (key: number, tableSize: number): number => {
  return key % tableSize
}

export const getParentIndex = (index: number): number => {
  return Math.floor((index - 1) / 2)
}

export const getLeftChildIndex = (index: number): number => {
  return 2 * index + 1
}

export const getRightChildIndex = (index: number): number => {
  return 2 * index + 2
}

export const formatComplexity = (value: string): string => {
  return value.replace(/O\(([^)]+)\)/g, 'O($1)')
}
