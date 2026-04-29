import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as d3 from 'd3'
import Graph, { SearchType, GraphSearchResult } from '../../dataStructures/Graph'
import AnimationController from '../common/AnimationController'
import ComplexityCard from '../common/ComplexityCard'
import CodeDisplay from '../common/CodeDisplay'
import { ComplexityInfo, AnimationStep, QueueState, StackState, GraphNode } from '../../types'

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

const GraphContainer = styled.div`
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
  height: 450px;
  overflow: auto;
  background: #f8f9fa;
  border-radius: 8px;
`

const SearchSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`

const SearchButton = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.active ? '#667eea' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 2px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#5a67d8' : '#e0e0e0'};
  }
`

const StartInput = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Label = styled.span`
  font-size: 14px;
  color: #666;
`

const Input = styled.input`
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  width: 100px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const DataStructureState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`

const StateTitle = styled.h4`
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
`

const QueueVisual = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
`

const QueueItem = styled.div<{ isFront?: boolean; isRear?: boolean }>`
  background: #667eea;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  
  ${props => props.isFront && `
    &::before {
      content: 'front';
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: #667eea;
      font-weight: normal;
    }
  `}
  
  ${props => props.isRear && `
    &::after {
      content: 'rear';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: #e53e3e;
      font-weight: normal;
    }
  `}
`

const StackVisual = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: flex-start;
`

const StackItem = styled.div<{ isTop?: boolean }>`
  background: ${props => props.isTop ? '#e53e3e' : '#667eea'};
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  
  ${props => props.isTop && `
    &::after {
      content: ' ← top';
      color: #e53e3e;
      font-size: 12px;
      font-weight: normal;
    }
  `}
`

const TraversalResult = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`

const TraversalPath = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const PathNode = styled.span<{ isCurrent?: boolean }>`
  background: ${props => props.isCurrent ? '#e53e3e' : '#68d391'};
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

const graphComplexity: ComplexityInfo = {
  bestCase: 'O(V + E)',
  averageCase: 'O(V + E)',
  worstCase: 'O(V + E)',
  spaceComplexity: 'O(V)',
  description: 'BFS和DFS的时间复杂度均为O(V + E)，其中V是顶点数，E是边数。两个算法都需要访问每个顶点和每条边一次。空间复杂度主要用于存储已访问顶点和队列/栈。'
}

const bfsPythonCode = `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    order = []
    
    while queue:
        vertex = queue.popleft()
        order.append(vertex)
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return order
`

const dfsPythonCode = `def dfs(graph, start):
    visited = set()
    stack = [start]
    order = []
    
    while stack:
        vertex = stack.pop()
        if vertex not in visited:
            visited.add(vertex)
            order.append(vertex)
            
            # 反序压入栈以保持顺序一致
            for neighbor in reversed(graph[vertex]):
                if neighbor not in visited:
                    stack.append(neighbor)
    
    return order
`

const bfsJavaScriptCode = `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);
  const order = [];

  while (queue.length > 0) {
    const vertex = queue.shift();
    order.push(vertex);

    for (const neighbor of graph[vertex] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return order;
}
`

const dfsJavaScriptCode = `function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];

  while (stack.length > 0) {
    const vertex = stack.pop();
    
    if (!visited.has(vertex)) {
      visited.add(vertex);
      order.push(vertex);

      // 反序压入栈以保持顺序一致
      const neighbors = graph[vertex] || [];
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return order;
}
`

const GraphVisualizer: React.FC = () => {
  const [graph] = useState(() => {
    const g = new Graph()
    g.generateExampleGraph()
    return g
  })
  
  const [searchType, setSearchType] = useState<SearchType>('bfs')
  const [startValue, setStartValue] = useState<number>(1)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  const [traversalPath, setTraversalPath] = useState<number[]>([])
  
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

    const g = svg.append('g')

    if (graph.nodes.length === 0) {
      g.append('text')
        .attr('x', 400)
        .attr('y', 225)
        .attr('text-anchor', 'middle')
        .attr('fill', '#999')
        .attr('font-size', '16')
        .text('图为空，请添加节点和边')
      return
    }

    const getNodeState = (node: GraphNode) => {
      const highlightedNodes = currentStep?.highlightedNodes || []
      const visitedNodes = currentStep?.visitedNodes || []
      const currentNodeId = currentStep?.currentNode

      if (node.id === currentNodeId) return 'current'
      if (visitedNodes.includes(node.id)) return 'visited'
      if (highlightedNodes.includes(node.id)) return 'highlighted'
      return 'normal'
    }

    g.append('g')
      .selectAll('line')
      .data(graph.edges)
      .enter()
      .append('line')
      .attr('x1', edge => {
        const fromNode = graph.getNodeById(edge.from)
        return fromNode ? fromNode.x + 50 : 0
      })
      .attr('y1', edge => {
        const fromNode = graph.getNodeById(edge.from)
        return fromNode ? fromNode.y + 50 : 0
      })
      .attr('x2', edge => {
        const toNode = graph.getNodeById(edge.to)
        return toNode ? toNode.x + 50 : 0
      })
      .attr('y2', edge => {
        const toNode = graph.getNodeById(edge.to)
        return toNode ? toNode.y + 50 : 0
      })
      .attr('stroke', edge => {
        const fromNode = graph.getNodeById(edge.from)
        const toNode = graph.getNodeById(edge.to)
        if (!fromNode || !toNode) return '#d1d5db'

        const fromState = getNodeState(fromNode)
        const toState = getNodeState(toNode)

        if (fromState === 'current' || toState === 'current') {
          return '#e53e3e'
        }
        if (fromState === 'highlighted' || toState === 'highlighted') {
          return '#f6ad55'
        }
        if (fromState === 'visited' && toState === 'visited') {
          return '#68d391'
        }
        return '#d1d5db'
      })
      .attr('stroke-width', edge => {
        const fromNode = graph.getNodeById(edge.from)
        const toNode = graph.getNodeById(edge.to)
        if (!fromNode || !toNode) return 2

        const fromState = getNodeState(fromNode)
        const toState = getNodeState(toNode)

        if (fromState === 'current' || toState === 'current') {
          return 4
        }
        return 2
      })
      .style('transition', 'all 0.3s ease')

    const nodeGroups = g.append('g')
      .selectAll('g')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('transform', node => `translate(${node.x + 50}, ${node.y + 50})`)

    nodeGroups.append('circle')
      .attr('r', 28)
      .attr('fill', node => {
        const state = getNodeState(node)
        switch (state) {
          case 'current': return '#e53e3e'
          case 'highlighted': return '#f6ad55'
          case 'visited': return '#68d391'
          default: return '#667eea'
        }
      })
      .attr('stroke', node => {
        const state = getNodeState(node)
        switch (state) {
          case 'current': return '#c53030'
          case 'highlighted': return '#dd6b20'
          default: return '#5a67d8'
        }
      })
      .attr('stroke-width', 3)
      .style('transition', 'all 0.3s ease')
      .style('transform', node => {
        const state = getNodeState(node)
        return state === 'current' ? 'scale(1.15)' : 'scale(1)'
      })

    nodeGroups.append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '16')
      .text(node => node.value)

  }, [graph, currentStep])

  const getQueueState = (): QueueState | null => {
    if (!currentStep?.extras?.queue) return null
    return currentStep.extras.queue as QueueState
  }

  const getStackState = (): StackState | null => {
    if (!currentStep?.extras?.stack) return null
    return currentStep.extras.stack as StackState
  }

  const handleSearchTypeChange = (type: SearchType) => {
    setSearchType(type)
    setSteps([])
    setCurrentStepIndex(-1)
    setIsPlaying(false)
    setTraversalPath([])
  }

  const handleStartSearch = () => {
    let result: GraphSearchResult
    
    if (searchType === 'bfs') {
      result = graph.bfs(startValue)
    } else {
      result = graph.dfs(startValue)
    }

    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTraversalPath(result.order)
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

  const queueState = getQueueState()
  const stackState = getStackState()

  const getVisitedCount = () => {
    if (!currentStep?.visitedNodes) return 0
    return currentStep.visitedNodes.length
  }

  const combinedPythonCode = `# BFS (广度优先搜索)
${bfsPythonCode}

# DFS (深度优先搜索)
${dfsPythonCode}`

  const combinedJavaScriptCode = `// BFS (广度优先搜索)
${bfsJavaScriptCode}

// DFS (深度优先搜索)
${dfsJavaScriptCode}`

  return (
    <Container>
      <Grid>
        <Section>
          <GraphContainer>
            <Title>图搜索配置</Title>
            <SearchSelector>
              <SearchButton
                active={searchType === 'bfs'}
                onClick={() => handleSearchTypeChange('bfs')}
              >
                BFS (广度优先搜索) - 队列
              </SearchButton>
              <SearchButton
                active={searchType === 'dfs'}
                onClick={() => handleSearchTypeChange('dfs')}
              >
                DFS (深度优先搜索) - 栈
              </SearchButton>
            </SearchSelector>
            <StartInput>
              <Label>起始节点:</Label>
              <Input
                type="number"
                value={startValue}
                onChange={(e) => setStartValue(parseInt(e.target.value) || 1)}
                disabled={isPlaying}
              />
              <button
                onClick={handleStartSearch}
                disabled={isPlaying}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isPlaying ? 'not-allowed' : 'pointer',
                  opacity: isPlaying ? 0.5 : 1,
                }}
              >
                开始搜索
              </button>
            </StartInput>
          </GraphContainer>

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

          <GraphContainer>
            <Title>图可视化</Title>
            <SVGContainer>
              <svg ref={svgRef} width={800} height={450} />
            </SVGContainer>
            <Legend>
              <LegendItem>
                <LegendCircle color="#e53e3e" />
                <span>当前访问节点</span>
              </LegendItem>
              <LegendItem>
                <LegendCircle color="#f6ad55" />
                <span>待访问节点</span>
              </LegendItem>
              <LegendItem>
                <LegendCircle color="#68d391" />
                <span>已访问节点</span>
              </LegendItem>
              <LegendItem>
                <LegendCircle color="#667eea" />
                <span>未访问节点</span>
              </LegendItem>
            </Legend>
          </GraphContainer>

          {searchType === 'bfs' && queueState && (
            <DataStructureState>
              <StateTitle>队列状态 (BFS)</StateTitle>
              {queueState.items.length > 0 ? (
                <QueueVisual>
                  {queueState.items.map((item, index) => (
                    <QueueItem
                      key={index}
                      isFront={index === queueState.front}
                      isRear={index === queueState.rear}
                    >
                      {item}
                    </QueueItem>
                  ))}
                </QueueVisual>
              ) : (
                <div style={{ color: '#999', fontSize: '14px' }}>队列为空</div>
              )}
            </DataStructureState>
          )}

          {searchType === 'dfs' && stackState && (
            <DataStructureState>
              <StateTitle>栈状态 (DFS)</StateTitle>
              {stackState.items.length > 0 ? (
                <StackVisual>
                  {[...stackState.items].reverse().map((item, index) => (
                    <StackItem
                      key={index}
                      isTop={index === 0}
                    >
                      {item}
                    </StackItem>
                  ))}
                </StackVisual>
              ) : (
                <div style={{ color: '#999', fontSize: '14px' }}>栈为空</div>
              )}
            </DataStructureState>
          )}

          {traversalPath.length > 0 && (
            <TraversalResult>
              <StateTitle>
                访问顺序 ({searchType === 'bfs' ? 'BFS' : 'DFS'}) 
                {getVisitedCount() > 0 && ` - 已访问 ${getVisitedCount()}/${traversalPath.length} 个节点`}
              </StateTitle>
              <TraversalPath>
                {traversalPath.map((value, index) => (
                  <React.Fragment key={index}>
                    <PathNode isCurrent={index === getVisitedCount() - 1}>
                      {value}
                    </PathNode>
                    {index < traversalPath.length - 1 && <Arrow>→</Arrow>}
                  </React.Fragment>
                ))}
              </TraversalPath>
            </TraversalResult>
          )}
        </Section>

        <Section>
          <ComplexityCard
            title="图搜索复杂度分析 (BFS & DFS)"
            complexity={graphComplexity}
          />
          
          <CodeDisplay
            pythonCode={combinedPythonCode}
            javascriptCode={combinedJavaScriptCode}
            defaultLanguage="javascript"
          />
        </Section>
      </Grid>
    </Container>
  )
}

export default GraphVisualizer
