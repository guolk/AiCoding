import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as d3 from 'd3'
import AVLTree, { AVLTreeNode, AVLInsertResult, AVLDeleteResult } from '../../dataStructures/AVLTree'
import AnimationController from '../common/AnimationController'
import InputControlPanel from '../common/InputControlPanel'
import ComplexityCard from '../common/ComplexityCard'
import CodeDisplay from '../common/CodeDisplay'
import { ComplexityInfo, AnimationStep } from '../../types'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const TreeContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`

const Title = styled.h3`
  font-size: 16px;
  color: #333;
  margin: 0 0 15px 0;
`

const SVGContainer = styled.div`
  width: 100%;
  height: 550px;
  overflow: auto;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }
`

const Legend = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 15px;
  flex-wrap: wrap;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
`

const LegendCircle = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
`

const BalanceBadge = styled.div<{ balanced: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  background: ${props => props.balanced ? '#68d391' : '#f6ad55'};
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  margin-left: 10px;
`

const avlComplexity: ComplexityInfo = {
  bestCase: 'O(log n)',
  averageCase: 'O(log n)',
  worstCase: 'O(log n)',
  spaceComplexity: 'O(n)',
  description: 'AVL树是一种自平衡二叉搜索树，任何节点的两个子树高度差不超过1。所有操作的时间复杂度均为O(log n)，保证了最坏情况下的性能。'
}

const avlPythonCode = `class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    def __init__(self):
        self.root = None
    
    def get_height(self, node):
        if not node:
            return 0
        return node.height
    
    def get_balance(self, node):
        if not node:
            return 0
        return self.get_height(node.left) - self.get_height(node.right)
    
    def right_rotate(self, y):
        x = y.left
        T2 = x.right
        
        x.right = y
        y.left = T2
        
        y.height = 1 + max(self.get_height(y.left),
                           self.get_height(y.right))
        x.height = 1 + max(self.get_height(x.left),
                           self.get_height(x.right))
        
        return x
    
    def left_rotate(self, x):
        y = x.right
        T2 = y.left
        
        y.left = x
        x.right = T2
        
        x.height = 1 + max(self.get_height(x.left),
                           self.get_height(x.right))
        y.height = 1 + max(self.get_height(y.left),
                           self.get_height(y.right))
        
        return y
    
    def insert(self, node, value):
        if not node:
            return AVLNode(value)
        
        if value < node.value:
            node.left = self.insert(node.left, value)
        else:
            node.right = self.insert(node.right, value)
        
        node.height = 1 + max(self.get_height(node.left),
                              self.get_height(node.right))
        
        balance = self.get_balance(node)
        
        # 左左情况
        if balance > 1 and value < node.left.value:
            return self.right_rotate(node)
        
        # 右右情况
        if balance < -1 and value > node.right.value:
            return self.left_rotate(node)
        
        # 左右情况
        if balance > 1 and value > node.left.value:
            node.left = self.left_rotate(node.left)
            return self.right_rotate(node)
        
        # 右左情况
        if balance < -1 and value < node.right.value:
            node.right = self.right_rotate(node.right)
            return self.left_rotate(node)
        
        return node
`

const avlJavaScriptCode = `class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rightRotate(y) {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));
    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));

    return x;
  }

  leftRotate(x) {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = 1 + Math.max(this.getHeight(x.left), this.getHeight(x.right));
    y.height = 1 + Math.max(this.getHeight(y.left), this.getHeight(y.right));

    return y;
  }

  insert(node, value) {
    if (!node) return new AVLNode(value);

    if (value < node.value) {
      node.left = this.insert(node.left, value);
    } else if (value > node.value) {
      node.right = this.insert(node.right, value);
    } else {
      return node;
    }

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

    const balance = this.getBalance(node);

    // 左左情况
    if (balance > 1 && value < node.left.value) {
      return this.rightRotate(node);
    }

    // 右右情况
    if (balance < -1 && value > node.right.value) {
      return this.leftRotate(node);
    }

    // 左右情况
    if (balance > 1 && value > node.left.value) {
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }

    // 右左情况
    if (balance < -1 && value < node.right.value) {
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }

  delete(node, value) {
    // 删除逻辑与插入类似，需要重新平衡
    return node;
  }
}
`

interface AVLTreeVisualizerProps {}

const AVLTreeVisualizer: React.FC<AVLTreeVisualizerProps> = () => {
  const [avlTree] = useState(() => new AVLTree())
  const [root, setRoot] = useState<AVLTreeNode | null>(null)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  
  const svgRef = useRef<SVGSVGElement>(null)
  const playIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null

  useEffect(() => {
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const delayMs = 1000 / speed
      playIntervalRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1)
      }, delayMs)
    } else if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false)
    }

    return () => {
      if (playIntervalRef.current) {
        clearTimeout(playIntervalRef.current)
      }
    }
  }, [isPlaying, currentStepIndex, steps.length, speed])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const nodeRadius = 28
    const nodePadding = 50
    const levelHeight = 100

    const g = svg.append('g')

    if (!root) {
      g.append('text')
        .attr('x', 400)
        .attr('y', 250)
        .attr('text-anchor', 'middle')
        .attr('fill', '#999')
        .attr('font-size', '16')
        .text('AVL树为空，请插入节点')
      return
    }

    const treeHeight = avlTree.getHeight(root) || 1
    const maxNodesPerLevel = Math.pow(2, treeHeight - 1)
    const calculatedWidth = Math.max(
      800,
      maxNodesPerLevel * (nodeRadius * 2 + nodePadding) + 120
    )
    const calculatedHeight = Math.max(
      500,
      treeHeight * levelHeight + 120
    )

    svg
      .attr('width', calculatedWidth)
      .attr('height', calculatedHeight)

    const treeLayout = d3.tree<AVLTreeNode>()
      .size([calculatedWidth - 120, calculatedHeight - 120])
      .separation((a, b) => (a.parent === b.parent ? 1.8 : 2.2))

    const hierarchy = d3.hierarchy(root)
    treeLayout(hierarchy)

    const highlightedNodes = currentStep?.highlightedNodes || []
    const visitedNodes = currentStep?.visitedNodes || []
    const currentNode = currentStep?.currentNode
    const extras = currentStep?.extras

    g.append('g')
      .selectAll('line')
      .data(hierarchy.links())
      .enter()
      .append('line')
      .attr('x1', d => d.source.x! + 50)
      .attr('y1', d => d.source.y! + 50)
      .attr('x2', d => d.target.x! + 50)
      .attr('y2', d => d.target.y! + 50)
      .attr('stroke', d => {
        if (extras?.rotation) {
          const nodes = extras.nodes as number[]
          if (nodes && nodes.includes(d.source.data.value) && nodes.includes(d.target.data.value)) {
            return '#e53e3e'
          }
        }
        return '#d1d5db'
      })
      .attr('stroke-width', d => {
        if (extras?.rotation) {
          const nodes = extras.nodes as number[]
          if (nodes && nodes.includes(d.source.data.value) && nodes.includes(d.target.data.value)) {
            return 4
          }
        }
        return 2
      })

    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(hierarchy.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x! + 50}, ${d.y! + 50})`)

    nodeGroups.append('circle')
      .attr('r', 28)
      .attr('fill', d => {
        const nodeData = d.data as AVLTreeNode
        const nodeId = avlTree['nodeIds'].get(nodeData) || `node-${d.data.value}`
        
        if (currentNode && nodeId === currentNode) {
          return '#e53e3e'
        }
        if (highlightedNodes.includes(nodeId)) {
          return '#f6ad55'
        }
        if (visitedNodes.includes(nodeId)) {
          return '#68d391'
        }
        return '#667eea'
      })
      .attr('stroke', d => {
        const nodeData = d.data as AVLTreeNode
        const nodeId = avlTree['nodeIds'].get(nodeData) || `node-${d.data.value}`
        
        if (currentNode && nodeId === currentNode) {
          return '#c53030'
        }
        if (highlightedNodes.includes(nodeId)) {
          return '#dd6b20'
        }
        return '#5a67d8'
      })
      .attr('stroke-width', 3)
      .style('transition', 'all 0.3s ease')

    nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '14')
      .text(d => d.data.value)

    nodeGroups.append('text')
      .attr('dy', '50px')
      .attr('text-anchor', 'middle')
      .attr('fill', d => {
        const balance = avlTree.getBalanceFactor(d.data as AVLTreeNode)
        return Math.abs(balance) <= 1 ? '#68d391' : '#e53e3e'
      })
      .attr('font-size', '12')
      .attr('font-weight', 'bold')
      .text(d => {
        const balance = avlTree.getBalanceFactor(d.data as AVLTreeNode)
        return `BF: ${balance}`
      })

    if (extras?.rotation) {
      const centerX = 400
      const centerY = 30
      
      g.append('text')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('fill', '#e53e3e')
        .attr('font-size', '16')
        .attr('font-weight', 'bold')
        .text(extras.rotation === 'right' ? '→ 执行右旋操作' : '← 执行左旋操作')
    }

    if (extras?.balanceFactor !== undefined) {
      const centerX = 400
      const centerY = 30
      const balance = extras.balanceFactor as number
      const isBalanced = Math.abs(balance) <= 1
      
      g.append('text')
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('fill', isBalanced ? '#68d391' : '#e53e3e')
        .attr('font-size', '14')
        .attr('font-weight', 'bold')
        .text(`平衡因子: ${balance} ${isBalanced ? '(平衡)' : '(失衡，需要旋转)'}`)
    }

  }, [root, currentStep, avlTree])

  const handleInsert = (value: number) => {
    const result: AVLInsertResult = avlTree.insert(value)
    if (result.success) {
      setRoot(result.root ? { ...result.root } : null)
      setSteps(result.steps)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    }
  }

  const handleDelete = (value: number) => {
    const result: AVLDeleteResult = avlTree.delete(value)
    setRoot(result.root ? { ...result.root } : null)
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleRandom = () => {
    const randomValues = []
    for (let i = 0; i < 7; i++) {
      randomValues.push(Math.floor(Math.random() * 100))
    }
    
    let allSteps: AnimationStep[] = []
    for (const value of randomValues) {
      const result = avlTree.insert(value)
      if (result.success) {
        allSteps = [...allSteps, ...result.steps]
      }
    }
    
    setRoot(avlTree.root ? { ...avlTree.root } : null)
    setSteps(allSteps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleClear = () => {
    avlTree.root = null
    setRoot(null)
    setSteps([])
    setCurrentStepIndex(-1)
    setIsPlaying(false)
  }

  const handlePlay = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0)
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStepForward = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const handleReset = () => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
  }

  const handleStepChange = (step: number) => {
    setCurrentStepIndex(step)
    setIsPlaying(false)
  }

  return (
    <Container>
      <Grid>
        <Section>
          <InputControlPanel
            onInsert={handleInsert}
            onDelete={handleDelete}
            onRandom={handleRandom}
            onClear={handleClear}
            disabled={isPlaying}
          />

          <AnimationController
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            stepDescription={currentStep?.description || ''}
            isPlaying={isPlaying}
            speed={speed}
            onPlay={handlePlay}
            onPause={handlePause}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onReset={handleReset}
            onSpeedChange={handleSpeedChange}
            onStepChange={handleStepChange}
          />

          <TreeContainer>
            <Title>
              AVL树可视化
              {root && (
                <BalanceBadge balanced={true}>
                  自动平衡
                </BalanceBadge>
              )}
            </Title>
            <SVGContainer>
              <svg ref={svgRef} width={800} height={500} />
            </SVGContainer>
            <Legend>
              <LegendItem>
                <LegendCircle color="#e53e3e" />
                <span>当前节点</span>
              </LegendItem>
              <LegendItem>
                <LegendCircle color="#f6ad55" />
                <span>高亮节点</span>
              </LegendItem>
              <LegendItem>
                <LegendCircle color="#68d391" />
                <span>已访问/平衡</span>
              </LegendItem>
              <LegendItem>
                <LegendCircle color="#667eea" />
                <span>普通节点</span>
              </LegendItem>
            </Legend>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <strong>说明：</strong> BF = 平衡因子 (左子树高度 - 右子树高度)。|BF| ≤ 1 表示平衡，否则失衡需要旋转。
            </div>
          </TreeContainer>
        </Section>

        <Section>
          <ComplexityCard
            title="AVL树复杂度分析"
            complexity={avlComplexity}
          />
          
          <CodeDisplay
            pythonCode={avlPythonCode}
            javascriptCode={avlJavaScriptCode}
            defaultLanguage="javascript"
          />
        </Section>
      </Grid>
    </Container>
  )
}

export default AVLTreeVisualizer
