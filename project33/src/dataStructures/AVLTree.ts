import { TreeNode, AnimationStep } from '../types'
import { createAnimationStep, generateId } from '../utils/helpers'

export interface AVLTreeNode extends TreeNode {
  height: number
  left?: AVLTreeNode | null
  right?: AVLTreeNode | null
}

export interface AVLInsertResult {
  root: AVLTreeNode | null
  steps: AnimationStep[]
  success: boolean
}

export interface AVLDeleteResult {
  root: AVLTreeNode | null
  steps: AnimationStep[]
  success: boolean
}

class AVLTree {
  root: AVLTreeNode | null = null
  nodeIds: Map<AVLTreeNode, string> = new Map()

  private getNodeId(node: AVLTreeNode): string {
    if (!this.nodeIds.has(node)) {
      this.nodeIds.set(node, generateId())
    }
    return this.nodeIds.get(node)!
  }

  getHeight(node: AVLTreeNode | null): number {
    return node ? node.height : 0
  }

  getBalanceFactor(node: AVLTreeNode): number {
    const leftHeight = this.getHeight(node.left || null)
    const rightHeight = this.getHeight(node.right || null)
    return leftHeight - rightHeight
  }

  private updateHeight(node: AVLTreeNode): void {
    const leftHeight = this.getHeight(node.left || null)
    const rightHeight = this.getHeight(node.right || null)
    node.height = Math.max(leftHeight, rightHeight) + 1
  }

  private rotateRight(
    y: AVLTreeNode,
    steps: AnimationStep[]
  ): AVLTreeNode {
    const x = y.left as AVLTreeNode
    const T2 = x.right || null

    const yId = this.getNodeId(y)
    const xId = this.getNodeId(x)

    steps.push(createAnimationStep(`执行右旋操作：以 ${y.value} 为轴旋转`, {
      highlightedNodes: [yId, xId],
      currentNode: yId,
      extras: { rotation: 'right', nodes: [y.value, x.value] },
    }))

    x.right = y
    y.left = T2

    this.updateHeight(y)
    this.updateHeight(x)

    steps.push(createAnimationStep(`右旋完成：${x.value} 成为新根`, {
      highlightedNodes: [xId],
      currentNode: xId,
    }))

    return x
  }

  private rotateLeft(
    x: AVLTreeNode,
    steps: AnimationStep[]
  ): AVLTreeNode {
    const y = x.right as AVLTreeNode
    const T2 = y.left || null

    const xId = this.getNodeId(x)
    const yId = this.getNodeId(y)

    steps.push(createAnimationStep(`执行左旋操作：以 ${x.value} 为轴旋转`, {
      highlightedNodes: [xId, yId],
      currentNode: xId,
      extras: { rotation: 'left', nodes: [x.value, y.value] },
    }))

    y.left = x
    x.right = T2

    this.updateHeight(x)
    this.updateHeight(y)

    steps.push(createAnimationStep(`左旋完成：${y.value} 成为新根`, {
      highlightedNodes: [yId],
      currentNode: yId,
    }))

    return y
  }

  private rebalance(
    node: AVLTreeNode,
    steps: AnimationStep[]
  ): AVLTreeNode {
    this.updateHeight(node)

    const balance = this.getBalanceFactor(node)
    const nodeId = this.getNodeId(node)

    steps.push(createAnimationStep(`节点 ${node.value} 的平衡因子为 ${balance}`, {
      highlightedNodes: [nodeId],
      currentNode: nodeId,
      extras: { balanceFactor: balance },
    }))

    if (balance > 1) {
      const leftNode = node.left as AVLTreeNode | null
      if (leftNode && this.getBalanceFactor(leftNode) < 0) {
        steps.push(createAnimationStep(`左-右情况：先对左子节点左旋`, {
          highlightedNodes: [nodeId, this.getNodeId(leftNode)],
        }))
        node.left = this.rotateLeft(leftNode, steps)
      }
      return this.rotateRight(node, steps)
    }

    if (balance < -1) {
      const rightNode = node.right as AVLTreeNode | null
      if (rightNode && this.getBalanceFactor(rightNode) > 0) {
        steps.push(createAnimationStep(`右-左情况：先对右子节点右旋`, {
          highlightedNodes: [nodeId, this.getNodeId(rightNode)],
        }))
        node.right = this.rotateRight(rightNode, steps)
      }
      return this.rotateLeft(node, steps)
    }

    return node
  }

  insert(value: number): AVLInsertResult {
    const steps: AnimationStep[] = []

    const insertNode = (
      node: AVLTreeNode | null,
      value: number
    ): AVLTreeNode | null => {
      if (!node) {
        const newNode: AVLTreeNode = { value, height: 1 }
        const newNodeId = this.getNodeId(newNode)
        steps.push(createAnimationStep(`创建新节点 ${value}`, {
          highlightedNodes: [newNodeId],
          currentNode: newNodeId,
        }))
        return newNode
      }

      const nodeId = this.getNodeId(node)

      if (value < node.value) {
        steps.push(createAnimationStep(`${value} 小于 ${node.value}，向左插入`, {
          highlightedNodes: [nodeId],
          currentNode: nodeId,
        }))
        node.left = insertNode(node.left || null, value)
      } else if (value > node.value) {
        steps.push(createAnimationStep(`${value} 大于 ${node.value}，向右插入`, {
          highlightedNodes: [nodeId],
          currentNode: nodeId,
        }))
        node.right = insertNode(node.right || null, value)
      } else {
        steps.push(createAnimationStep(`值 ${value} 已存在，插入失败`, {
          highlightedNodes: [nodeId],
        }))
        return node
      }

      return this.rebalance(node, steps)
    }

    steps.push(createAnimationStep(`开始插入 ${value}`, {}))
    this.root = insertNode(this.root, value)
    steps.push(createAnimationStep(`插入 ${value} 完成`, {}))

    return { root: this.root, steps, success: true }
  }

  delete(value: number): AVLDeleteResult {
    const steps: AnimationStep[] = []

    const deleteNode = (
      node: AVLTreeNode | null,
      value: number
    ): AVLTreeNode | null => {
      if (!node) {
        steps.push(createAnimationStep(`未找到值 ${value}`, {}))
        return null
      }

      const nodeId = this.getNodeId(node)

      if (value < node.value) {
        steps.push(createAnimationStep(`${value} 小于 ${node.value}，向左查找`, {
          highlightedNodes: [nodeId],
        }))
        node.left = deleteNode(node.left as AVLTreeNode | null, value)
      } else if (value > node.value) {
        steps.push(createAnimationStep(`${value} 大于 ${node.value}，向右查找`, {
          highlightedNodes: [nodeId],
        }))
        node.right = deleteNode(node.right as AVLTreeNode | null, value)
      } else {
        steps.push(createAnimationStep(`找到节点 ${value}，准备删除`, {
          highlightedNodes: [nodeId],
          currentNode: nodeId,
        }))

        if (!node.left) {
          return node.right as AVLTreeNode | null
        }
        if (!node.right) {
          return node.left as AVLTreeNode | null
        }

        let successor = node.right as AVLTreeNode
        while (successor.left) {
          successor = successor.left as AVLTreeNode
        }

        const successorId = this.getNodeId(successor)
        steps.push(createAnimationStep(`中序后继为 ${successor.value}`, {
          highlightedNodes: [successorId],
        }))

        node.value = successor.value
        steps.push(createAnimationStep(`将 ${successor.value} 复制到被删除节点`, {
          highlightedNodes: [nodeId],
        }))

        node.right = deleteNode(node.right as AVLTreeNode | null, successor.value)
      }

      return this.rebalance(node, steps)
    }

    steps.push(createAnimationStep(`开始删除 ${value}`, {}))
    this.root = deleteNode(this.root, value)
    steps.push(createAnimationStep(`删除 ${value} 完成`, {}))

    return { root: this.root, steps, success: true }
  }

  getBalanceFactors(): Map<string, number> {
    const balanceMap = new Map<string, number>()
    
    const traverse = (node: AVLTreeNode | null) => {
      if (!node) return
      const nodeId = this.getNodeId(node)
      balanceMap.set(nodeId, this.getBalanceFactor(node))
      traverse(node.left as AVLTreeNode | null)
      traverse(node.right as AVLTreeNode | null)
    }
    
    traverse(this.root)
    return balanceMap
  }
}

export default AVLTree
