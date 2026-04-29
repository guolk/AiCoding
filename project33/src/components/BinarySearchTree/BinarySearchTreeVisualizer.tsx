import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import BinarySearchTree, { BSTInsertResult, BSTDeleteResult, BSTSearchResult, BSTTraversalResult } from '../../dataStructures/BinarySearchTree'
import TreeVisualizer from './TreeVisualizer'
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

const TraversalResult = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const TraversalTitle = styled.h4`
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
`

const TraversalPath = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const PathNode = styled.span`
  background: #667eea;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
`

const Arrow = styled.span`
  color: #999;
  font-size: 16px;
  font-weight: bold;
`

const bstComplexity: ComplexityInfo = {
  bestCase: 'O(log n)',
  averageCase: 'O(log n)',
  worstCase: 'O(n)',
  spaceComplexity: 'O(n)',
  description: '二叉搜索树的平均时间复杂度为O(log n)，最坏情况下退化为链表，时间复杂度为O(n)。树的平衡性越好，性能越佳。'
}

const bstPythonCode = `class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinarySearchTree:
    def __init__(self):
        self.root = None
    
    def insert(self, value):
        if not self.root:
            self.root = Node(value)
            return
        
        current = self.root
        while True:
            if value < current.value:
                if not current.left:
                    current.left = Node(value)
                    break
                current = current.left
            else:
                if not current.right:
                    current.right = Node(value)
                    break
                current = current.right
    
    def search(self, value):
        current = self.root
        while current:
            if value == current.value:
                return True
            elif value < current.value:
                current = current.left
            else:
                current = current.right
        return False
    
    def delete(self, value):
        # 略复杂，详见完整实现
        pass
`

const bstJavaScriptCode = `class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new Node(value);
    
    if (!this.root) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    while (true) {
      if (value === current.value) return undefined;
      
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }

  search(value) {
    if (!this.root) return false;
    
    let current = this.root;
    let found = false;
    
    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }
    
    return found;
  }
}
`

const traverseOptions = [
  { value: 'pre', label: '前序遍历 (根→左→右)' },
  { value: 'in', label: '中序遍历 (左→根→右)' },
  { value: 'post', label: '后序遍历 (左→右→根)' },
  { value: 'level', label: '层序遍历 (逐层)' },
]

const BinarySearchTreeVisualizer: React.FC = () => {
  const [bst] = useState(() => new BinarySearchTree())
  const [root, setRoot] = useState<typeof bst.root>(null)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  const [traversalPath, setTraversalPath] = useState<number[]>([])
  const [traversalType, setTraversalType] = useState<string>('')
  
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

  const handleInsert = (value: number) => {
    const result: BSTInsertResult = bst.insert(value)
    if (result.success) {
      setRoot({ ...result.root! })
      setSteps(result.steps)
      setCurrentStepIndex(0)
      setIsPlaying(false)
      setTraversalPath([])
      setTraversalType('')
    }
  }

  const handleDelete = (value: number) => {
    const result: BSTDeleteResult = bst.delete(value)
    setRoot(result.root ? { ...result.root } : null)
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTraversalPath([])
    setTraversalType('')
  }

  const handleSearch = (value: number) => {
    const result: BSTSearchResult = bst.search(value)
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTraversalPath([])
    setTraversalType('')
  }

  const handleTraverse = (type: string) => {
    let result: BSTTraversalResult
    
    switch (type) {
      case 'pre':
        result = bst.preOrderTraversal()
        break
      case 'in':
        result = bst.inOrderTraversal()
        break
      case 'post':
        result = bst.postOrderTraversal()
        break
      case 'level':
        result = bst.levelOrderTraversal()
        break
      default:
        return
    }

    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTraversalPath(result.order)
    setTraversalType(type)
  }

  const handleRandom = () => {
    const randomValues = []
    for (let i = 0; i < 7; i++) {
      randomValues.push(Math.floor(Math.random() * 100))
    }
    
    let allSteps: AnimationStep[] = []
    for (const value of randomValues) {
      const result = bst.insert(value)
      if (result.success) {
        allSteps = [...allSteps, ...result.steps]
      }
    }
    
    setRoot(bst.root ? { ...bst.root } : null)
    setSteps(allSteps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTraversalPath([])
    setTraversalType('')
  }

  const handleClear = () => {
    bst.root = null
    setRoot(null)
    setSteps([])
    setCurrentStepIndex(-1)
    setIsPlaying(false)
    setTraversalPath([])
    setTraversalType('')
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

  const getTraversalLabel = (type: string): string => {
    const option = traverseOptions.find(o => o.value === type)
    return option ? option.label : ''
  }

  return (
    <Container>
      <Grid>
        <Section>
          <InputControlPanel
            onInsert={handleInsert}
            onDelete={handleDelete}
            onSearch={handleSearch}
            onTraverse={handleTraverse}
            onRandom={handleRandom}
            onClear={handleClear}
            showTraverse={true}
            traverseOptions={traverseOptions}
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

          <TreeVisualizer
            root={root}
            currentStep={currentStep}
            width={700}
            height={450}
          />

          {traversalPath.length > 0 && (
            <TraversalResult>
              <TraversalTitle>遍历结果 - {getTraversalLabel(traversalType)}</TraversalTitle>
              <TraversalPath>
                {traversalPath.map((value, index) => (
                  <React.Fragment key={index}>
                    <PathNode>{value}</PathNode>
                    {index < traversalPath.length - 1 && <Arrow>→</Arrow>}
                  </React.Fragment>
                ))}
              </TraversalPath>
            </TraversalResult>
          )}
        </Section>

        <Section>
          <ComplexityCard
            title="二叉搜索树复杂度分析"
            complexity={bstComplexity}
          />
          
          <CodeDisplay
            pythonCode={bstPythonCode}
            javascriptCode={bstJavaScriptCode}
            defaultLanguage="javascript"
          />
        </Section>
      </Grid>
    </Container>
  )
}

export default BinarySearchTreeVisualizer
