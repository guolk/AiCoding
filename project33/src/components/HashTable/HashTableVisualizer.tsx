import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import HashTable, { HashMethod, HashTableInsertResult, HashTableSearchResult, HashTableDeleteResult } from '../../dataStructures/HashTable'
import AnimationController from '../common/AnimationController'
import InputControlPanel from '../common/InputControlPanel'
import ComplexityCard from '../common/ComplexityCard'
import CodeDisplay from '../common/CodeDisplay'
import { ComplexityInfo, AnimationStep, HashTableEntry } from '../../types'

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

const MethodSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`

const MethodButton = styled.button<{ active: boolean }>`
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

const TableContainer = styled.div`
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

const HashTableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`

const Bucket = styled.div<{ 
  status: 'empty' | 'occupied' | 'deleted' | 'collision';
  isHighlighted: boolean;
  isCurrent: boolean;
}>`
  display: flex;
  flex-direction: column;
  background: ${props => {
    if (props.isCurrent) return '#e53e3e'
    if (props.isHighlighted) return '#f6ad55'
    switch (props.status) {
      case 'occupied': return '#667eea'
      case 'deleted': return '#a0aec0'
      case 'collision': return '#ed8936'
      default: return '#f0f0f0'
    }
  }};
  border-radius: 8px;
  padding: 10px;
  min-height: 80px;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.isCurrent ? '#c53030' : 'transparent'};
`

const BucketIndex = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
  font-weight: 500;
`

const BucketValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const BucketStatus = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 5px;
`

const ChainContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  flex-wrap: wrap;
`

const ChainNode = styled.div<{ isHighlighted: boolean }>`
  background: ${props => props.isHighlighted ? '#ed8936' : '#805ad5'};
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
`

const Arrow = styled.span`
  color: #666;
  font-size: 14px;
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

const LegendBox = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${props => props.color};
`

const SizeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const SizeLabel = styled.span`
  font-size: 14px;
  color: #666;
`

const SizeInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 80px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const hashTableComplexity: ComplexityInfo = {
  bestCase: 'O(1)',
  averageCase: 'O(1)',
  worstCase: 'O(n)',
  spaceComplexity: 'O(n)',
  description: '哈希表的平均时间复杂度为O(1)，这是通过哈希函数将键映射到数组索引实现的。最坏情况下（所有键冲突）时间复杂度为O(n)。链地址法通常比开放寻址法有更好的最坏情况性能。'
}

const hashTablePythonCode = `class HashTable:
    def __init__(self, size=10):
        self.size = size
        self.table = [[] for _ in range(size)]
    
    def hash_function(self, key):
        return key % self.size
    
    def insert(self, key, value):
        # 链地址法
        index = self.hash_function(key)
        
        # 检查是否已存在
        for item in self.table[index]:
            if item[0] == key:
                item[1] = value
                return
        
        self.table[index].append([key, value])
    
    def search(self, key):
        index = self.hash_function(key)
        
        for item in self.table[index]:
            if item[0] == key:
                return item[1]
        
        return None
    
    def delete(self, key):
        index = self.hash_function(key)
        
        for i, item in enumerate(self.table[index]):
            if item[0] == key:
                del self.table[index][i]
                return True
        
        return False


class HashTableLinearProbing:
    def __init__(self, size=10):
        self.size = size
        self.keys = [None] * size
        self.values = [None] * size
    
    def hash_function(self, key):
        return key % self.size
    
    def insert(self, key, value):
        index = self.hash_function(key)
        
        # 线性探测
        while self.keys[index] is not None:
            if self.keys[index] == key:
                self.values[index] = value
                return
            index = (index + 1) % self.size
        
        self.keys[index] = key
        self.values[index] = value
`

const hashTableJavaScriptCode = `class HashTable {
  constructor(size = 10) {
    this.size = size;
    this.table = Array.from({ length: size }, () => []);
  }

  hashFunction(key) {
    return key % this.size;
  }

  insert(key, value) {
    const index = this.hashFunction(key);
    const bucket = this.table[index];

    // 检查是否已存在
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket[i][1] = value;
        return;
      }
    }

    bucket.push([key, value]);
  }

  search(key) {
    const index = this.hashFunction(key);
    const bucket = this.table[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        return bucket[i][1];
      }
    }

    return null;
  }

  delete(key) {
    const index = this.hashFunction(key);
    const bucket = this.table[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i][0] === key) {
        bucket.splice(i, 1);
        return true;
      }
    }

    return false;
  }
}
`

const HashTableVisualizer: React.FC = () => {
  const [method, setMethod] = useState<HashMethod>('linear')
  const [tableSize, setTableSize] = useState(10)
  const [hashTable, setHashTable] = useState<HashTable>(() => new HashTable(10, 'linear'))
  const [table, setTable] = useState<HashTableEntry[]>([])
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  
  const playIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null

  useEffect(() => {
    setTable([...hashTable.table])
  }, [hashTable])

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

  const handleMethodChange = (newMethod: HashMethod) => {
    if (newMethod !== method) {
      setMethod(newMethod)
      const newHashTable = new HashTable(tableSize, newMethod)
      setHashTable(newHashTable)
      setTable([...newHashTable.table])
      setSteps([])
      setCurrentStepIndex(-1)
      setIsPlaying(false)
    }
  }

  const handleSizeChange = (newSize: number) => {
    if (newSize >= 5 && newSize <= 30) {
      setTableSize(newSize)
      const newHashTable = new HashTable(newSize, method)
      setHashTable(newHashTable)
      setTable([...newHashTable.table])
      setSteps([])
      setCurrentStepIndex(-1)
      setIsPlaying(false)
    }
  }

  const handleInsert = (value: number) => {
    const result: HashTableInsertResult = hashTable.insert(value)
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTable([...result.table])
  }

  const handleDelete = (value: number) => {
    const result: HashTableDeleteResult = hashTable.delete(value)
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
    setTable([...result.table])
  }

  const handleSearch = (value: number) => {
    const result: HashTableSearchResult = hashTable.search(value)
    setSteps(result.steps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleRandom = () => {
    const randomValues = []
    for (let i = 0; i < Math.min(7, tableSize); i++) {
      randomValues.push(Math.floor(Math.random() * 100))
    }
    
    let allSteps: AnimationStep[] = []
    for (const value of randomValues) {
      const result = hashTable.insert(value)
      if (result.success) {
        allSteps = [...allSteps, ...result.steps]
      }
    }
    
    setTable([...hashTable.table])
    setSteps(allSteps)
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  const handleClear = () => {
    const newHashTable = new HashTable(tableSize, method)
    setHashTable(newHashTable)
    setTable([...newHashTable.table])
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

  const isHighlighted = (index: number): boolean => {
    if (!currentStep) return false
    const extras = currentStep.extras
    if (extras?.index === index) return true
    if (extras?.probeCount !== undefined && extras?.index !== undefined) {
      const initialIndex = extras.hashValue as number
      const probeCount = extras.probeCount as number
      for (let i = 0; i <= probeCount; i++) {
        if ((initialIndex + i) % tableSize === index) return true
      }
    }
    return false
  }

  const isCurrent = (index: number): boolean => {
    if (!currentStep) return false
    const extras = currentStep.extras
    if (extras?.index === index && extras?.swap) return true
    return false
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'empty': return '空'
      case 'occupied': return '已占用'
      case 'deleted': return '已删除'
      case 'collision': return '冲突'
      default: return status
    }
  }

  return (
    <Container>
      <Grid>
        <Section>
          <TableContainer>
            <Title>哈希表配置</Title>
            <MethodSelector>
              <MethodButton
                active={method === 'linear'}
                onClick={() => handleMethodChange('linear')}
              >
                线性探测 (开放寻址法)
              </MethodButton>
              <MethodButton
                active={method === 'chaining'}
                onClick={() => handleMethodChange('chaining')}
              >
                链地址法
              </MethodButton>
            </MethodSelector>
            <SizeControl>
              <SizeLabel>表大小:</SizeLabel>
              <SizeInput
                type="number"
                value={tableSize}
                onChange={(e) => handleSizeChange(parseInt(e.target.value) || 10)}
                min={5}
                max={30}
                disabled={isPlaying}
              />
            </SizeControl>
          </TableContainer>

          <InputControlPanel
            onInsert={handleInsert}
            onDelete={handleDelete}
            onSearch={handleSearch}
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

          <TableContainer>
            <Title>
              哈希表可视化 - {method === 'linear' ? '线性探测' : '链地址法'}
            </Title>
            <HashTableGrid>
              {table.map((entry, index) => (
                <Bucket
                  key={index}
                  status={entry.status}
                  isHighlighted={isHighlighted(index)}
                  isCurrent={isCurrent(index)}
                >
                  <BucketIndex>索引 {index}</BucketIndex>
                  <BucketValue>
                    {entry.status === 'empty' ? '-' : entry.key}
                  </BucketValue>
                  {entry.status !== 'empty' && (
                    <BucketStatus>
                      {getStatusText(entry.status)}
                    </BucketStatus>
                  )}
                  
                  {method === 'chaining' && entry.chain && entry.chain.length > 0 && (
                    <ChainContainer>
                      <Arrow>→</Arrow>
                      {entry.chain.map((chainEntry, chainIndex) => (
                        <React.Fragment key={chainIndex}>
                          <ChainNode isHighlighted={isHighlighted(index)}>
                            {chainEntry.key}
                          </ChainNode>
                          {chainIndex < entry.chain!.length - 1 && <Arrow>→</Arrow>}
                        </React.Fragment>
                      ))}
                    </ChainContainer>
                  )}
                </Bucket>
              ))}
            </HashTableGrid>
            
            <Legend>
              <LegendItem>
                <LegendBox color="#e53e3e" />
                <span>当前操作</span>
              </LegendItem>
              <LegendItem>
                <LegendBox color="#f6ad55" />
                <span>高亮/冲突</span>
              </LegendItem>
              <LegendItem>
                <LegendBox color="#667eea" />
                <span>已占用</span>
              </LegendItem>
              <LegendItem>
                <LegendBox color="#f0f0f0" />
                <span>空</span>
              </LegendItem>
            </Legend>
          </TableContainer>
        </Section>

        <Section>
          <ComplexityCard
            title="哈希表复杂度分析"
            complexity={hashTableComplexity}
          />
          
          <CodeDisplay
            pythonCode={hashTablePythonCode}
            javascriptCode={hashTableJavaScriptCode}
            defaultLanguage="javascript"
          />
        </Section>
      </Grid>
    </Container>
  )
}

export default HashTableVisualizer
