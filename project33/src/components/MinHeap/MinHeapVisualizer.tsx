import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as d3 from 'd3'
import MinHeap, { HeapInsertResult, HeapExtractResult } from '../../dataStructures/MinHeap'
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

const HeapContainer = styled.div`
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
  height: 400px;
  overflow: auto;
  background: #f8f9fa;
  border-radius: 8px;
`

const ArrayContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const ArrayVisual = styled.div`
  display: flex;
  gap: 5px;
  overflow-x: auto;
  padding: 10px 0;
  flex-wrap: wrap;
`

const ArrayItem = styled.div<{ 
  isHighlighted: boolean;
  isCurrent: boolean;
  isSwapping: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  transition: all 0.3s ease;
  
  .value {
    background: ${props => {
      if (props.isSwapping) return '#e53e3e'
      if (props.isCurrent) return '#f6ad55'
      if (props.isHighlighted) return '#68d391'
      return '#667eea'
    }};
    color: white;
    padding: 12px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 16px;
    min-width: 45px;
    text-align: center;
    transition: all 0.3s ease;
    transform: ${props => props.isSwapping ? 'scale(1.1)' : 'scale(1)'};
  }
  
  .index {
    font-size: 10px;
    color: #999;
    margin-top: 5px;
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

const LegendBox = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${props => props.color};
`

const ExtractButton = styled.button`
  padding: 10px 20px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #c53030;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const MinValue = styled.div`
  background: #68d391;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  display: inline-block;
  margin-left: 10px;
`

const heapComplexity: ComplexityInfo = {
  bestCase: 'O(1) - 获取最小值',
  averageCase: 'O(log n) - 插入/删除',
  worstCase: 'O(log n) - 插入/删除',
  spaceComplexity: 'O(n)',
  description: '最小堆是一种完全二叉树，其中每个节点的值都小于或等于其子节点的值。获取最小值为O(1)，插入和删除操作需要堆化，时间复杂度为O(log n)。堆通常用数组实现。'
}

const heapPythonCode = `class MinHeap:
    def __init__(self):
        self.heap = []
    
    def parent(self, i):
        return (i - 1) // 2
    
    def left_child(self, i):
        return 2 * i + 1
    
    def right_child(self, i):
        return 2 * i + 2
    
    def insert(self, value):
        self.heap.append(value)
        self._heapify_up(len(self.heap) - 1)
    
    def _heapify_up(self, i):
        while i > 0 and self.heap[i] < self.heap[self.parent(i)]:
            self.heap[i], self.heap[self.parent(i)] = \
                self.heap[self.parent(i)], self.heap[i]
            i = self.parent(i)
    
    def extract_min(self):
        if not self.heap:
            return None
        
        min_val = self.heap[0]
        self.heap[0] = self.heap[-1]
        self.heap.pop()
        
        if self.heap:
            self._heapify_down(0)
        
        return min_val
    
    def _heapify_down(self, i):
        while True:
            left = self.left_child(i)
            right = self.right_child(i)
            smallest = i
            
            if (left < len(self.heap) and 
                self.heap[left] < self.heap[smallest]):
                smallest = left
            
            if (right < len(self.heap) and 
                self.heap[right] < self.heap[smallest]):
                smallest = right
            
            if smallest == i:
                break
            
            self.heap[i], self.heap[smallest] = \
                self.heap[smallest], self.heap[i]
            i = smallest
    
    def get_min(self):
        return self.heap[0] if self.heap else None
`

const heapJavaScriptCode = `class MinHeap {
  constructor() {
    this.heap = [];
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChild(i) {
    return 2 * i + 1;
  }

  rightChild(i) {
    return 2 * i + 2;
  }

  insert(value) {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  heapifyUp(i) {
    while (i > 0 && this.heap[i] < this.heap[this.parent(i)]) {
      [this.heap[i], this.heap[this.parent(i)]] = 
        [this.heap[this.parent(i)], this.heap[i]];
      i = this.parent(i);
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    
    const minVal = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    
    if (this.heap.length > 0) {
      this.heapifyDown(0);
    }
    
    return minVal;
  }

  heapifyDown(i) {
    while (true) {
      const left = this.leftChild(i);
      const right = this.rightChild(i);
      let smallest = i;
      
      if (left < this.heap.length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      
      if (right < this.heap.length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }
      
      if (smallest === i) break;
      
      [this.heap[i], this.heap[smallest]] = 
        [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }

  getMin() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }
}
`

const MinHeapVisualizer: React.FC = () => {
  const [heap] = useState(() => new MinHeap())
  const [heapArray, setHeapArray] = useState<number[]>([])
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  const [extractedValue, setExtractedValue] = useState<number | null>(null)
  
  const svgRef = useRef<SVGSVGElement>(null)
  const playIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null

  useEffect(() => {
    setHeapArray([...heap.getHeap()])
  }, [heap])

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

    const g = svg.append('g')

    if (heapArray.length === 0) {
      g.append('text')
        .attr('x', 400)
        .attr('y', 200)
        .attr('text-anchor', 'middle')
        .attr('fill', '#999')
        .attr('font-size', '16')
        .text('堆为空，请插入节点')
      return
    }

    const treeLayout = d3.tree<{ value: number }>()
      .size([700, 300])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2))

    const buildHierarchy = (index: number): { value: number; children?: unknown[] } | null => {
      if (index >= heapArray.length) return null
      
      const node = { value: heapArray[index] } as { value: number; children?: unknown[] }
      const children = []
      
      const leftChild = buildHierarchy(2 * index + 1)
      const rightChild = buildHierarchy(2 * index + 2)
      
      if (leftChild) children.push(leftChild)
      if (rightChild) children.push(rightChild)
      
      if (children.length > 0) node.children = children
      
      return node
    }

    const rootNode = buildHierarchy(0)
    if (!rootNode) return

    const hierarchy = d3.hierarchy(rootNode)
    treeLayout(hierarchy)

    const extras = currentStep?.extras

    g.append('g')
      .selectAll('line')
      .data(hierarchy.links())
      .enter()
      .append('line')
      .attr('x1', d => d.source.x! + 50)
      .attr('y1', d => d.source.y! + 40)
      .attr('x2', d => d.target.x! + 50)
      .attr('y2', d => d.target.y! + 40)
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 2)

    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(hierarchy.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x! + 50}, ${d.y! + 40})`)

    const getNodeIndex = (node: d3.HierarchyNode<{ value: number; children?: unknown[] }>): number => {
      const value = node.data.value
      return heapArray.indexOf(value)
    }

    interface HeapExtras {
      heapState?: number[]
      currentIndex?: number
      parentIndex?: number
      currentValue?: number
      parentValue?: number
      leftChild?: { index: number; value: number }
      rightChild?: { index: number; value: number }
      swap?: boolean
      value1?: number
      value2?: number
      index1?: number
      index2?: number
      done?: boolean
    }

    const isNodeHighlighted = (node: d3.HierarchyNode<{ value: number; children?: unknown[] }>): boolean => {
      if (!extras) return false
      const extrasTyped = extras as HeapExtras
      
      if (extrasTyped.heapState) {
        const stateIndex = extrasTyped.heapState.indexOf(node.data.value)
        if (stateIndex !== -1 && 
            (extrasTyped.currentIndex === stateIndex || 
             extrasTyped.parentIndex === stateIndex ||
             extrasTyped.leftChild?.index === stateIndex ||
             extrasTyped.rightChild?.index === stateIndex)) {
          return true
        }
      }
      
      if (extrasTyped.currentValue === node.data.value ||
          extrasTyped.parentValue === node.data.value ||
          extrasTyped.leftChild?.value === node.data.value ||
          extrasTyped.rightChild?.value === node.data.value) {
        return true
      }
      
      return false
    }

    const isNodeCurrent = (node: d3.HierarchyNode<{ value: number; children?: unknown[] }>): boolean => {
      if (!extras) return false
      const extrasTyped = extras as HeapExtras
      return extrasTyped.swap === true && 
             (extrasTyped.value1 === node.data.value || extrasTyped.value2 === node.data.value)
    }

    const isNodeSwapping = (node: d3.HierarchyNode<{ value: number; children?: unknown[] }>): boolean => {
      return isNodeCurrent(node)
    }

    nodeGroups.append('circle')
      .attr('r', 28)
      .attr('fill', d => {
        if (isNodeSwapping(d)) return '#e53e3e'
        if (isNodeCurrent(d)) return '#f6ad55'
        if (isNodeHighlighted(d)) return '#68d391'
        return '#667eea'
      })
      .attr('stroke', d => {
        if (isNodeSwapping(d)) return '#c53030'
        if (isNodeCurrent(d)) return '#dd6b20'
        return '#5a67d8'
      })
      .attr('stroke-width', 3)
      .style('transition', 'all 0.3s ease')
      .style('transform', d => isNodeSwapping(d) ? 'scale(1.15)' : 'scale(1)')

    nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '14')
      .text(d => d.data.value)

    nodeGroups.append('text')
      .attr('dy', '48px')
      .attr('text-anchor', 'middle')
      .attr('fill', '#999')
      .attr('font-size', '11px')
      .text((_d, _i) => `[${getNodeIndex(_d)}]`)

  }, [heapArray, currentStep])

  const isArrayItemHighlighted = (index: number): boolean => {
    if (!currentStep?.extras) return false
    const extras = currentStep.extras as Record<string, unknown>
    
    if (extras.currentIndex === index) return true
    if (extras.parentIndex === index) return true
    
    const leftChild = extras.leftChild as { index: number } | undefined
    const rightChild = extras.rightChild as { index: number } | undefined
    
    if (leftChild?.index === index) return true
    if (rightChild?.index === index) return true
    
    if (extras.swap && ((extras as { index1?: number; index2?: number }).index1 === index || 
                        (extras as { index1?: number; index2?: number }).index2 === index)) {
      return true
    }
    
    return false
  }

  const isArrayItemCurrent = (index: number): boolean => {
    if (!currentStep?.extras) return false
    const extras = currentStep.extras as { swap?: boolean; index1?: number; index2?: number }
    
    if (extras.swap && (extras.index1 === index || extras.index2 === index)) return true
    
    return false
  }

  const isArrayItemSwapping = (index: number): boolean => {
    return isArrayItemCurrent(index)
  }

  const handleInsert = (value: number) => {
    const result: HeapInsertResult = heap.insert(value)
    setHeapArray([...result.heap])
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setExtractedValue(null)
  }

  const handleExtract = () => {
    if (heapArray.length === 0) return
    
    const result: HeapExtractResult = heap.extractMin()
    if (result.value !== null) {
      setExtractedValue(result.value)
      setHeapArray([...result.heap])
      setSteps(result.steps)
      setCurrentStepIndex(0)
      setIsPlaying(false)
    }
  }

  const handleRandom = () => {
    const randomValues = []
    for (let i = 0; i < 7; i++) {
      randomValues.push(Math.floor(Math.random() * 100))
    }
    
    let allSteps: AnimationStep[] = []
    for (const value of randomValues) {
      const result = heap.insert(value)
      allSteps = [...allSteps, ...result.steps]
    }
    
    setHeapArray([...heap.getHeap()])
    setSteps(allSteps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setExtractedValue(null)
  }

  const handleClear = () => {
    while (heap.getHeap().length > 0) {
      heap.extractMin()
    }
    setHeapArray([])
    setSteps([])
    setCurrentStepIndex(-1)
    setIsPlaying(false)
    setExtractedValue(null)
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

  const minValue = heapArray.length > 0 ? heapArray[0] : null

  return (
    <Container>
      <Grid>
        <Section>
          <InputControlPanel
            onInsert={handleInsert}
            onRandom={handleRandom}
            onClear={handleClear}
            disabled={isPlaying}
            extraControls={
              <>
                <ExtractButton onClick={handleExtract} disabled={isPlaying || heapArray.length === 0}>
                  提取最小值
                </ExtractButton>
                {minValue !== null && (
                  <MinValue>当前最小值: {minValue}</MinValue>
                )}
                {extractedValue !== null && (
                  <MinValue style={{ background: '#e53e3e' }}>
                    已提取: {extractedValue}
                  </MinValue>
                )}
              </>
            }
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

          <HeapContainer>
            <Title>最小堆树结构</Title>
            <SVGContainer>
              <svg ref={svgRef} width={800} height={400} />
            </SVGContainer>
            <Legend>
              <LegendItem>
                <LegendBox color="#e53e3e" />
                <span>正在交换</span>
              </LegendItem>
              <LegendItem>
                <LegendBox color="#f6ad55" />
                <span>当前节点</span>
              </LegendItem>
              <LegendItem>
                <LegendBox color="#68d391" />
                <span>相关节点</span>
              </LegendItem>
              <LegendItem>
                <LegendBox color="#667eea" />
                <span>普通节点</span>
              </LegendItem>
            </Legend>
          </HeapContainer>

          <ArrayContainer>
            <Title>数组表示 (完全二叉树)</Title>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              父节点索引: (i-1)/2 | 左子节点: 2i+1 | 右子节点: 2i+2
            </div>
            <ArrayVisual>
              {heapArray.map((value, index) => (
                <ArrayItem
                  key={index}
                  isHighlighted={isArrayItemHighlighted(index)}
                  isCurrent={isArrayItemCurrent(index)}
                  isSwapping={isArrayItemSwapping(index)}
                >
                  <div className="value">{value}</div>
                  <div className="index">[{index}]</div>
                </ArrayItem>
              ))}
            </ArrayVisual>
          </ArrayContainer>
        </Section>

        <Section>
          <ComplexityCard
            title="最小堆复杂度分析"
            complexity={heapComplexity}
          />
          
          <CodeDisplay
            pythonCode={heapPythonCode}
            javascriptCode={heapJavaScriptCode}
            defaultLanguage="javascript"
          />
        </Section>
      </Grid>
    </Container>
  )
}

export default MinHeapVisualizer
