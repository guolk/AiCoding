import { TreeNode, AnimationStep } from '../types'
import { createAnimationStep, generateId } from '../utils/helpers'

export interface BSTInsertResult {
  root: TreeNode | null
  steps: AnimationStep[]
  success: boolean
}

export interface BSTDeleteResult {
  root: TreeNode | null
  steps: AnimationStep[]
  success: boolean
}

export interface BSTSearchResult {
  found: boolean
  steps: AnimationStep[]
  node: TreeNode | null
}

export interface BSTTraversalResult {
  order: number[]
  steps: AnimationStep[]
}

class BinarySearchTree {
  root: TreeNode | null = null
  nodeIds: Map<TreeNode, string> = new Map()

  constructor() {
    this.root = null
  }

  private getNodeId(node: TreeNode): string {
    if (!this.nodeIds.has(node)) {
      this.nodeIds.set(node, generateId())
    }
    return this.nodeIds.get(node)!
  }

  insert(value: number): BSTInsertResult {
    const steps: AnimationStep[] = []
    
    if (!this.root) {
      this.root = { value }
      const rootId = this.getNodeId(this.root)
      steps.push(createAnimationStep(`创建根节点 ${value}`, {
        highlightedNodes: [rootId],
        currentNode: rootId,
      }))
      return { root: this.root, steps, success: true }
    }

    let current: TreeNode | null = this.root
    let currentId = this.getNodeId(current)
    
    steps.push(createAnimationStep(`开始插入 ${value}，从根节点开始`, {
      highlightedNodes: [currentId],
      currentNode: currentId,
    }))

    while (true) {
      if (value === current.value) {
        steps.push(createAnimationStep(`值 ${value} 已存在，插入失败`, {
          highlightedNodes: [currentId],
        }))
        return { root: this.root, steps, success: false }
      }

      if (value < current.value) {
        if (!current.left) {
          current.left = { value }
          const newNodeId = this.getNodeId(current.left)
          steps.push(createAnimationStep(`${value} 小于 ${current.value}，插入为左子节点`, {
            highlightedNodes: [currentId, newNodeId],
            currentNode: newNodeId,
          }))
          return { root: this.root, steps, success: true }
        } else {
          current = current.left
          currentId = this.getNodeId(current)
          steps.push(createAnimationStep(`${value} 小于 ${current.value}，向左移动`, {
            highlightedNodes: [currentId],
            currentNode: currentId,
          }))
        }
      } else {
        if (!current.right) {
          current.right = { value }
          const newNodeId = this.getNodeId(current.right)
          steps.push(createAnimationStep(`${value} 大于 ${current.value}，插入为右子节点`, {
            highlightedNodes: [currentId, newNodeId],
            currentNode: newNodeId,
          }))
          return { root: this.root, steps, success: true }
        } else {
          current = current.right
          currentId = this.getNodeId(current)
          steps.push(createAnimationStep(`${value} 大于 ${current.value}，向右移动`, {
            highlightedNodes: [currentId],
            currentNode: currentId,
          }))
        }
      }
    }
  }

  search(value: number): BSTSearchResult {
    const steps: AnimationStep[] = []
    
    if (!this.root) {
      steps.push(createAnimationStep('树为空，查找失败', {}))
      return { found: false, steps, node: null }
    }

    let current: TreeNode | null = this.root
    let currentId = this.getNodeId(current)
    
    steps.push(createAnimationStep(`开始查找 ${value}，从根节点开始`, {
      highlightedNodes: [currentId],
      currentNode: currentId,
    }))

    while (current) {
      if (value === current.value) {
        steps.push(createAnimationStep(`找到值 ${value}`, {
          highlightedNodes: [currentId],
          currentNode: currentId,
          visitedNodes: [currentId],
        }))
        return { found: true, steps, node: current }
      }

      if (value < current.value) {
        current = current.left || null
        if (current) {
          currentId = this.getNodeId(current)
          steps.push(createAnimationStep(`${value} 小于当前值，向左查找`, {
            highlightedNodes: [currentId],
            currentNode: currentId,
          }))
        }
      } else {
        current = current.right || null
        if (current) {
          currentId = this.getNodeId(current)
          steps.push(createAnimationStep(`${value} 大于当前值，向右查找`, {
            highlightedNodes: [currentId],
            currentNode: currentId,
          }))
        }
      }
    }

    steps.push(createAnimationStep(`未找到值 ${value}`, {}))
    return { found: false, steps, node: null }
  }

  delete(value: number): BSTDeleteResult {
    const steps: AnimationStep[] = []
    
    if (!this.root) {
      steps.push(createAnimationStep('树为空，删除失败', {}))
      return { root: null, steps, success: false }
    }

    const deleteNode = (
      node: TreeNode | null,
      value: number
    ): TreeNode | null => {
      if (!node) {
        steps.push(createAnimationStep(`未找到值 ${value}，删除失败`, {}))
        return null
      }

      const nodeId = this.getNodeId(node)

      if (value < node.value) {
        steps.push(createAnimationStep(`${value} 小于 ${node.value}，向左查找`, {
          highlightedNodes: [nodeId],
        }))
        node.left = deleteNode(node.left as TreeNode | null, value)
        return node
      } else if (value > node.value) {
        steps.push(createAnimationStep(`${value} 大于 ${node.value}，向右查找`, {
          highlightedNodes: [nodeId],
        }))
        node.right = deleteNode(node.right as TreeNode | null, value)
        return node
      } else {
        steps.push(createAnimationStep(`找到节点 ${value}，准备删除`, {
          highlightedNodes: [nodeId],
          currentNode: nodeId,
        }))

        if (!node.left) {
          steps.push(createAnimationStep(`节点 ${value} 无左子节点，用右子节点替换`, {
            highlightedNodes: node.right ? [this.getNodeId(node.right)] : [],
          }))
          return node.right as TreeNode | null
        }
        if (!node.right) {
          steps.push(createAnimationStep(`节点 ${value} 无右子节点，用左子节点替换`, {
            highlightedNodes: [this.getNodeId(node.left as TreeNode)],
          }))
          return node.left as TreeNode | null
        }

        steps.push(createAnimationStep(`节点 ${value} 有两个子节点，查找中序后继`, {
          highlightedNodes: [this.getNodeId(node.right as TreeNode)],
        }))

        let successor = node.right as TreeNode
        while (successor.left) {
          successor = successor.left as TreeNode
        }
        const successorId = this.getNodeId(successor)

        steps.push(createAnimationStep(`中序后继为 ${successor.value}`, {
          highlightedNodes: [successorId],
          currentNode: successorId,
        }))

        node.value = successor.value

        steps.push(createAnimationStep(`将 ${successor.value} 复制到被删除节点`, {
          highlightedNodes: [nodeId],
        }))

        node.right = deleteNode(node.right as TreeNode | null, successor.value)

        steps.push(createAnimationStep(`删除中序后继节点 ${successor.value}`, {
          highlightedNodes: [successorId],
        }))

        return node
      }
    }

    this.root = deleteNode(this.root, value)
    return { root: this.root, steps, success: true }
  }

  preOrderTraversal(): BSTTraversalResult {
    const order: number[] = []
    const steps: AnimationStep[] = []
    const visitedIds: string[] = []

    const traverse = (node: TreeNode | null) => {
      if (!node) return

      const nodeId = this.getNodeId(node)
      
      steps.push(createAnimationStep(`访问节点 ${node.value}`, {
        highlightedNodes: [nodeId],
        currentNode: nodeId,
        visitedNodes: [...visitedIds],
      }))
      
      order.push(node.value)
      visitedIds.push(nodeId)
      
      traverse(node.left as TreeNode | null)
      traverse(node.right as TreeNode | null)
    }

    if (this.root) {
      steps.push(createAnimationStep('开始前序遍历：根 → 左 → 右', {}))
      traverse(this.root)
      steps.push(createAnimationStep(`前序遍历完成：${order.join(' → ')}`, {
        visitedNodes: [...visitedIds],
      }))
    } else {
      steps.push(createAnimationStep('树为空，无法遍历', {}))
    }

    return { order, steps }
  }

  inOrderTraversal(): BSTTraversalResult {
    const order: number[] = []
    const steps: AnimationStep[] = []
    const visitedIds: string[] = []

    const traverse = (node: TreeNode | null) => {
      if (!node) return

      traverse(node.left as TreeNode | null)

      const nodeId = this.getNodeId(node)
      
      steps.push(createAnimationStep(`访问节点 ${node.value}`, {
        highlightedNodes: [nodeId],
        currentNode: nodeId,
        visitedNodes: [...visitedIds],
      }))
      
      order.push(node.value)
      visitedIds.push(nodeId)
      
      traverse(node.right as TreeNode | null)
    }

    if (this.root) {
      steps.push(createAnimationStep('开始中序遍历：左 → 根 → 右', {}))
      traverse(this.root)
      steps.push(createAnimationStep(`中序遍历完成：${order.join(' → ')}`, {
        visitedNodes: [...visitedIds],
      }))
    } else {
      steps.push(createAnimationStep('树为空，无法遍历', {}))
    }

    return { order, steps }
  }

  postOrderTraversal(): BSTTraversalResult {
    const order: number[] = []
    const steps: AnimationStep[] = []
    const visitedIds: string[] = []

    const traverse = (node: TreeNode | null) => {
      if (!node) return

      traverse(node.left as TreeNode | null)
      traverse(node.right as TreeNode | null)

      const nodeId = this.getNodeId(node)
      
      steps.push(createAnimationStep(`访问节点 ${node.value}`, {
        highlightedNodes: [nodeId],
        currentNode: nodeId,
        visitedNodes: [...visitedIds],
      }))
      
      order.push(node.value)
      visitedIds.push(nodeId)
    }

    if (this.root) {
      steps.push(createAnimationStep('开始后序遍历：左 → 右 → 根', {}))
      traverse(this.root)
      steps.push(createAnimationStep(`后序遍历完成：${order.join(' → ')}`, {
        visitedNodes: [...visitedIds],
      }))
    } else {
      steps.push(createAnimationStep('树为空，无法遍历', {}))
    }

    return { order, steps }
  }

  levelOrderTraversal(): BSTTraversalResult {
    const order: number[] = []
    const steps: AnimationStep[] = []
    const visitedIds: string[] = []

    if (!this.root) {
      steps.push(createAnimationStep('树为空，无法遍历', {}))
      return { order, steps }
    }

    steps.push(createAnimationStep('开始层序遍历，使用队列', {}))

    const queue: TreeNode[] = [this.root]

    while (queue.length > 0) {
      const node = queue.shift()!
      const nodeId = this.getNodeId(node)

      steps.push(createAnimationStep(`访问节点 ${node.value}`, {
        highlightedNodes: [nodeId],
        currentNode: nodeId,
        visitedNodes: [...visitedIds],
        extras: { queueSize: queue.length },
      }))

      order.push(node.value)
      visitedIds.push(nodeId)

      if (node.left) {
        queue.push(node.left as TreeNode)
      }
      if (node.right) {
        queue.push(node.right as TreeNode)
      }
    }

    steps.push(createAnimationStep(`层序遍历完成：${order.join(' → ')}`, {
      visitedNodes: [...visitedIds],
    }))

    return { order, steps }
  }
}

export default BinarySearchTree
