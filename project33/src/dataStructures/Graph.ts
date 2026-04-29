import { GraphNode, GraphEdge, AnimationStep, QueueState, StackState } from '../types'
import { createAnimationStep, generateId } from '../utils/helpers'

export type SearchType = 'bfs' | 'dfs'

export interface GraphSearchResult {
  order: number[]
  steps: AnimationStep[]
  nodes: GraphNode[]
  edges: GraphEdge[]
}

class Graph {
  nodes: GraphNode[] = []
  edges: GraphEdge[] = []
  adjacencyList: Map<number, number[]> = new Map()
  nodeIdMap: Map<number, string> = new Map()

  constructor() {
    this.nodes = []
    this.edges = []
    this.adjacencyList = new Map()
    this.nodeIdMap = new Map()
  }

  addNode(value: number, x: number = 0, y: number = 0): string {
    if (this.nodeIdMap.has(value)) {
      return this.nodeIdMap.get(value)!
    }

    const id = generateId()
    const node: GraphNode = {
      id,
      value,
      x,
      y,
      isVisited: false,
      isCurrent: false,
      isHighlighted: false,
    }

    this.nodes.push(node)
    this.nodeIdMap.set(value, id)
    this.adjacencyList.set(value, [])

    return id
  }

  addEdge(fromValue: number, toValue: number): boolean {
    if (!this.nodeIdMap.has(fromValue) || !this.nodeIdMap.has(toValue)) {
      return false
    }

    const fromId = this.nodeIdMap.get(fromValue)!
    const toId = this.nodeIdMap.get(toValue)!

    const existingEdge = this.edges.find(
      e => (e.from === fromId && e.to === toId) || (e.from === toId && e.to === fromId)
    )

    if (existingEdge) {
      return false
    }

    this.edges.push({
      from: fromId,
      to: toId,
      isHighlighted: false,
    })

    const fromNeighbors = this.adjacencyList.get(fromValue) || []
    const toNeighbors = this.adjacencyList.get(toValue) || []

    if (!fromNeighbors.includes(toValue)) {
      fromNeighbors.push(toValue)
    }
    if (!toNeighbors.includes(fromValue)) {
      toNeighbors.push(fromValue)
    }

    this.adjacencyList.set(fromValue, fromNeighbors)
    this.adjacencyList.set(toValue, toNeighbors)

    return true
  }

  getNodeById(id: string): GraphNode | undefined {
    return this.nodes.find(n => n.id === id)
  }

  getNodeByValue(value: number): GraphNode | undefined {
    return this.nodes.find(n => n.value === value)
  }

  bfs(startValue: number): GraphSearchResult {
    const steps: AnimationStep[] = []
    const order: number[] = []
    const visited = new Set<number>()
    const queue: number[] = []

    const visitedIds: string[] = []
    const highlightedIds: string[] = []

    const startNode = this.getNodeByValue(startValue)
    if (!startNode) {
      steps.push(createAnimationStep(`起始节点 ${startValue} 不存在`, {}))
      return { order, steps, nodes: [...this.nodes], edges: [...this.edges] }
    }

    steps.push(createAnimationStep(`开始广度优先搜索 (BFS)，从节点 ${startValue} 开始`, {
      highlightedNodes: [startNode.id],
      currentNode: startNode.id,
    }))

    queue.push(startValue)
    visited.add(startValue)

    steps.push(createAnimationStep(`将 ${startValue} 加入队列`, {
      extras: { 
        queue: { items: [...queue], front: 0, rear: queue.length - 1 } as QueueState,
        action: 'enqueue',
        value: startValue,
      },
    }))

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentNode = this.getNodeByValue(current)!
      
      steps.push(createAnimationStep(`从队列取出 ${current}，访问该节点`, {
        currentNode: currentNode.id,
        highlightedNodes: [currentNode.id, ...highlightedIds],
        visitedNodes: [...visitedIds],
        extras: { 
          queue: { items: [...queue], front: 0, rear: queue.length - 1 } as QueueState,
          action: 'dequeue',
          value: current,
        },
      }))

      order.push(current)
      visitedIds.push(currentNode.id)

      const neighbors = this.adjacencyList.get(current) || []
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const neighborNode = this.getNodeByValue(neighbor)!
          
          steps.push(createAnimationStep(`发现未访问的邻居 ${neighbor}`, {
            highlightedNodes: [currentNode.id, neighborNode.id, ...highlightedIds],
            currentNode: neighborNode.id,
            visitedNodes: [...visitedIds],
            extras: { 
              queue: { items: [...queue], front: 0, rear: queue.length - 1 } as QueueState,
            },
          }))

          visited.add(neighbor)
          queue.push(neighbor)
          highlightedIds.push(neighborNode.id)

          steps.push(createAnimationStep(`将 ${neighbor} 加入队列`, {
            highlightedNodes: [currentNode.id, ...highlightedIds],
            visitedNodes: [...visitedIds],
            extras: { 
              queue: { items: [...queue], front: 0, rear: queue.length - 1 } as QueueState,
              action: 'enqueue',
              value: neighbor,
            },
          }))
        }
      }
    }

    steps.push(createAnimationStep(`BFS 完成，访问顺序：${order.join(' → ')}`, {
      visitedNodes: [...visitedIds],
      extras: { done: true },
    }))

    return { order, steps, nodes: [...this.nodes], edges: [...this.edges] }
  }

  dfs(startValue: number): GraphSearchResult {
    const steps: AnimationStep[] = []
    const order: number[] = []
    const visited = new Set<number>()
    const stack: number[] = []

    const visitedIds: string[] = []
    const highlightedIds: string[] = []

    const startNode = this.getNodeByValue(startValue)
    if (!startNode) {
      steps.push(createAnimationStep(`起始节点 ${startValue} 不存在`, {}))
      return { order, steps, nodes: [...this.nodes], edges: [...this.edges] }
    }

    steps.push(createAnimationStep(`开始深度优先搜索 (DFS)，从节点 ${startValue} 开始`, {
      highlightedNodes: [startNode.id],
      currentNode: startNode.id,
    }))

    stack.push(startValue)

    steps.push(createAnimationStep(`将 ${startValue} 压入栈`, {
      extras: { 
        stack: { items: [...stack], top: stack.length - 1 } as StackState,
        action: 'push',
        value: startValue,
      },
    }))

    while (stack.length > 0) {
      const current = stack.pop()!
      const currentNode = this.getNodeByValue(current)!

      if (!visited.has(current)) {
        steps.push(createAnimationStep(`从栈弹出 ${current}，访问该节点`, {
          currentNode: currentNode.id,
          highlightedNodes: [currentNode.id, ...highlightedIds],
          visitedNodes: [...visitedIds],
          extras: { 
            stack: { items: [...stack], top: stack.length - 1 } as StackState,
            action: 'pop',
            value: current,
          },
        }))

        visited.add(current)
        order.push(current)
        visitedIds.push(currentNode.id)

        const neighbors = this.adjacencyList.get(current) || []
        
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i]
          if (!visited.has(neighbor)) {
            const neighborNode = this.getNodeByValue(neighbor)!
            
            steps.push(createAnimationStep(`发现未访问的邻居 ${neighbor}`, {
              highlightedNodes: [currentNode.id, neighborNode.id, ...highlightedIds],
              currentNode: neighborNode.id,
              visitedNodes: [...visitedIds],
              extras: { 
                stack: { items: [...stack], top: stack.length - 1 } as StackState,
              },
            }))

            stack.push(neighbor)
            highlightedIds.push(neighborNode.id)

            steps.push(createAnimationStep(`将 ${neighbor} 压入栈`, {
              highlightedNodes: [currentNode.id, ...highlightedIds],
              visitedNodes: [...visitedIds],
              extras: { 
                stack: { items: [...stack], top: stack.length - 1 } as StackState,
                action: 'push',
                value: neighbor,
              },
            }))
          }
        }
      }
    }

    steps.push(createAnimationStep(`DFS 完成，访问顺序：${order.join(' → ')}`, {
      visitedNodes: [...visitedIds],
      extras: { done: true },
    }))

    return { order, steps, nodes: [...this.nodes], edges: [...this.edges] }
  }

  setNodePositions(positions: Map<number, { x: number; y: number }>): void {
    for (const [value, pos] of positions) {
      const node = this.getNodeByValue(value)
      if (node) {
        node.x = pos.x
        node.y = pos.y
      }
    }
  }

  generateExampleGraph(): void {
    const positions = new Map<number, { x: number; y: number }>([
      [1, { x: 300, y: 100 }],
      [2, { x: 150, y: 200 }],
      [3, { x: 450, y: 200 }],
      [4, { x: 100, y: 350 }],
      [5, { x: 200, y: 350 }],
      [6, { x: 400, y: 350 }],
      [7, { x: 500, y: 350 }],
    ])

    for (const [value, _] of positions) {
      this.addNode(value, 0, 0)
    }

    this.setNodePositions(positions)

    this.addEdge(1, 2)
    this.addEdge(1, 3)
    this.addEdge(2, 4)
    this.addEdge(2, 5)
    this.addEdge(3, 6)
    this.addEdge(3, 7)
  }
}

export default Graph
